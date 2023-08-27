import config from "../util/config.js";
import { BufferMemory } from "langchain/memory";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RedisChatMessageHistory } from "langchain/stores/message/ioredis";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import BadRequestError from "../error/bad-request-error.js";

const {
  redis: { ttl },
} = config;

export default class QABot {
  private memory: BufferMemory;

  constructor(
    private log: any,
    private vectorStore: PineconeStore,
    private redisClient: any,
    private chatModel: ChatOpenAI,
    private conversationRetrievelQAChain = ConversationalRetrievalQAChain,
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
  }

  private createChain(source: boolean): ConversationalRetrievalQAChain {
    // const CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT = `
    // You are a helpful and formal researcher assistant.
    // Given the following conversation and a follow up question.
    // Context:
    // {context}

    // Follow Up Input: {question}

    // Use the following pieces of context to answer the users question.
    // If you don't know the answer within this given context, please think rationally and answer from your own knowledge base. If you don't know the answer, say you don't know.`;

    return this.conversationRetrievelQAChain.fromLLM(
      this.chatModel,
      this.vectorStore.asRetriever(),
      {
        memory: this.memory,
        returnSourceDocuments: source,
        // questionGeneratorChainOptions: {
        //   template: CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT,
        // },
      }
    );
  }

  async chat(input: string, source = false) {
    try {
      const chain = this.createChain(source)
      const result = await chain.call({ question: input });
      return result;
    } catch (error) {
      this.log.error(
        "Error when having a conversation %s",
        (error as Error).message
      );
      throw new BadRequestError((error as Error).message)
    }
  }
}