import React from "react";

/**
 * 1. Collection Page Skeleton Loader
 * Renders an authentic luxury fashion layout: title, breadcrumbs, filter bar, and 8 product cards in a 4-column grid.
 */
export function CollectionSkeleton() {
  return (
    <div className="min-h-[80vh] bg-white animate-fade-in font-serif">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
        {/* Collection Header Skeleton */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="h-7 sm:h-9 w-56 sm:w-80 skeleton-shimmer mx-auto mb-3 rounded-xs" />
          <div className="h-3.5 w-40 sm:w-56 skeleton-shimmer mx-auto rounded-xs opacity-75" />
        </div>

        {/* Filter & Sort Controls Skeleton Bar */}
        <div className="flex items-center justify-between border-y border-[#ebebeb] py-3 px-1 sm:px-2 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 skeleton-shimmer rounded-xs" />
            <div className="h-4 w-20 skeleton-shimmer rounded-xs hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 skeleton-shimmer rounded-xs" />
            <div className="h-4 w-12 skeleton-shimmer rounded-xs hidden sm:block" />
          </div>
        </div>

        {/* Product Cards Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[17px]">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="flex flex-col h-full">
              {/* Product Image Skeleton (2:3 Aspect Ratio) */}
              <div className="w-full pb-[150%] skeleton-shimmer relative rounded-xs overflow-hidden mb-3">
                <div className="absolute top-2 right-2 w-8 h-4 bg-white/70 rounded-xs" />
              </div>

              {/* Product Meta Skeleton */}
              <div className="pt-1 pb-2 text-center space-y-2">
                <div className="h-3.5 w-3/4 skeleton-shimmer mx-auto rounded-xs" />
                <div className="h-3 w-1/2 skeleton-shimmer mx-auto rounded-xs opacity-80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Product Detail Page Skeleton Loader
 * Renders large 2:3 imagery, thumbnails, title, pricing, size buttons, and action buttons.
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-[85vh] bg-white animate-fade-in font-serif">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Image Gallery Skeleton (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full pb-[135%] sm:pb-[140%] skeleton-shimmer relative rounded-xs overflow-hidden" />
            <div className="grid grid-cols-4 gap-3 pt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="pb-[130%] skeleton-shimmer rounded-xs" />
              ))}
            </div>
          </div>

          {/* Right Column: Product Meta & Purchase Actions Skeleton (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:pl-4">
            {/* Breadcrumb */}
            <div className="h-3 w-36 skeleton-shimmer rounded-xs" />

            {/* Title & Price */}
            <div className="space-y-3">
              <div className="h-7 sm:h-9 w-4/5 skeleton-shimmer rounded-xs" />
              <div className="h-5 sm:h-6 w-36 skeleton-shimmer rounded-xs" />
            </div>

            {/* Tax / Delivery Info */}
            <div className="h-3 w-48 skeleton-shimmer rounded-xs opacity-75" />

            {/* Size Selector Skeleton */}
            <div className="space-y-3 pt-2">
              <div className="h-3.5 w-24 skeleton-shimmer rounded-xs" />
              <div className="flex flex-wrap gap-2.5">
                {["XS", "S", "M", "L", "XL"].map((s) => (
                  <div key={s} className="w-12 h-10 skeleton-shimmer rounded-xs" />
                ))}
              </div>
            </div>

            {/* Primary Action Buttons Skeleton */}
            <div className="space-y-3 pt-4">
              <div className="w-full h-12 skeleton-shimmer rounded-xs" />
              <div className="w-full h-11 skeleton-shimmer rounded-xs" />
            </div>

            {/* Accordion / Details Section Skeletons */}
            <div className="space-y-4 pt-6 border-t border-[#ededed]">
              <div className="flex justify-between items-center py-2 border-b border-[#f3f3f3]">
                <div className="h-4 w-32 skeleton-shimmer rounded-xs" />
                <div className="h-3 w-3 skeleton-shimmer rounded-xs" />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#f3f3f3]">
                <div className="h-4 w-40 skeleton-shimmer rounded-xs" />
                <div className="h-3 w-3 skeleton-shimmer rounded-xs" />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#f3f3f3]">
                <div className="h-4 w-28 skeleton-shimmer rounded-xs" />
                <div className="h-3 w-3 skeleton-shimmer rounded-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Search Page Skeleton Loader
 */
