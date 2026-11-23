import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { title, story, user, coverImage } = await request.json();

        // Validate required fields
        if (
            typeof title !== "string" ||
            typeof story !== "string" ||
            typeof user !== "string" ||
            !title.trim() ||
            !story.trim() ||
            !user.trim()
        ) {
            return NextResponse.json(
                {
                    status: "failed",
                    message: "Title, story, and user are required.",
                },
                { status: 400 }
            );
        }

        // Validate optional cover image
        if (coverImage) {
            try {
                const url = new URL(coverImage);

                if (
                    url.protocol !== "https:" ||
                    url.hostname !== "res.cloudinary.com" ||
                    !url.pathname.startsWith(
                        `/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`
                    )
                ) {
                    throw new Error("Invalid image URL");
                }
            } catch {
                return NextResponse.json(
                    {
                        status: "failed",
                        message: "Invalid cover image URL.",
                    },
                    { status: 400 }
                );
            }
        }

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("newsbite");

        // Save article for review
        const result = await db.collection("articles").insertOne({
            title: title.trim(),
            story: story,
            user: user,
            coverImage: coverImage || null,
            time: new Date(),
            like: 0,
        });

        return NextResponse.json(
            {
                status: "successful",
                message: "Article submitted for review.",
                articleId: result.insertedId.toString(),
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Article submission error:", error);

        return NextResponse.json(
            {
                status: "failed",
                message: "Failed to submit article.",
            },
            { status: 500 }
        );
    }
}