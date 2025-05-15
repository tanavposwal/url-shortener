"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/shorten", {
        url,
      });
      setShortUrl(response.data.slug);
    } catch (err) {
      setError("Failed to shorten URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(process.env.FRONTEND_URL + "/" + shortUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full flex items-center justify-center">
      <div className="max-w-4xl w-full px-6">
        <div className="mb-12 flex items-center justify-center w-full">
          <div className="text-5xl font-black text-gray-600 flex select-none">
            <span>B</span>
            <img
              src="https://emojicdn.elk.sh/⚡?style=apple"
              className="w-12 -my-3"
            />
            <span>azingly Fast Shortener</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4 w-full">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your URL"
            className="p-4 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:shadow-lg shadow-sm w-full"
          />

          <button
            type="submit"
            disabled={loading || !url}
            className="px-12 py-4 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors cursor-pointer shadow shadow-blue-400 whitespace-nowrap select-none">
            Shorten
          </button>
        </form>

        <div className="w-full flex items-center justify-center mt-12 text-center text-gray-600 text-sm font-semibold select-none">
          <span>made with</span>
          <img
            src="https://emojicdn.elk.sh/❤️?style=apple"
            className="w-6 mx-2 hover:animate-bounce"
          />
          <span>
            by{" "}
            <a href="https://x.com/tanavindev" className="underline">
              tanav
            </a>
          </span>
        </div>

        {error && (
          <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
        )}

        {shortUrl && (
          <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 absolute bottom-8 right-8">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600 pl-2 select-none">
                Short URL
              </p>
              <input
                type="text"
                onChange={() => {}}
                value={"/" + shortUrl}
                readOnly
                className="flex-1 px-2 text-sm text-gray-600 outline-none font-mono"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer select-none">
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
