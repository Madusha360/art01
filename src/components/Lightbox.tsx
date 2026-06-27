"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt: string;
}

export default function Lightbox({ isOpen, onClose, imageUrl, imageAlt }: LightboxProps) {
  // Disable body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Support Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-bg-gallery flex flex-col justify-between p-6 md:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Top panel */}
          <div className="flex justify-between items-center w-full">
            <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary">
              Detailed View
            </span>
            <button
              onClick={onClose}
              className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-primary hover:text-text-gallery-secondary quiet-transition cursor-pointer"
            >
              [ Close ]
            </button>
          </div>

          {/* Center image container */}
          <div className="relative flex-grow w-full max-h-[80vh] flex items-center justify-center my-4">
            <motion.div
              className="relative w-full h-full max-w-[90vw] max-h-[75vh]"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                sizes="100vw"
                className="object-contain select-none"
                priority
              />
            </motion.div>
          </div>

          {/* Bottom panel */}
          <div className="flex justify-center w-full">
            <p className="font-serif text-xs md:text-sm italic text-text-gallery-secondary max-w-lg text-center">
              {imageAlt}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
