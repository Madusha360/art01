import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { put, del } from "@vercel/blob";

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
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
    };

    let slug = slugify(title);
    if (!slug) slug = "exhibition-" + Date.now();

    // 3. Load DB
    const dbPath = path.join(process.cwd(), "src", "data", "galleryData.json");
    const dbData = fs.readFileSync(dbPath, "utf-8");
    const database = JSON.parse(dbData);

    let installShotUrl = "/images/exhibition_install.png"; // fallback

    // 4. File Processing (Vercel Blob with Local Fallback)
    if (file) {
      const originalName = file.name;
      const extension = originalName.split(".").pop() || "png";
      const filename = `exhibition_${slug}_${Date.now()}.${extension}`;

      const hasVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

      if (hasVercelBlob) {
        const blob = await put(filename, file, {
          access: "public",
        });
        installShotUrl = blob.url;
      } else {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadDir = path.join(process.cwd(), "public", "images");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uploadPath = path.join(uploadDir, filename);
        fs.writeFileSync(uploadPath, buffer);
        installShotUrl = `/images/${filename}`;
      }
    }

    // 5. Create or Update Entry
    if (id) {
      // --- UPDATE MODE ---
      const exhibitionIndex = database.exhibitions.findIndex((e: any) => e.id === id);
      if (exhibitionIndex === -1) {
        return NextResponse.json({ error: "Exhibition not found." }, { status: 404 });
      }

      const existingExhibition = database.exhibitions[exhibitionIndex];

      // Keep existing image if no new file is uploaded
      if (!file) {
        installShotUrl = existingExhibition.installShotUrl;
      } else {
        // Delete old image if it was a user-uploaded one (not stock)
        if (
          existingExhibition.installShotUrl.startsWith("https://") &&
          existingExhibition.installShotUrl.includes("public.blob.vercel-storage.com")
        ) {
          try {
            await del(existingExhibition.installShotUrl);
          } catch (err) {
            console.error("Failed to delete old Vercel Blob image:", err);
          }
        } else if (
          existingExhibition.installShotUrl.startsWith("/images/") &&
          !existingExhibition.installShotUrl.includes("exhibition_install") &&
          !existingExhibition.installShotUrl.includes("artwork_") &&
          !existingExhibition.installShotUrl.includes("artist_")
        ) {
          const oldFilePath = path.join(process.cwd(), "public", existingExhibition.installShotUrl);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (err) {
              console.error("Failed to delete old local image:", err);
            }
          }
        }
      }

      // Generate unique slug for updated title if it changed
      let finalSlug = slug;
      if (existingExhibition.title !== title) {
        let counter = 1;
        while (database.exhibitions.some((e: any) => e.slug === finalSlug && e.id !== id)) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
      } else {
        finalSlug = existingExhibition.slug;
      }

      const updatedExhibition = {
        ...existingExhibition,
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

      database.exhibitions[exhibitionIndex] = updatedExhibition;
    } else {
      // --- CREATE MODE ---
      // Ensure slug uniqueness
      let finalSlug = slug;
      let counter = 1;
      while (database.exhibitions.some((e: any) => e.slug === finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      const newExhibition = {
        id: finalSlug,
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

      database.exhibitions.push(newExhibition);
    }

    // Save back to JSON file
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exhibition save error details:", error);
    return NextResponse.json({ error: "Failed to save exhibition. Server error." }, { status: 500 });
  }
}
