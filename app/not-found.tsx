import React from "react";
import Link from "next/link";
import AnnouncementBar from "./components/AnnouncementBar";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-serif">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
        <h1 className="text-[32px] sm:text-[40px] font-semibold uppercase tracking-[0.05em] text-[#111111] mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[#666666] max-w-md mx-auto mb-8 font-serif leading-relaxed">
          The page you were looking for does not exist. Explore our latest bridal and formal collections instead.
        </p>
        <Link href="/" className="btn-primary">
          Back to Homepage
        </Link>
      </main>

      <Footer />
    </div>
  );
}
