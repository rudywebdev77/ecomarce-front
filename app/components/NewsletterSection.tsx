"use client";

import React, { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="bg-[#f9f9f9] py-16 sm:py-20 border-b border-[#e8e8e1]">
      <div className="max-w-[650px] mx-auto px-4 text-center">
        <h2 className="text-[25px] font-semibold uppercase tracking-[0.05em] font-serif text-[#111111] leading-none mb-3">
          Subscribe to our newsletter
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[#555555] font-serif mb-8 leading-relaxed">
          Signup for our newsletter to stay up to date on sales and events.
        </p>

        {submitted ? (
          <div className="p-4 bg-white border border-[#e8e8e1] text-emerald-800 font-serif text-[15px]">
            Thank you for subscribing! Check your inbox for updates.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-0 max-w-[480px] mx-auto shadow-xs">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 bg-white border border-[#e8e8e1] px-4 py-3 text-[14px] font-sans-custom outline-none focus:border-black transition-colors"
            />
            <button
              type="submit"
              className="btn-primary sm:border-l-0 px-6 py-3 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Subscribe</span>
              <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
