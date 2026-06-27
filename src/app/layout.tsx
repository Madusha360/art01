import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: {
    template: "%s | Elena Rostova",
    default: "Elena Rostova | Fine Art Portfolio",
  },
  description: "Elena Rostova is a contemporary artist based in Berlin and New York. Her work explores space, negative matter, and architectural silence through paint, stone, and steel.",
  keywords: ["Elena Rostova", "Contemporary Art", "Minimalist Art", "Sculpture", "Abstract Painting", "Fine Art Gallery"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="bg-bg-gallery text-text-gallery-primary min-h-full flex flex-col selection:bg-text-gallery-primary selection:text-bg-gallery">
        <ThemeProvider>
          <CustomCursor />
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
