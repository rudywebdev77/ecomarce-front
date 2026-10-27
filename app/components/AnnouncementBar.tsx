"use client";

import React, { useEffect, useRef, useState } from "react";
import siteData from "../site_data.json";
import { useSlideTick, mod } from "../store/useSlideSync";

// Timer hero slider ke saath SHARED hai (store/useSlideSync.ts), isliye
// text aur hero image hamesha ek hi waqt par slide hote hain.
//  - Purana text jaldi (~0.1s) left ki taraf nikal jata hai
//  - Naya text right se aa kar ~0.45s mein beech mein ruk jata hai
const IN_MS = 450;
const OUT_MS = 100;

export default function AnnouncementBar() {
  const messages = siteData.announcements;
  const total = messages.length;
  const tick = useSlideTick();
  const current = mod(tick, total);

  const [prev, setPrev] = useState<number | null>(null);
  const lastIndexRef = useRef(current);
  const clearPrevRef = useRef<NodeJS.Timeout | null>(null);
  const hasChanged = tick !== 0;

  useEffect(() => {
    if (lastIndexRef.current === current) return;
    setPrev(lastIndexRef.current);
    lastIndexRef.current = current;
    if (clearPrevRef.current) clearTimeout(clearPrevRef.current);
    clearPrevRef.current = setTimeout(() => setPrev(null), OUT_MS + 20);
  }, [current]);

  useEffect(() => {
    return () => {
      if (clearPrevRef.current) clearTimeout(clearPrevRef.current);
    };
  }, []);

  const textClass =
    "absolute inset-0 text-center whitespace-nowrap font-serif font-bold uppercase text-[11px] sm:text-[12px] tracking-[0.2em] leading-[16px]";

  return (
    <div className="bg-[#0f0f0f] text-white py-[11px] px-4">
      <style>{`
        @keyframes announceIn {
          from { transform: translateX(45%); }
          to   { transform: translateX(0); }
        }
        @keyframes announceOut {
          from { transform: translateX(0); opacity: 1; }
          to   { transform: translateX(-60%); opacity: 0; }
        }
      `}</style>
      <div className="max-w-[1440px] mx-auto relative h-[16px] overflow-hidden">
        {prev !== null && (
          <p
            key={`out-${prev}`}
            className={textClass}
            style={{ animation: `announceOut ${OUT_MS}ms ease-in both` }}
          >
            {messages[prev]}
          </p>
        )}
        <p
          key={`in-${current}`}
          className={textClass}
          style={
            hasChanged
              ? {
                  animation: `announceIn ${IN_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) both`,
                }
              : undefined
          }
        >
          {messages[current]}
        </p>
      </div>
    </div>
  );
}