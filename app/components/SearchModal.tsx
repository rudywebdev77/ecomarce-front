"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import siteData from "../site_data.json";
import { useStore } from "../store/useStore";
import { API_BASE } from "../lib/api";

// Product type taken directly from site_data.json
type SiteProduct = (typeof siteData.collections)[number]["products"][number];
type SearchProduct = SiteProduct & { collectionTitle: string };

export default function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, closeSearch, addToCart } = useStore();
  const [query, setQuery] = useState("");
  const [dbProducts, setDbProducts] = useState<SearchProduct[]>([]);

  useEffect(() => {
    if (!isSearchOpen) return;
    fetch(`${API_BASE}/products?limit=250`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          const mapped: SearchProduct[] = data.products.map((p: any) => ({
            id: p.id || p._id,
            title: p.title,
            handle: p.handle,
            link: `/products/${p.handle}`,
            currentPrice: `Rs.${Number(p.price || 0).toLocaleString()}`,
            comparePrice: p.compare_at_price ? `Rs.${Number(p.compare_at_price).toLocaleString()}` : null,
            primaryImage: p.images?.[0] || "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png",
            secondaryImage: p.images?.[1] || p.images?.[0] || "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png",
            isNew: !!p.is_new,
            isSale: !!p.is_sale || Boolean(p.compare_at_price),
            isSoldOut: p.in_stock === false,
            collectionTitle: p.category || "Luxury Pret",
          }));
          setDbProducts(mapped);
        }
      })
      .catch(() => {});
  }, [isSearchOpen]);

  // Flatten all products across collections
  const allProducts = useMemo(() => {
    const list: SearchProduct[] = [...dbProducts];
    const seen = new Set(dbProducts.map((p) => p.handle.toLowerCase()));

    siteData.collections.forEach((col) => {
      col.products.forEach((p) => {
        if (!seen.has(p.handle.toLowerCase())) {
          seen.add(p.handle.toLowerCase());
          list.push({ ...p, collectionTitle: col.title });
        }
      });
    });
    return list;
  }, [dbProducts]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      closeSearch();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-x-0 top-[38px] bottom-0 z-50 overflow-hidden font-serif"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop (light white fade, no blur) */}
      <div
        onClick={closeSearch}
        className="absolute inset-0 bg-white/70 transition-opacity duration-300"
      />

      {/* Full-width search strip */}
      <div className="relative z-10 w-full bg-[#efefef]">
        <div className="max-w-[1364px] mx-auto px-4 h-[92px] flex items-center justify-center gap-6 sm:gap-8">
          {/* Input box */}
          <form onSubmit={handleSubmit} className="relative w-full max-w-[908px]">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-[39px] bg-white border border-black pl-4 pr-20 text-[14px] font-serif outline-none placeholder:text-[#999999]"
            />
            <div className="absolute right-3 top-0 bottom-0 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-[11px] text-[#777777] hover:text-black font-sans-custom uppercase px-1"
                >
                  Clear
                </button>
              )}
              <button type="submit" aria-label="Submit search">
                <svg
                  className="w-6 h-6 stroke-current stroke-[1.5] text-[#111111] fill-none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </form>

          {/* Close button */}
          <button
            onClick={closeSearch}
            aria-label="Close search"
            className="p-1 text-[#111111] hover:opacity-60 transition-opacity flex-shrink-0"
          >
            <svg className="w-5 h-5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        {/* Search Results (drop down under the strip) */}
        {query && (
          <div className="bg-white border-t border-[#e8e8e1] shadow-lg">
            <div className="max-w-[908px] mx-auto max-h-[60vh] overflow-y-auto p-4 sm:p-6">
              {results.length === 0 ? (
                <div className="text-center py-10 text-[#777777]">
                  <p className="text-[16px]">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-[13px] mt-1 font-sans-custom">
                    Try checking for spelling or searching a general keyword.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.slice(0, 6).map((product) => (
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

                  {/* View all results link */}
                  <div className="mt-4 pt-3 border-t border-[#f0f0f0] text-center">
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={closeSearch}
                      className="text-[13px] font-serif text-[#111111] hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Show all results for &ldquo;{query}&rdquo;</span>
                      <span>→</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}