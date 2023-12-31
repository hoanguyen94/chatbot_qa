import express, { Request, Response } from "express";
import botRouter from "./router/botRouter.js";
import NotImplementedError from "./error/not-implemented-error.js";
import GeneralError from "./error/general-error.js";
import DocumentLoader from "./chat/documentLoader.js";
import Bot from "./chat/bot.js";
import Summarizer from "./chat/summarizer.js";
import ChattyAgent from "./chat/agent.js";
import { InfluencerStorateService } from "./storage/typeorm/influencers-storage.js";
import influencerRouter from "./router/influencerRouter.js";
import { SQLAgent } from "./chat/sqlAgent.js";

export default (
  log: any,
  documentLoader: DocumentLoader,
  qaBot: Bot,
  summarizer: Summarizer,
  chatBot: ChattyAgent,
  influenceStorage: InfluencerStorateService,
  sqlAgent: SQLAgent
) => {
  const app = express();

  // add correlation ID to the log
  app.use(log.logNetwork);

  app.use(express.json());

  // log incoming requests
  app.use((req, res, next) => {
    // reqLogger logs in request context
    const { method, url } = req;
    log.debug(`${method} ${url}`);
    next();
  });

  // health check
  app.get("/health", (req, res) => {
    res.status(200).type("text/plain").send("OK");
  });

  app.use("/chatbot", botRouter(log, documentLoader, qaBot, summarizer, chatBot, sqlAgent));
  app.use("/chatbot/influencer", influencerRouter(log, influenceStorage))

  app.use((req, res, next) => {
    const error = new NotImplementedError();
    next(error);
  });

  app.use(
    (
      error: GeneralError,
      req: Request,
      res: Response,
    ): void => {
      const { message, code } = error;
      const { method, url } = req;
      log.error("Error %s %s %s", method, url, message);
      res.status(code).type("text/plain").send(message);
    }
  );

  return app;
};
