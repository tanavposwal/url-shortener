import db from "./db";
import Redis from "ioredis";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

// Create a single Redis client instance
export const redisClient = new Redis(process.env.UPSTASH_REDIS_URL!);

const app = express();
app.use(express.json());
app.use(cors());

// Error handling for Redis connection
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

app.get("/", (req, res) => {
  res.send("Ultra fast url shortner!");
});

// super simple shorten endpoint
app.post("/api/shorten", async (req, res) => {
  const longUrl = req.body.url;
  const title = req.body.title;

  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let slug = "";
  do {
    slug = "";
    for (let i = 0; i < 7; i++) {
      slug += chars[Math.floor(Math.random() * 62)];
    }
  } while (
    await db.url.findFirst({
      where: {
        short_url: slug,
      },
    })
  );

  await db.url.create({
    data: {
      long_url: longUrl,
      title,
      short_url: slug,
      count: 0,
    },
  });

  res.send({
    slug,
  });
});

//@ts-ignore
app.get("/redirect/:slug", async (req, res) => {
  const { slug } = req.params;

  // increment count
  if (await redisClient.exists(`count:${slug}`)) {
    await redisClient.incr(`count:${slug}`);
  } else {
    await redisClient.set(`count:${slug}`, 0);
    await redisClient.expire(`count:${slug}`, 43200);
  }

  // cache layer with redis
  if (await redisClient.exists(`slug:${slug}`)) {
    const long_url = await redisClient.get(`slug:${slug}`);
    // console.log("cache hit");
    return res.json({
      long_url,
    });
  }

  // console.log("cache miss");
  const toUrl = await db.url.findUnique({
    where: {
      short_url: slug,
    },
  });

  if (!toUrl) {
    return res.status(404).send("URL not found");
  }

  await redisClient.set(`slug:${slug}`, toUrl.long_url!);
  await redisClient.expire(`slug:${slug}`, 43200);

  return res.json({
    long_url: toUrl?.long_url,
  });
});

// all the details of a url
app.get("/analytics/:slug", async (req, res) => {
  const { slug } = req.params;
  const url = await db.url.findUnique({
    where: {
      short_url: slug,
    },
  });
  res.json({
    count: url?.count,
    title: url?.title,
    favicon: url?.favicon,
    short_url: url?.short_url,
    long_url: url?.long_url,
    created_at: url?.created_at,
  });
});

// cron job to dump counts to db
// after every 40 minutes
const DUMP_INTERVAL = 40 * 60 * 1000;
setInterval(async () => {
  try {
    const keys = await redisClient.keys("count:*");
    for (const key of keys) {
      // key - slug
      // value - count in redis
      const value = await redisClient.get(key);
      const slug = key.replace("count:", "");

      await db.url.update({
        where: {
          short_url: slug,
        },
        data: {
          count: {
            increment: parseInt(value!),
          },
        },
      });

      // Clear the counter in Redis after adding to DB
      await redisClient.del(key);
    }
  } catch (error) {
    console.error("Error in count dump:", error);
  }
}, DUMP_INTERVAL);

// Get port from environment variable or use default
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
