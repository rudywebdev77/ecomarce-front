"use client";

import React, { useState } from "react";
import { useStore, formatPrice } from "../store/useStore";

export default function ProductQuickViewModal() {
  const { quickViewProduct, closeQuickView, addToCart, currentCurrency } = useStore();
  const [selectedSize, setSelectedSize] = useState("S");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!quickViewProduct) return null;

  const images = [
    quickViewProduct.primaryImage,
    quickViewProduct.secondaryImage,
  ].filter(Boolean);

  const sizes = ["XS", "S", "M", "L", "XL", "Custom"];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${quickViewProduct.handle}-${selectedSize}`,
        title: `${quickViewProduct.title} (${selectedSize})`,
        price: quickViewProduct.currentPrice,
        image: quickViewProduct.primaryImage,
        size: selectedSize,
      });
    }
    closeQuickView();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-serif" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={closeQuickView}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white shadow-2xl border border-[#e8e8e1] overflow-hidden my-8">
          {/* Close Button */}
          <button
            onClick={closeQuickView}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 p-2 text-[#444444] hover:text-black bg-white/80 rounded-full transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Gallery */}
            <div className="p-4 bg-[#f8f8f8] flex flex-col justify-between">
              <div className="relative w-full pb-[140%] overflow-hidden bg-white">
                <img
                  src={images[activeImageIndex] || quickViewProduct.primaryImage}
                  alt={quickViewProduct.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-300"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 justify-center">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-20 border-2 overflow-hidden transition-all ${
                        activeImageIndex === idx ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#888888] font-sans-custom block mb-1">
                  Sillhouete Atelier
                </span>
                <h3 className="text-[22px] font-semibold tracking-[0.04em] text-[#111111]">
                  {quickViewProduct.title}
                </h3>

                <div className="mt-2 text-[18px] text-[#111111] font-semibold">
                  {formatPrice(quickViewProduct.currentPrice, currentCurrency)}
                </div>

                <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                  <p className="text-[13px] text-[#555555] leading-relaxed">
                    Exquisite craftsmanship featuring intricate handwork, opulent textures, and modern silhouettes tailored for luxury festive wear and celebratory occasions.
                  </p>
                </div>

                {/* Size Selector */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-sans-custom uppercase tracking-[0.1em] text-[#333333] font-semibold">
                      Size: <span className="font-normal">{selectedSize}</span>
                    </span>
                    <button className="text-[11px] underline text-[#777777] font-sans-custom hover:text-black">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`h-9 px-3.5 text-[12px] font-sans-custom border transition-all cursor-pointer ${
                          selectedSize === s
                            ? "border-black bg-black text-white"
                            : "border-[#e8e8e1] bg-white text-[#333333] hover:border-black"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-6">
                  <span className="text-[12px] font-sans-custom uppercase tracking-[0.1em] text-[#333333] font-semibold block mb-2">
                    Quantity
                  </span>
                  <div className="inline-flex items-center border border-[#e8e8e1]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer text-[14px]"
                    >
                      -
                    </button>
                    <span className="px-4 text-[13px] font-sans-custom font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer text-[14px]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-2.5">
                <button
                  onClick={handleAddToCart}
                  className="w-full btn-primary py-3.5 text-[12px] tracking-[0.25em]"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    handleAddToCart();
                  }}
                  className="w-full btn-secondary py-3 text-[12px] tracking-[0.2em]"
                >
                  Buy It Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
