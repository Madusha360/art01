import { db, storage } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as fs from "fs";
import * as path from "path";

// ==========================================
// LOCAL FALLBACK DATABASE CONFIG
// ==========================================

const useLocalDatabase = !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const localDbPath = path.join(process.cwd(), "src", "data", "galleryData.json");

function readLocalDb() {
  try {
    const fileContents = fs.readFileSync(localDbPath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to read local database file:", error);
    return { artworks: [], exhibitions: [], artistBio: null };
  }
}

function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to write to local database file:", error);
  }
}

// ==========================================
// ARTWORKS
// ==========================================

export async function getArtworks(): Promise<Record<string, any>[]> {
  if (useLocalDatabase) {
    return readLocalDb().artworks || [];
  }
  const snapshot = await getDocs(collection(db, "artworks"));
  return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function getArtwork(id: string): Promise<Record<string, any> | null> {
  if (useLocalDatabase) {
    const database = readLocalDb();
    const artworks = database.artworks || [];
    return artworks.find((a: any) => a.id === id) || null;
  }
  const docRef = doc(db, "artworks", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function addArtwork(id: string, data: Record<string, unknown>) {
  if (useLocalDatabase) {
    const database = readLocalDb();
    database.artworks = database.artworks || [];
    const idx = database.artworks.findIndex((a: any) => a.id === id);
    const item = { id, ...data };
    if (idx !== -1) {
      database.artworks[idx] = item;
    } else {
      database.artworks.push(item);
    }
    writeLocalDb(database);
    return;
  }
  const docRef = doc(db, "artworks", id);
  await setDoc(docRef, data);
}

export async function deleteArtworkDoc(id: string) {
  if (useLocalDatabase) {
    const database = readLocalDb();
    database.artworks = (database.artworks || []).filter((a: any) => a.id !== id);
    writeLocalDb(database);
    return;
  }
  const docRef = doc(db, "artworks", id);
  await deleteDoc(docRef);
}

// ==========================================
// EXHIBITIONS
// ==========================================

export async function getExhibitions(): Promise<Record<string, any>[]> {
  if (useLocalDatabase) {
    return readLocalDb().exhibitions || [];
  }
  const snapshot = await getDocs(collection(db, "exhibitions"));
  return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function getExhibition(id: string): Promise<Record<string, any> | null> {
  if (useLocalDatabase) {
    const database = readLocalDb();
    const exhibitions = database.exhibitions || [];
    return exhibitions.find((e: any) => e.id === id) || null;
  }
  const docRef = doc(db, "exhibitions", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function addExhibition(
  id: string,
  data: Record<string, unknown>
) {
  if (useLocalDatabase) {
    const database = readLocalDb();
    database.exhibitions = database.exhibitions || [];
    const idx = database.exhibitions.findIndex((e: any) => e.id === id);
    const item = { id, ...data };
    if (idx !== -1) {
      database.exhibitions[idx] = item;
    } else {
      database.exhibitions.push(item);
    }
    writeLocalDb(database);
    return;
  }
  const docRef = doc(db, "exhibitions", id);
  await setDoc(docRef, data);
}

export async function updateExhibition(
  id: string,
  data: Record<string, unknown>
) {
  if (useLocalDatabase) {
    const database = readLocalDb();
    database.exhibitions = database.exhibitions || [];
    const idx = database.exhibitions.findIndex((e: any) => e.id === id);
    if (idx !== -1) {
      database.exhibitions[idx] = { ...database.exhibitions[idx], ...data };
      writeLocalDb(database);
    }
    return;
  }
  const docRef = doc(db, "exhibitions", id);
  await updateDoc(docRef, data);
}

export async function deleteExhibitionDoc(id: string) {
  if (useLocalDatabase) {
    const database = readLocalDb();
    database.exhibitions = (database.exhibitions || []).filter((e: any) => e.id !== id);
    writeLocalDb(database);
    return;
  }
  const docRef = doc(db, "exhibitions", id);
  await deleteDoc(docRef);
}

// ==========================================
// ARTIST BIO
// ==========================================

export async function getArtistBio(): Promise<Record<string, any> | null> {
  if (useLocalDatabase) {
    return readLocalDb().artistBio || null;
  }
  const docRef = doc(db, "config", "artistBio");
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as Record<string, any>;
}

export async function setArtistBio(data: Record<string, unknown>) {
  if (useLocalDatabase) {
    const database = readLocalDb();
    database.artistBio = data;
    writeLocalDb(database);
    return;
  }
  const docRef = doc(db, "config", "artistBio");
  await setDoc(docRef, data);
}

// ==========================================
// FIREBASE STORAGE (Images)
// ==========================================

export async function uploadImage(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  if (useLocalDatabase) {
    const fileName = path.basename(filePath);
    const publicDir = path.join(process.cwd(), "public", "images");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const absolutePath = path.join(publicDir, fileName);
    fs.writeFileSync(absolutePath, fileBuffer);
    return `/images/${fileName}`;
  }
  const storageRef = ref(storage, filePath);
  const snapshot = await uploadBytes(storageRef, fileBuffer, { contentType });
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

export async function deleteImage(imageUrl: string) {
  if (useLocalDatabase) {
    if (imageUrl.startsWith("/images/")) {
      const fileName = path.basename(imageUrl);
      const absolutePath = path.join(process.cwd(), "public", "images", fileName);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (error) {
          console.error("Failed to delete local image file:", error);
        }
      }
    }
    return;
  }
  try {
    // Only delete Firebase Storage URLs (not local /images/ paths)
    if (imageUrl.includes("firebasestorage.googleapis.com")) {
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    }
  } catch (error) {
    console.error("Failed to delete image from storage:", error);
    // Don't throw — image deletion failure shouldn't block document deletion
  }
}

// ==========================================
// FULL DATABASE (for /api/gallery GET)
// ==========================================

export async function getFullDatabase() {
  if (useLocalDatabase) {
    const database = readLocalDb();
    return {
      artworks: database.artworks || [],
      exhibitions: database.exhibitions || [],
      artistBio: database.artistBio || null,
    };
  }
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
