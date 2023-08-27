import application from "./application.js";
import process from "node:process";
import config from "./util/config.js";
import log from "./util/logger.js";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import pinecone from "../src/storage/clientIndex.js";
import DocumentLoader from "./chat/documentLoader.js";
import QABot from "./chat/bot.js";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAI } from "langchain/llms/openai";
import Summarizer from "./chat/summarizer.js";
import RedisClient from "./storage/redisClient.js";
import { RedisCache } from "langchain/cache/ioredis";
import ChattyAgent from "./chat/agent.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import sqlClient from "./storage/typeorm/sqlClient.js";
import { SqlDatabase } from "langchain/sql_db";
import { InfluencerStorateService } from "./storage/typeorm/influencers-storage.js";
import { SQLAgent } from "./chat/sqlAgent.js";


const {
  app: { port },
  openai_api: { openai_key, batch_size },
  pinecone_api: { pinecone_key, pinecone_env, pinecone_index },
  openai_api: { openai_temperature, chat_model },
  redis: { redis_url },
  logging_level,
} = config;

log.setLoggingLevel(logging_level);

sqlClient.initialize()
// create redis client
const redisClient = RedisClient(log, redis_url);

// create prisma client for sql database
const influencerStorage = new InfluencerStorateService(log, sqlClient)

// create sql database
const db = await SqlDatabase.fromDataSourceParams({
  appDataSource: sqlClient
})


// initiate openai embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: openai_key,
  batchSize: +batch_size
});

// initiate pinecone client and index
const pineconeIndex = await pinecone(
  pinecone_key as string,
  pinecone_env as string,
  pinecone_index as string
);

// create pinecone index and vector store
const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
});

// initiate openai
const model = new OpenAI({
  temperature: openai_temperature as number,
  openAIApiKey: openai_key,
  cache: new RedisCache(redisClient)
});

// initiate chat model
const chatModel = new ChatOpenAI({
  modelName: chat_model,
  temperature: +openai_temperature,
});

// create sql agent
const sqlAgent = new SQLAgent(log, db, model)
const documentLoader = new DocumentLoader(log, embeddings, pineconeIndex);
const qaBot = new QABot(log, vectorStore, redisClient, chatModel);
const chatBot = new ChattyAgent(log, vectorStore, redisClient, chatModel);

// summarizer
const summarizer = new Summarizer(model);

const app = application(log, documentLoader, qaBot, summarizer, chatBot, influencerStorage, sqlAgent);
const server = app
  .listen(port, async () => {
    log.info(`Server is listening on http://localhost:${port}`);
  })
  .on("error", (message: string) => log.error(message));

const shutdown = () =>
  server.close(async () => {
    log.info("server closed");
    await sqlClient.destroy()
    process.exit();
  });

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
