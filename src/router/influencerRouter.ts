import express from "express";
import { InfluencerStorateService } from "../storage/typeorm/influencers-storage.js";

export default (
  log: any,
  influenceStorage: InfluencerStorateService
) => {
  const router = express.Router();

  router.post("/", express.json(), async (req, res, next) => {
    const { body } = req;
    try {
      const result = await influenceStorage.createMany(body)
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/", express.json(), async (req, res, next) => {
    try {
      const result = await influenceStorage.findAll()
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/", express.json(), async (req, res, next) => {
    try {
      const result = await influenceStorage.deleteAll()
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });


  return router;
};
