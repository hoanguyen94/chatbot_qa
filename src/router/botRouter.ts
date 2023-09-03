import express from "express";
import DocumentLoader from "../chat/documentLoader.js";
import multer from "multer";
import * as fs from "fs";
import Summarizer from "../chat/summarizer.js";
import Helper from "../util/helper.js";
import { ChainValues } from "langchain/schema";
import ChattyAgent from "../chat/agent.js";
import { SQLAgent } from "../chat/sqlAgent.js";
import { Document } from "langchain/document";
import QABot from "../chat/bot.js";

export default (
  log: any,
  documentLoader: DocumentLoader,
  qaBot: QABot,
  summarizer: Summarizer,
  chatBot: ChattyAgent,
  sqlAgent: SQLAgent
) => {
  const router = express.Router();
  const upload_des = Helper.createFolder("uploads");
  const upload = multer({ dest: upload_des });

  router.post(
    "/upload-pdf",
    upload.single("pdfFile"),
    async (req, res, next) => {
      const { file } = req;
      try {
        if (file?.path) {
          const dataSplit = await documentLoader.splitPDFData(file.path);
          const result = await documentLoader.uploadDoc(dataSplit);
          fs.unlink(file?.path, (err) => {
            if (err) log.error(err);
            else {
              log.info(`Successfully deleted file ${file.path}`);
            }
          });
          res.status(201).json(result);
        } else {
          res.status(404).json("File doesnt exist");
        }
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/upload-csv",
    upload.single("csvFile"),
    async (req, res, next) => {
      const { file } = req;
      try {
        if (file?.path) {
          console.log(file);
          const dataSplit = await documentLoader.loadCSV(file.path);
          const result = await documentLoader.uploadDoc(dataSplit);
          fs.unlink(file?.path, (err) => {
            if (err) log.error(err);
            else {
              log.info(`Successfully deleted file ${file.path}`);
            }
          });
          res.status(201).json(result);
        } else {
          res.status(404).json("File doesnt exist");
        }
      } catch (error) {
        next(error);
      }
    }
  );

  router.post("/qachat", express.json(), async (req, res, next) => {
    const {
      body: { input },
      query: { source },
    } = req;
    try {
      let result: ChainValues;
      if (source) {
        result = await qaBot.chat(input, Boolean(source));
      } else {
        result = await qaBot.chat(input);
      }
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/chatty", express.json(), async (req, res, next) => {
    const {
      body: { input },
    } = req;
    try {
      const result = await chatBot.chat(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/sql-chat", express.json(), async (req, res, next) => {
    const {
      body: { input },
    } = req;
    try {
      const result = await sqlAgent.chat(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/summarize", upload.single("paper"), async (req, res, next) => {
    const {
      file,
      query: { intermediateStep, chunkSize },
    } = req;
    try {
      if (file?.path) {
        let result: ChainValues;
        let dataSplit: Document<Record<string, any>>[];

        if (chunkSize) {
          dataSplit = await documentLoader.splitPDFData(file.path, +chunkSize);
        } else {
          dataSplit = await documentLoader.splitPDFData(file.path, 5000);
        }

        if (intermediateStep) {
          result = await summarizer.summarize(
            dataSplit,
            Boolean(intermediateStep)
          );
        } else {
          result = await summarizer.summarize(dataSplit);
        }
        // delete the file
        fs.unlink(file?.path, (err) => {
          if (err) log.error(err);
          else {
            log.info(`Successfully deleted file ${file.path}`);
          }
        });
        res.status(201).json(result);
      } else {
        res.status(404).json("File doesnt exist");
      }
    } catch (error) {
      next(error);
    }
  });

  router.post("/summarize-youtube", express.json(), async (req, res, next) => {
    const {
      body: { link, chunkSize },
      query: { intermediateStep },
    } = req;
    try {
      let dataSplit: Document<Record<string, any>>[];
      let result: ChainValues;

      if (chunkSize) {
        dataSplit = await documentLoader.loadYoutubeVideos(link, chunkSize);
      } else {
        dataSplit = await documentLoader.loadYoutubeVideos(link);
      }

      if (intermediateStep) {
        result = await summarizer.summarize(
          dataSplit,
          Boolean(intermediateStep)
        );
      } else {
        result = await summarizer.summarize(dataSplit);
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/extract-topic", express.json(), async (req, res, next) => {
    const {
      body: { input },
    } = req;
    try {
      const result = await qaBot.extractTopic(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });
  return router;
};
