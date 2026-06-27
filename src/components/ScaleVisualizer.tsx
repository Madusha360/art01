"use client";

import { motion } from "framer-motion";

interface ScaleVisualizerProps {
  dimensions: string;
  title: string;
  imageUrl: string;
}

export default function ScaleVisualizer({ dimensions, title, imageUrl }: ScaleVisualizerProps) {
  // Parse dimensions string (e.g. "180 x 140 cm" or "75 x 75 x 40 cm")
  // Format is usually H x W or H x W x D. We want H and W.
  const parseDimensions = (dimStr: string) => {
    const cleanStr = dimStr.replace(/[^\d.x\s]/g, ""); // keep only numbers, dots, spaces, and x
    const parts = cleanStr.split(/\s*x\s*/i);
    
    let height = 100; // fallback
    let width = 100;  // fallback

    if (parts.length >= 2) {
      height = parseFloat(parts[0]) || 100;
      width = parseFloat(parts[1]) || 100;
    }

    return { height, width };
  };

  const { height: artH, width: artW } = parseDimensions(dimensions);

  // Scaling factor: 1cm = 1.15 pixels inside our 250px high wall height
  const scale = 1.15;
  const humanH = 175; // 175 cm human
  const eyeLevel = 145; // 145 cm standard museum center hanging height

  // Calculate layout heights in pixels
  const pxHumanH = humanH * scale;
  const pxArtH = artH * scale;
  const pxArtW = artW * scale;
  
  // Hang art center at eyeLevel (145cm) from bottom
  const pxArtCenter = eyeLevel * scale;
  const pxArtBottom = pxArtCenter - (pxArtH / 2);

  return (
    <div className="w-full bg-bg-gallery-alt border border-border-gallery-hairline/60 p-6 md:p-8 select-none">
      <div className="flex justify-between items-baseline mb-6 border-b border-border-gallery-hairline/40 pb-2">
        <span className="font-sans text-[10px] tracking-[0.1em] uppercase font-bold text-text-gallery-primary">
          Scale Comparison
        </span>
        <span className="font-sans text-[10px] tracking-[0.05em] text-text-gallery-secondary uppercase">
          Human (175 cm) vs Artwork ({artH} x {artW} cm)
        </span>
      </div>

      {/* Wall area */}
      <div className="relative w-full h-[260px] bg-bg-gallery border-b border-text-gallery-primary overflow-hidden flex items-end">
        {/* Floor line decoration */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-text-gallery-primary/5" />
        
        {/* 145cm Eye Level Guideline */}
        <div className="absolute inset-x-0 border-t border-dashed border-border-gallery-hairline/60 z-0 pointer-events-none" style={{ bottom: `${pxArtCenter}px` }}>
          <span className="absolute right-4 top-1 font-sans text-[7px] tracking-[0.05em] uppercase text-text-gallery-secondary">
            Museum Center Line (145 cm)
          </span>
        </div>

        {/* Technical Blueprint Layout */}
        <div className="relative w-full h-full max-w-xl mx-auto flex items-end justify-between px-10 md:px-16">
          {/* Human silhouette */}
          <div className="flex flex-col items-center z-10" style={{ height: `${pxHumanH}px` }}>
            {/* SVG standing figure */}
            <svg
              width="50"
              height={pxHumanH}
              viewBox="0 0 50 175"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-text-gallery-secondary/60"
            >
              {/* Head */}
              <circle cx="25" cy="18" r="8" stroke="currentColor" strokeWidth="1" />
              {/* Torso & Shoulders */}
              <path d="M 25 26 L 25 75 M 12 36 L 38 36 M 12 36 L 15 85 M 38 36 L 35 85" stroke="currentColor" strokeWidth="1" />
              {/* Legs */}
              <path d="M 19 75 L 17 170 M 31 75 L 33 170 M 19 75 L 31 75" stroke="currentColor" strokeWidth="1" />
            </svg>
            <span className="font-sans text-[8px] tracking-[0.05em] uppercase text-text-gallery-secondary mt-1">
              Collector
            </span>
          </div>

          {/* Artwork Box */}
          <div className="relative flex justify-center items-center" style={{ height: "100%", width: "50%" }}>
            <motion.div
              className="absolute bg-bg-gallery-alt border border-text-gallery-primary/80 flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] group overflow-hidden"
              style={{
                bottom: `${pxArtBottom}px`,
                height: `${pxArtH}px`,
                width: `${pxArtW}px`,
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-white/75 group-hover:bg-white/40 quiet-transition z-0" />

              {/* Title & Dimension Lines */}
              <div className="relative z-10 p-2 text-center select-none pointer-events-none">
                <p className="font-serif italic text-[9px] text-text-gallery-primary leading-tight font-medium truncate max-w-full">
                  {title}
                </p>
              </div>

              {/* Horizontal Dimension Arrow Indicator */}
              <div className="absolute -top-5 left-0 right-0 flex items-center justify-between pointer-events-none">
                <span className="h-[0.5px] bg-text-gallery-secondary/60 flex-grow" />
                <span className="font-sans text-[7px] text-text-gallery-secondary mx-2 font-semibold">
                  {artW} cm
                </span>
                <span className="h-[0.5px] bg-text-gallery-secondary/60 flex-grow" />
              </div>

              {/* Vertical Dimension Arrow Indicator */}
              <div className="absolute -left-6 top-0 bottom-0 flex flex-col items-center justify-between pointer-events-none">
                <span className="w-[0.5px] bg-text-gallery-secondary/60 flex-grow" />
                <span className="font-sans text-[7px] text-text-gallery-secondary my-2 font-semibold rotate-270 select-none">
                  {artH} cm
                </span>
                <span className="w-[0.5px] bg-text-gallery-secondary/60 flex-grow" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Informational CV foot note */}
      <p className="font-sans text-[9px] text-text-gallery-secondary/80 mt-4 leading-normal">
        * Standard exhibition hanging placing the visual center of the canvas at 145 cm (57 inches) from the floor. Visualizations are approximate representations for scale comparison.
      </p>
    </div>
  );
}
