import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(`/api/redirect/${slug}`, {
    cache: "force-cache",
  });
  const data = await res.json();
  console.log(data);
  const longUrl = data.long_url;

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
