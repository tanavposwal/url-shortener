import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  try {
    const res = await fetch(
      (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") +
        `/api/redirect/${params.slug}`,
      {
        cache: "force-cache",
      }
    );

    const data = await res.json();

    if (!data.long_url) {
      throw new Error("URL not found");
    }
    const longUrl = data.long_url;

    if (longUrl) {
      return redirect(longUrl);
    }
  } catch (error) {
    console.error("Error fetching URL:", error);
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
