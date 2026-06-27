"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Artwork } from "@/data/galleryData";

interface ArtworkCardProps {
  artwork: Artwork;
  priority?: boolean;
}

export default function ArtworkCard({ artwork, priority = false }: ArtworkCardProps) {
  // Framer Motion variants for the slide-up black overlay
  const overlayVariants: Variants = {
    initial: { y: "101%" },
    hover: { 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1], // Custom ease-out cubic for premium feel
      }
    }
  };

  const imageVariants: Variants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <Link href={`/gallery/${artwork.slug}`} className="block group">
      <motion.div
        className="relative overflow-hidden bg-bg-gallery-alt border-hairline w-full custom-cursor-hover"
        style={{ aspectRatio: artwork.aspectRatio }}
        whileHover="hover"
        initial="initial"
        animate="initial"
      >
        {/* Artwork Image */}
        <motion.div className="w-full h-full relative" variants={imageVariants}>
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover quiet-transition"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZBRkFGOCIvPjwvc3ZnPg=="
          />
        </motion.div>

        {/* Slide-up Black Overlay (Quiet motion hover reveal) */}
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-text-gallery-primary text-white p-6 flex flex-col justify-end z-10"
          variants={overlayVariants}
        >
          {/* Headline editorial serif for Title */}
          <h3 className="font-serif text-base md:text-lg mb-1 italic">
            {artwork.title}
          </h3>
          {/* Sans-grotesk for metadata */}
          <div className="font-sans text-[10px] md:text-xs tracking-[0.05em] text-white/70 space-y-0.5 uppercase">
            <p>{artwork.medium}</p>
            <p className="text-white font-semibold mt-1">{artwork.year}</p>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
