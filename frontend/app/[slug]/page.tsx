import axios from "axios";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await axios.get(`http://localhost:3000/redirect/${slug}`);
  const longUrl = res.data.long_url;

  if (longUrl) {
    return redirect(longUrl);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Not-Found</h1>
        <p className="text-gray-600">The short url is not found</p>
      </div>
    </div>
  );
}
