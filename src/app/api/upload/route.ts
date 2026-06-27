import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { getDatabase, saveDatabase } from "@/data/dbHelper";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // 1. Password Verification
    const passcode = formData.get("passcode") as string;
    if (passcode !== "1234") {
      return NextResponse.json({ error: "Unauthorized. Incorrect passcode." }, { status: 401 });
    }

    // 2. Validate File
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Extract fields
    const title = (formData.get("title") as string) || "Untitled";
    const artist = (formData.get("artist") as string) || "Elena Rostova";
    const year = (formData.get("year") as string) || new Date().getFullYear().toString();
    const medium = (formData.get("medium") as string) || "Mixed Media";
    const dimensions = (formData.get("dimensions") as string) || "Dimensions Variable";
    const status = (formData.get("status") as "Available" | "Sold" | "Private Collection") || "Available";
    const aspectRatioStr = formData.get("aspectRatio") as string;
    const aspectRatio = parseFloat(aspectRatioStr) || 1.0;
    const description = (formData.get("description") as string) || "";

    // 3. Process Slug & File Name
    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
    };

    let slug = slugify(title);
    if (!slug) slug = "untitled-" + Date.now();
    
    // Extract file extension
    const originalName = file.name;
    const extension = originalName.split(".").pop() || "png";
    const filename = `${slug}_${Date.now()}.${extension}`;

    // 4. Save Binary File (Cloudinary with Local Fallback)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let imageUrl = "";

    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                          process.env.CLOUDINARY_API_KEY && 
                          process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "art_gallery",
            public_id: `${slug}_${Date.now()}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    } else {
      const uploadDir = path.join(process.cwd(), "public", "images");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uploadPath = path.join(uploadDir, filename);
      fs.writeFileSync(uploadPath, buffer);
      imageUrl = `/images/${filename}`;
    }

    // 5. Update Database File
    const database = await getDatabase();

    // Ensure slug uniqueness
    let finalSlug = slug;
    let counter = 1;
    while (database.artworks.some((a: any) => a.slug === finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const newArtwork = {
      id: finalSlug,
      slug: finalSlug,
      title: title,
      artist: artist,
      year: year,
      medium: medium,
      dimensions: dimensions,
      status: status,
      imageUrl: imageUrl,
      aspectRatio: aspectRatio,
      description: description,
    };

    database.artworks.push(newArtwork);
    
    // Save back to database
    await saveDatabase(database);

    return NextResponse.json({
      success: true,
      artwork: newArtwork,
    });
  } catch (error) {
    console.error("Upload error details:", error);
    return NextResponse.json({ error: "Failed to upload artwork. Server error." }, { status: 500 });
  }
}
