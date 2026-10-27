"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import siteData from "../site_data.json";
import { useStore } from "../store/useStore";

export default function SearchModal() {
  const { isSearchOpen, closeSearch, addToCart } = useStore();
  const [query, setQuery] = useState("");

  // Flatten all products across collections
  const allProducts = useMemo(() => {
    const list: any[] = [];
    siteData.collections.forEach((col) => {
      col.products.forEach((p) => {
        if (!list.some((existing) => existing.handle === p.handle)) {
          list.push({ ...p, collectionTitle: col.title });
        }
      });
    });
    return list;
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.collectionTitle.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q)
    );
  }, [query, allProducts]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-serif" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={closeSearch}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="relative max-w-3xl mx-auto mt-12 sm:mt-20 px-4 z-50">
        <div className="bg-white shadow-2xl overflow-hidden border border-[#e8e8e1]">
          {/* Search Header */}
          <div className="p-4 sm:p-6 border-b border-[#e8e8e1] flex items-center gap-3">
            <svg className="w-5 h-5 stroke-current stroke-2 text-[#777777] fill-none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by outfit name, collection, style..."
              className="flex-1 text-[16px] sm:text-[18px] font-serif outline-none placeholder:text-[#999999]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-[12px] text-[#777777] hover:text-black font-sans-custom uppercase px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeSearch}
              className="p-1 text-[#444444] hover:text-black transition-colors"
            >
              <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Suggestions */}
          {!query && (
            <div className="p-6 bg-[#fafafa]">
              <p className="text-[12px] font-sans-custom uppercase tracking-[0.1em] text-[#888888] mb-3">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {["Maahi", "Silk Solids", "Iris", "Formals", "Ayzel", "Eid Pret", "Nikkah"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 bg-white border border-[#e8e8e1] text-[13px] text-[#333333] hover:border-black transition-colors cursor-pointer font-serif"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && (
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
              {results.length === 0 ? (
                <div className="text-center py-10 text-[#777777]">
                  <p className="text-[16px]">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-[13px] mt-1 font-sans-custom">Try checking for spelling or searching a general keyword.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map((product) => (
                    <div
                      key={product.handle}
                      className="flex gap-3 p-2 border border-[#f0f0f0] hover:border-[#ddd] transition-colors items-center"
                    >
                      <img
                        src={product.primaryImage}
                        alt={product.title}
                        className="w-16 h-24 object-cover bg-[#f8f8f8] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[#888888] uppercase tracking-wider font-sans-custom truncate">
                          {product.collectionTitle}
                        </p>
                        <Link
                          href={product.link}
                          onClick={closeSearch}
                          className="block text-[15px] font-medium text-[#111111] hover:underline truncate"
                        >
                          {product.title}
                        </Link>
                        <p className="text-[13px] text-[#1c1d1d] mt-0.5">{product.currentPrice}</p>
                        <button
                          onClick={() => {
                            addToCart({
                              id: product.handle,
                              title: product.title,
                              price: product.currentPrice,
                              image: product.primaryImage,
                            });
                            closeSearch();
                          }}
                          className="mt-2 text-[10px] font-sans-custom font-semibold uppercase tracking-wider text-black underline hover:text-[#555]"
                        >
                          + Quick Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
