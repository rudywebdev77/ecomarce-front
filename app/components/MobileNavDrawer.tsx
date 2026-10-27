"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import siteData from "../site_data.json";
import { useStore } from "../store/useStore";

export default function MobileNavDrawer() {
  const { isMobileNavOpen, closeMobileNav, openSearch } = useStore();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  if (!isMobileNavOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-serif" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={closeMobileNav}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[#e8e8e1] flex items-center justify-between">
            <Link href="/" onClick={closeMobileNav} className="inline-block">
              <img
                src={siteData.storeInfo.logo}
                alt={siteData.storeInfo.name}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button
              onClick={closeMobileNav}
              aria-label="Close navigation"
              className="p-1 text-[#444444] hover:text-black transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="p-4 border-b border-[#f0f0f0]">
            <button
              onClick={() => {
                closeMobileNav();
                openSearch();
              }}
              className="w-full flex items-center justify-between bg-[#f7f7f7] px-3.5 py-2.5 text-[13px] text-[#777777] font-sans-custom hover:bg-[#efefef] transition-colors"
            >
              <span>Search products...</span>
              <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {/* Nav List */}
          <div className="flex-1 overflow-y-auto py-2">
            <ul className="divide-y divide-[#f5f5f5]">
              {siteData.navigation.map((item) => {
                const isExpanded = !!expandedItems[item.text];
                return (
                  <li key={item.text} className="px-4 py-2">
                    {item.isDropdown && item.subItems ? (
                      <div>
                        <div
                          onClick={() => toggleExpand(item.text)}
                          className="flex items-center justify-between py-1 cursor-pointer select-none"
                        >
                          <span className={`text-[15px] font-medium tracking-[0.03em] ${
                            item.isSale ? "sale-blink font-semibold" : "text-[#111111]"
                          }`}>
                            {item.text}
                          </span>
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            viewBox="0 0 28 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
                          </svg>
                        </div>

                        {/* Accordion Sub-menu */}
                        {isExpanded && (
                          <ul className="pl-4 pt-2 pb-1 space-y-2 border-l border-[#e8e8e1] ml-1 mt-1">
                            {item.subItems.map((sub) => (
                              <li key={sub.text}>
                                <Link
                                  href={sub.href}
                                  onClick={closeMobileNav}
                                  className="block py-1 text-[13px] text-[#555555] hover:text-black transition-colors"
                                >
                                  {sub.text}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={closeMobileNav}
                        className={`block py-1 text-[15px] font-medium tracking-[0.03em] ${
                          item.isSale ? "sale-blink font-semibold" : "text-[#111111] hover:text-black"
                        }`}
                      >
                        {item.text}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Bottom account / contact */}
          <div className="p-4 border-t border-[#e8e8e1] bg-[#fafafa] space-y-3">
            <Link
              href="/account"
              onClick={closeMobileNav}
              className="flex items-center gap-2 text-[14px] text-[#333333] hover:text-black"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 64 64">
                <path d="M35 39.84v-2.53c3.3-1.91 6-6.66 6-11.41 0-7.63 0-13.82-9-13.82s-9 6.19-9 13.82c0 4.75 2.7 9.51 6 11.41v2.53c-10.18.85-18 6-18 12.16h42c0-6.19-7.82-11.31-18-12.16Z" />
              </svg>
              <span>Account Log in</span>
            </Link>
            <p className="text-[12px] text-[#777777] font-sans-custom">
              WhatsApp Support: +92 331 0397865
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
