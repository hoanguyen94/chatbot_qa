import express from "express";
import DocumentLoader from "../chat/documentLoader.js";
import multer from "multer";
import * as fs from "fs";
import Bot from "../chat/bot.js";
import Summarizer from "../chat/summarizer.js";
import Helper from "../util/helper.js";

export default (
  log: any,
  documentLoader: DocumentLoader,
  chatbot: Bot,
  summarizer: Summarizer
) => {
  const router = express.Router();
  const upload_des = Helper.createFolder("uploads");
  const upload = multer({ dest: upload_des });

  router.post("/upload-pdf", upload.single("file"), async (req, res, next) => {
    const { file } = req;
    try {
      if (file?.path) {
        const dataSplit = await documentLoader.splitData(file.path);
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
  });

  router.post("/", express.json(), async (req, res, next) => {
    const {
      body: { input },
    } = req;
    try {
      const result = await chatbot.chat(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/summarize", upload.single("paper"), async (req, res, next) => {
    const { file } = req;
    try {
      if (file?.path) {
        const dataSplit = await documentLoader.splitData(file.path, 5000);
        const result = await summarizer.summarize(dataSplit);
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
  return router;
};
