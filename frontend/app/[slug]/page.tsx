import axios from "axios";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const res = await axios.get(`http://localhost:3000/redirect/${slug}`);
    const longUrl = res.data.long_url;

    if (longUrl) {
      redirect(longUrl);
    }
  } catch (err) {
    return <div>Something went wrong</div>;
  }

  return <div>Not Found</div>;
}
