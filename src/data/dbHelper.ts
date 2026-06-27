import fs from "fs";
import path from "path";
import { kv } from "@vercel/kv";

const LOCAL_DB_PATH = path.join(process.cwd(), "src/data/galleryData.json");

export async function getDatabase() {
  // If KV is configured (on Vercel), read from KV
  if (process.env.KV_REST_API_URL) {
    let data = await kv.get("galleryData");
    if (!data) {
      // Seed KV database with initial data from local JSON file if empty
      const fileContents = fs.readFileSync(LOCAL_DB_PATH, "utf8");
      data = JSON.parse(fileContents);
      await kv.set("galleryData", data);
    }
    return data as any;
  }

  // Local development fallback: read from JSON file
  const fileContents = fs.readFileSync(LOCAL_DB_PATH, "utf8");
  return JSON.parse(fileContents);
}

export async function saveDatabase(data: any) {
  // If KV is configured (on Vercel), write to KV
  if (process.env.KV_REST_API_URL) {
    await kv.set("galleryData", data);
    return;
  }

  // Local development fallback: write back to JSON file
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}
