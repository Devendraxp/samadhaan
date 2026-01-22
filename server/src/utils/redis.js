// src/infra/redis.js
import Redis from "ioredis-mock";

let redisClient = null;

const initRedis = async () => {
  if (redisClient) return redisClient; // ✅ singleton

  redisClient = new Redis();

  redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
  });

  console.log("✅ In-memory Redis (ioredis-mock) started");

  return redisClient;
};

const shutdownRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }

  console.log("🛑 In-memory Redis stopped");
};

const CACHE_TTL = {
  USER: parseInt(process.env.REDIS_USER_TTL) || 3600,
  COMPLAINT: parseInt(process.env.REDIS_COMPLAINT_TTL) || 1800,
  RESPONSE: parseInt(process.env.REDIS_RESPONSE_TTL) || 1800,
  NOTIFICATION: parseInt(process.env.REDIS_NOTIFICATION_TTL) || 900,
};

// ---------- Cache helpers ----------

const cacheGet = async (key) => {
  if (!redisClient) throw new Error("Redis not initialized");

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis GET error:", err);
    return null;
  }
};

const cacheSet = async (key, value, ttl) => {
  if (!redisClient) throw new Error("Redis not initialized");

  try {
    await redisClient.setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error("Redis SET error:", err);
  }
};

const cacheDelete = async (key) => {
  if (!redisClient) throw new Error("Redis not initialized");

  try {
    await redisClient.del(key);
  } catch (err) {
    console.error("Redis DEL error:", err);
  }
};

const cacheDeletePattern = async (pattern) => {
  if (!redisClient) throw new Error("Redis not initialized");

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (err) {
    console.error("Redis DEL pattern error:", err);
  }
};

export {
  initRedis,
  shutdownRedis,
  CACHE_TTL,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
};
