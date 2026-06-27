"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme, setTheme } = useTheme();

  return (
    <footer className="border-t border-border-gallery-hairline/60 bg-bg-gallery py-8 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left: Copyright */}
        <p className="font-sans text-[10px] tracking-[0.05em] uppercase text-text-gallery-secondary">
          © {currentYear} Elena Rostova. All rights reserved.
        </p>

        {/* Center: Navigation Links */}
        <div className="flex gap-6">
          <Link
            href="/gallery"
            className="font-sans text-[10px] tracking-[0.08em] uppercase text-text-gallery-secondary hover:text-text-gallery-primary quiet-transition font-medium"
          >
            Gallery
          </Link>
          <Link
            href="/exhibitions"
            className="font-sans text-[10px] tracking-[0.08em] uppercase text-text-gallery-secondary hover:text-text-gallery-primary quiet-transition font-medium"
          >
            Exhibitions
          </Link>
          <Link
            href="/contact"
            className="font-sans text-[10px] tracking-[0.08em] uppercase text-text-gallery-secondary hover:text-text-gallery-primary quiet-transition font-medium"
          >
            Contact
          </Link>
          <Link
            href="/admin"
            className="font-sans text-[10px] tracking-[0.08em] uppercase text-text-gallery-secondary hover:text-text-gallery-primary quiet-transition font-medium"
          >
            Admin
          </Link>
        </div>

        {/* Right: Gallery Hours Theme Selectors */}
        <div className="flex gap-4 items-center">
          <span className="font-sans text-[8px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold">
            Gallery Hours:
          </span>
          <button
            onClick={() => setTheme("light")}
            className={`font-sans text-[9px] tracking-[0.08em] uppercase cursor-pointer quiet-transition font-semibold pb-0.5 ${
              theme === "light"
                ? "text-text-gallery-primary border-b border-text-gallery-primary"
                : "text-text-gallery-secondary hover:text-text-gallery-primary"
            }`}
          >
            Daylight
          </button>
          <button
            onClick={() => setTheme("warm")}
            className={`font-sans text-[9px] tracking-[0.08em] uppercase cursor-pointer quiet-transition font-semibold pb-0.5 ${
              theme === "warm"
                ? "text-text-gallery-primary border-b border-text-gallery-primary"
                : "text-text-gallery-secondary hover:text-text-gallery-primary"
            }`}
          >
            Glow
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`font-sans text-[9px] tracking-[0.08em] uppercase cursor-pointer quiet-transition font-semibold pb-0.5 ${
              theme === "dark"
                ? "text-text-gallery-primary border-b border-text-gallery-primary"
                : "text-text-gallery-secondary hover:text-text-gallery-primary"
            }`}
          >
            Spotlight
          </button>
        </div>
      </div>
    </footer>
  );
}
