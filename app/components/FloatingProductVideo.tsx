"use client";

import React, { useState, useEffect } from "react";
import productVideosMap from "../product_videos.json";

interface FloatingProductVideoProps {
  productHandle: string;
  productTitle: string;
  videoUrl?: string;
}

export function normalizeMediaUrl(url?: string): string {
  if (!url) return "";
  return url
    .trim()
    .replace(/^https?:\/\/(?:localhost|127\.0\.0\.1):5000(\/uploads\/)/i, "$1");
}

export function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function FloatingProductVideo({
  productHandle,
  productTitle,
  videoUrl,
}: FloatingProductVideoProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Look up video for this product handle (case-insensitive) or explicit videoUrl
  const normalizedHandle = productHandle.toLowerCase().trim();
  const videos = productVideosMap as Record<string, string>;
  const trimmedUrl = normalizeMediaUrl(videoUrl);
  const explicitYouTubeId = extractYouTubeId(trimmedUrl);
  const youTubeId = explicitYouTubeId || (!trimmedUrl ? videos[normalizedHandle] || null : null);
  const directVideoSrc = !explicitYouTubeId && trimmedUrl ? trimmedUrl : null;

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // If this product doesn't have a video or the user dismissed it, don't show
  if ((!youTubeId && !directVideoSrc) || isDismissed) {
    return null;
  }

  return (
    <>
      {/* ================= FLOATING CORNER WIDGET (EXACT MATCH WITH SILLHOUETE PV-FLOAT) ================= */}
      <div
        className="fixed right-3 sm:right-4 bottom-[84px] sm:bottom-[92px] z-[49] w-[116px] sm:w-[136px] select-none"
        style={{ filter: "drop-shadow(0 10px 24px rgba(0, 0, 0, 0.28))" }}
      >
        <div
          onClick={() => setIsModalOpen(true)}
          className="relative w-full aspect-[9/16] rounded-[14px] overflow-hidden bg-black border-2 border-white cursor-pointer group shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
          title="Click to play full video"
        >
          {/* Muted Autoplay Video Preview */}
          {youTubeId ? (
            <iframe
              className="absolute inset-0 w-full h-full pointer-events-none scale-[1.05]"
              src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${youTubeId}&disablekb=1`}
              allow="autoplay; encrypted-media; picture-in-picture"
              tabIndex={-1}
              title={productTitle}
            />
          ) : (
            <video
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              src={directVideoSrc!}
              autoPlay
              muted
              loop
              playsInline
            />
          )}

          {/* Top Overlay Header */}
          <div className="absolute top-0 inset-x-0 pt-2 pb-5 px-2 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center space-x-1.5 min-w-0 pr-1">
              {/* Sillhouete Badge */}
              <div className="w-5 h-5 rounded-full bg-black/90 border border-white/20 flex items-center justify-center shrink-0">
                <span className="text-[7.5px] font-serif font-bold text-[#d4af37] tracking-tight">S</span>
              </div>
              <span className="text-[10px] font-medium text-white truncate drop-shadow-sm">
                {productTitle}
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              aria-label="Close floating video"
              className="pointer-events-auto w-5 h-5 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all shrink-0"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.65))" }}
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3.2 3.2l9.6 9.6M12.8 3.2l-9.6 9.6" />
              </svg>
            </button>
          </div>

          {/* Bottom Expand Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            aria-label="Expand video"
            className="absolute right-2 bottom-2 z-10 w-7 h-7 rounded-[6px] bg-black/75 text-white flex items-center justify-center hover:bg-black transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.2 2.2H13.8V6.8M6.8 13.8H2.2V9.2M13.5 2.5L9.2 6.8M2.5 13.5L6.8 9.2" />
            </svg>
          </button>
        </div>
      </div>

      {/* ================= FULL SCREEN MODAL POPUP ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={productTitle}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Dialog Container */}
          <div
            className="relative w-full max-w-[380px] aspect-[9/16] max-h-[calc(100vh-48px)] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close video modal"
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3.2 3.2l9.6 9.6M12.8 3.2l-9.6 9.6" />
              </svg>
            </button>

            {/* Video Player With Sound & Full Controls */}
            {youTubeId ? (
              <iframe
                className="w-full h-full border-0"
                src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&mute=0&controls=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${youTubeId}`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title={productTitle}
              />
            ) : (
              <video
                className="w-full h-full object-contain bg-black"
                src={directVideoSrc!}
                autoPlay
                controls
                playsInline
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

