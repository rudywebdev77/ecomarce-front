"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import siteData from "../site_data.json";
import { API_BASE } from "../lib/api";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "SIL-1004";
  const email = searchParams.get("email") || "your email address";
  const total = searchParams.get("total") || "";
  const method = searchParams.get("method") || "stripe";

  const [isCancelled, setIsCancelled] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState("");
  const [refundErrorMsg, setRefundErrorMsg] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const cancellationPhone = siteData?.storeInfo?.phone || "+92 331 0397865";
  const cancellationWhatsApp = siteData?.storeInfo?.whatsapp || "+92 331 0397865";
  const rawWhatsAppNumber = cancellationWhatsApp.replace(/[^0-9]/g, "");

  const handleCancelAndRefund = async () => {
    setIsRefunding(true);
    setRefundErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/cancel-and-refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process cancellation and refund.");
      }
      setIsCancelled(true);
      setShowConfirmModal(false);
      setRefundSuccessMsg(
        data.message || `Order ${orderId} has been cancelled and your payment of Rs.${Number(total || 0).toLocaleString()} has been refunded to your card.`
      );
    } catch (err: any) {
      setRefundErrorMsg(err.message || "Something went wrong while processing the refund.");
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto py-16 px-4 sm:px-6 text-center font-serif">
      <div className={`w-16 h-16 ${isCancelled ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"} rounded-full flex items-center justify-center mx-auto mb-6 transition-colors`}>
        {isCancelled ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <p className={`text-[12px] font-sans-custom uppercase tracking-[0.2em] ${isCancelled ? "text-rose-700" : "text-emerald-700"} font-semibold mb-2`}>
        {isCancelled ? "Order Cancelled & Refunded" : "Payment & Order Confirmed"}
      </p>

      <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#111111] uppercase tracking-[0.05em] mb-4">
        {isCancelled ? "Order Cancelled Successfully" : "Thank You For Shopping with Sillhouete"}
      </h1>

      {refundSuccessMsg ? (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-sans-custom rounded-md text-left flex items-start gap-3">
          <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-semibold">Refund Processed Successfully</p>
            <p className="mt-0.5">{refundSuccessMsg}</p>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-[#555555] font-sans-custom leading-relaxed mb-6">
          Your order <strong className="text-black font-mono">{orderId}</strong> has been successfully placed. We have sent a detailed receipt and tracking confirmation to{" "}
          <strong className="text-black">{decodeURIComponent(email)}</strong>.
        </p>
      )}

      {refundErrorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-[13px] font-sans-custom rounded-md text-left">
          {refundErrorMsg}
        </div>
      )}

      <div className="bg-[#fcfcfc] border border-[#e8e8e1] p-6 sm:p-8 text-left mb-8 space-y-4 font-sans-custom text-[13px]">
        <div className="flex justify-between border-b border-[#f0f0f0] pb-3">
          <span className="text-[#666666]">Order Number:</span>
          <span className={`font-semibold font-mono ${isCancelled ? "line-through text-rose-600" : "text-black"}`}>
            {orderId} {isCancelled && <span className="text-[11px] font-sans text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 ml-1">CANCELLED</span>}
          </span>
        </div>
        <div className="flex justify-between border-b border-[#f0f0f0] pb-3">
          <span className="text-[#666666]">Payment Status:</span>
          {isCancelled ? (
            <span className="font-semibold text-rose-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
              Refunded to Card
            </span>
          ) : (
            <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              {method === "stripe" ? "Paid via Stripe Card" : method === "cod" ? "Cash on Delivery" : "Bank Transfer"}
            </span>
          )}
        </div>
        {total && (
          <div className="flex justify-between border-b border-[#f0f0f0] pb-3">
            <span className="text-[#666666]">{isCancelled ? "Total Refunded:" : "Total Charged:"}</span>
            <span className={`font-semibold ${isCancelled ? "text-emerald-700" : "text-black"}`}>
              Rs.{Number(total).toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between border-b border-[#f0f0f0] pb-3">
          <span className="text-[#666666]">Estimated Delivery:</span>
          <span className="font-semibold text-black">{isCancelled ? "Cancelled" : "3 - 7 Business Days"}</span>
        </div>
        <div className="flex justify-between border-b border-[#f0f0f0] pb-3">
          <span className="text-[#666666]">Customer Care WhatsApp:</span>
          <a
            href={`https://wa.me/${rawWhatsAppNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#25D366] hover:underline"
          >
            {cancellationWhatsApp}
          </a>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-1">
          <span className="text-[#666666]">Order Cancellation Helpline:</span>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${cancellationPhone.replace(/\s+/g, "")}`}
              className="font-semibold text-[#111111] hover:text-[#0e3359] underline text-[12px]"
            >
              {cancellationPhone}
            </a>
            <span className="text-[#cccccc]">&bull;</span>
            <a
              href={`https://wa.me/${rawWhatsAppNumber}?text=${encodeURIComponent(`Hello Sillhouete, I want to cancel and refund order ${orderId}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#25D366] font-semibold hover:underline"
            >
              WhatsApp Cancel
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={`/account?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`}
          className="w-full sm:w-auto bg-[#0e3359] text-white px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a2542] transition-colors shadow-xs"
        >
          Track Order Live &rarr;
        </Link>
        <Link
          href="/collections/all"
          className="w-full sm:w-auto bg-[#1773b0] text-white px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#125e91] transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/pages/contact-us"
          className="w-full sm:w-auto border border-[#cccccc] text-black px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] hover:border-black transition-colors"
        >
          Contact Support
        </Link>
        {!isCancelled && (
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            style={{ borderColor: "#ef4444", color: "#dc2626", backgroundColor: "#fef2f2" }}
            className="w-full sm:w-auto border px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer hover:bg-red-100"
          >
            Cancel Order &amp; Refund
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white max-w-[500px] w-full p-6 sm:p-8 rounded-lg shadow-2xl text-left font-sans-custom space-y-4 border border-[#e5e7eb]">
            <div className="flex items-center gap-3 text-[#b42318]">
              <div className="w-10 h-10 rounded-full bg-[#fee4e2] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-[#d92d20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-[19px] text-black">
                Cancel Order &amp; Refund Payment?
              </h3>
            </div>

            <p className="text-[13px] text-[#475467] leading-relaxed">
              Are you sure you want to cancel order <strong className="text-black font-mono">{orderId}</strong>?
            </p>

            <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-[13px] text-[#334155] space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-[#e2e8f0]">
                <span className="text-[#64748b]">Refund Amount:</span>
                <strong className="text-emerald-700 font-mono text-[15px]">Rs.{Number(total || 0).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#e2e8f0]">
                <span className="text-[#64748b]">Refund Destination:</span>
                <span className="font-semibold text-black">Original Card (via Stripe)</span>
              </div>
              <div className="text-[11px] text-[#64748b] leading-normal pt-1">
                ✓ Full payment will be credited back immediately to your bank account / card.
              </div>
            </div>

            <div className="pt-3 border-t border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={isRefunding}
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 border border-[#cccccc] text-[#333333] hover:bg-[#f5f5f5] text-[12px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                disabled={isRefunding}
                onClick={handleCancelAndRefund}
                style={{ backgroundColor: "#d92d20", color: "#ffffff", border: "1px solid #b42318" }}
                className="w-full sm:w-auto px-6 py-2.5 text-[12px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:opacity-95"
              >
                {isRefunding ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Processing Refund...</span>
                  </>
                ) : (
                  <span>Yes, Cancel &amp; Refund Payment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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

