"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Artwork Inquiry",
    message: "",
    subscribe: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({
      name: "",
      email: "",
      subject: "Artwork Inquiry",
      message: "",
      subscribe: false,
    });
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-bg-gallery min-h-screen pt-28 pb-24 md:pt-36 md:pb-36 flex items-center">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        
        {/* Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Studio & Gallery Info (5 Columns) */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-2 block">
                Inquiries
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-text-gallery-primary">
                Contact Studio
              </h1>
            </div>

            {/* Practical Contact Info Blocks */}
            <div className="space-y-6 pt-4 border-t border-border-gallery-hairline/60">
              {/* Block 1 */}
              <div className="font-sans text-xs space-y-1">
                <h3 className="font-bold text-text-gallery-primary uppercase tracking-[0.05em] text-[9px] mb-1">
                  General & Studio Inquiries
                </h3>
                <p className="text-text-gallery-primary font-medium">Elena Rostova Studio</p>
                <p className="text-text-gallery-secondary">Berlin-Mitte / New York City</p>
                <p className="text-text-gallery-secondary">studio@elenarostova.com</p>
              </div>

              {/* Block 2 */}
              <div className="font-sans text-xs space-y-1 pt-4 border-t border-border-gallery-hairline/30">
                <h3 className="font-bold text-text-gallery-primary uppercase tracking-[0.05em] text-[9px] mb-1">
                  Representative Gallery
                </h3>
                <p className="text-text-gallery-primary font-medium">Elysian Fine Arts</p>
                <p className="text-text-gallery-secondary">540 W 25th St, New York, NY</p>
                <p className="text-text-gallery-secondary">info@elysianfinearts.com | +1 (212) 555-0190</p>
              </div>

              {/* Block 3 */}
              <div className="font-sans text-xs space-y-1 pt-4 border-t border-border-gallery-hairline/30">
                <h3 className="font-bold text-text-gallery-primary uppercase tracking-[0.05em] text-[9px] mb-1">
                  Gallery Hours
                </h3>
                <p className="text-text-gallery-secondary">Tuesday – Saturday</p>
                <p className="text-text-gallery-secondary">11:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form (7 Columns) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {submitted ? (
                /* Success Message */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="border border-text-gallery-primary p-8 md:p-12 text-center"
                >
                  <h2 className="font-serif text-2xl italic mb-4 text-text-gallery-primary">
                    Inquiry Received
                  </h2>
                  <p className="font-sans text-xs text-text-gallery-secondary leading-relaxed uppercase tracking-[0.05em] max-w-md mx-auto">
                    Thank you for contacting the studio. We have received your message and will respond shortly.
                  </p>
                </motion.div>
              ) : (
                /* The Contact Form */
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Name Input */}
                  <div className="flex flex-col group">
                    <label
                      htmlFor="contact-name"
                      className="font-sans text-[9px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-1 transition-colors duration-200 group-focus-within:text-text-gallery-primary"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-b border-border-gallery-hairline/80 bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary transition-colors duration-300"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col group">
                    <label
                      htmlFor="contact-email"
                      className="font-sans text-[9px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-1 transition-colors duration-200 group-focus-within:text-text-gallery-primary"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-b border-border-gallery-hairline/80 bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary transition-colors duration-300"
                      placeholder="your.email@domain.com"
                    />
                  </div>

                  {/* Subject Selector */}
                  <div className="flex flex-col group">
                    <label
                      htmlFor="contact-subject"
                      className="font-sans text-[9px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-1 transition-colors duration-200 group-focus-within:text-text-gallery-primary"
                    >
                      Inquiry Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="border-b border-border-gallery-hairline/80 bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary cursor-pointer transition-colors duration-300"
                    >
                      <option value="Artwork Inquiry">Artwork Acquisition / Pricing</option>
                      <option value="Exhibition / Press">Exhibition / Press Inquiry</option>
                      <option value="Studio Visit">Studio Visit Request</option>
                      <option value="Other">General / Other</option>
                    </select>
                  </div>

                  {/* Message Input */}
                  <div className="flex flex-col group">
                    <label
                      htmlFor="contact-message"
                      className="font-sans text-[9px] tracking-[0.1em] uppercase text-text-gallery-secondary font-bold mb-1 transition-colors duration-200 group-focus-within:text-text-gallery-primary"
                    >
                      Message / Inquiry Details
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="border-b border-border-gallery-hairline/80 bg-transparent py-2 text-sm text-text-gallery-primary outline-none focus:border-text-gallery-primary resize-none transition-colors duration-300"
                      placeholder="Write your message here"
                    />
                  </div>

                  {/* Subscribe Checkbox */}
                  <div className="flex items-center gap-3 select-none">
                    <input
                      type="checkbox"
                      id="contact-subscribe"
                      checked={formData.subscribe}
                      onChange={(e) => setFormData({ ...formData, subscribe: e.target.checked })}
                      className="rounded border-border-gallery-hairline text-text-gallery-primary focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="contact-subscribe"
                      className="font-sans text-[10px] tracking-[0.05em] uppercase text-text-gallery-secondary cursor-pointer hover:text-text-gallery-primary transition-colors"
                    >
                      Subscribe to the mailing list for exhibition announcements
                    </label>
                  </div>

                  {/* Submit Button (One Accent Block Maximum) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-text-gallery-primary text-white hover:bg-black/90 py-3 px-8 text-center cursor-pointer transition-colors duration-200 font-sans text-[10px] md:text-xs tracking-[0.1em] uppercase font-bold w-full md:w-auto disabled:opacity-50"
                    >
                      {isSubmitting ? "Sending..." : "Submit Inquiry"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Social Links (No Icon Walls) */}
            <div className="mt-16 pt-8 border-t border-border-gallery-hairline/60 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-sans tracking-[0.08em] uppercase text-text-gallery-secondary select-none">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-gallery-primary quiet-transition"
              >
                Instagram
              </a>
              <span>/</span>
              <a
                href="https://artsy.net"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-gallery-primary quiet-transition"
              >
                Artsy
              </a>
              <span>/</span>
              <a
                href="https://davidzwirner.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-gallery-primary quiet-transition"
              >
                Ocula
              </a>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
