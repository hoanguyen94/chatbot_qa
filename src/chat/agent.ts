import config from "../util/config.js";
import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "langchain/stores/message/ioredis";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models";
import { OpenAIAgentTokenBufferMemory, createRetrieverTool } from "langchain/agents/toolkits";

const {
  redis: { ttl },
} = config;


export default class ChattyAgent {
  private memory: BufferMemory;

  constructor(
    private log: any,
    private vectorStore: PineconeStore,
    private redisClient: any,
    private chatModel: ChatOpenAI
  ) {

    this.memory = new OpenAIAgentTokenBufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: new Date().toISOString(),
        sessionTTL: +ttl,
        client: this.redisClient,
      }),
      llm: this.chatModel,
      memoryKey: "chat_history",
      outputKey: "output", // The key for the final conversational output of the chain
      returnMessages: true, // If using with a chat model (e.g. gpt-3.5 or gpt-4)
    });
  }

  private async createAgent() {
    const TEMPLATE = `You are a chatty and friendly teenage research assistant. If you don't know how to answer a question, use the available tools to look up relevant information.`;

    const retriever = this.vectorStore.asRetriever();
    const tool = createRetrieverTool(retriever, {
      name: "search_latest_knowledge",
      description: "Searches and returns up-to-date general information.",
    });

    const executor = await initializeAgentExecutorWithOptions([tool], this.chatModel, {
      agentType: "openai-functions",
      memory: this.memory,
      returnIntermediateSteps: true,
      verbose: true,
      agentArgs: {
        prefix: TEMPLATE,
      },
    });
    return executor
  }

  async chat(input: string) {
    try {
      const executor = await this.createAgent()
      return await executor.call({ input: input })
    } catch (error) {
      this.log.error(
        "Error when having a conversation %s",
        (error as Error).message
      );
      throw error;
    }
  }
}
