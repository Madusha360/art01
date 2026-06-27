"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { artistBio } from "@/data/galleryData";

export default function AboutPage() {
  return (
    <div className="bg-bg-gallery min-h-screen pt-28 pb-24 md:pt-36 md:pb-36">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        {/* Editorial Heading */}
        <div className="mb-12 md:mb-16">
          <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-2 block">
            About the Artist
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-text-gallery-primary">
            Biography & CV
          </h1>
        </div>

        {/* 1. Portrait & Bio Section (Split Screen) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start mb-24 md:mb-32">
          {/* Left Column: Portrait (5 cols) */}
          <motion.div
            className="lg:col-span-5 relative w-full aspect-[3/4] border border-border-gallery-hairline/60 overflow-hidden bg-bg-gallery-alt"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <Image
              src={artistBio.portraitUrl}
              alt={artistBio.name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
              className="object-cover"
            />
          </motion.div>

          {/* Right Column: Large Serif Bio (7 cols) */}
          <motion.div
            className="lg:col-span-7 flex flex-col gap-6 pt-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {artistBio.bioParagraphs.map((paragraph, i) => (
              <p
                key={i}
                className="font-serif text-base md:text-lg lg:text-xl leading-relaxed text-text-gallery-primary font-normal first-of-type:text-lg first-of-type:md:text-xl first-of-type:lg:text-2xl first-of-type:leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>

        {/* 2. CV Lists Section (Hairline Separated) */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Education Block */}
          <div>
            <div className="border-b border-border-gallery-hairline pb-4 mb-6">
              <h2 className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-primary font-bold">
                Education
              </h2>
            </div>
            <div className="divide-y divide-border-gallery-hairline/60">
              {artistBio.education.map((edu, i) => (
                <div key={i} className="py-4 flex justify-between gap-4">
                  <span className="font-sans text-xs text-text-gallery-secondary font-medium min-w-[40px]">
                    {edu.year}
                  </span>
                  <div className="font-sans text-xs md:text-sm text-text-gallery-primary text-right font-medium">
                    <p className="font-bold">{edu.degree}</p>
                    <p className="text-text-gallery-secondary text-[11px] mt-0.5">{edu.school}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Awards Block */}
          <div>
            <div className="border-b border-border-gallery-hairline pb-4 mb-6">
              <h2 className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-primary font-bold">
                Awards & Fellowships
              </h2>
            </div>
            <div className="divide-y divide-border-gallery-hairline/60">
              {artistBio.awards.map((award, i) => (
                <div key={i} className="py-4 flex justify-between gap-4">
                  <span className="font-sans text-xs text-text-gallery-secondary font-medium min-w-[40px]">
                    {award.year}
                  </span>
                  <div className="font-sans text-xs md:text-sm text-text-gallery-primary text-right font-medium">
                    <p className="font-bold">{award.title}</p>
                    <p className="text-text-gallery-secondary text-[11px] mt-0.5">{award.organization}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Press Block */}
          <div>
            <div className="border-b border-border-gallery-hairline pb-4 mb-6">
              <h2 className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-primary font-bold">
                Selected Bibliography
              </h2>
            </div>
            <div className="divide-y divide-border-gallery-hairline/60">
              {artistBio.selectedPress.map((press, i) => (
                <div key={i} className="py-4 flex justify-between gap-4">
                  <span className="font-sans text-xs text-text-gallery-secondary font-medium min-w-[40px]">
                    {press.year}
                  </span>
                  <div className="font-sans text-xs md:text-sm text-text-gallery-primary text-right font-medium">
                    <p className="font-serif italic font-normal text-xs md:text-sm">&ldquo;{press.title}&rdquo;</p>
                    <p className="text-text-gallery-secondary text-[10px] tracking-[0.05em] uppercase font-bold mt-1">{press.publication}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
