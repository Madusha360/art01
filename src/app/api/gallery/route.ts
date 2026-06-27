import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

function parseArtwork(file: any) {
  // Remove file extension (e.g. .jpg, .png)
  const cleanName = file.name.replace(/\.[^/.]+$/, "");
  
  // Split the file name by " - " to extract fields
  const parts = cleanName.split(" - ").map((s: string) => s.trim());

  let artist = "Elena Rostova";
  let title = cleanName;
  let year = new Date().getFullYear().toString();
  let medium = "Mixed Media";
  let dimensions = "Dimensions Variable";
  let status: "Available" | "Sold" | "Private Collection" = "Available";
  let description = "";

  if (parts.length >= 7) {
    artist = parts[0];
    title = parts[1];
    year = parts[2];
    medium = parts[3];
    dimensions = parts[4];
    const parsedStatus = parts[5];
    if (["Available", "Sold", "Private Collection"].includes(parsedStatus)) {
      status = parsedStatus as any;
    }
    description = parts.slice(6).join(" - ");
  } else {
    // Attempt parsing partial file names
    if (parts.length >= 1 && parts[0]) title = parts[0];
    if (parts.length >= 2 && parts[1]) {
      artist = parts[0];
      title = parts[1];
    }
    if (parts.length >= 3 && parts[2]) year = parts[2];
    if (parts.length >= 4 && parts[3]) medium = parts[3];
    if (parts.length >= 5 && parts[4]) dimensions = parts[4];
    if (parts.length >= 6 && parts[5]) {
      const parsedStatus = parts[5];
      if (["Available", "Sold", "Private Collection"].includes(parsedStatus)) {
        status = parsedStatus as any;
      }
    }
  }

  const slug = slugify(title) || `artwork-${file.id}`;

  return {
    id: file.id,
    slug: slug,
    title: title,
    artist: artist,
    year: year,
    medium: medium,
    dimensions: dimensions,
    status: status,
    imageUrl: `https://lh3.googleusercontent.com/d/${file.id}`,
    aspectRatio: 1.0, // Default aspect ratio for grid layout
    description: description,
  };
}

export async function GET() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const apiKey = process.env.GOOGLE_API_KEY;

    // Load local db for exhibitions data and local fallback
    const dbPath = path.join(process.cwd(), "src/data/galleryData.json");
    const dbData = fs.readFileSync(dbPath, "utf-8");
    const database = JSON.parse(dbData);

    if (folderId && apiKey) {
      const q = encodeURIComponent(`'${folderId}' in parents and mimeType starts with 'image/' and trashed = false`);
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${apiKey}&fields=files(id,name,mimeType,createdTime)&orderBy=createdTime+desc`;

      const response = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds
      if (!response.ok) {
        throw new Error(`Google Drive API responded with status ${response.status}`);
      }

      const driveData = await response.json();
      const files = driveData.files || [];

      const artworks = files.map((file: any) => parseArtwork(file));

      return NextResponse.json({
        artworks,
        exhibitions: database.exhibitions || [],
      });
    }

    // Fallback if environment variables are not set
    return NextResponse.json(database);
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    
    // Attempt local fallback in case of API failure
    try {
      const dbPath = path.join(process.cwd(), "src/data/galleryData.json");
      const dbData = fs.readFileSync(dbPath, "utf-8");
      const database = JSON.parse(dbData);
      return NextResponse.json(database);
    } catch (fallbackErr) {
      return NextResponse.json(
        { error: "Failed to read database file" },
        { status: 500 }
      );
    }
  }
}
