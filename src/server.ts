import application from "./application.js";
import process from "node:process";
import config from "./util/config.js";
import log from "./util/logger.js";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import pinecone from "../src/storage/clientIndex.js";
import DocumentLoader from "./chat/documentLoader.js";
import Bot from "./chat/bot.js";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAI } from "langchain/llms/openai";
import Summarizer from "./chat/summarizer.js";

const {
  app: { port },
  openai_api: { openai_key, batch_size },
  pinecone_api: { pinecone_key, pinecone_env, pinecone_index },
  openai_api: { openai_temperature },
} = config;

// initiate openai embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: openai_key,
  batchSize: +batch_size,
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
});

const documentLoader = new DocumentLoader(log, embeddings, pineconeIndex);
const chatbot = new Bot(log, vectorStore);

// summarizer
const summarizer = new Summarizer(model);

const app = application(log, documentLoader, chatbot, summarizer);
const server = app
  .listen(port, async () => {
    console.log(`Server is listening on http://localhost:${port}`);
  })
  .on("error", (message: string) => console.log(message));

const shutdown = () =>
  server.close(async () => {
    console.log("server closed");
    process.exit();
  });

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
