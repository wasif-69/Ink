import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    try {
        const data=await request.json();
        const User=data.User;

        // If there is no user, return an empty array
        if (!User || typeof User !== "string") {
            return NextResponse.json({
                status: "successful",
                message: [],
            });
        }

        const client = await clientPromise;
        const db = client.db("newsbite");

        const userDoc = await db.collection("user").findOne(
            { username: User },
            { projection: { _id: 0, favorite: 1 } }
        );
        
        const wholeFavoriteList = userDoc?.favorite || [];

        
        return NextResponse.json({
            status: "successful",
            message: wholeFavoriteList,
        });
    } catch (e) {
        return NextResponse.json({
            status: "failed",
            message: e,
        });
    }
}
