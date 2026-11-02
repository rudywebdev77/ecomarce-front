"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import ProductCard, { Product } from "../../components/ProductCard";
import { CollectionInfo } from "../../lib/collections";

interface CollectionClientProps {
  info: CollectionInfo;
  initialProducts: Product[];
}

type SortOption =
  | "featured"
  | "best-selling"
  | "title-ascending"
  | "title-descending"
  | "price-ascending"
  | "price-descending"
  | "created-descending"
  | "created-ascending";

const COLOR_OPTIONS = [
  { name: "Beige", hex: "#e0cfb3" },
  { name: "Black", hex: "#000000" },
  { name: "Blue", hex: "#0b5ed7" },
  { name: "Gold", hex: "#c69214" },
  { name: "Gray", hex: "#787878" },
  { name: "Green", hex: "#198754" },
  {
    name: "Multicolor",
    gradient: "linear-gradient(135deg, #e51c24, #cca023, #009f4d, #0b57cf)",
  },
  { name: "Orange", hex: "#ea580c" },
  { name: "Pink", hex: "#f472b6" },
  { name: "Red", hex: "#dc2626" },
  { name: "Silver", hex: "#c5c5c5" },
  { name: "White", hex: "#ffffff" },
];

const SALE_SIZE_OPTIONS = [
  { label: "Medium (M) (1)", value: "Medium (M)" },
  { label: "0 (9)", value: "0" },
];

const SALE_DRESS_STYLE_OPTIONS = [
  { label: "A-line (1)", value: "A-line" },
  { label: "Other (1)", value: "Other" },
];

