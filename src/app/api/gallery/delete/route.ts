import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDatabase, saveDatabase } from "@/data/dbHelper";

export async function POST(request: Request) {
  try {
    const { id, passcode } = await request.json();
    
    // 1. Password Verification
    if (passcode !== "1234") {
      return NextResponse.json({ error: "Unauthorized. Incorrect passcode." }, { status: 401 });
    }

    const database = await getDatabase();

    const artworkIndex = database.artworks.findIndex((a: any) => a.id === id);
    if (artworkIndex === -1) {
      return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
    }

    const artwork = database.artworks[artworkIndex];

    // 2. Delete file from public/images/ only if it is an uploaded asset
    // (Avoid deleting initial mock stock images)
    if (artwork.imageUrl.startsWith("/images/") && !artwork.imageUrl.includes("artwork_")) {
      const filePath = path.join(process.cwd(), "public", artwork.imageUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileErr) {
          console.error("Failed to delete physical file:", fileErr);
        }
      }
    }

    // 3. Remove from database
    database.artworks.splice(artworkIndex, 1);
    
    // Save back to database
    await saveDatabase(database);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error details:", error);
    return NextResponse.json({ error: "Failed to delete artwork. Server error." }, { status: 500 });
  }
}
