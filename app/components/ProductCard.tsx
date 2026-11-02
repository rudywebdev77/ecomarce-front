"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore, formatPrice } from "../store/useStore";

export interface Product {
  handle: string;
  title: string;
  link?: string;
  currentPrice: string;
  comparePrice?: string | null;
  isNew?: boolean;
  isSale?: boolean;
  isSoldOut?: boolean;
  primaryImage: string;
  secondaryImage?: string;
  extraImages?: string[];
  productType?: string;
  createdAt?: string;
  color?: string;
  size?: string;
  dressStyle?: string;
}

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { currentCurrency } = useStore();

  const hasComparePrice =
    product.comparePrice &&
    product.comparePrice !== product.currentPrice &&
    product.comparePrice !== "Rs.0";

  const hasSecondary = Boolean(
    product.secondaryImage &&
      product.secondaryImage.trim() !== "" &&
      product.secondaryImage !== product.primaryImage
  );

  return (
    <div className="product-card group flex flex-col" suppressHydrationWarning>
      {/* Image Container with 2:3 aspect ratio wrapped in product link */}
      <Link
        href={product.link || `/products/${product.handle}`}
        className="block relative w-full overflow-hidden bg-[#f5f5f5] pb-[150%] cursor-pointer"
      >
        {/* Product Badges */}
        {product.isNew && <span className="product-badge-new">New</span>}
        {(product.isSale || hasComparePrice) && (
          <span className="absolute top-2 left-2 bg-[#111111] text-white text-[11px] font-normal tracking-wide px-2 py-0.5 z-[3]">
            Sale
          </span>
        )}
        {product.isSoldOut && (
          <span className="absolute top-2 right-2 bg-[#111111] text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 z-[3]">
            Sold Out
          </span>
        )}

        {/* Primary Image - stays solid, fades only if secondary image exists */}
        {product.primaryImage && (
          <Image
            src={product.primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={`product-primary-image object-cover object-center z-[1] transition-opacity duration-300 ease-in-out ${
              hasSecondary ? "group-hover:opacity-0" : ""
            }`}
            style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
          />
        )}

        {/* Secondary Image - smoothly fades in on hover */}
        {hasSecondary && (
          <Image
            src={product.secondaryImage!}
            alt={`${product.title} alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-secondary-image object-cover object-center z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none"
            style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
          />
        )}
      </Link>

      {/* Product Meta */}
      <div className="pt-3 pb-2 text-center flex-1 flex flex-col justify-between">
        <Link
          href={product.link || `/products/${product.handle}`}
          className="block text-[13px] sm:text-[14px] font-normal tracking-[0.04em] font-serif uppercase text-[#111111] hover:text-[#555555] transition-colors leading-[1.4] line-clamp-1"
        >
          {product.title}
        </Link>

        <div className="mt-1 flex items-center justify-center space-x-2 text-[15px] text-[#1c1d1d] font-serif">
          {hasComparePrice && (
            <span className="text-[#888888] line-through text-[12px]">
              {formatPrice(product.comparePrice!, currentCurrency)}
            </span>
          )}
          <span className={hasComparePrice ? "text-[#c20000] font-medium" : ""}>
            {formatPrice(product.currentPrice, currentCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
}