export default function CollectionClient({
  info,
  initialProducts,
}: CollectionClientProps) {
  const gridTopRef = useRef<HTMLDivElement>(null);

  const isSalePage = info.handle === "sale-1" || info.handle === "sale";
  const itemsPerPage = isSalePage ? 24 : 36;

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Filter States
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Calculate maximum price in current collection
  const maxCollectionPrice = useMemo(() => {
    if (isSalePage) return 464165;
    let highest = 100000;
    for (const p of initialProducts) {
      const clean = (p.currentPrice || "").replace(/,/g, "");
      const match = clean.match(/\d+(\.\d+)?/);
      const val = match ? parseFloat(match[0]) : 0;
      if (val > highest) highest = val;
    }
    return Math.ceil(highest / 5000) * 5000;
  }, [initialProducts, isSalePage]);

  // Dynamically determine which colors exist in the current collection products (matches Image 2)
  const availableColors = useMemo(() => {
    if (isSalePage) return COLOR_OPTIONS;

    const foundColors = new Set<string>();
    for (const p of initialProducts) {
      if (p.color) foundColors.add(p.color.toLowerCase());
      const text = `${p.title} ${p.handle}`.toLowerCase();
      for (const col of COLOR_OPTIONS) {
        if (text.includes(col.name.toLowerCase())) {
          foundColors.add(col.name.toLowerCase());
        }
      }
    }
    const filtered = COLOR_OPTIONS.filter((col) =>
      foundColors.has(col.name.toLowerCase())
    );
    return filtered.length > 0 ? filtered : COLOR_OPTIONS.slice(0, 3);
  }, [initialProducts, isSalePage]);

  const [priceMax, setPriceMax] = useState<number>(maxCollectionPrice);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Lock body scroll and handle Escape key when filter drawer is open
  React.useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsFilterDrawerOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isFilterDrawerOpen]);

  // Accordion Toggle States (Open by default matching sillhouete.com)
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);
  const [isStyleOpen, setIsStyleOpen] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to extract numeric price correctly (handles "Rs." dot and commas)
  const getProductPrice = (p: Product): number => {
    const clean = (p.currentPrice || "").replace(/,/g, "");
    const match = clean.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  // Toggle helpers
  const toggleSize = (sizeVal: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeVal) ? prev.filter((s) => s !== sizeVal) : [...prev, sizeVal]
    );
    setCurrentPage(1);
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
    setCurrentPage(1);
  };

  const toggleStyle = (styleVal: string) => {
    setSelectedStyles((prev) =>
      prev.includes(styleVal) ? prev.filter((s) => s !== styleVal) : [...prev, styleVal]
    );
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by max price
    if (priceMax < maxCollectionPrice) {
      result = result.filter((p) => getProductPrice(p) <= priceMax);
    }

    // Filter by Size (Medium (M) or 0 on sale, or general size)
    if (selectedSizes.length > 0) {
      result = result.filter((p) => {
        if (!p.size) return false;
        return selectedSizes.includes(p.size);
      });
    }

    // Filter by Color
    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        if (p.color && selectedColors.includes(p.color)) return true;
        const text = `${p.title} ${p.handle}`.toLowerCase();
        return selectedColors.some((color) => text.includes(color.toLowerCase()));
      });
    }

    // Filter by Dress Style (A-line or Other on sale)
    if (selectedStyles.length > 0) {
      result = result.filter((p) => {
        if (!p.dressStyle) return false;
        return selectedStyles.includes(p.dressStyle);
      });
    }

    // Sorting
    switch (sortBy) {
      case "title-ascending":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-descending":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "price-ascending":
        result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case "price-descending":
        result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case "created-descending":
        result.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        break;
      case "created-ascending":
        result.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
        break;
      case "best-selling":
      case "featured":
      default:
        break;
    }

    return result;
  }, [
    initialProducts,
    priceMax,
    maxCollectionPrice,
    selectedColors,
    selectedSizes,
    selectedStyles,
    sortBy,
  ]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const displayedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Reusable Filter Content Renderer (Matches Image 1, 2, 3)
  const renderFilterContent = () => (
    <div className="text-[#111111]">
      {/* 1. PRICE */}
      <div>
        <button
          type="button"
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between text-[11px] font-normal uppercase tracking-[0.25em] text-[#111111] cursor-pointer py-2.5 font-serif select-none"
        >
          <span>P R I C E</span>
          <svg
            className={`w-3.5 h-2 text-[#111111] transition-transform duration-200 ${
              isPriceOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 28 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
          </svg>
        </button>

        {isPriceOpen && (
          <div className="mt-1 mb-2">
            <div className="flex items-center justify-between text-[13.5px] font-serif text-[#111111] mb-3 select-none">
              <span>Rs.0</span>
              <span>Rs.{priceMax.toLocaleString()}</span>
            </div>
            <div className="relative flex items-center h-6">
              <div className="absolute left-0 right-0 h-[2.5px] bg-black pointer-events-none" />
              <span className="absolute left-0 w-3.5 h-3.5 bg-black rounded-full pointer-events-none z-10 -translate-y-1/2 top-1/2" />
              <input
                type="range"
                min={0}
                max={maxCollectionPrice}
                step={1000}
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(parseFloat(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full relative z-20 cursor-pointer appearance-none bg-transparent focus:outline-none 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer 
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-[#eeeeee] my-5" />

      {/* 2. SIZE (Shown on sale page) */}
      {isSalePage && (
        <>
          <div>
            <button
              type="button"
              onClick={() => setIsSizeOpen(!isSizeOpen)}
              className="w-full flex items-center justify-between text-[11px] font-normal uppercase tracking-[0.25em] text-[#111111] cursor-pointer py-2.5 font-serif select-none"
            >
              <span>S I Z E</span>
              <svg
                className={`w-3.5 h-2 text-[#111111] transition-transform duration-200 ${
                  isSizeOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </button>

            {isSizeOpen && (
              <div className="mt-2 space-y-2">
                {SALE_SIZE_OPTIONS.map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center space-x-3 cursor-pointer select-none group py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(item.value)}
                      onChange={() => toggleSize(item.value)}
                      className="w-[15px] h-[15px] border border-[#d2d2d2] rounded-none accent-black cursor-pointer bg-white"
                    />
                    <span className="font-serif text-[13.5px] text-[#111111] group-hover:text-black">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="border-b border-[#eeeeee] my-5" />
        </>
      )}

      {/* 3. COLOR (Shows authentic collection colors only) */}
      <div>
        <button
          type="button"
          onClick={() => setIsColorOpen(!isColorOpen)}
          className="w-full flex items-center justify-between text-[11px] font-normal uppercase tracking-[0.25em] text-[#111111] cursor-pointer py-2.5 font-serif select-none"
        >
          <span>C O L O R</span>
          <svg
            className={`w-3.5 h-2 text-[#111111] transition-transform duration-200 ${
              isColorOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 28 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
          </svg>
        </button>

        {isColorOpen && (
          <div className="mt-2 space-y-2.5">
            {availableColors.map((col) => {
              const isSelected = selectedColors.includes(col.name);
              return (
                <div
                  key={col.name}
                  onClick={() => toggleColor(col.name)}
                  className="flex items-center space-x-3.5 py-1 cursor-pointer group select-none"
                >
                  <span
                    className="w-[32px] h-[32px] rounded-full relative shrink-0 transition-all flex items-center justify-center"
                    style={{
                      boxShadow: isSelected
                        ? "0 0 0 2px #000000"
                        : "0 0 0 1px #d6d6d6",
                    }}
                  >
                    <span
                      className="w-full h-full rounded-full block border-[3px] border-white"
                      style={{
                        backgroundColor: col.hex,
                        backgroundImage: col.gradient,
                      }}
                    />
                  </span>
                  <span
                    className={`font-serif text-[14px] transition-colors ${
                      isSelected
                        ? "font-bold text-black"
                        : "text-[#111111] group-hover:text-black"
                    }`}
                  >
                    {col.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-b border-[#eeeeee] my-5" />

      {/* 4. DRESS STYLE (Shown on sale page) */}
      {isSalePage && (
        <>
          <div>
            <button
              type="button"
              onClick={() => setIsStyleOpen(!isStyleOpen)}
              className="w-full flex items-center justify-between text-[11px] font-normal uppercase tracking-[0.25em] text-[#111111] cursor-pointer py-2.5 font-serif select-none"
            >
              <span>D R E S S   S T Y L E</span>
              <svg
                className={`w-3.5 h-2 text-[#111111] transition-transform duration-200 ${
                  isStyleOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </button>

            {isStyleOpen && (
              <div className="mt-2 space-y-2">
                {SALE_DRESS_STYLE_OPTIONS.map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center space-x-3 cursor-pointer select-none group py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStyles.includes(item.value)}
                      onChange={() => toggleStyle(item.value)}
                      className="w-[15px] h-[15px] border border-[#d2d2d2] rounded-none accent-black cursor-pointer bg-white"
                    />
                    <span className="font-serif text-[13.5px] text-[#111111] group-hover:text-black">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="border-b border-[#eeeeee] my-5" />
        </>
      )}
    </div>
  );

  return (
    <div className="font-serif bg-white min-h-[600px]">
      {/* 1. Page Title */}
      <header className="pt-8 sm:pt-10 pb-5 sm:pb-7 text-center px-4 bg-white">
        <h1
          className={`font-serif uppercase text-[#111111] ${
            isSalePage
              ? "text-[24px] sm:text-[28px] md:text-[30px] font-bold tracking-[0.05em]"
              : "text-[24px] sm:text-[28px] md:text-[30px] font-semibold md:font-bold tracking-[0.05em]"
          }`}
        >
          {info.title.toUpperCase()}
        </h1>
      </header>

      {/* 2. Main Content Container */}
      <div
        ref={gridTopRef}
        className={`${
          isSalePage ? "max-w-[1550px]" : "max-w-[1440px]"
        } mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4`}
      >
        {/* Breadcrumb Navigation for Standard Collections (Image 1 / Image 2 style) */}
        {!isSalePage && (
          <nav aria-label="Breadcrumb" className="mb-5 sm:mb-6">
            <ol className="flex items-center gap-2 text-[13px] font-serif text-[#000000]">
              <li className="flex items-center gap-2">
                <Link
                  href="/"
                  className="text-[#666666] hover:text-[#000000] flex items-center transition-colors"
                  aria-label="Home"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 shrink-0"
                  >
                    <path
                      d="M2 6L8 1L14 6V13C14 13.5304 13.7893 14.0391 13.4142 14.4142C13.0391 14.7893 12.5304 15 12 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V6Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 15V8H10V15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <span aria-hidden="true" className="text-[#999999] select-none text-[13px]">
                  /
                </span>
              </li>
              <li>
                <span className="text-[#000000] font-normal text-[13px] font-serif">
                  {info.title}
                </span>
              </li>
            </ol>
          </nav>
        )}

        {/* SALE PAGE LAYOUT (Permanent Sidebar + 4 Columns) */}
        {isSalePage ? (
          <div className="flex gap-8 lg:gap-12 items-start">
            {/* Left Column: Permanent Sidebar on Desktop */}
            <aside className="hidden lg:block w-[240px] shrink-0 sticky top-24">
              {renderFilterContent()}
            </aside>

            {/* Right Column: Products & Toolbar */}
            <div className="flex-1 min-w-0">
              {/* Top info and toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ececec] pb-4 mb-6">
                <div className="space-y-3 sm:space-y-4">
                  {info.notice && (
                    <p className="text-[13.5px] sm:text-[14px] text-[#111111] font-serif font-normal">
                      {info.notice}
                    </p>
                  )}
                  <p className="text-[13.5px] sm:text-[14px] text-[#111111] font-serif font-normal">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "product" : "products"}
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="lg:hidden inline-flex items-center h-[42px] px-4 border border-[#d2d2d2] text-[14px] font-serif text-[#111111] bg-transparent transition-colors cursor-pointer"
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      role="presentation"
                      className="w-4 h-4 mr-2.5 text-[#111111] shrink-0"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M48 42h10m-10 0a5 5 0 1 1-5-5 5 5 0 0 1 5 5ZM7 42h31M16 22H6m10 0a5 5 0 1 1 5 5 5 5 0 0 1-5-5Zm41 0H26" />
                    </svg>
                    <span>Filter</span>
                  </button>

                  <div className="relative">
                    <select
                      id="sort-by-select-sale"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      aria-label="Sort products by"
                      className="appearance-none bg-white border border-[#d2d2d2] h-[42px] px-3.5 pr-8 text-[13px] font-serif text-[#111111] cursor-pointer focus:outline-none transition-colors"
                    >
                      <option value="featured">Featured</option>
                      <option value="best-selling">Best Selling</option>
                      <option value="title-ascending">Alphabetically, A-Z</option>
                      <option value="title-descending">Alphabetically, Z-A</option>
                      <option value="price-ascending">Price, low to high</option>
                      <option value="price-descending">Price, high to low</option>
                      <option value="created-descending">Date, new to old</option>
                      <option value="created-ascending">Date, old to new</option>
                    </select>
                    <svg
                      className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#555555]"
                      viewBox="0 0 28 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 4-column Product Grid */}
              {displayedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 sm:gap-x-4 gap-y-7 sm:gap-y-8">
                    {displayedProducts.map((product, index) => (
                      <ProductCard
                        key={product.handle || product.title}
                        product={product}
                        priority={index < 4}
                      />
                    ))}
                  </div>

                  {/* Numbered Pagination matching Image 5 */}
                  {totalPages > 1 && (
                    <div className="mt-14 mb-10 flex items-center justify-center gap-7 sm:gap-9 font-serif text-[15px] sm:text-[16px]">
                      {currentPage > 1 && (
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center hover:bg-[#333333] transition-colors cursor-pointer shrink-0"
                          aria-label="Previous page"
                        >
                          <svg
                            className="w-3.5 h-3.5 stroke-white fill-none stroke-[2.5]"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                      )}

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          const isActive = currentPage === page;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`font-serif text-[15px] sm:text-[16px] transition-colors select-none ${
                                isActive
                                  ? "text-[#a5a5a5] cursor-default font-normal"
                                  : "text-[#111111] hover:text-[#555555] cursor-pointer font-normal"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}

                      {currentPage < totalPages && (
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center hover:bg-[#333333] transition-colors cursor-pointer shrink-0"
                          aria-label="Next page"
                        >
                          <svg
                            className="w-3.5 h-3.5 stroke-white fill-none stroke-[2.5]"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-20 text-center">
                  <h3 className="text-[20px] font-serif text-[#111111] mb-2">
                    No products found
                  </h3>
                  <p className="text-[14px] text-[#666666] font-sans mb-6">
                    Try adjusting your filters to see available products.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STANDARD COLLECTION LAYOUT (Image 1 & Image 2: Full Width, 3 Columns Grid) */
          <div>
            {/* Top Toolbar: Filter Drawer Button on Left + Sort Dropdown on Right */}
            <div className="flex items-center justify-between mb-8">
              {/* Left: Filter Button with Sliders Icon */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="inline-flex items-center h-[42px] px-4 sm:px-5 border border-[#d2d2d2] bg-transparent text-[14px] font-serif text-[#111111] cursor-pointer select-none transition-colors"
                aria-label="Open filter drawer"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  role="presentation"
                  className="w-4 h-4 mr-2.5 text-[#111111] shrink-0"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M48 42h10m-10 0a5 5 0 1 1-5-5 5 5 0 0 1 5 5ZM7 42h31M16 22H6m10 0a5 5 0 1 1 5 5 5 5 0 0 1-5-5Zm41 0H26" />
                </svg>
                <span className="tracking-normal font-serif">Filter</span>
              </button>

              {/* Right: Sort Dropdown */}
              <div className="relative">
                <select
                  id="sort-by-select-standard"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort products by"
                  className="appearance-none bg-white border border-[#d2d2d2] h-[42px] px-3.5 pr-8 text-[13px] font-serif text-[#111111] cursor-pointer focus:outline-none transition-colors"
                >
                  <option value="featured">Most relevant</option>
                  <option value="best-selling">Best Selling</option>
                  <option value="title-ascending">Alphabetically, A-Z</option>
                  <option value="title-descending">Alphabetically, Z-A</option>
                  <option value="price-ascending">Price, low to high</option>
                  <option value="price-descending">Price, high to low</option>
                  <option value="created-descending">Date, new to old</option>
                  <option value="created-ascending">Date, old to new</option>
                </select>
                <svg
                  className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#555555]"
                  viewBox="0 0 28 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
                </svg>
              </div>
            </div>

            {/* 3-Column Product Grid (Matching Image 1 & Image 2) */}
            {displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-5 sm:gap-x-7 md:gap-x-8 gap-y-10 sm:gap-y-14">
                  {displayedProducts.map((product, index) => (
                    <ProductCard
                      key={product.handle || product.title}
                      product={product}
                      priority={index < 3}
                    />
                  ))}
                </div>

                {/* Numbered Pagination if needed */}
                {totalPages > 1 && (
                  <div className="mt-14 mb-10 flex items-center justify-center gap-7 sm:gap-9 font-serif text-[15px] sm:text-[16px]">
                    {currentPage > 1 && (
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center hover:bg-[#333333] transition-colors cursor-pointer shrink-0"
                        aria-label="Previous page"
                      >
                        <svg
                          className="w-3.5 h-3.5 stroke-white fill-none stroke-[2.5]"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        const isActive = currentPage === page;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`font-serif text-[15px] sm:text-[16px] transition-colors select-none ${
                              isActive
                                ? "text-[#a5a5a5] cursor-default font-normal"
                                : "text-[#111111] hover:text-[#555555] cursor-pointer font-normal"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                    {currentPage < totalPages && (
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center hover:bg-[#333333] transition-colors cursor-pointer shrink-0"
                        aria-label="Next page"
                      >
                        <svg
                          className="w-3.5 h-3.5 stroke-white fill-none stroke-[2.5]"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <h3 className="text-[20px] font-serif text-[#111111] mb-2">
                  No products found
                </h3>
                <p className="text-[14px] text-[#666666] font-sans mb-6">
                  Try adjusting your filters to see available products.
                </p>
              </div>
            )}

            {/* Bottom SEO Article Section (Image 2 style) */}
            {info.seoHtml && (
              <section className="mt-20 pt-12 border-t border-[#e8e8e8] max-w-[1240px] mx-auto">
                <div
                  className="collection-seo-article font-serif text-[#222222] prose max-w-none 
                             [&_h2]:text-[16px] [&_h2]:sm:text-[18px] [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-[0.04em] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[#111111] 
                             [&_h3]:text-[14px] [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[#111111]
                             [&_p]:text-[13px] [&_p]:sm:text-[13.5px] [&_p]:leading-[1.9] [&_p]:text-[#444444] [&_p]:mb-4 
                             [&_a]:text-[#111111] [&_a]:underline [&_a]:hover:text-[#555555]
                             [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:text-[13px] [&_li]:text-[#444444] [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: info.seoHtml }}
                />
              </section>
            )}
          </div>
        )}
      </div>

      {/* Slide-out Filter Drawer (Both Desktop & Mobile for Standard, Mobile for Sale) */}
      <div
        className={`fixed inset-0 z-50 font-serif transition-opacity duration-300 ease-in-out ${
          isFilterDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div
          onClick={() => setIsFilterDrawerOpen(false)}
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isFilterDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="fixed inset-y-0 left-0 max-w-full flex">
          <div
            className={`w-[340px] sm:w-[380px] max-w-[90vw] bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out ${
              isFilterDrawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Header matching Image 1, 2, 3 */}
            <div className="px-7 py-5 border-b border-[#eeeeee] flex items-center justify-between">
              <h2 className="text-[18px] sm:text-[20px] font-bold uppercase tracking-[0.05em] text-[#111111] font-serif">
                FILTER
              </h2>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 text-[#111111] hover:text-[#555555] transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  role="presentation"
                  className="w-4 h-4 text-[#111111]"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m19 17.61 27.12 27.13m0-27.12L19 44.74" />
                </svg>
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto px-7 py-4">
              {renderFilterContent()}
            </div>

            {/* Bottom View Results Button (Matching Image 4) */}
            <div className="p-4 border-t border-[#eeeeee] bg-white">
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full bg-[#000000] text-white py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#222222] transition-colors cursor-pointer text-center"
              >
                VIEW RESULTS ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
