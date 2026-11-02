"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import siteData from "../site_data.json";

export default function ShopByEventSection() {
  const events = siteData.shopByEvent;

  return (
    <section className="py-12 sm:py-16 md:py-20 border-b border-[#f2f2f2]">
      <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-[20px] sm:text-[23px] lg:text-[25px] font-semibold uppercase tracking-[0.05em] font-serif text-[#111111] leading-none">
            SHOP BY EVENT
          </h2>
        </div>

        {/* 5 Columns Grid on Desktop, 2 on Mobile with 5th centered (matches screenshot) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-[17px]">
          {events.map((event, index) => (
            <Link
              key={event.title}
              href={event.link}
              className={`event-card group relative block overflow-hidden ${
                index === 4
                  ? "col-span-2 max-w-[calc(50%-6px)] mx-auto w-full lg:col-span-1 lg:max-w-none"
                  : ""
              }`}
            >
              {/* Image with 2:3 ratio */}
              <div className="relative w-full pb-[150%] overflow-hidden bg-black">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Soft black dimming overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 pointer-events-none z-[1]" />

                {/* Overlaid Title Box - White pill with black uppercase text */}
                <div className="absolute inset-x-2 sm:inset-x-4 bottom-3 sm:bottom-4 z-10 text-center">
                  <div className="inline-block bg-white px-3 sm:px-4 py-1.5 sm:py-2 border border-black/10 shadow-xs">
                    <span className="text-[11px] sm:text-[13px] font-semibold uppercase tracking-[0.1em] font-serif text-[#111111] block">
                      {event.title}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
