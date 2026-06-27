"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { artworks, Artwork } from "@/data/galleryData";
import FilterTabBar from "@/components/FilterTabBar";
import ArtworkCard from "@/components/ArtworkCard";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [loadedArtworks, setLoadedArtworks] = useState<Artwork[]>(artworks);

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
      }
    };
    loadFreshArt();
  }, []);

  const categories = ["All", "Painting", "Sculpture", "Photography", "Drawing"];

  // Filtering logic helper
  const filteredArtworks = loadedArtworks.filter((artwork) => {
    if (activeCategory === "All") return true;
    
    const category = activeCategory.toLowerCase();
    const medium = artwork.medium.toLowerCase();
    
    if (category === "painting") {
      return medium.includes("paint") || medium.includes("linen") || medium.includes("canvas");
    }
    if (category === "sculpture") {
      return medium.includes("sculpture") || medium.includes("stone") || medium.includes("steel");
    }
    if (category === "photography") {
      return medium.includes("print") || medium.includes("photo") || medium.includes("rag");
    }
    if (category === "drawing") {
      return medium.includes("drawing") || medium.includes("paper") || medium.includes("charcoal") || medium.includes("graphite");
    }
    return false;
  });

  return (
    <div className="bg-bg-gallery min-h-screen pt-28 pb-24 md:pt-36 md:pb-36">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        {/* Editorial Heading */}
        <div className="mb-12 md:mb-16">
          <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-2 block">
            Portfolio
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-text-gallery-primary">
            Selected Works
          </h1>
        </div>

        {/* Tab Filters */}
        <div className="mb-12">
          <FilterTabBar
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        {/* Masonry Grid (CSS-based column layout to respect aspect ratios) */}
        <motion.div 
          layout 
          className="columns-1 md:columns-2 lg:columns-3 gap-8 [column-fill:_balance] space-y-8 w-full"
        >
          <AnimatePresence mode="popLayout">
            {filteredArtworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
                className="break-inside-avoid mb-8 w-full block"
              >
                <ArtworkCard artwork={artwork} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredArtworks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-24 text-center"
          >
            <p className="font-serif text-lg italic text-text-gallery-secondary">
              No works found in this category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
