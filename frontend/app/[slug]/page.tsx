"use client";

import { useEffect, useState } from "react";

export default function Page({ params }: { params: { slug: string } }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const res = await fetch(
          (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") +
            `/api/redirect/${params.slug}`,
          {
            cache: "force-cache",
          }
        );

        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }

        const data = await res.json();
        console.log("API response data:", data);

        if (!data.long_url) {
          throw new Error("URL not found");
        }

        const longUrl = data.long_url;
        console.log("Redirecting to:", longUrl);
        window.location.href = longUrl;
      } catch (error) {
        console.error("Error in redirect page:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    };

    fetchAndRedirect();
  }, [params.slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Not-Found
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Redirecting...
        </h1>
        <p className="text-gray-600">Please wait while we redirect you</p>
      </div>
    </div>
  );
}
