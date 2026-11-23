"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ReaderInfo } from "@/lib/ReaderInfo";
import Image from "next/image";
interface ArticleDoc {
  _id: string;
  title: string;
  like?: number;
  time?: string | number;
  coverImage?: string | null;
}

const formatPublishedDate = (
  rawTime?: string | number
): string => {
  if (!rawTime) return "Recently";

  const parsedDate =
    typeof rawTime === "number"
      ? new Date(rawTime > 1e11 ? rawTime : rawTime * 1000)
      : new Date(rawTime);

  if (isNaN(parsedDate.getTime())) return "Recently";

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TopchoiceContent = () => {
  const [articles, setArticles] = useState<ArticleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { User } = ReaderInfo();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const listRes = await fetch("/api/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            User: User,
          }),
        });

        if (!listRes.ok) {
          throw new Error(`List API error: ${listRes.status}`);
        }

        const listData = await listRes.json();

        const articlesArray: string[] = Array.isArray(
          listData.message
        )
          ? listData.message
          : [];

        const combinedArticles = articlesArray
          .filter(Boolean)
          .join(" ");

        if (!combinedArticles) {
          setLoading(false);
          return;
        }

        const recRes = await fetch(
          "https://ink-zb89.onrender.com/article",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              status: "successful",
              message: combinedArticles,
              time: new Date().toISOString(),
            }),
          }
        );

        if (!recRes.ok) {
          throw new Error(`Article API failed: ${recRes.status}`);
        }

        const recResult = await recRes.json();

        const docs: ArticleDoc[] = Array.isArray(
          recResult.documents
        )
          ? recResult.documents.slice(0, 5)
          : [];

        setArticles(docs);
      } catch (error) {
        console.error("Topchoice error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [User]);

  return (
    <section className="w-full bg-white p-5 text-[#20201E] sm:p-6">

      <h2 className="border-b border-neutral-900 pb-4 font-serif text-2xl font-medium tracking-tight">
        Recommended for you
      </h2>

      {loading ? (

        <div className="animate-pulse divide-y divide-neutral-200">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 py-6">

              <div className="h-7 w-8 bg-neutral-100" />

              <div className="flex-1 space-y-3">
                <div className="h-4 w-4/5 bg-neutral-200" />
                <div className="h-3 w-2/5 bg-neutral-100" />
              </div>

              <div className="h-16 w-20 shrink-0 bg-neutral-100" />

            </div>
          ))}
        </div>

      ) : !User ? (

        <p className="py-6 text-sm leading-relaxed text-neutral-600">
          Log in to see personalized recommendations.
        </p>

      ) : articles.length === 0 ? (

        <p className="py-6 text-sm leading-relaxed text-neutral-600">
          Save favorite articles to get personalized recommendations.
        </p>

      ) : (

        <ul className="divide-y divide-neutral-200">

          {articles.map((article, index) => (
            <li key={article._id}>

              <Link
                href={`/${article._id}`}
                className="group flex items-start gap-4 py-6"
              >

                {/* Article Number */}
                <span className="w-9 shrink-0 font-serif text-3xl text-neutral-400">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Article Information */}
                <div className="min-w-0 flex-1">

                  <h3 className="font-serif text-lg font-medium leading-snug text-neutral-900 group-hover:underline group-hover:underline-offset-4">
                    {article.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">

                    <span>
                      {formatPublishedDate(article.time)}
                    </span>

                    <span>·</span>

                    <span>
                      {article.like ?? 0}{" "}
                      {(article.like ?? 0) === 1
                        ? "like"
                        : "likes"}
                    </span>

                  </div>
                </div>

                {/* Cover Image */}
                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt=""
                    loading="lazy"
                    className="h-16 w-20 shrink-0 object-cover sm:h-20 sm:w-24"
                  />
                )}

              </Link>
            </li>
          ))}

        </ul>

      )}
    </section>
  );
};

const Topchoice = () => {
  return (
    <Suspense
      fallback={
        <div className="bg-white p-6 text-sm text-neutral-500">
          Loading recommendations...
        </div>
      }
    >
      <TopchoiceContent />
    </Suspense>
  );
};

export default Topchoice;