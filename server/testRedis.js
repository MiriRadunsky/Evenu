import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);
console.log("Testing Redis connection...", process.env.REDIS_URL);
redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

async function test() {
  try {
    const result = await redis.ping();
    console.log("Ping result:", result);
  } catch (err) {
    console.error(err);
  } finally {
    redis.quit();
  }
}

test();
