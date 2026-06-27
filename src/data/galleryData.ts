import galleryData from "./galleryData.json";

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  artist: string;
  year: string;
  medium: string;
  dimensions: string;
  status: 'Available' | 'Sold' | 'Private Collection';
  imageUrl: string;
  aspectRatio: number; // width / height
  description: string;
}

export interface Exhibition {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  status: 'Current' | 'Upcoming' | 'Past';
  installShotUrl: string;
  curatorialText: string;
  featuredArtworkIds: string[];
  pressMentions: string[];
}

export interface ArtistBio {
  name: string;
  portraitUrl: string;
  bioParagraphs: string[];
  education: { degree: string; school: string; year: string }[];
  awards: { title: string; organization: string; year: string }[];
  selectedPress: { title: string; publication: string; year: string }[];
}

// Export data loaded from JSON
export const artworks = galleryData.artworks as Artwork[];
export const exhibitions = galleryData.exhibitions as Exhibition[];
export const artistBio = galleryData.artistBio as ArtistBio;
