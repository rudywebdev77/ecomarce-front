"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import siteData from "../site_data.json";
import { useStore } from "../store/useStore";

type SubItem = { text: string; href: string; isSale?: boolean };

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { cart, openCart, openSearch, openMobileNav } = useStore();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className=" bg-white border-b border-[#e8e8e1]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6">
        <div className="flex items-center justify-between min-h-[72px] xl:min-h-[92px] py-2 gap-3">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="inline-block relative">
              <Image
                src={siteData.storeInfo.logo}
                alt={siteData.storeInfo.name}
                width={220}
                height={44}
                className="h-[40px] sm:h-[44px] lg:h-[48px] w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Links (centered, uppercase, natural wrapping) */}
          <nav className="hidden xl:flex flex-1 flex-wrap items-center justify-center gap-x-[25px] gap-y-[2px] font-serif uppercase text-[14px] tracking-[0.01em] px-0">
            {siteData.navigation.map((item) => {
              const isActive = activeDropdown === item.text;
              return (
                <div
                  key={item.text}
                  className="relative py-[8px]"
                  onMouseEnter={() => item.isDropdown && setActiveDropdown(item.text)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`relative inline-flex items-center gap-[8px] whitespace-nowrap leading-none transition-colors ${
                      item.isSale
                        ? "sale-blink font-normal text-[#ff0000]"
                        : "text-[#000000]"
                    }`}
                  >
                    <span>{item.text}</span>
                    {item.isDropdown && (
                      <svg
                        className="w-[10px] h-[10px] flex-shrink-0"
                        viewBox="0 0 28 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
                      </svg>
                    )}
                    {/* Black underline on hover/active */}
                    <span
                      className={`absolute left-0 right-0 -bottom-[8px] h-[2px] bg-black origin-left transition-transform duration-200 ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>

                  {/* Dropdown Menu */}
                  {item.isDropdown && item.subItems && (
                    <div
                      className={`absolute top-full left-0 min-w-[215px] bg-white border border-[#ececec] shadow-[0_6px_18px_rgba(0,0,0,0.12)] pt-[10px] pb-[14px] px-[18px] transition-all duration-200 z-50 normal-case ${
                        isActive
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-1 pointer-events-none"
                      }`}
                    >
                      <ul className="flex flex-col">
                        {(item.subItems as SubItem[]).map((sub) => (
                          <li key={sub.text}>
                            <Link
                              href={sub.href}
                              className={`block whitespace-nowrap py-[10px] text-[15px] tracking-normal font-serif transition-opacity hover:opacity-70 ${
                                sub.isSale ? "text-[#ff0000]" : "text-[#000000]"
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
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex-shrink-0 flex items-center space-x-3 sm:space-x-5">
            {/* Account Icon */}
            <Link
              href="/account"
              aria-label="Account Login"
              className="hidden sm:inline-flex p-1 text-[#111111] hover:text-[#666666] transition-colors"
            >
              <svg
                aria-hidden="true"
                className="w-[26px] h-[26px] fill-none stroke-current stroke-[2.5]"
                viewBox="0 0 64 64"
              >
                <circle cx="32" cy="20" r="11" />
                <path d="M10 56c0-12 9.8-20 22-20s22 8 22 20" />
              </svg>
            </Link>

            {/* Search Icon */}
            <button
              onClick={openSearch}
              aria-label="Search"
              className="p-1 text-[#111111] hover:text-[#666666] transition-colors cursor-pointer"
            >
              <svg
                aria-hidden="true"
                className="w-[26px] h-[26px] stroke-current fill-none stroke-[3]"
                viewBox="0 0 64 64"
              >
                <path d="M47.16 28.58A18.58 18.58 0 1 1 28.58 10a18.58 18.58 0 0 1 18.58 18.58ZM54 54 41.94 42" />
              </svg>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={openMobileNav}
              aria-label="Navigation Menu"
              className="xl:hidden p-1 text-[#111111] hover:text-[#666666] transition-colors cursor-pointer"
            >
              <svg
                aria-hidden="true"
                className="w-[26px] h-[26px] stroke-current stroke-[3] fill-none"
                viewBox="0 0 64 64"
              >
                <path d="M7 15h51M7 32h43M7 49h51" />
              </svg>
            </button>

            {/* Cart Icon */}
            <button
              onClick={openCart}
              aria-label="Shopping Cart"
              className="p-1 text-[#111111] hover:text-[#666666] transition-colors relative cursor-pointer flex items-center"
            >
              <svg
                aria-hidden="true"
                className="w-[26px] h-[26px] fill-none stroke-current stroke-[3]"
                viewBox="0 0 64 64"
              >
                <rect x="11.375" y="17.863" width="41.25" height="36.75" />
                <path d="M22.25 18c0-7.105 4.35-9 9.75-9s9.75 1.895 9.75 9" />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}