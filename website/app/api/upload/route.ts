import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function POST(request: Request) {
    try {
        // Add server-side authentication before public deployment.

        const formData = await request.formData();
        const file = formData.get("image");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { message: "No image provided" },
                { status: 400 }
            );
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            return NextResponse.json(
                { message: "Unsupported image format" },
                { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { message: "Image exceeds 5 MB" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const url = await new Promise<string>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "deciding-now",
                    resource_type: "image",
                    allowed_formats: ["jpg", "png", "webp"],
                },
                (error, result) => {
                    if (error || !result) {
                        reject(error || new Error("Upload failed"));
                    } else {
                        resolve(result.secure_url);
                    }
                }
            ).end(buffer);
        });

        return NextResponse.json({
            status: "successful",
            url,
        });

    } catch (error) {
        console.error("Cloudinary error:", error);

        return NextResponse.json(
            { message: "Failed to upload image" },
            { status: 500 }
        );
    }
}