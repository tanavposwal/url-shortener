import db from "./db";
import express from "express";
import redis from "redis";

const app = express();
app.use(express.json());

const client = redis.createClient();
client.connect();

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

app.get("/redirect/:slug", async (req, res) => {
  const { slug } = req.params;

  // increment count
  if (await client.exists(`count:${slug}`)) {
    await client.incr(`count:${slug}`)
  } else {
    await client.set(`count:${slug}`, 0, { EX: 43200 })
  }

  // cache layer with redis
  if (await client.exists(`slug:${slug}`)) {
    const long_url = client.get(`slug:${slug}`);
    res.redirect(long_url);
  }

  const toUrl = await db.url.findFirst({
    where: {
      short_url: slug,
    },
  });

  await client.set(`slug:${slug}`, toUrl?.long_url, { EX: 43200 });

  res.redirect(toUrl?.long_url as string);
});

// all the details of a url
app.get("/analytics/:slug", async (req, res) => {
  const { slug } = req.params;
  const url = await db.url.findUnique({
    where: {
      short_url: slug
    }
  })
  res.json({
    count: url?.count,
    title: url?.title,
    favicon: url?.favicon,
    short_url: url?.short_url,
    long_url: url?.long_url,
    created_at: url?.created_at,
  })
})

// cron job to dump counts to db
// after every 10 minutes
const DUMP_INTERVAL = 20 * 60 * 1000
setInterval(async () => {
  try {
    const keys = await client.keys("count:*");
    for (const key of keys) {
      // key - slug
      // value - count in redis
      const value = await client.get(key);
      await db.url.update({
        where: {
          short_url: key
        },
        data: {
          count: {
            increment: value
          }
        }
      })
    }
  }
}, DUMP_INTERVAL)

app.listen(3000, () => console.log("Server running on port 3000"));
