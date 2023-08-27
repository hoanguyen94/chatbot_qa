import { DataSource } from "typeorm";
import config from "../../util/config.js";

const { postgres: { postgres_url } } = config

const client = new DataSource({
  type: 'postgres',
  url: postgres_url,
  poolSize: 10,
  entities: ["./**/*.entity.ts"],
  logging: true,
  // synchronize: true
})
// await client.initialize()
export default client;

