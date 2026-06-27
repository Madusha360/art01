import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), "src/data/galleryData.json");
    const dbData = fs.readFileSync(dbPath, "utf-8");
    const database = JSON.parse(dbData);
    return NextResponse.json(database);
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    return NextResponse.json(
      { error: "Failed to read database file" },
      { status: 500 }
    );
  }
}
