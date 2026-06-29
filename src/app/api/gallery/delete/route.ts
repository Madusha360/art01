import { NextResponse } from "next/server";
import { getArtwork, deleteArtworkDoc, deleteImage } from "@/lib/firebaseService";

export async function POST(request: Request) {
  try {
    const { id, passcode } = await request.json();
    
    // 1. Password Verification
    if (passcode !== "1234") {
      return NextResponse.json({ error: "Unauthorized. Incorrect passcode." }, { status: 401 });
    }

    // 2. Find the artwork
    const artwork = await getArtwork(id);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
    }

    // 3. Delete image from Firebase Storage
    const imageUrl = artwork.imageUrl as string;
    if (imageUrl) {
      await deleteImage(imageUrl);
    }

    // 4. Remove from Firestore
    await deleteArtworkDoc(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error details:", error);
    return NextResponse.json({ error: "Failed to delete artwork. Server error." }, { status: 500 });
  }
}
