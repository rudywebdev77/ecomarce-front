"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import siteData from "../site_data.json";
import { useStore } from "../store/useStore";

interface SubItem {
  text: string;
  href: string;
  isRed?: boolean;
  isSale?: boolean;
}

export default function MobileNavDrawer() {
  const { isMobileNavOpen, closeMobileNav } = useStore();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  // Lock body scroll and handle Escape key when mobile nav is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeMobileNav();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileNavOpen, closeMobileNav]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden font-serif transition-opacity duration-300 ease-in-out ${
        isMobileNavOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        onClick={closeMobileNav}
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isMobileNavOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Slide-out Drawer from Right to Left (matching sillhouete.com drawer--right) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div
          className={`w-[320px] sm:w-[360px] max-w-[85vw] bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out ${
            isMobileNavOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* 1. Header (Image 2: Only 'X' button on top-right with divider line) */}
          <div className="px-6 py-4 flex items-center justify-end border-b border-[#e8e8e1]">
            <button
              type="button"
              onClick={closeMobileNav}
              aria-label="Close navigation"
              className="p-1 text-[#111111] hover:text-[#555555] transition-colors cursor-pointer"
            >
              <svg
                aria-hidden="true"
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

          {/* 2. Scrollable Navigation Menu (Image 2 & 3) */}
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-[#e8e8e1]">
              {siteData.navigation.map((item) => {
                const isExpanded = !!expandedItems[item.text];
                const hasSub = item.isDropdown && item.subItems && item.subItems.length > 0;

                return (
                  <li key={item.text} className="border-b border-[#e8e8e1]">
                    {hasSub ? (
                      <div>
                        {/* Row with Text on Left, Vertical Divider '|' and Chevron button on Right */}
                        <div className="flex items-stretch justify-between">
                          <Link
                            href={item.href}
                            onClick={closeMobileNav}
                            className={`flex-1 px-6 py-3.5 text-[13px] sm:text-[13.5px] font-serif uppercase tracking-[0.06em] leading-normal transition-colors ${
                              item.isSale
                                ? "text-[#ff0000]"
                                : "text-[#111111] hover:text-[#555555]"
                            }`}
                          >
                            {item.text}
                          </Link>

                          {/* Vertical separator line '|' + toggle button */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.text)}
                            aria-label={`Toggle ${item.text}`}
                            className="w-[48px] shrink-0 border-l border-[#e8e8e1] flex items-center justify-center text-[#111111] hover:bg-[#fafafa] transition-colors cursor-pointer"
                          >
                            <svg
                              className={`w-3 h-3 text-[#111111] transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              viewBox="0 0 28 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
                            </svg>
                          </button>
                        </div>

                        {/* Collapsible Sublist */}
                        {isExpanded && item.subItems && (
                          <div className="bg-[#fafafa] border-t border-[#e8e8e1]">
                            <ul className="divide-y divide-[#eeeeee]">
                              {(item.subItems as SubItem[]).map((sub) => (
                                <li key={sub.text}>
                                  <Link
                                    href={sub.href}
                                    onClick={closeMobileNav}
                                    className={`block px-8 py-3 text-[13px] font-serif tracking-[0.02em] transition-colors ${
                                      sub.isRed || sub.isSale
                                        ? "text-[#ff0000]"
                                        : "text-[#333333] hover:text-black"
                                    }`}
                                  >
                                    {sub.text}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Simple Item without Dropdown */
                      <Link
                        href={item.href}
                        onClick={closeMobileNav}
                        className={`block px-6 py-3.5 text-[13px] sm:text-[13.5px] font-serif uppercase tracking-[0.06em] leading-normal transition-colors ${
                          item.isSale
                            ? "text-[#ff0000]"
                            : "text-[#111111] hover:text-[#555555]"
                        }`}
                      >
                        {item.text}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* 3. Bottom 'Log in' Link (Image 3) */}
            <div className="px-6 pt-6 pb-2">
              <Link
                href="/account"
                onClick={closeMobileNav}
                className="text-[13.5px] font-serif text-[#111111] hover:underline block"
              >
                Log in
              </Link>
            </div>

            {/* 4. Social Icons 3x2 Outlined Grid (Image 3) */}
            <div className="px-6 pt-2 pb-8">
              <div className="border border-[#e8e8e1] grid grid-cols-3">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/sillhouete.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="border-r border-b border-[#e8e8e1] py-3.5 flex items-center justify-center text-[#111111] hover:opacity-70 transition-opacity"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 32 32">
                    <path d="M16 3.094c4.206 0 4.7.019 6.363.094 1.538.069 2.369.325 2.925.544.738.287 1.262.625 1.813 1.175s.894 1.075 1.175 1.813c.212.556.475 1.387.544 2.925.075 1.662.094 2.156.094 6.363s-.019 4.7-.094 6.363c-.069 1.538-.325 2.369-.544 2.925-.288.738-.625 1.262-1.175 1.813s-1.075.894-1.813 1.175c-.556.212-1.387.475-2.925.544-1.663.075-2.156.094-6.363.094s-4.7-.019-6.363-.094c-1.537-.069-2.369-.325-2.925-.544-.737-.288-1.263-.625-1.813-1.175s-.894-1.075-1.175-1.813c-.212-.556-.475-1.387-.544-2.925-.075-1.663-.094-2.156-.094-6.363s.019-4.7.094-6.363c.069-1.537.325-2.369.544-2.925.287-.737.625-1.263 1.175-1.813s1.075-.894 1.813-1.175c.556-.212 1.388-.475 2.925-.544 1.662-.081 2.156-.094 6.363-.094zm0-2.838c-4.275 0-4.813.019-6.494.094-1.675.075-2.819.344-3.819.731-1.037.4-1.913.944-2.788 1.819S1.486 4.656 1.08 5.688c-.387 1-.656 2.144-.731 3.825-.075 1.675-.094 2.213-.094 6.488s.019 4.813.094 6.494c.075 1.675.344 2.819.731 3.825.4 1.038.944 1.913 1.819 2.788s1.756 1.413 2.788 1.819c1 .387 2.144.656 3.825.731s2.213.094 6.494.094 4.813-.019 6.494-.094c1.675-.075 2.819-.344 3.825-.731 1.038-.4 1.913-.944 2.788-1.819s1.413-1.756 1.819-2.788c.387-1 .656-2.144.731-3.825s.094-2.212.094-6.494-.019-4.813-.094-6.494c-.075-1.675-.344-2.819-.731-3.825-.4-1.038-.944-1.913-1.819-2.788s-1.756-1.413-2.788-1.819c-1-.387-2.144-.656-3.825-.731C20.812.275 20.275.256 16 .256z" />
                    <path d="M16 7.912a8.088 8.088 0 0 0 0 16.175c4.463 0 8.087-3.625 8.087-8.088s-3.625-8.088-8.088-8.088zm0 13.338a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 1 1 0 10.5zM26.294 7.594a1.887 1.887 0 1 1-3.774.002 1.887 1.887 0 0 1 3.774-.003z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/171Gb4SL8y/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="border-r border-b border-[#e8e8e1] py-3.5 flex items-center justify-center text-[#111111] hover:opacity-70 transition-opacity"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.46 11.82 5 14.5 5c1.28 0 2.38.1 2.7.14v3.13h-1.85c-1.48 0-1.77.7-1.77 1.73V12h3.46l-.45 3h-3.01v6.8c4.56-.93 8-4.96 8-9.8z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@sillhouete.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="border-b border-[#e8e8e1] py-3.5 flex items-center justify-center text-[#111111] hover:opacity-70 transition-opacity"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Pinterest */}
                <a
                  href="https://www.pinterest.com/sillhoueteofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="border-r border-[#e8e8e1] py-3.5 flex items-center justify-center text-[#111111] hover:opacity-70 transition-opacity"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.365-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-.998 2.352-1.488 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.372 12-12 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@sillhoueteofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="border-r border-[#e8e8e1] py-3.5 flex items-center justify-center text-[#111111] hover:opacity-70 transition-opacity"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>

                {/* 6th Empty Box */}
                <div className="py-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
