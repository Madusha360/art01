import clientPromise from "./mongodb";
import * as fs from "fs";
import * as path from "path";

let isSeeded = false;

async function checkAndSeed() {
  if (isSeeded) return;
  const client = await clientPromise;
  const db = client.db("gallery");
  
  // Check if collections are empty
  const artworksCount = await db.collection<any>("artworks").countDocuments();
  const exhibitionsCount = await db.collection<any>("exhibitions").countDocuments();
  const bioCount = await db.collection<any>("config").countDocuments();

  if (artworksCount === 0 && exhibitionsCount === 0 && bioCount === 0) {
    console.log("MongoDB is empty. Auto-seeding from local galleryData.json...");
    try {
      const localDbPath = path.join(process.cwd(), "src", "data", "galleryData.json");
      if (fs.existsSync(localDbPath)) {
        const fileContents = fs.readFileSync(localDbPath, "utf8");
        const seedData = JSON.parse(fileContents);

        if (seedData.artworks && seedData.artworks.length > 0) {
          const docs = seedData.artworks.map((item: any) => {
            const { id, ...rest } = item;
            return { _id: id, ...rest };
          });
          await db.collection<any>("artworks").insertMany(docs);
        }

        if (seedData.exhibitions && seedData.exhibitions.length > 0) {
          const docs = seedData.exhibitions.map((item: any) => {
            const { id, ...rest } = item;
            return { _id: id, ...rest };
          });
          await db.collection<any>("exhibitions").insertMany(docs);
        }

        if (seedData.artistBio) {
          await db.collection<any>("config").updateOne(
            { _id: "artistBio" },
            { $set: seedData.artistBio },
            { upsert: true }
          );
        }
        console.log("Auto-seeding completed successfully!");
      }
    } catch (error) {
      console.error("Auto-seeding failed:", error);
    }
  }
  isSeeded = true;
}

// ==========================================
// ARTWORKS
// ==========================================

export async function getArtworks(): Promise<Record<string, any>[]> {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  const items = await db.collection<any>("artworks").find({}).toArray();
  return items.map(item => ({ id: item._id, ...item, _id: undefined }));
}

export async function getArtwork(id: string): Promise<Record<string, any> | null> {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  const item = await db.collection<any>("artworks").findOne({ _id: id });
  if (!item) return null;
  return { id: item._id, ...item, _id: undefined };
}

export async function addArtwork(id: string, data: Record<string, unknown>) {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  await db.collection<any>("artworks").updateOne(
    { _id: id },
    { $set: data },
    { upsert: true }
  );
}

export async function deleteArtworkDoc(id: string) {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  await db.collection<any>("artworks").deleteOne({ _id: id });
}

// ==========================================
// EXHIBITIONS
// ==========================================

export async function getExhibitions(): Promise<Record<string, any>[]> {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  const items = await db.collection<any>("exhibitions").find({}).toArray();
  return items.map(item => ({ id: item._id, ...item, _id: undefined }));
}

export async function getExhibition(id: string): Promise<Record<string, any> | null> {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  const item = await db.collection<any>("exhibitions").findOne({ _id: id });
  if (!item) return null;
  return { id: item._id, ...item, _id: undefined };
}

export async function addExhibition(
  id: string,
  data: Record<string, unknown>
) {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  await db.collection<any>("exhibitions").updateOne(
    { _id: id },
    { $set: data },
    { upsert: true }
  );
}

export async function updateExhibition(
  id: string,
  data: Record<string, unknown>
) {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  await db.collection<any>("exhibitions").updateOne(
    { _id: id },
    { $set: data }
  );
}

export async function deleteExhibitionDoc(id: string) {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  await db.collection<any>("exhibitions").deleteOne({ _id: id });
}

// ==========================================
// ARTIST BIO
// ==========================================

export async function getArtistBio(): Promise<Record<string, any> | null> {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  const item = await db.collection<any>("config").findOne({ _id: "artistBio" });
  if (!item) return null;
  return { ...item, _id: undefined };
}

export async function setArtistBio(data: Record<string, unknown>) {
  await checkAndSeed();
  const client = await clientPromise;
  const db = client.db("gallery");
  await db.collection<any>("config").updateOne(
    { _id: "artistBio" },
    { $set: data },
    { upsert: true }
  );
}

// ==========================================
// IMAGE STORAGE
// ==========================================

export async function uploadImage(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const client = await clientPromise;
  const db = client.db("gallery");
  await db.collection<any>("images").updateOne(
    { _id: filePath },
    { $set: { data: fileBuffer.toString("base64"), contentType } },
    { upsert: true }
  );
  return `/api/images/${filePath}`;
}

export async function deleteImage(imageUrl: string) {
  if (imageUrl.startsWith("/api/images/")) {
    const filePath = imageUrl.replace("/api/images/", "");
    const client = await clientPromise;
    const db = client.db("gallery");
    await db.collection<any>("images").deleteOne({ _id: filePath });
  }
}

// ==========================================
// FULL DATABASE
// ==========================================

export async function getFullDatabase() {
  const [artworks, exhibitions, artistBio] = await Promise.all([
    getArtworks(),
    getExhibitions(),
    getArtistBio(),
  ]);

  return {
    artworks,
    exhibitions,
    artistBio: artistBio || null,
  };
}
