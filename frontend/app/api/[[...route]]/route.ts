import { Hono } from "hono";
import { handle } from "hono/vercel";
import db from "@/lib/prisma";
import Redis from "ioredis";

const redisClient = new Redis(process.env.UPSTASH_REDIS_URL!);

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

app.get("/redirect/:slug", async (c) => {
  const slug = c.req.param("slug");
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
    console.log("cache hit");
    return c.json({
      long_url,
    });
  }

  console.log("cache miss");
  const toUrl = await db.url.findUnique({
    where: {
      short_url: slug,
    },
  });

  if (!toUrl) {
    return Response.json("URL not found", { status: 404 });
  }

  await redisClient.set(`slug:${slug}`, toUrl.long_url!);
  await redisClient.expire(`slug:${slug}`, 43200);

  return Response.json({
    long_url: toUrl?.long_url,
  });
});

app.post("/shorten", async (c) => {
  const longUrl = (await c.req.json()).url;

  const exists = await db.url.findFirst({ where: { long_url: longUrl } });
  if (exists) {
    return Response.json({
      slug: exists.short_url,
    });
  }

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
      short_url: slug,
      count: 0,
    },
  });

  return Response.json({
    slug,
  });
});

export const GET = handle(app);
export const POST = handle(app);
