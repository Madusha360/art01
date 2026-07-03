import { NextResponse } from "next/server";
import { getFullDatabase } from "@/lib/dbService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const database = await getFullDatabase();
    return NextResponse.json(database);
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    return NextResponse.json(
      { error: "Failed to read database" },
      { status: 500 }
    );
  }
}
