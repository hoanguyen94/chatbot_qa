import { PineconeClient } from "@pinecone-database/pinecone";

export default async (key: string, env: string, index: string) => {
  const pineconeClient = new PineconeClient();
  await pineconeClient.init({
    apiKey: key,
    environment: env,
  });
  const pineconeIndex = pineconeClient.Index(index);
  return pineconeIndex;
};
