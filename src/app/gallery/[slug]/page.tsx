"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { artworks, Artwork } from "@/data/galleryData";
import MetadataTable from "@/components/MetadataTable";
import StatusPill from "@/components/StatusPill";
import Lightbox from "@/components/Lightbox";
import ScaleVisualizer from "@/components/ScaleVisualizer";

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [frameStyle, setFrameStyle] = useState<"none" | "oak" | "black">("none");
  const [showScaleVisualizer, setShowScaleVisualizer] = useState(false);
  const [loadedArtworks, setLoadedArtworks] = useState<Artwork[]>(artworks);
  const [isLoading, setIsLoading] = useState(true);

  const slug = params?.slug as string;

  useEffect(() => {
    const loadFreshArt = async () => {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          if (data.artworks) {
            setLoadedArtworks(data.artworks);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic artworks list", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFreshArt();
  }, []);

  // Find current artwork
  const currentIndex = loadedArtworks.findIndex((a) => a.slug === slug);
  const artwork = loadedArtworks[currentIndex];

  if (isLoading) {
    return (
      <div className="bg-bg-gallery min-h-screen flex items-center justify-center pt-24">
        <div className="text-center font-sans text-xs uppercase tracking-[0.1em] text-text-gallery-secondary">
          Loading Artwork...
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="bg-bg-gallery min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <h1 className="font-serif text-3xl italic mb-4">Artwork Not Found</h1>
          <Link href="/gallery" className="font-sans text-xs uppercase tracking-[0.1em] border border-text-gallery-primary px-4 py-2 hover:bg-text-gallery-primary hover:text-white quiet-transition">
            Return to Gallery
          </Link>
        </div>
      </div>
    );
  }

  // Calculate prev/next artwork links
  const prevIndex = (currentIndex - 1 + loadedArtworks.length) % loadedArtworks.length;
  const nextIndex = (currentIndex + 1) % loadedArtworks.length;
  const prevArtwork = loadedArtworks[prevIndex];
  const nextArtwork = loadedArtworks[nextIndex];

  // Set up metadata rows
  const metadataRows = [
    { label: "Artist", value: artwork.artist },
    { label: "Medium", value: artwork.medium },
    { label: "Dimensions", value: artwork.dimensions },
    { label: "Year", value: artwork.year },
    { label: "Status", value: <StatusPill status={artwork.status} /> },
  ];

  return (
    <div className="bg-bg-gallery min-h-screen pt-24 pb-24 md:pt-32 md:pb-36 flex flex-col justify-center">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        {/* Breadcrumbs */}
        <div className="mb-8 md:mb-12">
          <Link
            href="/gallery"
            className="font-sans text-[10px] tracking-[0.08em] uppercase text-text-gallery-secondary hover:text-text-gallery-primary quiet-transition font-medium"
          >
            ← Back to Gallery
          </Link>
        </div>

        {/* Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Large Artwork Image (65% width) */}
          <motion.div
            className="lg:col-span-8 relative w-full border border-border-gallery-hairline/60 bg-bg-gallery-alt overflow-hidden custom-cursor-hover group flex items-center justify-center transition-all duration-300"
            style={{ aspectRatio: artwork.aspectRatio }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            onClick={() => setIsLightboxOpen(true)}
          >
            {/* Dynamic Frame Wrapper */}
            <div
              className={`relative w-full h-full quiet-transition ${
                frameStyle === "oak"
                  ? "p-4 md:p-6 bg-[#DECFB4] border border-black/10 shadow-md"
                  : frameStyle === "black"
                  ? "p-3 md:p-5 bg-[#1C1C1C] border border-white/5 shadow-md"
                  : "p-0"
              }`}
            >
              {/* Inner container providing a drop-shadow if framed to mimic canvas shadow */}
              <div className={`relative w-full h-full ${
                frameStyle !== "none" ? "shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] ring-1 ring-black/45" : ""
              }`}>
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZBRkFGOCIvPjwvc3ZnPg=="
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Metadata column (35% width) */}
          <motion.div
            className="lg:col-span-4 flex flex-col justify-between h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <div>
              {/* Title serif */}
              <h1 className="font-serif text-3xl md:text-4xl italic text-text-gallery-primary mb-6">
                {artwork.title}
              </h1>

              {/* Description */}
              <p className="font-sans text-xs md:text-sm leading-relaxed text-text-gallery-secondary mb-8">
                {artwork.description}
              </p>

              {/* Metadata Table */}
              <MetadataTable rows={metadataRows} />

              {/* Frame Selector Options */}
              <div className="mt-8 mb-6 border-b border-border-gallery-hairline/40 pb-5">
                <span className="font-sans text-[10px] tracking-[0.08em] uppercase text-text-gallery-secondary font-bold mb-3 block">
                  Frame Options
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFrameStyle("none")}
                    className={`font-sans text-[10px] tracking-[0.05em] uppercase quiet-transition pb-0.5 border-b cursor-pointer ${
                      frameStyle === "none"
                        ? "border-text-gallery-primary text-text-gallery-primary font-bold"
                        : "border-transparent text-text-gallery-secondary hover:text-text-gallery-primary"
                    }`}
                  >
                    Raw Canvas
                  </button>
                  <button
                    onClick={() => setFrameStyle("oak")}
                    className={`font-sans text-[10px] tracking-[0.05em] uppercase quiet-transition pb-0.5 border-b cursor-pointer ${
                      frameStyle === "oak"
                        ? "border-text-gallery-primary text-text-gallery-primary font-bold"
                        : "border-transparent text-text-gallery-secondary hover:text-text-gallery-primary"
                    }`}
                  >
                    Natural Oak
                  </button>
                  <button
                    onClick={() => setFrameStyle("black")}
                    className={`font-sans text-[10px] tracking-[0.05em] uppercase quiet-transition pb-0.5 border-b cursor-pointer ${
                      frameStyle === "black"
                        ? "border-text-gallery-primary text-text-gallery-primary font-bold"
                        : "border-transparent text-text-gallery-secondary hover:text-text-gallery-primary"
                    }`}
                  >
                    Black Matte
                  </button>
                </div>
              </div>

              {/* Scale Visualizer Trigger */}
              <div className="mt-6 mb-2">
                <button
                  onClick={() => setShowScaleVisualizer(!showScaleVisualizer)}
                  className="w-full bg-text-gallery-primary text-white hover:bg-black/90 py-3 text-center cursor-pointer transition-colors duration-200 font-sans text-[10px] tracking-[0.1em] uppercase font-bold select-none"
                >
                  {showScaleVisualizer ? "Close Scale Guide" : "View Scale Guide"}
                </button>
              </div>
            </div>

            {/* Prev / Next controls bottom right */}
            <div className="flex justify-end items-center gap-8 mt-12 pt-6 border-t border-border-gallery-hairline/20 select-none">
              <Link
                href={`/gallery/${prevArtwork.slug}`}
                className="font-sans text-[10px] md:text-xs tracking-[0.08em] uppercase text-text-gallery-secondary hover:text-text-gallery-primary quiet-transition font-medium"
              >
                [ Previous ]
              </Link>
              <span className="font-sans text-[10px] text-border-gallery-hairline">/</span>
              <Link
                href={`/gallery/${nextArtwork.slug}`}
                className="font-sans text-[10px] md:text-xs tracking-[0.08em] uppercase text-text-gallery-secondary hover:text-text-gallery-primary quiet-transition font-bold text-right"
              >
                [ Next ]
              </Link>
            </div>
          </motion.div>
        </div>

        {/* 3. Scale Visualizer Collapsible Panel */}
        {showScaleVisualizer && (
          <motion.div
            className="mt-16 md:mt-24 w-full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ScaleVisualizer
              dimensions={artwork.dimensions}
              title={artwork.title}
              imageUrl={artwork.imageUrl}
            />
          </motion.div>
        )}
      </div>

      {/* Full-screen Lightbox Zoom Viewer */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={artwork.imageUrl}
        imageAlt={`${artwork.title} (${artwork.year}) - ${artwork.medium}`}
      />
    </div>
  );
}
