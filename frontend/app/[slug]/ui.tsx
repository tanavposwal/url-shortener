"use client";

import { useEffect } from "react";

export default function Redirect({ url }: { url: string }) {
  useEffect(() => {
    if (url) {
      // If the URL doesn't start with http:// or https://, add https://
      const redirectUrl = url.startsWith("http") ? url : `https://${url}`;
      window.location.href = redirectUrl;
    }
  }, [url]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">
          You are being redirected to your destination.
        </p>
      </div>
    </div>
  );
}
