"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard, { Product } from "../components/ProductCard";
import rawProductsData from "../raw_products.json";
import siteData from "../site_data.json";
import { API_BASE } from "../lib/api";

interface RawProduct {
  id: number;
  title: string;
  handle: string;
  tags: string[];
  product_type: string;
  variants: Array<{
    price: string;
    compare_at_price: string | null;
  }>;
  images: Array<{
    src: string;
  }>;
}

const rawProducts = rawProductsData as RawProduct[];

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/products?limit=250`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          const mapped: Product[] = data.products.map((p: any) => ({
            handle: p.handle,
            title: p.title,
            link: `/products/${p.handle}`,
            currentPrice: `Rs.${Number(p.price || 0).toLocaleString()}`,
            comparePrice: p.compare_at_price ? `Rs.${Number(p.compare_at_price).toLocaleString()}` : null,
            primaryImage: p.images?.[0] || "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png",
            secondaryImage: p.images?.[1] || p.images?.[0] || "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png",
            isNew: !!p.is_new,
            isSale: !!p.is_sale || Boolean(p.compare_at_price),
            isSoldOut: p.in_stock === false,
            productType: p.category || p.product_type || "Couture",
          }));
          setDbProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Formatted products from db + raw_products + siteData
  const allProducts = useMemo<Product[]>(() => {
    const list: Product[] = [...dbProducts];
    const seen = new Set<string>(dbProducts.map((p) => p.handle.toLowerCase()));

    // 1. Curated from site_data
    for (const col of siteData.collections) {
      for (const p of col.products) {
        if (!seen.has(p.handle.toLowerCase())) {
          seen.add(p.handle.toLowerCase());
          list.push(p);
        }
      }
    }

    // 2. From raw_products
    for (const raw of rawProducts) {
      if (raw.images && raw.images.length > 0 && !seen.has(raw.handle.toLowerCase())) {
        seen.add(raw.handle.toLowerCase());
        list.push({
          handle: raw.handle,
          title: raw.title,
          link: `/products/${raw.handle}`,
          currentPrice: raw.variants[0]?.price
            ? `Rs.${parseFloat(raw.variants[0].price).toLocaleString()}`
            : "Rs.32,900",
          comparePrice: raw.variants[0]?.compare_at_price
            ? `Rs.${parseFloat(raw.variants[0].compare_at_price).toLocaleString()}`
            : null,
          primaryImage: raw.images[0]?.src,
          secondaryImage: raw.images[1]?.src || raw.images[0]?.src,
          isNew: raw.tags?.some((t) => t.toLowerCase() === "new"),
          isSale: Boolean(raw.variants[0]?.compare_at_price),
        });
      }
    }

    return list;
  }, [dbProducts]);

  const results = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return [];
    return allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q)
    );
  }, [searchTerm, allProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="font-serif">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-[#f0f0f0] bg-[#fafafa]">
        <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 text-[12px] text-[#777777] font-sans-custom uppercase tracking-[0.1em]">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="text-[#cccccc]">/</li>
            <li className="text-[#111111] font-semibold">Search</li>
          </ol>
        </div>
      </nav>

      {/* Header and Search Input */}
      <header className="pt-10 pb-8 sm:pt-14 sm:pb-12 border-b border-[#ececec] text-center px-4 bg-white">
        <div className="max-w-[650px] mx-auto">
          <h1 className="text-[28px] sm:text-[36px] font-semibold uppercase tracking-[0.05em] text-[#111111]">
            Search
          </h1>
          <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center border border-[#111111] max-w-[500px] mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search our store..."
              className="w-full px-4 py-3 text-[14px] font-sans-custom outline-none bg-white text-[#111111]"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#111111] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333333] transition-colors"
            >
              Search
            </button>
          </form>
          {searchTerm && (
            <p className="mt-4 text-[13px] text-[#777777] font-sans-custom">
              {results.length} {results.length === 1 ? "result" : "results"} found for &quot;{searchTerm}&quot;
            </p>
          )}
        </div>
      </header>

      {/* Results Grid */}
      <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-[17px]">
            {results.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-[16px] text-[#666666] font-sans-custom mb-6">
              {searchTerm
                ? `No products found matching "${searchTerm}". Please try a different search keyword.`
                : "Enter a keyword above to search for luxury Pakistani couture, bridal and formals."}
            </p>
            <Link
              href="/collections/all"
              className="inline-block bg-[#111111] hover:bg-[#222222] text-white px-8 py-3 text-[12px] font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

