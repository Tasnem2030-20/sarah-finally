import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
  RESP: 2,
});

redisClient.on("error", (err) => console.log("Redis Connection Error:", err));

export const redisConnection = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected successfully");
  }
};