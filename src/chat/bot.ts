import config from "../util/config.js";
import { BufferMemory } from "langchain/memory";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RedisChatMessageHistory } from "langchain/stores/message/ioredis";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const {
  redis: { redis_url, ttl },
  openai_api: { chat_model, openai_temperature, chat_model_source },
} = config;

export default class Bot {
  private memory: BufferMemory;
  private chatModel: ChatOpenAI;
  private chain: ConversationalRetrievalQAChain;

  constructor(
    private log: any,
    private vectorStore: PineconeStore,
    private redisClient: any,
    private conversationRetrievelQAChain = ConversationalRetrievalQAChain
  ) {
    this.memory = new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: new Date().toISOString(),
        sessionTTL: +ttl,
        client: this.redisClient,
      }),
      memoryKey: "chat_history",
      inputKey: "question", // The key for the input to the chain
      outputKey: "text", // The key for the final conversational output of the chain
      returnMessages: true, // If using with a chat model (e.g. gpt-3.5 or gpt-4)
    });

    this.chatModel = new ChatOpenAI({
      modelName: chat_model,
      temperature: +openai_temperature,
    });

    this.chain = this.conversationRetrievelQAChain.fromLLM(
      this.chatModel,
      this.vectorStore.asRetriever(),
      {
        memory: this.memory,
        returnSourceDocuments: Boolean(chat_model_source),
      }
    );
  }

  async chat(input: string) {
    try {
      const result = await this.chain.call({ question: input });
      return result;
    } catch (error) {
      this.log.error(
        "Error when having a conversation %s",
        (error as Error).message
      );
      throw error;
    }
  }
}
