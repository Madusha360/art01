import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    hasFolderId: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
    hasApiKey: !!process.env.GOOGLE_API_KEY,
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    apiKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
  });
}
