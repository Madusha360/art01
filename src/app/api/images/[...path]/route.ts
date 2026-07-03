import { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await context.params;
    const filePath = pathArray.join("/"); // e.g. "artworks/silence-in-ochre_12345.png"
    
    const client = await clientPromise;
    const db = client.db("gallery");
    const imageDoc = await db.collection<any>("images").findOne({ _id: filePath });
    
    if (!imageDoc) {
      return new Response("Image not found", { status: 404 });
    }

    const buffer = Buffer.from(imageDoc.data, "base64");
    
    return new Response(buffer, {
      headers: {
        "Content-Type": imageDoc.contentType || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image from MongoDB:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
