import Link from "next/link";
import { Exhibition } from "@/data/galleryData";

interface TimelineRowProps {
  exhibition: Exhibition;
}

export default function TimelineRow({ exhibition }: TimelineRowProps) {
  // Parse date range for clean presentation
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <Link
      href={`/exhibitions/${exhibition.slug}`}
      className="group block border-t border-border-gallery-hairline/60 py-8 hover:bg-bg-gallery-alt/40 quiet-transition"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline px-4">
        {/* Date Range on Left (Columns 1-4) */}
        <div className="md:col-span-4 font-sans text-xs md:text-sm tracking-wide text-text-gallery-secondary font-medium">
          {exhibition.startDate.includes("-") ? (
            <>
              {formatDate(exhibition.startDate)} — {formatDate(exhibition.endDate)}
            </>
          ) : (
            exhibition.startDate // fallback if raw string
          )}
        </div>

        {/* Title, Venue, City on Right (Columns 5-12) */}
        <div className="md:col-span-8 flex flex-col md:flex-row md:justify-between md:items-baseline gap-2">
          <div>
            <h3 className="font-serif text-lg md:text-xl font-normal group-hover:translate-x-1 quiet-transition">
              {exhibition.title}
            </h3>
            <p className="font-sans text-[11px] md:text-xs tracking-[0.05em] uppercase text-text-gallery-secondary mt-1">
              {exhibition.subtitle}
            </p>
          </div>
          <div className="text-right md:text-right font-sans text-xs md:text-sm font-medium text-text-gallery-primary">
            {exhibition.venue}, <span className="text-text-gallery-secondary font-normal">{exhibition.city}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
