import Redirect from "./ui";

const NotFoundView = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        No URL found {":("}
      </h1>
      <p className="text-gray-600">
        The page you are requesting does not exist
      </p>
    </div>
  </div>
);

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/api/redirect/${slug}`,
    {
      cache: "force-cache",
    }
  );

  const data = await res.json();
  console.log("API response data:", data);

  if (!data.long_url) {
    return <NotFoundView />;
  }

  const longUrl = data.long_url as string;
  console.log("Redirecting to:", longUrl);
  return <Redirect url={longUrl} />;
}
