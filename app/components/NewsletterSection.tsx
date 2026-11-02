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
    <section className="bg-white py-14 sm:py-16 md:py-20 border-b border-[#e8e8e1]">
      <div className="max-w-[650px] mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-[20px] sm:text-[23px] md:text-[25px] font-semibold uppercase tracking-[0.05em] font-serif text-[#111111] leading-none mb-3">
          SUBSCRIBE TO OUR NEWSLETTER
        </h2>

        {/* Subtext matching screenshot */}
        <p className="text-[13.5px] sm:text-[14.5px] text-[#444444] font-serif mb-6 sm:mb-8 leading-relaxed max-w-[500px] mx-auto">
          Signup for our newsletter to stay up to date on sales and events.
        </p>

        {submitted ? (
          <div className="p-4 bg-[#f9f9f9] border border-[#e8e8e1] text-emerald-800 font-serif text-[14px] max-w-[440px] mx-auto">
            Thank you for subscribing! Check your inbox for updates.
          </div>
        ) : (
          /* Form: Input + Black Button with White Arrow (matches screenshot) */
          <form
            onSubmit={handleSubmit}
            className="flex items-stretch max-w-[420px] mx-auto shadow-xs"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 min-w-0 bg-[#fafafa]/50 border border-[#e8e8e1] border-r-0 px-4 py-3 text-[13.5px] font-sans outline-none placeholder:text-[#555555] focus:bg-white focus:border-black transition-colors"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="bg-[#111111] hover:bg-[#222222] text-white px-7 py-3 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <svg
                className="w-5 h-5 text-white stroke-current fill-none stroke-[2]"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
