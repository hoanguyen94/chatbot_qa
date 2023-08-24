import { Redis } from "ioredis";

export default (log: any, url: string) => {
  const client = new Redis(url);
  client.on("error", (err) => {
    log.error("Redis client error", err);
    client.disconnect();
  });
  return client;
};
