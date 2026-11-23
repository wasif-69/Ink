"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ArticleSuggestion {
  _id: string;
  title: string;
  like?: number;
}

const Search = () => {
  const [input, setInput] = useState("");
  const [related, setRelated] = useState<ArticleSuggestion[]>([]);
  const [focus, setFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!input.trim()) {
      setRelated([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("https://ink-zb89.onrender.com/article", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: "successful",
            message: input.trim(),
            time: new Date().toISOString(),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const result = await response.json();
        setRelated(Array.isArray(result.documents) ? result.documents : []);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Unable to load suggestions. Try again.");
          setRelated([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [input]);

  return (
    <section className="flex flex-col items-center bg-[#FAF9F6] px-6 py-24">

      <h2 className="mb-10 text-center font-serif text-4xl font-normal tracking-tight text-[#20201E] md:text-5xl">
        Explore the journal.
      </h2>

      <div className="relative w-full max-w-xl">

        {/* Search field */}
        <div
          className={`flex items-center border transition-colors ${
            focus ? "border-black" : "border-black/20"
          }`}
        >
          <svg
            className="ml-4 h-5 w-5 shrink-0 text-neutral-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" strokeLinecap="round" />
          </svg>

          <input
            type="text"
            placeholder="Search articles..."
            aria-label="Search articles"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            className="w-full bg-transparent px-4 py-4 text-base text-[#20201E] outline-none placeholder:text-neutral-500"
          />

          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="mr-4 text-xl font-light text-neutral-500 transition-colors hover:text-black"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Article suggestions */}
        {focus && input.trim() && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-0 top-full z-30 -mt-px w-full border border-black/20 bg-[#FAF9F6]"
          >
            {loading ? (
              <p className="px-5 py-4 text-sm text-neutral-500">
                Searching...
              </p>
            ) : error ? (
              <p className="px-5 py-4 text-sm text-red-700">
                {error}
              </p>
            ) : related.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">

                {related.map((article, key) => (
                  <Link
                    href={`/${article._id}`}
                    key={article._id || key}
                    onClick={() => setFocus(false)}
                    className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4 transition-colors last:border-0 hover:bg-black/5"
                  >
                    <span className="truncate font-serif text-lg text-[#20201E]">
                      {article.title}
                    </span>

                    <span className="shrink-0 text-xs text-neutral-500">
                      {article.like ?? 0} likes
                    </span>
                  </Link>
                ))}

              </div>
            ) : (
              <p className="px-5 py-4 text-sm text-neutral-500">
                No articles found.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Search;