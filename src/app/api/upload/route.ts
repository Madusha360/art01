import { NextResponse } from "next/server";
import { getArtworks, addArtwork, uploadImage } from "@/lib/firebaseService";

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
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
    };

    let slug = slugify(title);
    if (!slug) slug = "untitled-" + Date.now();

    // 4. Upload Image to Firebase Storage
    const extension = file.name.split(".").pop() || "png";
    const filename = `artworks/${slug}_${Date.now()}.${extension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageUrl = await uploadImage(filename, buffer, file.type);

    // 5. Ensure slug uniqueness in Firestore
    const existingArtworks = await getArtworks();
    let finalSlug = slug;
    let counter = 1;
    while (existingArtworks.some((a: any) => a.slug === finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const newArtwork = {
      slug: finalSlug,
      title,
      artist,
      year,
      medium,
      dimensions,
      status,
      imageUrl,
      aspectRatio,
      description,
    };

    // 6. Save to Firestore
    await addArtwork(finalSlug, newArtwork);

    return NextResponse.json({
      success: true,
      artwork: { id: finalSlug, ...newArtwork },
    });
  } catch (error) {
    console.error("Upload error details:", error);
    return NextResponse.json({ error: "Failed to upload artwork. Server error." }, { status: 500 });
  }
}
