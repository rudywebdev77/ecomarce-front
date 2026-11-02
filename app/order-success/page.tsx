"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import siteData from "../site_data.json";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "SIL-1004";
  const email = searchParams.get("email") || "your email address";
  const total = searchParams.get("total") || "";
  const method = searchParams.get("method") || "stripe";

  return (
    <div className="max-w-[700px] mx-auto py-16 px-4 sm:px-6 text-center font-serif">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <p className="text-[12px] font-sans-custom uppercase tracking-[0.2em] text-emerald-700 font-semibold mb-2">
        Payment &amp; Order Confirmed
      </p>

      <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#111111] uppercase tracking-[0.05em] mb-4">
        Thank You For Shopping with Sillhouete
      </h1>

      <p className="text-[14px] text-[#555555] font-sans-custom leading-relaxed mb-6">
        Your order <strong className="text-black font-mono">{orderId}</strong> has been successfully placed. We have sent a detailed receipt and tracking confirmation to{" "}
        <strong className="text-black">{decodeURIComponent(email)}</strong>.
      </p>

      <div className="bg-[#fcfcfc] border border-[#e8e8e1] p-6 sm:p-8 text-left mb-8 space-y-4 font-sans-custom text-[13px]">
        <div className="flex justify-between border-b border-[#f0f0f0] pb-3">
          <span className="text-[#666666]">Order Number:</span>
          <span className="font-semibold text-black font-mono">{orderId}</span>
        </div>
        <div className="flex justify-between border-b border-[#f0f0f0] pb-3">
          <span className="text-[#666666]">Payment Status:</span>
          <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
            {method === "stripe" ? "Paid via Stripe Card" : method === "cod" ? "Cash on Delivery" : "Bank Transfer"}
          </span>
        </div>
        {total && (
          <div className="flex justify-between border-b border-[#f0f0f0] pb-3">
            <span className="text-[#666666]">Total Charged:</span>
            <span className="font-semibold text-black">Rs.{Number(total).toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between border-b border-[#f0f0f0] pb-3">
          <span className="text-[#666666]">Estimated Delivery:</span>
          <span className="font-semibold text-black">3 - 7 Business Days</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#666666]">Customer Care WhatsApp:</span>
          <a
            href={`https://wa.me/${siteData.storeInfo.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#25D366] hover:underline"
          >
            {siteData.storeInfo.whatsapp}
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/collections/all"
          className="w-full sm:w-auto bg-black text-white px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#222222] transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/pages/contact-us"
          className="w-full sm:w-auto border border-[#cccccc] text-black px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] hover:border-black transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-serif text-[#111111]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center">Loading order confirmation...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

