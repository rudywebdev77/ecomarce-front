"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import siteData from "../site_data.json";

export default function ShopByEventSection() {
  const events = siteData.shopByEvent;

  return (
    <section className="py-14 sm:py-20 border-b border-[#f2f2f2]">
      <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-[25px] font-semibold uppercase tracking-[0.05em] font-serif text-[#111111] leading-none">
            SHOP BY EVENT
          </h2>
        </div>

        {/* 5 Columns Grid on Desktop, 2 on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-[17px]">
          {events.map((event) => (
            <Link
              key={event.title}
              href={event.link}
              className="group relative block overflow-hidden"
            >
              {/* Image with 2:3 ratio */}
              <div className="relative w-full pb-[150%] overflow-hidden bg-[#f4f4f4]">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Overlaid Title Box matching Sillhouete Impulse theme */}
                <div className="absolute inset-x-4 bottom-4 z-10 text-center">
                  <div className="inline-block bg-white/95 backdrop-blur-xs px-4 py-2 border border-black/10 shadow-xs group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <span className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.1em] font-serif block">
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
