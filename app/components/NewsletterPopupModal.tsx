"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function NewsletterPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check if the popup was already shown to this user
    try {
      const alreadyShown = localStorage.getItem("sillhouete_newsletter_popup_shown");
      if (alreadyShown === "true") {
        return;
      }
    } catch {
      // In case localStorage is blocked
    }

    // 30 seconds timer (same as requested: "30 second tak chalali tab ye card show huta hy sirf aak baar")
    const timer = setTimeout(() => {
      try {
        const checkAgain = localStorage.getItem("sillhouete_newsletter_popup_shown");
        if (checkAgain !== "true") {
          setIsOpen(true);
          localStorage.setItem("sillhouete_newsletter_popup_shown", "true");
        }
      } catch {
        setIsOpen(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to newsletter"
      onClick={handleClose}
    >
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-[840px] bg-white rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-visible flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button (Matching Image 1 & 2) */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close newsletter popup"
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30 cursor-pointer border border-black/10"
        >
          <svg
            className="w-4 h-4 text-black"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M3.2 3.2l9.6 9.6M12.8 3.2l-9.6 9.6" />
          </svg>
        </button>

        {/* Left Column: Form & Content */}
        <div className="w-full md:w-[50%] p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center">
          {/* Header */}
          <h2 className="text-[17px] sm:text-[19px] md:text-[21px] font-serif font-bold uppercase tracking-[0.08em] text-[#111111] leading-tight">
            SUBSCRIBE OUR NEWSLETTER TO GET 5% OFF
          </h2>

          {/* Description */}
          <p className="mt-3 text-[12px] sm:text-[13px] font-serif text-[#444444] leading-relaxed max-w-[320px]">
            Sign up to our newsletter today and get exclusive access to our upcoming collections, deals and discounts.
          </p>

          {/* Email Subscription Form */}
          {isSubmitted ? (
            <div className="mt-5 p-3 bg-[#f7fdf9] border border-[#a3e0b8] text-[#186a3b] text-[13px] font-serif">
              Thank you for subscribing! Your 5% discount code is:{" "}
              <strong className="tracking-widest">WELCOME5</strong>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 w-full max-w-[320px]">
              <div className="flex w-full border border-[#d8d8d8] focus-within:border-black transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-3 py-2.5 text-[12.5px] sm:text-[13px] font-serif text-[#111111] placeholder:text-[#888888] focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  aria-label="Submit email"
                  className="bg-[#111111] hover:bg-black text-white px-4 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <svg
                    viewBox="0 0 50 15"
                    className="w-5 h-3 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M0 9.63V5.38h35V0l15 7.5L35 15V9.63Z" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Shop Now Button */}
          <Link
            href="/collections/sale-1"
            onClick={handleClose}
            className="mt-5 inline-block bg-[#111111] hover:bg-[#2b2b2b] text-white px-7 sm:px-8 py-2.5 sm:py-3 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.22em] font-sans transition-colors shadow-xs"
          >
            SHOP NOW
          </Link>

          {/* Social Icons Row (Matching Sillhouete Popup) */}
          <div className="mt-6 flex items-center justify-center space-x-4 text-[#333333]">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/sillhouete.official"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-[#444444] hover:text-black transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/171Gb4SL8y/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-[#444444] hover:text-black transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@sillhouete.official"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-[#444444] hover:text-black transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* Pinterest */}
            <a
              href="https://www.pinterest.com/sillhoueteofficial/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="text-[#444444] hover:text-black transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@sillhouete.official"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-[#444444] hover:text-black transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-.88-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.48 6.28 6.28 0 0 0 1.95-4.49V8.62a8.28 8.28 0 0 0 4.82 1.52V6.69z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Column: Exact Model Photo From Sillhouete */}
        <div className="w-full md:w-[50%] relative min-h-[280px] md:min-h-[460px] bg-[#f9f9f9]">
          <Image
            src="https://sillhouete.com/cdn/shop/files/webimages_0049_DSC07653_c5437d24-1c1e-4f8b-9646-80f0757ba6e5.jpg?v=1767332212&width=1000"
            alt="Subscribe our newsletter to get 5% off"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
    </div>
  );
}

