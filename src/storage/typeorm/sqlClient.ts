import { DataSource } from "typeorm";
import config from "../../util/config.js";
import { InfluencerEntity } from "./entity/influencers.entity.js";

const { postgres: { postgres_url, logging } } = config

const client = new DataSource({
  type: 'postgres',
  url: postgres_url,
  poolSize: 10,
  entities: [InfluencerEntity],
  logging: logging as boolean,
  // synchronize: true
})
export default client;

