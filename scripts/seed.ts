/**
 * Seed Script — Migrate existing galleryData.json to Firebase
 * 
 * Run with: npx tsx scripts/seed.ts
 * 
 * This reads the local JSON data and uploads all documents to Firestore.
 * Images in public/images/ are uploaded to Firebase Storage and URLs are updated.
 * 
 * NOTE: Set your Firebase env vars in .env.local before running.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local manually (no dotenv needed)
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (key && value) {
      process.env[key] = value;
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Firebase config:", {
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
});

if (!firebaseConfig.projectId) {
  console.error("ERROR: Firebase config is missing. Make sure .env.local has your Firebase values.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Load existing JSON data
const dataPath = path.join(__dirname, "..", "src", "data", "galleryData.json");
const rawData = fs.readFileSync(dataPath, "utf-8");
const data = JSON.parse(rawData);

async function uploadLocalImage(localPath: string, storagePath: string): Promise<string> {
  const fullPath = path.join(__dirname, "..", "public", localPath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠ Image not found: ${fullPath}, keeping original URL`);
    return localPath;
  }

  const buffer = fs.readFileSync(fullPath);
  const storageRef = ref(storage, storagePath);
  
  // Determine content type from extension
  const ext = path.extname(fullPath).toLowerCase();
  const contentTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  const contentType = contentTypes[ext] || "image/png";

  await uploadBytes(storageRef, buffer, { contentType });
  const downloadURL = await getDownloadURL(storageRef);
  console.log(`  ✓ Uploaded ${localPath} → ${storagePath}`);
  return downloadURL;
}

async function seedArtworks() {
  console.log("\n📦 Seeding artworks...");
  for (const artwork of data.artworks) {
    // Upload image to Firebase Storage
    if (artwork.imageUrl.startsWith("/images/")) {
      const filename = path.basename(artwork.imageUrl);
      artwork.imageUrl = await uploadLocalImage(artwork.imageUrl, `artworks/${filename}`);
    }

    const { id, ...docData } = artwork;
    await setDoc(doc(db, "artworks", id), docData);
    console.log(`  ✓ Artwork: ${artwork.title} (${id})`);
  }
}

async function seedExhibitions() {
  console.log("\n📦 Seeding exhibitions...");
  for (const exhibition of data.exhibitions) {
    // Upload install shot to Firebase Storage
    if (exhibition.installShotUrl.startsWith("/images/")) {
      const filename = path.basename(exhibition.installShotUrl);
      exhibition.installShotUrl = await uploadLocalImage(exhibition.installShotUrl, `exhibitions/${filename}`);
    }

    const { id, ...docData } = exhibition;
    await setDoc(doc(db, "exhibitions", id), docData);
    console.log(`  ✓ Exhibition: ${exhibition.title} (${id})`);
  }
}

async function seedArtistBio() {
  console.log("\n📦 Seeding artist bio...");
  const bio = data.artistBio;
  
  // Upload portrait
  if (bio.portraitUrl.startsWith("/images/")) {
    const filename = path.basename(bio.portraitUrl);
    bio.portraitUrl = await uploadLocalImage(bio.portraitUrl, `bio/${filename}`);
  }

  await setDoc(doc(db, "config", "artistBio"), bio);
  console.log(`  ✓ Artist bio: ${bio.name}`);
}

async function main() {
  console.log("🚀 Starting Firebase seed migration...");
  
  await seedArtworks();
  await seedExhibitions();
  await seedArtistBio();
  
  console.log("\n✅ Seed complete! All data migrated to Firebase.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
