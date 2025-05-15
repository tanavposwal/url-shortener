import db from "@/lib/prisma";
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL,
});

export const GET = async (
  req: Request,
  res: Response,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;

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
    return Response.json({
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
};
