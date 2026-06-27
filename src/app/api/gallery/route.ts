import { NextResponse } from "next/server";
import { getDatabase } from "@/data/dbHelper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDatabase();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading gallery data:", error);
    return NextResponse.json(
      { error: "Failed to read database" },
      { status: 500 }
    );
  }
}
