import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { User, article } = data;

    if (!User || !article) {
      return NextResponse.json(
        { status: "failed", message: "Missing User or article ID" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(article)) {
      return NextResponse.json(
        { status: "failed", message: "Invalid article ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("newsbite");
    const usersCollection = db.collection("user");
    const articlesCollection = db.collection("articles");

    // 1. Check if the user has already liked this article
    const userDoc = await usersCollection.findOne({ username: User });
    if (!userDoc) {
      return NextResponse.json(
        { status: "failed", message: "User not found" },
        { status: 404 }
      );
    }

    const favorites: string[] = Array.isArray(userDoc.favorite)
      ? userDoc.favorite
      : [];
    const alreadyLiked = favorites.includes(article);

    const articleObjectId = new ObjectId(article);

    if (alreadyLiked) {
      // 2a. Unlike: remove from user's favorites & decrement article likes
      await usersCollection.updateOne(
        { username: User },
        { $pull: { favorite: article as never } }
      );

      const updatedArticle = await articlesCollection.findOneAndUpdate(
        { _id: articleObjectId, like: { $gt: 0 } },
        { $inc: { like: -1 } },
        { returnDocument: "after" }
      );

      // Fallback read in case like was already 0
      const currentArticle =
        updatedArticle ||
        (await articlesCollection.findOne({ _id: articleObjectId }));

      return NextResponse.json({
        status: "successful",
        liked: false,
        likes: currentArticle?.like ?? 0,
      });
    } else {
      // 2b. Like: add to user's favorites (no duplicates) & increment article likes
      await usersCollection.updateOne(
        { username: User },
        { $addToSet: { favorite: article } }
      );

      const updatedArticle = await articlesCollection.findOneAndUpdate(
        { _id: articleObjectId },
        { $inc: { like: 1 } },
        { returnDocument: "after" }
      );

      return NextResponse.json({
        status: "successful",
        liked: true,
        likes: updatedArticle?.like ?? 1,
      });
    }
  } catch (e) {
    return NextResponse.json(
      {
        status: "failed",
        message: e instanceof Error ? e.message : "Server error",
      },
      { status: 500 }
    );
  }
}
