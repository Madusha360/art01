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

// ==========================================
// ARTWORKS
// ==========================================

export async function getArtworks(): Promise<Record<string, any>[]> {
  const snapshot = await getDocs(collection(db, "artworks"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getArtwork(id: string): Promise<Record<string, any> | null> {
  const docRef = doc(db, "artworks", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function addArtwork(id: string, data: Record<string, unknown>) {
  const docRef = doc(db, "artworks", id);
  await setDoc(docRef, data);
}

export async function deleteArtworkDoc(id: string) {
  const docRef = doc(db, "artworks", id);
  await deleteDoc(docRef);
}

// ==========================================
// EXHIBITIONS
// ==========================================

export async function getExhibitions(): Promise<Record<string, any>[]> {
  const snapshot = await getDocs(collection(db, "exhibitions"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getExhibition(id: string): Promise<Record<string, any> | null> {
  const docRef = doc(db, "exhibitions", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function addExhibition(
  id: string,
  data: Record<string, unknown>
) {
  const docRef = doc(db, "exhibitions", id);
  await setDoc(docRef, data);
}

export async function updateExhibition(
  id: string,
  data: Record<string, unknown>
) {
  const docRef = doc(db, "exhibitions", id);
  await updateDoc(docRef, data);
}

export async function deleteExhibitionDoc(id: string) {
  const docRef = doc(db, "exhibitions", id);
  await deleteDoc(docRef);
}

// ==========================================
// ARTIST BIO
// ==========================================

export async function getArtistBio(): Promise<Record<string, any> | null> {
  const docRef = doc(db, "config", "artistBio");
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as Record<string, any>;
}

export async function setArtistBio(data: Record<string, unknown>) {
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
  const storageRef = ref(storage, filePath);
  const snapshot = await uploadBytes(storageRef, fileBuffer, { contentType });
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

export async function deleteImage(imageUrl: string) {
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
