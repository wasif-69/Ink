import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const data = await request.json();

    const client = await clientPromise;

    const db = client.db("newsbite");

    const user = await db
        .collection("user")
        .find({
            username: data.username,
            password: data.password,
        })
        .toArray();

    const length = user.length;
    if (length === 0) {
        return NextResponse.json({
            status: "failed",
            message: user,
        });
    } else {
        return NextResponse.json({
            status: "succsesful",
            message: user,
        });
    }
}
