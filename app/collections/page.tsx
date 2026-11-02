import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileNavDrawer from "../components/MobileNavDrawer";
import CartDrawer from "../components/CartDrawer";
import SearchModal from "../components/SearchModal";
import CurrencySwitcher from "../components/CurrencySwitcher";
import WhatsAppButton from "../components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Collections – Sillhouete",
  description:
    "Explore our complete range of Pakistani bridal wear, luxury formals, festive pret, and accessories.",
};

const MAIN_COLLECTIONS = [
  {
    title: "Sale",
    href: "/collections/sale-1",
    image: "https://sillhouete.com/cdn/shop/files/wb-1.jpg?v=1777274033&width=1080",
    itemCount: "Special Markdowns",
  },
  {
    title: "New Arrivals",
    href: "/collections/new-arrivals",
    image: "https://sillhouete.com/cdn/shop/files/web-banner_jpg.jpg?v=1778078549&width=1080",
    itemCount: "Eid & Festive 2026",
  },
  {
    title: "Bridals",
    href: "/collections/bridal-dresses",
    image: "https://sillhouete.com/cdn/shop/files/1000x1500_0012_052A5865.jpg?v=1756903506&width=1080",
    itemCount: "Couture Editions",
  },
  {
    title: "Formal",
    href: "/collections/formal-dresses",
    image: "https://sillhouete.com/cdn/shop/files/webimages_0085_DSC06881.jpg?v=1767272677&width=1080",
    itemCount: "Luxury Formals",
  },
  {
    title: "Luxury Pret",
    href: "/collections/luxury-pret",
    image: "https://sillhouete.com/cdn/shop/files/wb-3_bd931670-6ab7-4d15-ad52-a5ee3d462be7.jpg?v=1777274033&width=1080",
    itemCount: "Ready to Wear",
  },
  {
    title: "Silk Solids'26",
    href: "/collections/silk-solids26",
    image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-meraki-light-grey-sequins.jpg?v=1769691351",
    itemCount: "Pure Raw Silks",
  },
  {
    title: "Raha Eid Pret'26",
    href: "/collections/raha-eid-pret26",
    image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-ayzel-ivory-delicate-embroidery.jpg?v=1768978410",
    itemCount: "Festive Pret",
  },
  {
    title: "Shop By Events",
    href: "/collections/shop-by-events",
    image: "https://sillhouete.com/cdn/shop/files/5_e07033cd-99f1-4016-8c06-d710e27a5b60.png?v=1771918660&width=1080",
    itemCount: "Engagement to Walima",
  },
  {
    title: "Best Sellers",
    href: "/collections/best-sellers",
    image: "https://sillhouete.com/cdn/shop/files/IMG_4249_JPG.jpg?v=1776413159&width=1080",
    itemCount: "Most Loved Pieces",
  },
];

export default function CollectionsIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-serif">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-[28px] sm:text-[36px] font-semibold uppercase tracking-[0.05em] text-[#111111]">
              Collections
            </h1>
            <p className="mt-3 text-[14px] sm:text-[15px] text-[#666666]">
              Browse all designer Pakistani collections from Sillhouete
            </p>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {MAIN_COLLECTIONS.map((col) => (
              <Link
                key={col.title}
                href={col.href}
                className="reveal-on-scroll group block relative overflow-hidden bg-[#f9f9f9]"
              >
                <div className="relative pb-[125%] overflow-hidden">
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/75" />
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <h2 className="text-[20px] sm:text-[22px] font-medium tracking-[0.05em] uppercase">
                      {col.title}
                    </h2>
                    <p className="mt-1 text-[12px] font-sans-custom uppercase tracking-[0.15em] text-[#f0f0f0]">
                      {col.itemCount}
                    </p>
                    <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.2em] border-b border-white pb-0.5">
                      Explore Collection →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <MobileNavDrawer />
      <CartDrawer />
      <SearchModal />
      <CurrencySwitcher />
      <WhatsAppButton />
    </div>
  );
}

