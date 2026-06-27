"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { exhibitions, artworks, Exhibition, Artwork } from "@/data/galleryData";
import ArtworkCard from "@/components/ArtworkCard";

export default function ExhibitionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loadedExhibitions, setLoadedExhibitions] = useState<Exhibition[]>(exhibitions);
  const [loadedArtworks, setLoadedArtworks] = useState<Artwork[]>(artworks);

  useEffect(() => {
    const loadFreshData = async () => {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          if (data.exhibitions) setLoadedExhibitions(data.exhibitions);
          if (data.artworks) setLoadedArtworks(data.artworks);
        }
      } catch (err) {
        console.error("Failed to load dynamic data for exhibition details", err);
      }
    };
    loadFreshData();
  }, []);

  // Find current exhibition
  const exhibition = loadedExhibitions.find((e) => e.slug === slug);

  if (!exhibition) {
    return (
      <div className="bg-bg-gallery min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <h1 className="font-serif text-3xl italic mb-4">Exhibition Not Found</h1>
          <Link href="/exhibitions" className="font-sans text-xs uppercase tracking-[0.1em] border border-text-gallery-primary px-4 py-2 hover:bg-text-gallery-primary hover:text-white quiet-transition">
            Return to Exhibitions
          </Link>
        </div>
      </div>
    );
  }

  // Get featured artworks for this exhibition
  const featuredArtworks = loadedArtworks.filter((art) =>
    exhibition.featuredArtworkIds.includes(art.id)
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div className="bg-bg-gallery min-h-screen pt-16 pb-24 md:pb-36">
      {/* 1. Full-Width Install Shot Banner */}
      <div className="relative w-full h-[45vh] md:h-[60vh] border-b border-border-gallery-hairline/60 bg-bg-gallery-alt">
        <Image
          src={exhibition.installShotUrl}
          alt={`Installation view of ${exhibition.title}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Scrim */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full mt-12 md:mt-16">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/exhibitions"
            className="font-sans text-[10px] tracking-[0.08em] uppercase text-text-gallery-secondary hover:text-text-gallery-primary quiet-transition font-medium"
          >
            ← Back to Exhibitions
          </Link>
        </div>

        {/* 2. Exhibition Header Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-baseline border-b border-border-gallery-hairline pb-12">
          {/* Left Column: Title, Dates, Venue (5 cols) */}
          <div className="lg:col-span-5">
            <span className="font-sans text-[9px] tracking-[0.1em] uppercase text-text-gallery-secondary font-semibold block mb-3">
              {exhibition.status} Exhibition
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-normal text-text-gallery-primary mb-4 leading-tight">
              {exhibition.title}
            </h1>
            <p className="font-sans text-xs tracking-wider uppercase text-text-gallery-secondary mb-4 font-semibold">
              {exhibition.subtitle}
            </p>
            <div className="font-sans text-xs space-y-1 text-text-gallery-secondary">
              <p className="font-medium text-text-gallery-primary">
                {exhibition.venue}, {exhibition.city}
              </p>
              <p>
                {formatDate(exhibition.startDate)} — {formatDate(exhibition.endDate)}
              </p>
            </div>
          </div>

          {/* Right Column: Curatorial Essay Paragraph (7 cols) */}
          <div className="lg:col-span-7">
            <h3 className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-primary font-bold mb-4">
              Curatorial Statement
            </h3>
            <p className="font-sans text-sm md:text-base leading-relaxed text-text-gallery-secondary space-y-4">
              {exhibition.curatorialText}
            </p>
          </div>
        </div>

        {/* 3. Grid of Featured Works */}
        {featuredArtworks.length > 0 && (
          <div className="mt-20 md:mt-28">
            <div className="border-b border-border-gallery-hairline pb-4 mb-10">
              <h2 className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-primary font-bold">
                Exhibited Artworks
              </h2>
            </div>
            {/* Masonry or flexible grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 items-start">
              {featuredArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          </div>
        )}

        {/* 4. Press Mentions (Plain text list at the bottom) */}
        {exhibition.pressMentions && exhibition.pressMentions.length > 0 && (
          <div className="mt-24 md:mt-32 max-w-3xl">
            <div className="border-b border-border-gallery-hairline pb-4 mb-6">
              <h2 className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-primary font-bold">
                Selected Press Coverage
              </h2>
            </div>
            <ul className="divide-y divide-border-gallery-hairline/60">
              {exhibition.pressMentions.map((press, i) => (
                <li
                  key={i}
                  className="py-4 font-serif text-sm md:text-base italic text-text-gallery-secondary"
                >
                  {press}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
