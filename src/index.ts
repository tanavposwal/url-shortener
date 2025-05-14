import db from "./db";
import express from "express";

const app = express();
app.use(express.json());

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

app.listen(3000, () => console.log("Server running on port 3000"));
