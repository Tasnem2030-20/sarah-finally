import { redisClient } from "./redis-connection.js";

export const revokeTokenKeyPrefix = ({ userId }) => {
  return `user:revokeToken:${userId}`;
};

export const revokeTokenKey = ({ userId, jti }) => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

export const set = async ({ key, value, ttl = null }) => {
  try {
    const data = typeof value !== "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, { EX: ttl });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {}
};

export const get = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error) {
    return null;
  }
};

export const update = async ({ key, value, ttl = null }) => {
  try {
    const exists = await redisClient.exists(key);
    if (!exists) return null;

    const data = typeof value !== "string" ? JSON.stringify(value) : value;

    if (ttl === null) {
      const remainingTtl = await redisClient.ttl(key);
      if (remainingTtl > 0) {
        return await redisClient.set(key, data, { EX: remainingTtl });
      }
      return await redisClient.set(key, data);
    }

    return await redisClient.set(key, data, { EX: ttl });
  } catch (error) {
    return null;
  }
};

export const del = async (key) => {
  try {
    return await redisClient.del(key);
  } catch (error) {}
};

export const expire = async (key, ttl) => {
  try {
    return await redisClient.expire(key, ttl);
  } catch (error) {
    return null;
  }
};

export const ttl = async (key) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    return null;
  }
};

export const keys = async (pattern = "*") => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    return [];
  }
};