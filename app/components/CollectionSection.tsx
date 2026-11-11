"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore, formatPrice } from "../store/useStore";

export interface Product {
  handle: string;
  title: string;
  link: string;
  currentPrice: string;
  comparePrice?: string | null;
  isNew?: boolean;
  isSoldOut?: boolean;
  primaryImage: string;
  secondaryImage: string;
  /** Optional extra images. On hover the card cycles: primary -> secondary -> these -> primary... */
  extraImages?: string[];
}

interface CollectionSectionProps {
  id: string;
  title: string;
  link: string;
  products: Product[];
  showViewAll?: boolean;
  viewAllTextColor?: "red" | "white";
}

const HOVER_CYCLE_MS = 1100;

function ProductCard({ product }: { product: Product }) {
  const { currentCurrency } = useStore();

  const numCompare = product.comparePrice
    ? parseFloat(
        String(product.comparePrice)
          .replace(/^(Rs\.?|PKR)\s*/i, "")
          .replace(/,/g, "")
          .match(/\d+(\.\d+)?/)?.[0] || "0"
      )
    : 0;

  const numCurrent = product.currentPrice
    ? parseFloat(
        String(product.currentPrice)
          .replace(/^(Rs\.?|PKR)\s*/i, "")
          .replace(/,/g, "")
          .match(/\d+(\.\d+)?/)?.[0] || "0"
      )
    : 0;

  const hasComparePrice =
    numCompare > numCurrent &&
    Boolean(product.comparePrice) &&
    product.comparePrice !== product.currentPrice &&
    product.comparePrice !== "Rs.0";

  const savePercent =
    hasComparePrice && numCompare > 0
      ? Math.round(((numCompare - numCurrent) / numCompare) * 100)
      : 0;

  // Unique, non-empty list of images: primary first
  const images = Array.from(
    new Set(
      [product.primaryImage, product.secondaryImage, ...(product.extraImages || [])].filter(
        Boolean
      ) as string[]
    )
  );

  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  // Hover in: show next image right away, then keep cycling while hovered
  const handleEnter = () => {
    if (images.length < 2) return;
    stop();
    setActive(1);
    if (images.length > 2) {
      timer.current = setInterval(() => {
        setActive((prev) => (prev + 1) % images.length);
      }, HOVER_CYCLE_MS);
    }
  };

  // Hover out: stop and go back to the primary image
  const handleLeave = () => {
    stop();
    setActive(0);
  };

  useEffect(() => stop, []);

  return (
    <div className="product-card group flex flex-col h-full" suppressHydrationWarning>
      {/* Image Container with 2:3 ratio wrapped in product link */}
      <Link
        href={product.link || `/products/${product.handle}`}
        className="block relative w-full overflow-hidden bg-[#f9f9f9] pb-[150%] cursor-pointer"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* Product Badges */}
        {hasComparePrice && (
          <span className="absolute top-2 left-2 bg-[#111111] text-white text-[11px] font-normal tracking-wide px-2 py-0.5 z-[3] uppercase">
            Sale
          </span>
        )}
        {product.isNew && <span className="product-badge-new">New</span>}

        {/* Primary Image - stays solid at z-1 */}
        <Image
          src={product.primaryImage}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 39vw, (max-width: 1024px) 33vw, 25vw"
          className="product-primary-image object-cover object-center z-[1]"
          style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        />

        {/* Hover images - preloaded (eager), z-[2], fade in/out; only the active one is visible */}
        {images.slice(1).map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${product.title} alternative ${i + 1}`}
            fill
            sizes="(max-width: 768px) 39vw, (max-width: 1024px) 33vw, 25vw"
            loading="eager"
            className={`product-secondary-image object-cover object-center z-[2] pointer-events-none transition-opacity duration-200 ease-in-out will-change-[opacity] ${
              active === i + 1 ? "opacity-100" : "opacity-0"
            }`}
            style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
          />
        ))}
      </Link>

      {/* Product Meta */}
      <div className="pt-2.5 sm:pt-3 pb-2 text-center flex-1 flex flex-col justify-between">
        <Link
          href={product.link || `/products/${product.handle}`}
          className="block text-[13px] sm:text-[15px] font-normal tracking-[0.025em] font-serif text-[#111111] hover:text-[#555555] transition-colors leading-[1.35] line-clamp-1"
        >
          {product.title}
        </Link>

        <div className="mt-1 flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 text-[12.5px] sm:text-[14px] text-[#111111] font-serif">
          {hasComparePrice && (
            <span className="text-[#888888] line-through text-[11px] sm:text-[12px]">
              {formatPrice(product.comparePrice, currentCurrency)}
            </span>
          )}
          <span className="text-[#111111] font-normal">
            {formatPrice(product.currentPrice, currentCurrency)}
          </span>
          {savePercent > 0 && (
            <span className="text-[#e53935] text-[11px] sm:text-[12px] font-normal">
              Save {savePercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollectionSection({
  title,
  link,
  products,
  showViewAll = false,
  viewAllTextColor = "white",
}: CollectionSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollRatio(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
    }
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 border-b border-[#f2f2f2]">
      <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-[20px] sm:text-[23px] lg:text-[25px] font-semibold uppercase tracking-[0.05em] font-serif text-[#111111] leading-none">
            {title}
          </h2>
        </div>

        {/* 1. Desktop & Laptop Layout (>= 769px): 4 columns grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[17px]">
          {products.map((product) => (
            <ProductCard key={product.handle || product.title} product={product} />
          ))}
        </div>

        {/* 2. Mobile Layout (< 769px): Horizontal Scroll Carousel matching sillhouete.com */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="grid-overflow-wrapper overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex flex-nowrap gap-[14px] w-max py-1">
              {products.map((product) => (
                <div
                  key={product.handle || product.title}
                  className="w-[39vw] min-w-[145px] max-w-[210px] shrink-0"
                >
                  <ProductCard product={product} />
                </div>
              ))}

              {/* View All Tile inside horizontal carousel on mobile (matching sillhouete.com) */}
              {showViewAll && (
                <div className="w-[39vw] min-w-[145px] max-w-[210px] shrink-0 flex items-center justify-center pb-8">
                  <Link
                    href={link || "#"}
                    className="w-full border border-[#d2d2d2] hover:border-black py-10 px-3 text-center text-[12px] font-serif uppercase tracking-[0.1em] text-[#111111] transition-colors flex flex-col items-center justify-center bg-white"
                  >
                    <span>View all</span>
                    <span className="text-[11px] font-sans text-[#777777] lowercase tracking-normal mt-1">
                      {products.length} products
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Custom Horizontal Scrollbar Indicator (exact match to live screenshot) */}
          <div className="mt-4 px-6 max-w-[240px] mx-auto">
            <div className="w-full bg-[#e5e5e5] h-[2px] rounded-full overflow-hidden relative">
              <div
                className="bg-[#111111] h-full rounded-full transition-transform duration-75"
                style={{
                  width: "35%",
                  transform: `translateX(${scrollRatio * 185}%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Desktop View All Button below grid */}
        {showViewAll && (
          <div className="mt-8 sm:mt-12 text-center hidden md:block">
            <Link
              href={link || "#"}
              className={`inline-flex items-center justify-center bg-[#111111] hover:bg-[#222222] px-10 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.25em] transition-colors border border-[#111111] ${
                viewAllTextColor === "red"
                  ? "text-[#ff0000] hover:text-[#ff3333]"
                  : "text-white"
              }`}
            >
              VIEW ALL
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
