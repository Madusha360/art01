"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Artwork } from "@/data/galleryData";
import ArtworkCard from "@/components/ArtworkCard";

export default function Home() {
  const [loadedArtworks, setLoadedArtworks] = useState<Artwork[]>([]);

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

  // Get the featured artwork for the hero
  const heroArtwork = loadedArtworks.find((a) => a.id === "silence-in-ochre") || loadedArtworks[0];

  // Filter out the hero artwork for the recent works strip
  const recentWorks = loadedArtworks.filter((a) => a.id !== "silence-in-ochre");

  // Get current exhibition
  const currentExhibition = exhibitions.find((e) => e.status === "Current") || exhibitions[0];

  // Motion container and item variants for scroll reveals
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Quiet ease-out
      }
    },
  };

  return (
    <div className="w-full bg-bg-gallery min-h-screen">
      {/* 1. Full-Bleed Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-end">
        {/* Full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroArtwork.imageUrl}
            alt={heroArtwork.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Quiet scrim overlay at bottom for readability */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />

        {/* Text Overlay Bottom-Left */}
        <div className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-12 w-full pb-16 text-white select-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Serif Artist Name */}
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-tight drop-shadow-sm text-text-gallery-primary">
              {heroArtwork.artist}
            </h1>
            
            {/* Sans word caption */}
            <p className="font-sans text-[11px] md:text-xs uppercase tracking-[0.15em] mt-3 text-text-gallery-primary font-medium">
              Featured Canvas: <span className="font-serif italic capitalize normal-case text-sm ml-1 font-normal">{heroArtwork.title}</span>, {heroArtwork.year}
            </p>
          </motion.div>
        </div>

        {/* Slow Indicator Arrow */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <motion.span
            className="font-sans text-[9px] tracking-[0.2em] uppercase text-text-gallery-primary font-medium"
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            Scroll
          </motion.span>
        </div>
      </section>

      {/* 2. Recent Works Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <motion.div 
          className="w-full"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Header Section */}
          <div className="flex justify-between items-baseline border-b border-border-gallery-hairline pb-4 mb-12">
            <h2 className="font-sans text-[10px] md:text-xs font-bold tracking-[0.1em] uppercase text-text-gallery-primary">
              Recent Work
            </h2>
            <Link 
              href="/gallery" 
              className="font-sans text-[10px] md:text-xs tracking-[0.08em] uppercase text-text-gallery-secondary hover:text-text-gallery-primary quiet-transition font-medium"
            >
              View Full Gallery
            </Link>
          </div>

          {/* Artworks Strip (Responsive Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
            {recentWorks.slice(0, 3).map((artwork) => (
              <motion.div key={artwork.id} variants={itemVariants}>
                <ArtworkCard artwork={artwork} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3. Latest Exhibition Block */}
      <section className="bg-bg-gallery-alt border-t border-b border-border-gallery-hairline/60 py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Exhibition Banner on Left */}
            <div className="lg:col-span-7 relative w-full aspect-[4/3] border border-border-gallery-hairline/60 overflow-hidden group custom-cursor-hover">
              <Link href={`/exhibitions/${currentExhibition.slug}`}>
                <Image
                  src={currentExhibition.installShotUrl}
                  alt={currentExhibition.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-101"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </Link>
            </div>

            {/* Exhibition Details on Right */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-4">
                Current Exhibition
              </span>
              <h3 className="font-serif text-3xl md:text-4xl font-normal text-text-gallery-primary mb-2">
                {currentExhibition.title}
              </h3>
              <p className="font-sans text-xs tracking-[0.05em] uppercase text-text-gallery-secondary mb-6 font-medium">
                {currentExhibition.venue} — {currentExhibition.city}
              </p>
              
              <div className="border-t border-border-gallery-hairline/60 pt-6">
                <p className="font-sans text-xs leading-relaxed text-text-gallery-secondary mb-8">
                  {currentExhibition.curatorialText}
                </p>
                <Link
                  href={`/exhibitions/${currentExhibition.slug}`}
                  className="inline-block bg-text-gallery-primary text-white hover:bg-black/90 px-6 py-3 font-sans text-[10px] md:text-xs tracking-[0.1em] uppercase font-bold quiet-transition select-none"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Studio Note (Refined Typography) */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 md:py-48 flex justify-center items-center">
        <motion.div
          className="max-w-2xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <p className="font-serif text-lg md:text-xl lg:text-2xl text-text-gallery-secondary italic leading-relaxed font-normal">
            &ldquo;Elena Rostova&rsquo;s studio practice centers on the deliberate reduction of form, allowing empty space and architectural light to perform as active elements of the visual dialogue.&rdquo;
          </p>
          <div className="mt-8 flex justify-center">
            <span className="h-[1px] w-12 bg-border-gallery-hairline" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
