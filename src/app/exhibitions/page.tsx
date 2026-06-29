"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Exhibition } from "@/data/galleryData";
import TimelineRow from "@/components/TimelineRow";

export default function ExhibitionsPage() {
  const [loadedExhibitions, setLoadedExhibitions] = useState<Exhibition[]>([]);

  useEffect(() => {
    const loadFreshExhibitions = async () => {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          if (data.exhibitions) {
            setLoadedExhibitions(data.exhibitions);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic exhibitions list", err);
      }
    };
    loadFreshExhibitions();
  }, []);

  // Sort exhibitions: Upcoming & Current first, then Past (latest to oldest)
  const sortedExhibitions = [...loadedExhibitions].sort((a, b) => {
    const statusWeight = { Current: 0, Upcoming: 1, Past: 2 };
    return statusWeight[a.status] - statusWeight[b.status];
  });

  // Find the featured "Current" exhibition to highlight in the bordered box
  const currentShow = loadedExhibitions.find((e) => e.status === "Current") || loadedExhibitions[0];

  // Format date helper
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div className="bg-bg-gallery min-h-screen pt-28 pb-24 md:pt-36 md:pb-36">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        {/* Page Title */}
        <div className="mb-12 md:mb-16">
          <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-2 block">
            Exhibitions
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-text-gallery-primary">
            Program Chronology
          </h1>
        </div>

        {/* Featured Current/Upcoming Show in a Bordered Box (Unfilled) */}
        {currentShow && (
          <motion.div
            className="border border-text-gallery-primary p-8 md:p-12 mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start gap-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <div className="max-w-2xl">
              <span className="font-sans text-[9px] tracking-[0.15em] uppercase font-bold text-text-gallery-primary border border-text-gallery-primary px-2 py-0.5 inline-block mb-6">
                Active Exhibition
              </span>
              <h2 className="font-serif text-3xl md:text-4xl italic text-text-gallery-primary mb-2">
                {currentShow.title}
              </h2>
              <p className="font-sans text-xs tracking-wider text-text-gallery-secondary uppercase mb-6 font-semibold">
                {currentShow.subtitle}
              </p>
              <p className="font-sans text-xs md:text-sm leading-relaxed text-text-gallery-secondary mb-8">
                {currentShow.curatorialText}
              </p>
              <Link
                href={`/exhibitions/${currentShow.slug}`}
                className="font-sans text-[10px] md:text-xs tracking-[0.1em] uppercase font-bold text-text-gallery-primary hover:text-text-gallery-secondary quiet-transition underline decoration-1 underline-offset-4"
              >
                [ View Exhibition Gallery ]
              </Link>
            </div>
            
            {/* Short Venue Info Box */}
            <div className="md:text-right font-sans text-xs md:text-sm tracking-wide space-y-1 text-text-gallery-secondary min-w-[200px] border-l md:border-l-0 md:border-r border-border-gallery-hairline/60 pl-6 md:pl-0 md:pr-6">
              <p className="font-semibold text-text-gallery-primary uppercase tracking-[0.05em] text-[10px]">Location</p>
              <p className="font-medium text-text-gallery-primary">{currentShow.venue}</p>
              <p>{currentShow.city}</p>
              <div className="h-6" />
              <p className="font-semibold text-text-gallery-primary uppercase tracking-[0.05em] text-[10px]">Dates</p>
              <p className="text-text-gallery-primary">
                {formatDate(currentShow.startDate)}
              </p>
              <p>to</p>
              <p className="text-text-gallery-primary">
                {formatDate(currentShow.endDate)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Timeline Header */}
        <div className="mb-8 border-b border-border-gallery-hairline/60 pb-2">
          <h3 className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold">
            All Presentations
          </h3>
        </div>

        {/* Vertical Timeline Chronology */}
        <motion.div
          className="flex flex-col border-b border-border-gallery-hairline/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {sortedExhibitions.map((exhibition) => (
            <TimelineRow key={exhibition.id} exhibition={exhibition} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
