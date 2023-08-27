import config from "../../../util/config.js"
// import PostgresConnectionOptions from "typeorm"
import { DataSourceOptions } from 'typeorm';

const { postgres: { postgres_url } } = config

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  url: postgres_url,
  poolSize: 10,
  entities: ["./**/*.entity.ts"],
  logging: true,
  // synchronize: true
}

