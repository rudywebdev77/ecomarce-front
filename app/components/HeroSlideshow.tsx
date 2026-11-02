"use client";

import React from "react";
import Link from "next/link";
import siteData from "../site_data.json";
import { slideSync, useSlideTick, mod } from "../store/useSlideSync";

// Timing video se match kiya hua hai. Timer announcement bar ke saath SHARED hai
// (store/useSlideSync.ts), isliye dono hamesha ek saath badalte hain.
//  - Purani slide foran gayab (black), nayi slide ~0.4s mein fade-in hoti hai
//    aur halka sa right se left slide karti hai
const TRANSITION_MS = 400;

export default function HeroSlideshow() {
  const slides = siteData.heroSlides;
  const tick = useSlideTick();
  const currentSlide = mod(tick, slides.length);
  const hasChanged = tick !== 0; // pehli slide par animation nahi

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0f0f0f] select-none"
      onMouseEnter={() => slideSync.setPaused(true)}
      onMouseLeave={() => slideSync.setPaused(false)}
      aria-label="Hero Carousel"
    >
      <style>{`
        @keyframes heroSlideIn {
          from { opacity: 0; transform: translateX(8%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Aspect Ratio Box: Desktop 41.15%, Mobile 125% */}
      <div className="relative w-full pb-[125%] sm:pb-[70%] md:pb-[50%] lg:pb-[41.15%]">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 ${
                isActive ? "z-10" : "z-0 opacity-0 invisible pointer-events-none"
              }`}
              style={
                isActive && hasChanged
                  ? {
                      animation: `heroSlideIn ${TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) both`,
                    }
                  : undefined
              }
            >
              <Link href={slide.link || "/"} className="block w-full h-full relative">
                {/* Desktop Image */}
                <picture className="w-full h-full block">
                  <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                  <img
                    src={slide.desktopImage}
                    alt={slide.alt || "Sillhouete Banner"}
                    className="w-full h-full object-cover object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </picture>
              </Link>
            </div>
          );
        })}

        {/* Dots: image ke neeche beech mein (har slide ke liye 1 dot) */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-[10px]">
          {slides.map((slide, dotIndex) => (
            <button
              key={slide.id}
              onClick={() => slideSync.goTo(dotIndex, slides.length)}
              aria-label={`Go to slide ${dotIndex + 1}`}
              aria-current={dotIndex === currentSlide}
              className={`w-[10px] h-[10px] rounded-full cursor-pointer transition-colors duration-300 ${
                dotIndex === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
