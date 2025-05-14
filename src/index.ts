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

app.listen(3000, () => console.log("Server running on port 3000"));
