import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "@/components/favorite";
import { Suspense } from "react";
import clientPromise from "@/lib/mongodb";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ObjectId } from "mongodb";
import { Source_Serif_4 } from "next/font/google";

const readingFont = Source_Serif_4({
    subsets: ["latin"],
    display: "swap",
});

type ArticlePageProps = {
  params: Promise<{ article: string }>;
};

interface RecommendedArticle {
  _id: string;
  title: string;
  like?: number;
  time?: string | number;
  coverImage?: string | null;
}

const formatPublishedDate = (
  rawTime?: string | number | Date
): string => {
  if (!rawTime) return "Recently";

  const parsedDate =
    typeof rawTime === "number"
      ? new Date(rawTime > 1e11 ? rawTime : rawTime * 1000)
      : rawTime instanceof Date
        ? rawTime
        : new Date(rawTime);

  if (isNaN(parsedDate.getTime())) return "Recently";

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { article } = await params;
  const decodedArticle = decodeURIComponent(article);

  await connection();

  const getArticleFromDB = async () => {
    const client = await clientPromise;
    const db = client.db("newsbite");
    const collection = db.collection("articles");

    if (!ObjectId.isValid(decodedArticle)) {
      return null;
    }

    return await collection.findOne({
      _id: new ObjectId(decodedArticle),
    });
  };

  const getRecommendations =
    async (): Promise<RecommendedArticle[]> => {
      try {
        const response = await fetch(
          "https://ink-zb89.onrender.com/article",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              status: "successful",
              message: decodedArticle,
              time: new Date().toISOString(),
            }),
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Recommendation API failed");
        }

        const result = await response.json();

        const docs: RecommendedArticle[] = Array.isArray(
          result.documents
        )
          ? result.documents
          : [];

        return docs.filter(
          (doc) =>
            doc.title.toLowerCase() !==
            decodedArticle.toLowerCase()
        );
      } catch (error) {
        console.error("Recommendation error:", error);
        return [];
      }
    };

  const [articleResult, recommendations] =
    await Promise.allSettled([
      getArticleFromDB(),
      getRecommendations(),
    ]);

  const articleDoc =
    articleResult.status === "fulfilled"
      ? articleResult.value
      : null;

  if (!articleDoc) {
    notFound();
  }

  const articleBody: string =
    articleDoc.content ||
    articleDoc.body ||
    articleDoc.text ||
    articleDoc.story ||
    "No content available for this article.";

  const articleLikes = articleDoc.like ?? 0;
  const articleDate = formatPublishedDate(articleDoc.time);

  return (
    <main className="min-h-screen bg-white text-[#20201E]">

      {/* Article Header */}
      <header className="w-full px-6 pb-8 pt-32 sm:px-10 lg:px-16">

        <h1 className="font-serif text-4xl font-normal leading-[1.15] tracking-tight sm:text-5xl lg:text-7xl">
          {articleDoc.title || decodedArticle}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-neutral-500">

          {articleDoc.user && (
            <>
              <span className="text-neutral-800">
                {articleDoc.user}
              </span>

              <span>·</span>
            </>
          )}

          <span >{articleDate}</span>

          <span>·</span>

          <span>
            {articleLikes}{" "}
            {articleLikes === 1 ? "like" : "likes"}
          </span>

        </div>

        <div className="mt-8 border-b border-neutral-200" />

      </header>

      {/* Full-width Cover Image */}
      {articleDoc.coverImage && (
        <figure className="relative mb-12 h-75 w-full overflow-hidden sm:h-112.5 lg:h-150">

          <Image
            src={articleDoc.coverImage}
            alt={articleDoc.title || "Article cover"}
            fill
            sizes="100vw"
            className="object-cover"
          />

        </figure>
      )}

      {/* Full-width Article Content */}
      <section className="w-full px-6 pb-12 sm:px-10 lg:px-16">

      <article
    className={`
        ${readingFont.className}
        prose prose-lg mx-auto w-full max-w-212.5

        prose-headings:font-serif
        prose-headings:font-semibold
        prose-headings:tracking-tight
        prose-headings:text-[#20201E]

        prose-p:text-[19px]
        prose-p:leading-[1.85]
        prose-p:text-neutral-800
        prose-p:mb-6

        prose-strong:text-[#20201E]

        prose-a:text-[#20201E]
        prose-a:underline
        prose-a:underline-offset-4

        prose-li:text-[19px]
        prose-li:leading-[1.85]
        prose-li:text-neutral-800

        prose-blockquote:border-neutral-300
        prose-blockquote:font-normal
        prose-blockquote:text-neutral-600

        prose-img:my-10
        prose-img:w-full
        prose-img:h-auto

        prose-hr:border-neutral-200
    `}
>
    <ReactMarkdown>
        {articleBody}
    </ReactMarkdown>
</article>

      </section>

      {/* Favorite Button */}
      <div className="w-full px-6 pb-16 sm:px-10 lg:px-16">
        <FavoriteButton
          itemId={articleDoc._id.toString()}
          initialLikes={articleDoc.like ?? 0}
        />
      </div>

      {/* Centered Recommendations */}
<Suspense>
    <section className="mx-auto max-w-200 px-6 pb-24">

        <h2 className="border-b border-neutral-200 pb-6 text-center font-serif text-4xl font-normal tracking-tight">
            Further reading
        </h2>

        {recommendations.status === "fulfilled" &&
        recommendations.value.length > 0 ? (

            <div className="divide-y divide-neutral-200">

                {recommendations.value.map((rec) => (
                    <Link
                        href={`/${rec._id}`}
                        key={rec._id}
                        className="group flex flex-col items-center py-10 text-center"
                    >

                        {/* Cover Image */}
                        {rec.coverImage && (
                            <div className="relative mb-6 aspect-video w-[80%] overflow-hidden">
                                <Image
                                    src={rec.coverImage}
                                    alt={rec.title}
                                    fill
                                    sizes="(max-width: 800px) 80vw, 600px"
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Article Title */}
                        <h3 className="w-[80%] font-serif text-2xl font-normal leading-snug text-[#20201E] group-hover:underline group-hover:underline-offset-4">
                            {rec.title}
                        </h3>

                        {/* Metadata */}
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500">

                            <span>
                                {formatPublishedDate(rec.time)}
                            </span>

                            <span>·</span>

                            <span>
                                {rec.like ?? 0}{" "}
                                {(rec.like ?? 0) === 1
                                    ? "like"
                                    : "likes"}
                            </span>

                        </div>

                    </Link>
                ))}

            </div>

        ) : (

            <p className="py-6 text-center text-sm text-neutral-500">
                No related articles available right now.
            </p>

        )}

    </section>
</Suspense>
    </main>
  );
}