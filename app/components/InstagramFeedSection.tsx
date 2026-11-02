"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import feedData from "../instagram_feed.json";

export interface InstagramPost {
  id: string;
  type: string;
  image: string;
  fallbackImage: string;
  video: string | null;
  fallbackVideo?: string | null;
  caption: string;
  date: string;
  link?: string;
}

export default function InstagramFeedSection() {
  const [posts] = useState<InstagramPost[]>(feedData as InstagramPost[]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const activePost = selectedIndex !== null ? posts[selectedIndex] : null;

  // Handle keyboard navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : posts.length - 1) : null
        );
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev < posts.length - 1 ? prev + 1 : 0) : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, posts.length]);

  return (
    <section className="py-10 sm:py-14 bg-white border-t border-[#f2f2f2]">
      <div className="max-w-[1500px] mx-auto px-[17px] md:px-[40px]">
        {/* Section Heading */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 px-4">
          <h2 className="text-[19px] sm:text-[22px] md:text-[25px] font-bold uppercase tracking-[0.14em] font-serif text-[#111111]">
            FOLLOW US ON INSTAGRAM
          </h2>
        </div>

        {/* 12 Posts: 6x2 on Desktop (Image 2 match), 3x2 on Mobile */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-[2px] bg-[#ebebeb]">
          {posts.slice(0, 12).map((post, index) => {
            return (
              <div
                key={post.id || index}
                onClick={() => setSelectedIndex(index)}
                className={`relative w-full aspect-square overflow-hidden bg-[#f5f5f5] cursor-pointer group select-none ${
                  index >= 6 ? "hidden md:block" : ""
                }`}
              >
                {/* Thumbnail Image */}
                <Image
                  src={post.image}
                  alt="Sillhouete Instagram post"
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  unoptimized
                />

                {/* Dark Hover Overlay with Centered Instagram Icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <svg
                    className="w-7 h-7 sm:w-9 sm:h-9 text-white fill-none stroke-current stroke-[1.8] drop-shadow-md"
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Popup (matches Screenshot 5) */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs transition-opacity animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop Click */}
          <div
            className="fixed inset-0"
            onClick={() => setSelectedIndex(null)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-[880px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            {/* Close Button on Card Top Right */}
            <button
              onClick={() => setSelectedIndex(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-30 p-2 text-white md:text-[#333333] hover:opacity-75 transition-opacity cursor-pointer bg-black/40 md:bg-transparent rounded-full"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Column: Media (High Resolution Image) */}
            <div className="relative w-full md:w-[48%] bg-black flex items-center justify-center min-h-[300px] md:min-h-[520px] max-h-[50vh] md:max-h-[85vh] overflow-hidden">
              <div className="relative w-full h-[60vh] max-h-[85vh]">
                <Image
                  src={activePost.image}
                  alt="Instagram post detail"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column: Profile, Caption, Date */}
            <div className="w-full md:w-[52%] p-6 sm:p-8 flex flex-col justify-between bg-white overflow-y-auto">
              <div>
                {/* Profile Header */}
                <div className="flex items-center space-x-3 pb-4 border-b border-[#f0f0f0]">
                  <div className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden bg-white p-0.5 flex items-center justify-center relative">
                    <Image
                      src="https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png?v=1744702089&width=220"
                      alt="Sillhouete"
                      width={36}
                      height={36}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="block text-[14px] font-semibold text-[#111111] font-serif tracking-[0.02em]">
                      sillhouete.official
                    </span>
                  </div>
                </div>

                {/* Caption Text with Preserved Spacing */}
                <div className="py-5">
                  <p className="text-[13px] sm:text-[14px] text-[#333333] font-serif leading-[1.65] whitespace-pre-line">
                    {activePost.caption}
                  </p>
                </div>
              </div>

              {/* Card Footer: Date */}
              <div className="pt-4 border-t border-[#f2f2f2] text-center">
                <span className="text-[12px] font-serif text-[#888888] tracking-wider uppercase">
                  {activePost.date}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Arrows (Left & Right) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((prev) =>
                prev !== null ? (prev > 0 ? prev - 1 : posts.length - 1) : null
              );
            }}
            aria-label="Previous Post"
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((prev) =>
                prev !== null ? (prev < posts.length - 1 ? prev + 1 : 0) : null
              );
            }}
            aria-label="Next Post"
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
