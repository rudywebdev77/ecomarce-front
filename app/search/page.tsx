import React, { Suspense } from "react";
import { Metadata } from "next";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileNavDrawer from "../components/MobileNavDrawer";
import CartDrawer from "../components/CartDrawer";
import SearchModal from "../components/SearchModal";
import CurrencySwitcher from "../components/CurrencySwitcher";
import WhatsAppButton from "../components/WhatsAppButton";
import SearchPageClient from "./SearchPageClient";
import { SearchSkeleton } from "../components/SkeletonLoaders";

export const metadata: Metadata = {
  title: "Search – Sillhouete",
  description: "Search luxury Pakistani bridal, formal, and prêt dresses at Sillhouete.",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        <Suspense fallback={<SearchSkeleton />}>
          <SearchPageClient />
        </Suspense>
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