export function SearchSkeleton() {
  return (
    <div className="min-h-[70vh] bg-white font-serif py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[600px] mx-auto text-center mb-10 space-y-4">
          <div className="h-8 w-44 skeleton-shimmer mx-auto rounded-xs" />
          <div className="h-12 w-full skeleton-shimmer rounded-xs" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[17px]">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="w-full pb-[150%] skeleton-shimmer rounded-xs mb-3" />
              <div className="h-3.5 w-3/4 skeleton-shimmer mx-auto mb-2 rounded-xs" />
              <div className="h-3 w-1/2 skeleton-shimmer mx-auto rounded-xs" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 4. Account Dashboard Skeleton Loader
 */
export function AccountSkeleton() {
  return (
    <div className="min-h-[75vh] bg-[#fafafa] font-serif py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header Profile Banner Skeleton */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <div className="h-7 w-56 skeleton-shimmer rounded-xs" />
            <div className="h-4 w-40 skeleton-shimmer rounded-xs opacity-75" />
          </div>
          <div className="h-9 w-28 skeleton-shimmer rounded-xs" />
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-xs space-y-2">
              <div className="h-3 w-20 skeleton-shimmer rounded-xs" />
              <div className="h-6 w-16 skeleton-shimmer rounded-xs" />
            </div>
          ))}
        </div>

        {/* Orders Card Skeleton */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="h-5 w-36 skeleton-shimmer rounded-xs mb-4" />
          <div className="h-20 w-full skeleton-shimmer rounded-xs" />
          <div className="h-20 w-full skeleton-shimmer rounded-xs" />
        </div>
      </div>
    </div>
  );
}

/**
 * 5. Generic Editorial / Policy Page Skeleton Loader
 */
export function GenericPageSkeleton() {
  return (
    <div className="min-h-[60vh] bg-white font-serif py-12 sm:py-16">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-3 mb-10">
          <div className="h-8 w-64 skeleton-shimmer mx-auto rounded-xs" />
          <div className="h-4 w-44 skeleton-shimmer mx-auto rounded-xs opacity-70" />
        </div>

        <div className="space-y-4 pt-4">
          <div className="h-4 w-full skeleton-shimmer rounded-xs" />
          <div className="h-4 w-11/12 skeleton-shimmer rounded-xs" />
          <div className="h-4 w-4/5 skeleton-shimmer rounded-xs" />
          <div className="h-4 w-full skeleton-shimmer rounded-xs" />
          <div className="h-4 w-3/4 skeleton-shimmer rounded-xs" />
        </div>
      </div>
    </div>
  );
}

/**
 * 6. Order Success Skeleton Loader
 */
export function OrderSuccessSkeleton() {
  return (
    <div className="max-w-[700px] mx-auto py-16 px-4 sm:px-6 text-center font-serif">
      <div className="w-16 h-16 rounded-full skeleton-shimmer mx-auto mb-6" />
      <div className="h-3 w-40 skeleton-shimmer mx-auto mb-3 rounded-xs" />
      <div className="h-8 sm:h-9 w-4/5 sm:w-2/3 skeleton-shimmer mx-auto mb-5 rounded-xs" />
      <div className="h-4 w-3/4 skeleton-shimmer mx-auto mb-8 rounded-xs opacity-75" />
      <div className="bg-[#fcfcfc] border border-[#e8e8e1] p-6 sm:p-8 rounded-xs space-y-4">
        <div className="h-4 w-full skeleton-shimmer rounded-xs" />
        <div className="h-4 w-4/5 skeleton-shimmer rounded-xs" />
        <div className="h-4 w-2/3 skeleton-shimmer rounded-xs" />
      </div>
    </div>
  );
}
