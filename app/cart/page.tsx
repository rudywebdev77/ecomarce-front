import React from "react";
import { Metadata } from "next";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileNavDrawer from "../components/MobileNavDrawer";
import CartDrawer from "../components/CartDrawer";
import SearchModal from "../components/SearchModal";
import CurrencySwitcher from "../components/CurrencySwitcher";
import WhatsAppButton from "../components/WhatsAppButton";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Your Shopping Cart – Sillhouete",
  description: "View and checkout items in your Sillhouete shopping bag.",
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        <CartPageClient />
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

