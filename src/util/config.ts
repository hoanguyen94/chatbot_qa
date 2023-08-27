import "dotenv/config";
const {
  PORT,
  OPENAI_API_KEY,
  OPENAI_API_TEMPERATURE,
  OPENAI_API_CHATMODEL,
  OPENAI_BATCH_SIZE,
  PINECONE_API_KEY,
  PINECONE_API_ENV,
  PINECONE_API_INDEX,
  REDIS_URL,
  REDIS_TTL,
  LOGGING_LEVEL,
  DATABASE_URL
} = process.env;

export default {
  app: {
    port: PORT || 3010,
  },
  logging_level: LOGGING_LEVEL || "debug",
  openai_api: {
    openai_key: OPENAI_API_KEY,
    batch_size: OPENAI_BATCH_SIZE || 512,
    openai_temperature: OPENAI_API_TEMPERATURE || 0,
    chat_model: OPENAI_API_CHATMODEL || "gpt-3.5-turbo",
  },
  pinecone_api: {
    pinecone_key: PINECONE_API_KEY,
    pinecone_env: PINECONE_API_ENV,
    pinecone_index: PINECONE_API_INDEX || "chatbot-openai",
  },
  redis: {
    redis_url: REDIS_URL || "redis://:chatbot@localhost:6379",
    ttl: REDIS_TTL || 300,
  },
  postgres: {
    postgres_url: DATABASE_URL || "postgresql://chatbot:chatbot2023@localhost:5432/chatbot"
  }
};
