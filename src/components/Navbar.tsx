"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Home page gets special transparent treatment at the top
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Determine navbar background styling
  const navbarBg = isHomePage
    ? isScrolled
      ? "bg-bg-gallery/95 border-b border-border-gallery-hairline/60 backdrop-blur-md py-4"
      : "bg-transparent py-6 text-white"
    : "bg-bg-gallery/95 border-b border-border-gallery-hairline/60 backdrop-blur-md py-4";

  const linkColorClass = isHomePage && !isScrolled
    ? "text-white/80 hover:text-white"
    : "text-text-gallery-secondary hover:text-text-gallery-primary";

  const logoColorClass = isHomePage && !isScrolled
    ? "text-white"
    : "text-text-gallery-primary";

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navbarBg}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Wordmark */}
        <Link 
          href="/" 
          className={`font-sans text-xs md:text-sm font-semibold tracking-[0.15em] uppercase quiet-transition ${logoColorClass}`}
          id="nav-logo"
        >
          Elena Rostova
        </Link>

        {/* Navigation Items */}
        <nav className="flex space-x-6 md:space-x-10">
          <Link
            href="/gallery"
            className={`font-sans text-[10px] md:text-xs tracking-[0.08em] uppercase font-medium quiet-transition ${linkColorClass} ${
              pathname === "/gallery" ? "text-text-gallery-primary font-semibold" : ""
            }`}
            id="nav-gallery"
          >
            Gallery
          </Link>
          <Link
            href="/exhibitions"
            className={`font-sans text-[10px] md:text-xs tracking-[0.08em] uppercase font-medium quiet-transition ${linkColorClass} ${
              pathname?.startsWith("/exhibitions") ? "text-text-gallery-primary font-semibold" : ""
            }`}
            id="nav-exhibitions"
          >
            Exhibitions
          </Link>
          <Link
            href="/about"
            className={`font-sans text-[10px] md:text-xs tracking-[0.08em] uppercase font-medium quiet-transition ${linkColorClass} ${
              pathname === "/about" ? "text-text-gallery-primary font-semibold" : ""
            }`}
            id="nav-about"
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`font-sans text-[10px] md:text-xs tracking-[0.08em] uppercase font-medium quiet-transition ${linkColorClass} ${
              pathname === "/contact" ? "text-text-gallery-primary font-semibold" : ""
            }`}
            id="nav-contact"
          >
            Contact
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
