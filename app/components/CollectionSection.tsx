"use client";

import  "react";
import Image from "next/image";
import Link from "next/link";
import { useStore, formatPrice } from "../store/useStore";

export interface Product {
  handle: string;
  title: string;
  link: string;
  currentPrice: string;
  comparePrice?: string | null;
  isNew?: boolean;
  isSoldOut?: boolean;
  primaryImage: string;
  secondaryImage: string;
}

interface CollectionSectionProps {
  id: string;
  title: string;
  link: string;
  products: Product[];
}

export default function CollectionSection({
  title,
  link,
  products,
}: CollectionSectionProps) {
  const { addToCart, currentCurrency } = useStore();

  return (
    <section className="py-12 sm:py-16 border-b border-[#f2f2f2]">
      <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-[25px] font-semibold uppercase tracking-[0.05em] font-serif text-[#111111] leading-none">
            {title}
          </h2>
        </div>

        {/* Product Grid: 4 columns desktop, 2 columns mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-[17px]">
          {products.map((product) => (
            <div
              key={product.handle || product.title}
              className="product-card group flex flex-col"
            >
              {/* Image Container with 2:3 ratio */}
              <div className="relative w-full overflow-hidden bg-[#f9f9f9] pb-[150%]">
                {/* Product Badge */}
                {product.isNew && (
                  <span className="product-badge-new">New</span>
                )}

                {/* Primary Image */}
                <Image
                  src={product.primaryImage}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="product-primary-image object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
                />

                {/* Secondary Hover Image */}
                {product.secondaryImage && product.secondaryImage !== product.primaryImage && (
                  <Image
                    src={product.secondaryImage}
                    alt={`${product.title} alternative`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="product-secondary-image object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
                  />
                )}

                {/* Quick Add Overlay on Hover */}
                <div className="absolute inset-x-0 bottom-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({
                        id: product.handle,
                        title: product.title,
                        price: product.currentPrice,
                        image: product.primaryImage,
                      });
                    }}
                    className="w-full bg-[#111111] text-white hover:bg-[#333333] py-[10px] text-[11px] font-extrabold uppercase tracking-[.3em] font-sans-custom transition-colors cursor-pointer"
                  >
                    Quick Add
                  </button>
                </div>
              </div>

              {/* Product Meta */}
              <div className="pt-3 pb-2 text-center flex-1 flex flex-col justify-between">
                <Link
                  href={product.link || `/products/${product.handle}`}
                  className="block text-[15px] font-normal tracking-[0.025em] font-serif text-[#111111] hover:text-[#555555] transition-colors leading-[1.4] line-clamp-1"
                >
                  {product.title}
                </Link>

                <div className="mt-1 flex items-center justify-center space-x-2 text-[15px] text-[#1c1d1d] font-serif">
                  {product.comparePrice && (
                    <span className="text-[#888888] line-through text-[12px]">
                      {formatPrice(product.comparePrice, currentCurrency)}
                    </span>
                  )}
                  <span className={product.comparePrice ? "text-[#c20000] font-medium" : ""}>
                    {formatPrice(product.currentPrice, currentCurrency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <Link href={link || "#"} className="btn-secondary">
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
