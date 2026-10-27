"use client";

import React from "react";
import Image from "next/image";
import siteData from "../site_data.json";

export default function CustomMediaSection() {
  const { video1, image, video2 } = siteData.videoCustom;

  return (
    <section className="w-full bg-black overflow-hidden" aria-label="Media Showcase">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full">
        {/* Left Video */}
        <div className="relative aspect-[9/16] md:aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={video1} type="video/mp4" />
          </video>
        </div>

        {/* Center Image */}
        <div className="relative aspect-[9/16] md:aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden bg-black">
          <Image
            src={image}
            alt="Sillhouete Haute Couture"
            fill
            sizes="33vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Right Video */}
        <div className="relative aspect-[9/16] md:aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={video2} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
