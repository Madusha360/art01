interface StatusPillProps {
  status: "Available" | "Sold" | "Private Collection";
}

export default function StatusPill({ status }: StatusPillProps) {
  // Border coloring based on status, but strictly within monochrome theme
  const borderClass =
    status === "Available"
      ? "border-text-gallery-primary text-text-gallery-primary"
      : "border-border-gallery-hairline text-text-gallery-secondary";

  return (
    <span
      className={`inline-block px-2.5 py-0.5 border text-[9px] font-sans font-semibold tracking-[0.08em] uppercase ${borderClass}`}
    >
      {status}
    </span>
  );
}
