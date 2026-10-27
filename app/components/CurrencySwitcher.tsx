"use client";

import React, { useState } from "react";
import { useStore } from "../store/useStore";

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const currencies: CurrencyOption[] = [
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs.", flag: "🇵🇰" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", flag: "🇨🇦" },
];

export default function CurrencySwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentCurrency, setCurrency } = useStore();

  const selected = currencies.find((c) => c.code === currentCurrency) || currencies[0];

  return (
    <div className="fixed bottom-6 left-6 z-40 font-sans-custom">
      <div className="relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select currency"
          className="flex items-center gap-2 bg-white text-[#111111] px-3.5 py-2 rounded-full border border-[#e8e8e1] shadow-md hover:shadow-lg transition-all text-[12px] font-medium cursor-pointer"
        >
          <span className="text-[14px]">{selected.flag}</span>
          <span className="font-semibold">{selected.code}</span>
          <span className="text-[#888888]">({selected.symbol})</span>
          <svg
            className={`w-3 h-3 text-[#555] transition-transform ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Currency Dropdown */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-52 bg-white border border-[#e8e8e1] rounded-lg shadow-xl overflow-hidden py-1 z-50">
            <div className="px-3 py-1.5 border-b border-[#f0f0f0] text-[10px] uppercase font-bold tracking-wider text-[#888888]">
              Select Currency
            </div>
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-[12px] flex items-center justify-between hover:bg-[#f7f7f7] transition-colors cursor-pointer ${
                  c.code === currentCurrency ? "bg-[#f2f2f2] font-semibold text-black" : "text-[#444444]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">{c.flag}</span>
                  <span>{c.code}</span>
                </div>
                <span className="text-[#777] text-[11px]">{c.symbol}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
