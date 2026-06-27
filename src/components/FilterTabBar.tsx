"use client";

import { motion } from "framer-motion";

interface FilterTabBarProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export default function FilterTabBar({ categories, activeCategory, onSelect }: FilterTabBarProps) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-border-gallery-hairline/40 pb-6 w-full overflow-x-auto select-none no-scrollbar">
      {categories.map((category) => {
        const isActive = category.toLowerCase() === activeCategory.toLowerCase();

        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className="relative pb-2 font-sans text-xs md:text-sm tracking-[0.08em] uppercase font-semibold text-text-gallery-secondary hover:text-text-gallery-primary transition-colors duration-250 cursor-pointer outline-none"
          >
            <span className={isActive ? "text-text-gallery-primary" : ""}>
              {category}
            </span>
            {isActive && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-text-gallery-primary"
                layoutId="activeFilterUnderline"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
