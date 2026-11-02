"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../store/useStore";

interface CurrencyOption {
  code: string;
  name: string;
}

/* ---------- Round flag icons (inline SVG) ---------- */
const FlagWrap = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <svg viewBox="0 0 32 32" className="w-[22px] h-[22px] shrink-0 rounded-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id={id}>
        <circle cx="16" cy="16" r="16" />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id})`}>{children}</g>
  </svg>
);

const PkFlag = () => (
  <svg viewBox="0 0 32 32" className="w-[22px] h-[22px] shrink-0 rounded-full" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#3C9A4E" />
    <circle cx="16.5" cy="16" r="7.5" fill="#fff" />
    <circle cx="18.8" cy="16" r="6.2" fill="#3C9A4E" />
    <polygon
      points="20.5,11.5 21.8,13.8 24.2,14.3 22.4,16 22.9,18.4 20.8,17.2 18.6,18.4 19.1,16 17.3,14.3 19.7,13.8"
      fill="#fff"
    />
  </svg>
);

const UsFlag = () => (
  <FlagWrap id="flag-us">
    <rect width="32" height="32" fill="#fff" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} y={i * 4.6} width="32" height="2.3" fill="#E5484D" />
    ))}
    <rect width="16" height="17" fill="#3C5BA8" />
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <circle key={`${r}-${c}`} cx={3.5 + c * 4.5} cy={3.5 + r * 4.5} r="0.9" fill="#fff" />
      ))
    )}
  </FlagWrap>
);

const EuFlag = () => (
  <FlagWrap id="flag-eu">
    <rect width="32" height="32" fill="#3A5DB5" />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <circle
          key={i}
          cx={16 + Math.cos(a) * 9}
          cy={16 + Math.sin(a) * 9}
          r="1.3"
          fill="#F6C945"
        />
      );
    })}
  </FlagWrap>
);

const GbFlag = () => (
  <FlagWrap id="flag-gb">
    <rect width="32" height="32" fill="#3A5DB5" />
    <path d="M0 0L32 32M32 0L0 32" stroke="#fff" strokeWidth="5" />
    <path d="M0 0L32 32M32 0L0 32" stroke="#E5484D" strokeWidth="2" />
    <path d="M16 0V32M0 16H32" stroke="#fff" strokeWidth="9" />
    <path d="M16 0V32M0 16H32" stroke="#E5484D" strokeWidth="5" />
  </FlagWrap>
);

const CaFlag = () => (
  <FlagWrap id="flag-ca">
    <rect width="32" height="32" fill="#fff" />
    <rect width="8" height="32" fill="#E5484D" />
    <rect x="24" width="8" height="32" fill="#E5484D" />
    <path
      d="M16 7l1.6 3.2 2.4-.9-.8 4.6 2.6-1.9.4 1.5 2.3-.4-1 2.3 1.2.9-4.2 3.3.4 1.3-3.4-.4V25h-1v-3.1l-3.4.4.4-1.3-4.2-3.3 1.2-.9-1-2.3 2.3.4.4-1.5 2.6 1.9-.8-4.6 2.4.9z"
      fill="#E5484D"
    />
  </FlagWrap>
);

const flags: Record<string, React.ReactNode> = {
  PKR: <PkFlag />,
  USD: <UsFlag />,
  EUR: <EuFlag />,
  GBP: <GbFlag />,
  CAD: <CaFlag />,
};

/* Order exactly as in the reference dropdown */
const currencies: CurrencyOption[] = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "PKR", name: "Pakistani Rupee" },
];

/* Auto Location: guess the currency from the browser's region */
const EURO_REGIONS = [
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR",
  "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
];

function detectCurrency(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || "";
    const region = (locale.split("-")[1] || "").toUpperCase();
    if (region === "PK") return "PKR";
    if (region === "US") return "USD";
    if (region === "GB") return "GBP";
    if (region === "CA") return "CAD";
    if (EURO_REGIONS.includes(region)) return "EUR";
  } catch {
    /* ignore */
  }
  return "PKR";
}

export default function CurrencySwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentCurrency, setCurrency } = useStore();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = currencies.find((c) => c.code === currentCurrency) || currencies[4];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const rowClass =
    "w-full flex items-center gap-4 px-4 h-[52px] shrink-0 text-left text-[13px] text-[#111111] hover:bg-[#f7f7f7] transition-colors cursor-pointer border-b border-[#ececec]";

  return (
    <div ref={wrapperRef} className="fixed bottom-6 left-5 z-40 font-serif">
      <div className="relative">
        {/* Currency Dropdown (opens upward, scrollable) */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-[218px] bg-white rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.18)] overflow-hidden z-50">
            <div
              className="max-h-[285px] overflow-y-scroll [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d4d4d4] [&::-webkit-scrollbar-thumb]:rounded-full"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#d4d4d4 transparent" }}
            >
              {/* Auto Location */}
              <button
                onClick={() => {
                  setCurrency(detectCurrency());
                  setIsOpen(false);
                }}
                className={rowClass}
              >
                <PkFlag />
                <span>Auto Location</span>
              </button>

              {currencies.map((c, idx) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`${rowClass} ${idx === currencies.length - 1 ? "!border-b-0" : ""}`}
                >
                  {flags[c.code]}
                  <span>
                    {c.name} ({c.code})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggle Button (Matching Image: balanced width, rounded-8px, white glow shadow, rounded flag) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select currency"
          aria-expanded={isOpen}
          className="flex items-center gap-2 bg-white text-[#111111] px-2.5 h-[36px] rounded-[8px] transition-all text-[13px] cursor-pointer"
          style={{
            boxShadow: "0 0 28px 10px rgba(255, 255, 255, 0.95), 0 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          {flags[selected.code]}
          <span className="font-sans font-medium text-[13px] text-[#222222]">{selected.code}</span>
          <svg
            className={`w-3.5 h-3.5 text-[#777777] transition-transform ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}




