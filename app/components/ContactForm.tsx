"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE } from "../lib/api";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Customer Inquiry",
    message: "",
  });

  useEffect(() => {
    if (orderId) {
      setFormData((prev) => ({
        ...prev,
        subject: `Cancellation Request for Order ${orderId}`,
        message:
          prev.message ||
          `Hello Sillhouete Customer Care, I would like to request cancellation for order ${orderId} which has been dispatched.`,
      }));
    }
  }, [orderId]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Customer Inquiry",
        message: "",
      });
    } catch (err: any) {
      console.error("Contact error:", err);
      // Even if offline/network fail, show helpful message
      setStatus("error");
      setErrorMessage(err.message || "Failed to send message. Please contact us via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfcfc] border border-[#f0f0f0] p-6 font-serif">
      <h3 className="text-[16px] font-bold uppercase tracking-[0.1em] text-[#111111] mb-4">
        Send us a Message
      </h3>

      {status === "success" && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-sans-custom">
          ✓ Thank you! Your message has been received by Sillhouete customer care. We will contact you shortly.
        </div>
      )}

      {status === "error" && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-[13px] font-sans-custom">
          {errorMessage}
        </div>
      )}

      {orderId && (
        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-[12px] leading-relaxed">
          <p className="font-bold text-[12.5px] mb-1">📦 Order #{orderId} - Cancellation Notice</p>
          <p>
            This order has already been dispatched/shipped and cannot be automatically cancelled online.
            Please submit your message below so our atelier customer support team can assist you directly with return, courier re-routing, or refund.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-[13px] font-sans-custom">
        <div>
          <label className="block text-[#444444] mb-1 font-medium">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your full name"
            className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
          />
        </div>
        <div>
          <label className="block text-[#444444] mb-1 font-medium">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
          />
        </div>
        <div>
          <label className="block text-[#444444] mb-1 font-medium">Phone / WhatsApp (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+92 300 1234567"
            className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
          />
        </div>
        <div>
          <label className="block text-[#444444] mb-1 font-medium">Message *</label>
          <textarea
            rows={4}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="How can we assist you with sizes, custom orders, or delivery?"
            className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-black outline-none resize-none bg-white text-[#111]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#222222] transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

