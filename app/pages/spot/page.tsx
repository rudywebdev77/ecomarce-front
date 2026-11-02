import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MobileNavDrawer from "../../components/MobileNavDrawer";
import CartDrawer from "../../components/CartDrawer";
import SearchModal from "../../components/SearchModal";
import CurrencySwitcher from "../../components/CurrencySwitcher";
import WhatsAppButton from "../../components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Spotted – Sillhouete",
  description:
    "See renowned celebrities and prominent influencers styled in authentic Sillhouete couture.",
};

interface SpottedItem {
  id: string;
  celebrity: string;
  image: string;
  link: string;
}

const SPOTTED_ITEMS: SpottedItem[] = [
  {
    id: "rida-khawar",
    celebrity: "RIDA KHAWAR",
    image:
      "https://sillhouete.com/cdn/shop/files/Untitled-1_0012_IMG-20251015-WA0040.jpg?v=1760528497&width=600",
    link: "/products/nargis-rb-06",
  },
  {
    id: "momina-iqbal",
    celebrity: "MOMINA IQBAL",
    image:
      "https://sillhouete.com/cdn/shop/files/Don_t_lose_that_sparkle_that_makes_you___Styling__daniiyah05__Makeup__haseebkhan_4540__Dress__sillhouete.official__Jewellery__ayeshaccessories__7_46f0fbb8-adaf-47f6-91e3-b9cee95ef639.jpg?v=1758789708&width=600",
    link: "/products/orange",
  },
  {
    id: "hina-niazi",
    celebrity: "HINA NIAZI",
    image:
      "https://sillhouete.com/cdn/shop/files/WhatsApp_Image_2025-04-22_at_15.16.00_d01f29aa.webp?v=1758789816&width=600",
    link: "/products/slx-5",
  },
  {
    id: "abeera-riaz",
    celebrity: "ABEERA RIAZ",
    image:
      "https://sillhouete.com/cdn/shop/files/web_images_0000_2.jpg?v=1758812672&width=600",
    link: "/products/grey",
  },
  {
    id: "sophia-ch-1",
    celebrity: "SOPHIA CH",
    image:
      "https://sillhouete.com/cdn/shop/files/1_af93ee57-224a-4ebb-af63-11eaaa371e90.jpg?v=1759820897&width=600",
    link: "/products/slx-5",
  },
  {
    id: "sophia-ch-2",
    celebrity: "SOPHIA CH",
    image:
      "https://sillhouete.com/cdn/shop/files/WhatsApp_Image_2025-03-24_at_10.55.48_9d6827e0.webp?v=1758789837&width=600",
    link: "/products/orange",
  },
  {
    id: "fiza-ali-1",
    celebrity: "FIZA ALI",
    image:
      "https://sillhouete.com/cdn/shop/files/IMG_5194.webp?v=1758789837&width=600",
    link: "/products/noor-jahan-d-8",
  },
  {
    id: "fiza-ali-2",
    celebrity: "FIZA ALI",
    image:
      "https://sillhouete.com/cdn/shop/files/WhatsApp_Image_2025-03-14_at_14.09.28_7eb91c72.webp?v=1758789817&width=600",
    link: "/products/jacket-1-sj-3",
  },
];

export default function SpottedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-serif">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Header */}
      <Header />

      {/* 3. Main Content matching https://sillhouete.com/pages/spot */}
      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <h1 className="text-[26px] sm:text-[32px] font-serif font-bold uppercase tracking-[0.15em] text-center text-[#111111] mb-8 sm:mb-12">
            SPOTTED
          </h1>

          {/* 4-Column Responsive Grid matching sillhouete.com */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {SPOTTED_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center group"
              >
                {/* Image Link */}
                <Link
                  href={item.link}
                  className="block relative w-full pb-[135%] overflow-hidden bg-[#f4f4f4]"
                >
                  <Image
                    src={item.image}
                    alt={item.celebrity}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 350px"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Content: Celebrity Name & Shop Now Button */}
                <div className="mt-4 text-center flex flex-col items-center">
                  <h3 className="font-serif text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.16em] text-[#111111] mb-2.5 text-center">
                    {item.celebrity}
                  </h3>
                  <Link
                    href={item.link}
                    className="inline-block bg-black hover:bg-[#222222] text-white text-[12px] font-serif px-6 py-2 transition-colors uppercase tracking-[0.06em]"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* Interactive Overlays */}
      <MobileNavDrawer />
      <CartDrawer />
      <SearchModal />
      <CurrencySwitcher />
      <WhatsAppButton />
    </div>
  );
}
