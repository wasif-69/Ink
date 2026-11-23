"use client";

import { ReaderInfo } from "@/lib/ReaderInfo";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
    const [title, settitle] = useState("");
    const [story, setstory] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { User } = ReaderInfo();
    const router = useRouter();

    const uploadImage = async (file: File) => {
        if (!User) {
            alert("Please log in before uploading images.");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || typeof data.url !== "string") {
                throw new Error(data.message || "Image upload failed.");
            }

            setCoverImage(data.url);

        } catch (error) {
            console.error(error);
            alert("Unable to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const publish = async () => {
        if (!User) {
            alert("Please log in before submitting.");
            return;
        }

        if (!title.trim() || !story.trim()) {
            alert("Please enter both a title and a story.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/publish", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    story,
                    user: User,
                    coverImage,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                settitle("");
                setstory("");
                setCoverImage("");

                router.push("/review");
            } else {
                alert(data.message || "Failed to submit article.");
            }
        } catch (error) {
            console.error("Publish error:", error);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white px-6 pb-16 pt-28 text-[#20201E]">

            <div className="mx-auto max-w-[800px]">

                {/* Editor Header */}
                <header className="mb-10 flex items-center justify-between gap-4 border-b border-neutral-200 pb-5">

                    <div>
                        <h1 className="text-sm font-medium">
                            New article
                        </h1>

                        <p className="mt-1 text-xs text-neutral-500">
                            {User ? `Draft · ${User}` : "Unpublished"}
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={loading || uploading}
                        onClick={publish}
                        className="cursor-pointer bg-[#20201E] px-5 py-2.5 text-sm text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit for review"}
                    </button>

                </header>

                {/* Cover Image */}
                <div className="mb-10">

                    {coverImage ? (
                        <div>
                            <img
                                src={coverImage}
                                alt="Article cover"
                                className="aspect-video w-full object-cover"
                            />

                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => setCoverImage("")}
                                className="mt-3 text-xs text-neutral-500 underline underline-offset-4 hover:text-black"
                            >
                                Remove cover image
                            </button>
                        </div>
                    ) : (
                        <label className="flex cursor-pointer items-center justify-center border border-dashed border-neutral-300 py-12 text-sm text-neutral-500 transition-colors hover:border-black">

                            {uploading
                                ? "Uploading image..."
                                : "Add cover image"}

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                disabled={uploading || loading}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];

                                    if (file) {
                                        uploadImage(file);
                                    }

                                    e.target.value = "";
                                }}
                            />

                        </label>
                    )}

                </div>

                {/* Article Title */}
                <input
                    type="text"
                    aria-label="Article title"
                    value={title}
                    onChange={(e) => settitle(e.target.value)}
                    placeholder="Title"
                    className="w-full border-none bg-transparent font-serif text-5xl font-normal tracking-tight outline-none placeholder:text-neutral-400 sm:text-6xl"
                />

                {/* Article Body */}
                <textarea
                    name="body"
                    aria-label="Article content"
                    placeholder="Begin writing..."
                    rows={18}
                    value={story}
                    onChange={(e) => setstory(e.target.value)}
                    className="mt-8 min-h-[500px] w-full resize-y border-none bg-transparent font-serif text-xl leading-[1.85] text-neutral-800 outline-none placeholder:text-neutral-400"
                />

            </div>

        </main>
    );
};

export default Page;