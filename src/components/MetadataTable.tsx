import React from "react";

interface MetadataRow {
  label: string;
  value: string | React.ReactNode;
}

interface MetadataTableProps {
  rows: MetadataRow[];
}

export default function MetadataTable({ rows }: MetadataTableProps) {
  return (
    <div className="w-full border-t border-border-gallery-hairline/60">
      {rows.map((row, index) => (
        <div
          key={index}
          className="flex justify-between items-center py-4 border-b border-border-gallery-hairline/60 gap-4"
        >
          <span className="font-sans text-[10px] md:text-xs tracking-[0.08em] uppercase text-text-gallery-secondary font-medium">
            {row.label}
          </span>
          <div className="font-sans text-xs md:text-sm text-text-gallery-primary text-right font-medium">
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}
