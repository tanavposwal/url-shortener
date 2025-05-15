import db from "@/lib/prisma";

export const POST = async (req: Request, res: Response) => {
  const rq = await req.json();
  const longUrl = rq.url;

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
};
