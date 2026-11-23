import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
    const data = await request.json();

    try {
        const client = await clientPromise;
        const db = client.db("newsbite");

        // 1. Check if username already exists
        const existingUser = await db.collection("user").findOne({
            username: data.username,
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    status: "Failed",
                    message: "Username taken",
                }
            );
        }

        // 2. Insert new user (added 'await' so it completes before returning)
        const user = await db.collection("user").insertOne({
            username: data.username,
            password: data.password,
            favorite: [],
        });

        return NextResponse.json({
            status: "succesfull",
            message: user,
        });
    } catch (e) {
        return NextResponse.json({
            status: "Failed",
            message: e instanceof Error ? e.message : "Something went wrong",
        });
    }
}
