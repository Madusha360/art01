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

    const exhibitionIndex = database.exhibitions.findIndex((e: any) => e.id === id);
    if (exhibitionIndex === -1) {
      return NextResponse.json({ error: "Exhibition not found." }, { status: 404 });
    }

    const exhibition = database.exhibitions[exhibitionIndex];

    // 2. Delete file from public/images/ only if it is an uploaded asset
    if (
      exhibition.installShotUrl.startsWith("/images/") &&
      !exhibition.installShotUrl.includes("exhibition_install") &&
      !exhibition.installShotUrl.includes("artwork_") &&
      !exhibition.installShotUrl.includes("artist_")
    ) {
      const filePath = path.join(process.cwd(), "public", exhibition.installShotUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileErr) {
          console.error("Failed to delete physical file:", fileErr);
        }
      }
    }

    // 3. Remove from database
    database.exhibitions.splice(exhibitionIndex, 1);
    
    // Save back to database
    await saveDatabase(database);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exhibition delete error details:", error);
    return NextResponse.json({ error: "Failed to delete exhibition. Server error." }, { status: 500 });
  }
}
