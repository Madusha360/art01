import { NextResponse } from "next/server";
import {
  getExhibitions,
  getExhibition,
  addExhibition,
  updateExhibition,
  uploadImage,
  deleteImage,
} from "@/lib/firebaseService";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // 1. Password Verification
    const passcode = formData.get("passcode") as string;
    if (passcode !== "1234") {
      return NextResponse.json({ error: "Unauthorized. Incorrect passcode." }, { status: 401 });
    }

    // Extract fields
    const id = formData.get("id") as string | null; // Null means CREATE, otherwise UPDATE
    const title = (formData.get("title") as string) || "Untitled Exhibition";
    const subtitle = (formData.get("subtitle") as string) || "";
    const venue = (formData.get("venue") as string) || "";
    const city = (formData.get("city") as string) || "";
    const startDate = (formData.get("startDate") as string) || "";
    const endDate = (formData.get("endDate") as string) || "";
    const status = (formData.get("status") as "Current" | "Upcoming" | "Past") || "Upcoming";
    const curatorialText = (formData.get("curatorialText") as string) || "";
    
    // Parse arrays from string payloads
    const featuredArtworksRaw = formData.get("featuredArtworkIds") as string;
    const featuredArtworkIds = featuredArtworksRaw
      ? featuredArtworksRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
      
    const pressMentionsRaw = formData.get("pressMentions") as string;
    const pressMentions = pressMentionsRaw
      ? pressMentionsRaw.split("\n").map((s) => s.trim()).filter(Boolean)
      : [];

    const file = formData.get("file") as File | null;

    // 2. Slugify Helper
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
    if (!slug) slug = "exhibition-" + Date.now();

    let installShotUrl = ""; // Will be set below

    // 3. File Processing (Firebase Storage)
    if (file) {
      const extension = file.name.split(".").pop() || "png";
      const filename = `exhibitions/exhibition_${slug}_${Date.now()}.${extension}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      installShotUrl = await uploadImage(filename, buffer, file.type);
    }

    // 4. Create or Update Entry
    if (id) {
      // --- UPDATE MODE ---
      const existingExhibition = await getExhibition(id);
      if (!existingExhibition) {
        return NextResponse.json({ error: "Exhibition not found." }, { status: 404 });
      }

      // Keep existing image if no new file is uploaded
      if (!file) {
        installShotUrl = existingExhibition.installShotUrl as string;
      } else {
        // Delete old image from Firebase Storage
        const oldUrl = existingExhibition.installShotUrl as string;
        if (oldUrl) {
          await deleteImage(oldUrl);
        }
      }

      // Generate unique slug for updated title if it changed
      let finalSlug = slug;
      if (existingExhibition.title !== title) {
        const allExhibitions = await getExhibitions();
        let counter = 1;
        while (allExhibitions.some((e: any) => e.slug === finalSlug && e.id !== id)) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
      } else {
        finalSlug = existingExhibition.slug as string;
      }

      const updatedData = {
        title,
        slug: finalSlug,
        subtitle,
        venue,
        city,
        startDate,
        endDate,
        status,
        installShotUrl,
        curatorialText,
        featuredArtworkIds,
        pressMentions,
      };

      await updateExhibition(id, updatedData);
    } else {
      // --- CREATE MODE ---
      const allExhibitions = await getExhibitions();
      let finalSlug = slug;
      let counter = 1;
      while (allExhibitions.some((e: any) => e.slug === finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      // Use a default placeholder if no image was uploaded
      if (!installShotUrl) {
        installShotUrl = "/images/exhibition_install.png";
      }

      const newExhibition = {
        slug: finalSlug,
        title,
        subtitle,
        venue,
        city,
        startDate,
        endDate,
        status,
        installShotUrl,
        curatorialText,
        featuredArtworkIds,
        pressMentions,
      };

      await addExhibition(finalSlug, newExhibition);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exhibition save error details:", error);
    return NextResponse.json({ error: "Failed to save exhibition. Server error." }, { status: 500 });
  }
}
