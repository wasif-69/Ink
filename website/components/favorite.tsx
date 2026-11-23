"use client";

import { useState } from "react";
import { ReaderInfo } from "@/lib/ReaderInfo";

interface FavoriteButtonProps {
  itemId: string;
  initialLikes?: number;
  initialLiked?: boolean;
}

export default function FavoriteButton({
  itemId,
  initialLikes = 0,
  initialLiked = false,
}: FavoriteButtonProps) {
  const { User } = ReaderInfo();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    if (!User) {
      alert("Please log in to like this article.");
      return;
    }

    if (loading) return;

    // Trigger pop animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 350);

    // Optimistic UI update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      setLoading(true);
      const response = await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article: itemId, // MongoDB _id of the document
          User: User,
        }),
      });

      const data = await response.json();
      console.log(data);

      // Sync with exact count from backend if returned
      if (typeof data.likes === "number") {
        setLikes(data.likes);
      }
      if (typeof data.liked === "boolean") {
        setLiked(data.liked);
      }
    } catch (error) {
      // Revert optimistic update on failure
      setLiked(!nextLiked);
      setLikes((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      console.error("Failed to update favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={toggleFavorite}
        aria-label={liked ? "Unlike article" : "Like article"}
        aria-pressed={liked}
        disabled={loading}
        className="inline-flex cursor-pointer items-center gap-2 text-neutral-500 transition-colors hover:text-black disabled:cursor-wait"
      >
        <svg
          className={`h-[22px] w-[22px] transition-colors ${
            liked ? "text-[#20201E]" : ""
          }`}
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>

        <span className="text-sm tabular-nums">{likes}</span>
      </button>
    </div>
  );
}
