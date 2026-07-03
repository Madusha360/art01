import { NextResponse } from "next/server";
import { getExhibition, deleteExhibitionDoc, deleteImage } from "@/lib/dbService";

export async function POST(request: Request) {
  try {
    const { id, passcode } = await request.json();
    
    // 1. Password Verification
    if (passcode !== "1234") {
      return NextResponse.json({ error: "Unauthorized. Incorrect passcode." }, { status: 401 });
    }

    // 2. Find the exhibition
    const exhibition = await getExhibition(id);
    if (!exhibition) {
      return NextResponse.json({ error: "Exhibition not found." }, { status: 404 });
    }

    // 3. Delete image from Firebase Storage
    const installShotUrl = exhibition.installShotUrl as string;
    if (installShotUrl) {
      await deleteImage(installShotUrl);
    }

    // 4. Remove from Firestore
    await deleteExhibitionDoc(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exhibition delete error details:", error);
    return NextResponse.json({ error: "Failed to delete exhibition. Server error." }, { status: 500 });
  }
}
