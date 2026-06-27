"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Artwork, Exhibition } from "@/data/galleryData";

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [activeTab, setActiveTab] = useState<"artworks" | "exhibitions">("artworks");

  // Global list states
  const [artworksList, setArtworksList] = useState<Artwork[]>([]);
  const [exhibitionsList, setExhibitionsList] = useState<Exhibition[]>([]);

  // ==========================================
  // ARTWORK FORM STATES
  // ==========================================
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("Elena Rostova");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [medium, setMedium] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [status, setStatus] = useState<"Available" | "Sold" | "Private Collection">("Available");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1.0);

  // ==========================================
  // EXHIBITION FORM STATES
  // ==========================================
  const [exhibitionId, setExhibitionId] = useState<string | null>(null); // Null = CREATE, otherwise UPDATE
  const [exTitle, setExTitle] = useState("");
  const [exSubtitle, setExSubtitle] = useState("");
  const [exVenue, setExVenue] = useState("");
  const [exCity, setExCity] = useState("");
  const [exStartDate, setExStartDate] = useState("");
  const [exEndDate, setExEndDate] = useState("");
  const [exStatus, setExStatus] = useState<"Current" | "Upcoming" | "Past">("Upcoming");
  const [exCuratorialText, setExCuratorialText] = useState("");
  const [exSelectedArtworkIds, setExSelectedArtworkIds] = useState<string[]>([]);
  const [exPressMentions, setExPressMentions] = useState("");
  const [exSelectedFile, setExSelectedFile] = useState<File | null>(null);

  // Status & loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exFileInputRef = useRef<HTMLInputElement>(null);

  // Load database arrays
  const loadCatalogData = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setArtworksList(data.artworks || []);
        setExhibitionsList(data.exhibitions || []);
      }
    } catch (err) {
      console.error("Failed to load catalog database:", err);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      loadCatalogData();
    }
  }, [isUnlocked]);

  // Handle Admin Passcode Lock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "1234") {
      setIsUnlocked(true);
      setUnlockError("");
    } else {
      setUnlockError("Incorrect passcode. Access denied.");
    }
  };

  // ==========================================
  // ARTWORK ACTIONS
  // ==========================================
  const handleArtworkFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFormError("Selected file must be an image.");
      return;
    }
    setSelectedFile(file);
    setFormError("");

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Calculate aspect ratio dynamically
    const img = new window.Image();
    img.onload = () => {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    };
    img.src = previewUrl;
  };

  const handleArtworkPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFormError("Please select or drop an image file.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    
    const formData = new FormData();
    formData.append("passcode", passcode);
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("year", year);
    formData.append("medium", medium);
    formData.append("dimensions", dimensions);
    formData.append("status", status);
    formData.append("aspectRatio", aspectRatio.toString());
    formData.append("description", description);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        setFormSuccess(true);
        setTitle("");
        setMedium("");
        setDimensions("");
        setSelectedFile(null);
        setImagePreview(null);
        setDescription("");
        loadCatalogData();
        setTimeout(() => setFormSuccess(false), 4000);
      } else {
        setFormError(data.error || "Failed to publish artwork.");
      }
    } catch (err) {
      setFormError("Connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArtworkDelete = async (id: string) => {
    if (!window.confirm("Delete this artwork? This removes it from the catalog.")) return;

    try {
      const res = await fetch("/api/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, passcode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadCatalogData();
      } else {
        alert(data.error || "Failed to delete artwork.");
      }
    } catch (err) {
      alert("Connection error.");
    }
  };

  // ==========================================
  // EXHIBITION ACTIONS
  // ==========================================
  const handleExhibitionFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFormError("Selected file must be an image.");
      return;
    }
    setExSelectedFile(file);
    setFormError("");
    setImagePreview(URL.createObjectURL(file));
  };

  const handleExhibitionSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    const formData = new FormData();
    formData.append("passcode", passcode);
    formData.append("title", exTitle);
    formData.append("subtitle", exSubtitle);
    formData.append("venue", exVenue);
    formData.append("city", exCity);
    formData.append("startDate", exStartDate);
    formData.append("endDate", exEndDate);
    formData.append("status", exStatus);
    formData.append("curatorialText", exCuratorialText);
    formData.append("featuredArtworkIds", exSelectedArtworkIds.join(","));
    formData.append("pressMentions", exPressMentions);

    if (exhibitionId) {
      formData.append("id", exhibitionId);
    }
    if (exSelectedFile) {
      formData.append("file", exSelectedFile);
    }

    try {
      const res = await fetch("/api/exhibitions/save", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        setFormSuccess(true);
        cancelExhibitionEdit();
        loadCatalogData();
        setTimeout(() => setFormSuccess(false), 4000);
      } else {
        setFormError(data.error || "Failed to save exhibition.");
      }
    } catch (err) {
      setFormError("Connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadExhibitionForEdit = (ex: Exhibition) => {
    setExhibitionId(ex.id);
    setExTitle(ex.title);
    setExSubtitle(ex.subtitle || "");
    setExVenue(ex.venue || "");
    setExCity(ex.city || "");
    setExStartDate(ex.startDate || "");
    setExEndDate(ex.endDate || "");
    setExStatus(ex.status || "Upcoming");
    setExCuratorialText(ex.curatorialText || "");
    setExSelectedArtworkIds(ex.featuredArtworkIds || []);
    setExPressMentions(ex.pressMentions ? ex.pressMentions.join("\n") : "");
    setImagePreview(ex.installShotUrl);
    setExSelectedFile(null);
    setFormError("");
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const cancelExhibitionEdit = () => {
    setExhibitionId(null);
    setExTitle("");
    setExSubtitle("");
    setExVenue("");
    setExCity("");
    setExStartDate("");
    setExEndDate("");
    setExStatus("Upcoming");
    setExCuratorialText("");
    setExSelectedArtworkIds([]);
    setExPressMentions("");
    setImagePreview(null);
    setExSelectedFile(null);
    setFormError("");
  };

  const handleExhibitionDelete = async (id: string) => {
    if (!window.confirm("Delete this exhibition? This will remove it from the program timeline.")) return;

    try {
      const res = await fetch("/api/exhibitions/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, passcode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (exhibitionId === id) cancelExhibitionEdit();
        loadCatalogData();
      } else {
        alert(data.error || "Failed to delete exhibition.");
      }
    } catch (err) {
      alert("Connection error.");
    }
  };

  return (
    <div className="bg-bg-gallery min-h-screen pt-28 pb-24 md:pt-36 md:pb-36">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full flex justify-center">
        
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            /* 1. Passcode Screen */
            <motion.div
              key="gate"
              className="w-full max-w-sm border border-text-gallery-primary p-8 md:p-10 text-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-4 block">
                Restricted Area
              </span>
              <h1 className="font-serif text-2xl italic text-text-gallery-primary mb-6">
                Studio Verification
              </h1>
              
              <form onSubmit={handleUnlock} className="space-y-6">
                <div className="flex flex-col text-left">
                  <label htmlFor="passcode-input" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">
                    Passcode
                  </label>
                  <input
                    type="password"
                    id="passcode-input"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                    className="border-b border-border-gallery-hairline bg-transparent py-2 text-center text-sm tracking-[0.3em] text-text-gallery-primary outline-none focus:border-text-gallery-primary"
                    placeholder="••••"
                  />
                  {unlockError && (
                    <p className="font-sans text-[10px] text-red-500 mt-2 font-medium">
                      {unlockError}
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-text-gallery-primary text-white hover:bg-black/90 py-2.5 font-sans text-[10px] tracking-[0.1em] uppercase font-bold cursor-pointer"
                >
                  Enter Dashboard
                </button>
              </form>
            </motion.div>
          ) : (
            /* 2. Admin Dashboard */
            <motion.div
              key="dashboard"
              className="w-full space-y-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Tab Navigation selectors */}
              <div className="flex gap-8 border-b border-border-gallery-hairline/60 pb-4 w-full justify-start select-none">
                <button
                  onClick={() => { setActiveTab("artworks"); setFormError(""); }}
                  className={`font-sans text-xs md:text-sm tracking-[0.08em] uppercase font-bold pb-2 border-b cursor-pointer quiet-transition ${
                    activeTab === "artworks" ? "border-text-gallery-primary text-text-gallery-primary" : "border-transparent text-text-gallery-secondary hover:text-text-gallery-primary"
                  }`}
                >
                  Manage Artworks
                </button>
                <button
                  onClick={() => { setActiveTab("exhibitions"); setFormError(""); }}
                  className={`font-sans text-xs md:text-sm tracking-[0.08em] uppercase font-bold pb-2 border-b cursor-pointer quiet-transition ${
                    activeTab === "exhibitions" ? "border-text-gallery-primary text-text-gallery-primary" : "border-transparent text-text-gallery-secondary hover:text-text-gallery-primary"
                  }`}
                >
                  Manage Exhibitions
                </button>
              </div>

              {/* Tab 1: Artworks CRUD */}
              {activeTab === "artworks" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-7 space-y-8">
                    <div>
                      <span className="font-sans text-[9px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-2 block">
                        Database Upload
                      </span>
                      <h2 className="font-serif text-3xl font-normal text-text-gallery-primary">
                        Add Artwork
                      </h2>
                    </div>

                    <form onSubmit={handleArtworkPublish} className="space-y-6">
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary font-semibold mb-2">Image File</span>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border border-dashed border-border-gallery-hairline/80 hover:border-text-gallery-primary bg-bg-gallery-alt/40 p-10 text-center cursor-pointer quiet-transition flex flex-col items-center justify-center min-h-[160px]"
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => e.target.files && handleArtworkFileChange(e.target.files[0])}
                            accept="image/*"
                            className="hidden"
                          />
                          {imagePreview ? (
                            <div className="relative w-40 h-28 border border-border-gallery-hairline">
                              <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="font-sans text-xs text-text-gallery-primary font-medium">Drag & drop image here or click to browse</p>
                              <p className="font-sans text-[9px] text-text-gallery-secondary uppercase tracking-wider">PNG, JPG, or WEBP</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                          <label htmlFor="art-title" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Title</label>
                          <input type="text" id="art-title" required value={title} onChange={(e) => setTitle(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" placeholder="Silence in Ochre" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="art-artist" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Artist</label>
                          <input type="text" id="art-artist" required value={artist} onChange={(e) => setArtist(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="art-medium" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Medium</label>
                          <input type="text" id="art-medium" required value={medium} onChange={(e) => setMedium(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" placeholder="Oil and charcoal on linen" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="art-dimensions" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Dimensions (H x W in cm)</label>
                          <input type="text" id="art-dimensions" required value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" placeholder="180 x 140 cm" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="art-year" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Year</label>
                          <input type="text" id="art-year" required value={year} onChange={(e) => setYear(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="art-status" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Status</label>
                          <select id="art-status" value={status} onChange={(e) => setStatus(e.target.value as any)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary cursor-pointer">
                            <option value="Available">Available</option>
                            <option value="Sold">Sold</option>
                            <option value="Private Collection">Private Collection</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label htmlFor="art-description" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Description</label>
                        <textarea id="art-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary resize-none" placeholder="Brief curatorial essay..." />
                      </div>

                      {formError && <p className="font-sans text-xs text-red-500 font-semibold">{formError}</p>}
                      {formSuccess && <p className="font-sans text-xs text-text-gallery-primary font-bold uppercase tracking-wider">✓ Artwork published successfully.</p>}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-text-gallery-primary text-white hover:bg-black/90 py-3 px-8 font-sans text-[10px] tracking-[0.1em] uppercase font-bold disabled:opacity-50 select-none cursor-pointer"
                      >
                        {isSubmitting ? "Uploading..." : "Publish Artwork"}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Catalog Listing */}
                  <div className="lg:col-span-5 space-y-8">
                    <div>
                      <span className="font-sans text-[9px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-2 block">Catalog</span>
                      <h3 className="font-serif text-2xl font-normal text-text-gallery-primary">Inventory</h3>
                    </div>

                    <div className="border-t border-border-gallery-hairline/60 divide-y divide-border-gallery-hairline/60 overflow-y-auto max-h-[550px] pr-2">
                      {artworksList.map((art) => (
                        <div key={art.id} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 border border-border-gallery-hairline bg-bg-gallery-alt flex-shrink-0">
                              <Image src={art.imageUrl} alt={art.title} fill className="object-cover" />
                            </div>
                            <div className="font-sans text-xs">
                              <p className="font-bold text-text-gallery-primary truncate max-w-[150px]">{art.title}</p>
                              <p className="text-text-gallery-secondary text-[10px] mt-0.5">{art.year} • {art.status}</p>
                            </div>
                          </div>
                          <button onClick={() => handleArtworkDelete(art.id)} className="font-sans text-[9px] tracking-[0.08em] uppercase text-red-500 hover:text-red-700 cursor-pointer font-semibold quiet-transition">
                            [ Delete ]
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Exhibitions CRUD */}
              {activeTab === "exhibitions" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-7 space-y-8">
                    <div>
                      <span className="font-sans text-[9px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb- block">
                        Exhibition Curator
                      </span>
                      <h2 className="font-serif text-3xl font-normal text-text-gallery-primary">
                        {exhibitionId ? `Edit: ${exTitle}` : "Create Exhibition"}
                      </h2>
                    </div>

                    <form onSubmit={handleExhibitionSave} className="space-y-6">
                      {/* Install Shot Upload */}
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary font-semibold mb-2">
                          Install Shot (Room Shot)
                        </span>
                        <div
                          onClick={() => exFileInputRef.current?.click()}
                          className="border border-dashed border-border-gallery-hairline/80 hover:border-text-gallery-primary bg-bg-gallery-alt/40 p-10 text-center cursor-pointer quiet-transition flex flex-col items-center justify-center min-h-[160px]"
                        >
                          <input
                            type="file"
                            ref={exFileInputRef}
                            onChange={(e) => e.target.files && handleExhibitionFileChange(e.target.files[0])}
                            accept="image/*"
                            className="hidden"
                          />
                          {imagePreview ? (
                            <div className="relative w-40 h-28 border border-border-gallery-hairline">
                              <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="font-sans text-xs text-text-gallery-primary font-medium">Drag & drop install shot here or click to browse</p>
                              <p className="font-sans text-[9px] text-text-gallery-secondary uppercase tracking-wider">PNG, JPG, or WEBP</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                          <label htmlFor="ex-title" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Exhibition Title</label>
                          <input type="text" id="ex-title" required value={exTitle} onChange={(e) => setExTitle(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" placeholder="Silent Contours" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="ex-subtitle" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Subtitle</label>
                          <input type="text" id="ex-subtitle" value={exSubtitle} onChange={(e) => setExSubtitle(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" placeholder="A Study in Space" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="ex-venue" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Venue</label>
                          <input type="text" id="ex-venue" required value={exVenue} onChange={(e) => setExVenue(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" placeholder="Elysian Fine Arts" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="ex-city" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">City</label>
                          <input type="text" id="ex-city" required value={exCity} onChange={(e) => setExCity(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" placeholder="New York" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="ex-start" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Start Date</label>
                          <input type="date" id="ex-start" required value={exStartDate} onChange={(e) => setExStartDate(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="ex-end" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">End Date</label>
                          <input type="date" id="ex-end" required value={exEndDate} onChange={(e) => setExEndDate(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="ex-status" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Status</label>
                          <select id="ex-status" value={exStatus} onChange={(e) => setExStatus(e.target.value as any)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary cursor-pointer">
                            <option value="Current">Current (Hangs Featured Box)</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Past">Past</option>
                          </select>
                        </div>
                      </div>

                      {/* Curatorial Essay */}
                      <div className="flex flex-col">
                        <label htmlFor="ex-curatorial" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Curatorial Essay / Overview</label>
                        <textarea id="ex-curatorial" required rows={4} value={exCuratorialText} onChange={(e) => setExCuratorialText(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary resize-none" placeholder="Explain the curatorial concept of the show..." />
                      </div>

                      {/* Checkbox selector for Artworks Association */}
                      <div className="flex flex-col">
                        <span className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2 block">
                          Link Exhibited Artworks
                        </span>
                        <div className="border border-border-gallery-hairline/60 p-4 max-h-[160px] overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3 bg-bg-gallery-alt/30 select-none">
                          {artworksList.map((art) => (
                            <label key={art.id} className="flex items-center gap-2 font-sans text-xs text-text-gallery-secondary hover:text-text-gallery-primary cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={exSelectedArtworkIds.includes(art.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setExSelectedArtworkIds([...exSelectedArtworkIds, art.id]);
                                  } else {
                                    setExSelectedArtworkIds(exSelectedArtworkIds.filter((id) => id !== art.id));
                                  }
                                }}
                                className="rounded border-border-gallery-hairline text-text-gallery-primary focus:ring-0 cursor-pointer"
                              />
                              <span className="truncate max-w-[120px] font-medium">{art.title}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Press Mentions newline list */}
                      <div className="flex flex-col">
                        <label htmlFor="ex-press" className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-secondary font-semibold mb-2">Selected Press Mentions (One quote per line)</label>
                        <textarea id="ex-press" rows={3} value={exPressMentions} onChange={(e) => setExPressMentions(e.target.value)} className="border-b border-border-gallery-hairline bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary resize-none" placeholder="Artforum — 'A review description quote...'&#10;Frieze — 'Another quote...'" />
                      </div>

                      {formError && <p className="font-sans text-xs text-red-500 font-semibold">{formError}</p>}
                      {formSuccess && <p className="font-sans text-xs text-text-gallery-primary font-bold uppercase tracking-wider">✓ Exhibition database saved successfully.</p>}

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-text-gallery-primary text-white hover:bg-black/90 py-3 px-8 font-sans text-[10px] tracking-[0.1em] uppercase font-bold disabled:opacity-50 select-none cursor-pointer"
                        >
                          {isSubmitting ? "Saving..." : exhibitionId ? "Update Exhibition" : "Publish Exhibition"}
                        </button>
                        
                        {exhibitionId && (
                          <button
                            type="button"
                            onClick={cancelExhibitionEdit}
                            className="border border-text-gallery-primary text-text-gallery-primary hover:bg-bg-gallery-alt py-3 px-8 font-sans text-[10px] tracking-[0.1em] uppercase font-bold cursor-pointer"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Exhibitions Program List */}
                  <div className="lg:col-span-5 space-y-8">
                    <div>
                      <span className="font-sans text-[9px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-2 block">Program</span>
                      <h3 className="font-serif text-2xl font-normal text-text-gallery-primary">Exhibitions</h3>
                    </div>

                    <div className="border-t border-border-gallery-hairline/60 divide-y divide-border-gallery-hairline/60 overflow-y-auto max-h-[550px] pr-2">
                      {exhibitionsList.map((ex) => (
                        <div key={ex.id} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 border border-border-gallery-hairline bg-bg-gallery-alt flex-shrink-0">
                              <Image src={ex.installShotUrl} alt={ex.title} fill className="object-cover" />
                            </div>
                            <div className="font-sans text-xs">
                              <p className="font-bold text-text-gallery-primary truncate max-w-[150px]">{ex.title}</p>
                              <p className="text-text-gallery-secondary text-[10px] mt-0.5">{ex.venue} • {ex.status}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => loadExhibitionForEdit(ex)} className="font-sans text-[9px] tracking-[0.08em] uppercase text-text-gallery-primary hover:underline cursor-pointer font-semibold quiet-transition">
                              [ Edit ]
                            </button>
                            <button onClick={() => handleExhibitionDelete(ex.id)} className="font-sans text-[9px] tracking-[0.08em] uppercase text-red-500 hover:text-red-700 cursor-pointer font-semibold quiet-transition">
                              [ Delete ]
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
