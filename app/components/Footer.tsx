"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import siteData from "../site_data.json";

export default function Footer() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) setSubscribed(true);
  };

  return (
    <footer className="bg-white border-t border-[#e8e8e1] pt-14 pb-8 text-[#111111] font-serif">
      <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-[#e8e8e1]">
          {/* Column 1: About Us */}
          <div>
            <div className="hidden sm:block">
              <h3 className="text-[16px] font-semibold uppercase tracking-[0.05em] mb-4 text-[#111111]">
                About Us
              </h3>
            </div>
            {/* Mobile accordion trigger */}
            <button
              onClick={() => toggleAccordion("about")}
              className="sm:hidden w-full flex items-center justify-between py-2 text-left text-[15px] font-semibold uppercase tracking-[0.05em]"
            >
              <span>About Us</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${openAccordion === "about" ? "rotate-180" : ""}`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </button>

            <div className={`${openAccordion === "about" ? "block" : "hidden"} sm:block pt-2 sm:pt-0`}>
              <Link href="/" className="inline-block mb-4">
                <Image
                  src={siteData.storeInfo.logo}
                  alt={siteData.storeInfo.name}
                  width={160}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <p className="text-[13px] leading-relaxed text-[#555555]">
                Sillhouete is a Pakistan-based designer brand offering luxury bridal, formal, and ready-to-wear outfits to customers worldwide. Our collections are made for weddings and special occasions, with easy online shopping available globally.
              </p>
            </div>
          </div>

          {/* Column 2: HELP & INFO */}
          <div>
            <div className="hidden sm:block">
              <h3 className="text-[16px] font-semibold uppercase tracking-[0.05em] mb-4 text-[#111111]">
                HELP & INFO
              </h3>
            </div>
            {/* Mobile accordion trigger */}
            <button
              onClick={() => toggleAccordion("help")}
              className="sm:hidden w-full flex items-center justify-between py-2 text-left text-[15px] font-semibold uppercase tracking-[0.05em]"
            >
              <span>HELP & INFO</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${openAccordion === "help" ? "rotate-180" : ""}`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </button>

            <div className={`${openAccordion === "help" ? "block" : "hidden"} sm:block pt-2 sm:pt-0`}>
              <ul className="space-y-2 text-[13px]">
                {[
                  { name: "PRIVACY POLICY", href: "/pages/privacy-policy" },
                  { name: "MADE-TO-ORDER POLICY", href: "/pages/policies" },
                  { name: "EXCHANGE, REFUND & CANCELATION POLICY", href: "/pages/policies" },
                  { name: "TERMS AND CONDITIONS", href: "/pages/terms-and-conditions" },
                  { name: "BRAND STORY", href: "/pages/brand-story" },
                  { name: "SHIPPING POLICY", href: "/pages/shipping-policy" },
                  { name: "BLOG", href: "/blogs/news" },
                  { name: "Contact Us.", href: "/pages/contact-us" },
                  { name: "FAQS.", href: "/pages/faqs" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[#444444] hover:text-black hover:underline transition-colors block py-0.5"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <div className="hidden sm:block">
              <h3 className="text-[16px] font-semibold uppercase tracking-[0.05em] mb-4 text-[#111111]">
                Contact Info
              </h3>
            </div>
            {/* Mobile accordion trigger */}
            <button
              onClick={() => toggleAccordion("contact")}
              className="sm:hidden w-full flex items-center justify-between py-2 text-left text-[15px] font-semibold uppercase tracking-[0.05em]"
            >
              <span>Contact Info</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${openAccordion === "contact" ? "rotate-180" : ""}`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </button>

            <div className={`${openAccordion === "contact" ? "block" : "hidden"} sm:block pt-2 sm:pt-0 text-[13px] leading-relaxed text-[#555555] space-y-3`}>
              <div>
                <p className="font-semibold text-[#111111]">Pakistan (Office & Studio):</p>
                <p><span className="font-semibold">Office Address:</span> 327-B, Street 7, Lane 15, Cavalry Ground, Lahore</p>
                <p><span className="font-semibold">Studio Address:</span> Sillhouete, Almas Tower, MM Alam Rd, Block T, Gulberg 2, Lahore</p>
                <p><span className="font-semibold">Phone:</span> +92 331 0397865</p>
              </div>

              <div>
                <p className="font-semibold text-[#111111]">USA Office:</p>
                <p className="font-semibold">ADVENT BUSINESS CONSULTAX LLC</p>
                <p>18w100 22nd St, Ste 124, Oakbrook Terrace, IL, Zip Code 60181</p>
                <p><span className="font-semibold">Phone:</span> +1 217 2909383</p>
              </div>

              <div>
                <p><span className="font-semibold">Email:</span> <a href="mailto:info@sillhouete.com" className="hover:underline text-[#111111]">info@sillhouete.com</a></p>
              </div>
            </div>
          </div>

          {/* Column 4: Sign up and save */}
          <div>
            <div className="hidden sm:block">
              <h3 className="text-[16px] font-semibold uppercase tracking-[0.05em] mb-4 text-[#111111]">
                Sign up and save
              </h3>
            </div>
            {/* Mobile accordion trigger */}
            <button
              onClick={() => toggleAccordion("signup")}
              className="sm:hidden w-full flex items-center justify-between py-2 text-left text-[15px] font-semibold uppercase tracking-[0.05em]"
            >
              <span>Sign up and save</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${openAccordion === "signup" ? "rotate-180" : ""}`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </button>

            <div className={`${openAccordion === "signup" ? "block" : "hidden"} sm:block pt-2 sm:pt-0`}>
              <p className="text-[13px] text-[#555555] mb-4">
                Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
              </p>

              {subscribed ? (
                <p className="text-emerald-700 text-[13px] font-sans-custom py-2">Thank you for subscribing!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="relative mb-6">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-white border border-[#e8e8e1] pr-12 pl-3 py-2.5 text-[13px] outline-none focus:border-black font-sans-custom"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-0 top-0 bottom-0 px-3.5 bg-black text-white hover:bg-[#333333] transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </button>
                </form>
              )}

              {/* Social Icons */}
              <div className="flex items-center space-x-4 pt-2">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/sillhouete.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-[#444444] hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 32 32">
                    <path d="M16 3.094c4.206 0 4.7.019 6.363.094 1.538.069 2.369.325 2.925.544.738.287 1.262.625 1.813 1.175s.894 1.075 1.175 1.813c.212.556.475 1.387.544 2.925.075 1.662.094 2.156.094 6.363s-.019 4.7-.094 6.363c-.069 1.538-.325 2.369-.544 2.925-.288.738-.625 1.262-1.175 1.813s-1.075.894-1.813 1.175c-.556.212-1.387.475-2.925.544-1.663.075-2.156.094-6.363.094s-4.7-.019-6.363-.094c-1.537-.069-2.369-.325-2.925-.544-.737-.288-1.263-.625-1.813-1.175s-.894-1.075-1.175-1.813c-.212-.556-.475-1.387-.544-2.925-.075-1.663-.094-2.156-.094-6.363s.019-4.7.094-6.363c.069-1.537.325-2.369.544-2.925.287-.737.625-1.263 1.175-1.813s1.075-.894 1.813-1.175c.556-.212 1.388-.475 2.925-.544 1.662-.081 2.156-.094 6.363-.094zm0-2.838c-4.275 0-4.813.019-6.494.094-1.675.075-2.819.344-3.819.731-1.037.4-1.913.944-2.788 1.819S1.486 4.656 1.08 5.688c-.387 1-.656 2.144-.731 3.825-.075 1.675-.094 2.213-.094 6.488s.019 4.813.094 6.494c.075 1.675.344 2.819.731 3.825.4 1.038.944 1.913 1.819 2.788s1.756 1.413 2.788 1.819c1 .387 2.144.656 3.825.731s2.213.094 6.494.094 4.813-.019 6.494-.094c1.675-.075 2.819-.344 3.825-.731 1.038-.4 1.913-.944 2.788-1.819s1.413-1.756 1.819-2.788c.387-1 .656-2.144.731-3.825s.094-2.212.094-6.494-.019-4.813-.094-6.494c-.075-1.675-.344-2.819-.731-3.825-.4-1.038-.944-1.913-1.819-2.788s-1.756-1.413-2.788-1.819c-1-.387-2.144-.656-3.825-.731C20.812.275 20.275.256 16 .256z" />
                    <path d="M16 7.912a8.088 8.088 0 0 0 0 16.175c4.463 0 8.087-3.625 8.087-8.088s-3.625-8.088-8.088-8.088zm0 13.338a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 1 1 0 10.5zM26.294 7.594a1.887 1.887 0 1 1-3.774.002 1.887 1.887 0 0 1 3.774-.003z" />
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
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.46 11.82 5 14.5 5c1.28 0 2.38.1 2.7.14v3.13h-1.85c-1.48 0-1.77.7-1.77 1.73V12h3.46l-.45 3h-3.01v6.8c4.56-.93 8-4.96 8-9.8z" />
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
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Pinterest */}
                <a
                  href="https://www.pinterest.com/sillhoueteofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="text-[#444444] hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.365-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-.998 2.352-1.488 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.372 12-12 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@sillhoueteofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="text-[#444444] hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Payment icons & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#666666]">
          <div className="flex items-center space-x-2">
            <span>Powered by</span>
            <Link href="/" className="text-[#111111] font-semibold hover:underline">
              Sillhouete
            </Link>
          </div>

          {/* Payment Icons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Mastercard */}
            <div className="h-6 w-9 rounded-xs bg-[#222] p-1 flex items-center justify-center border border-black/10">
              <span className="text-[9px] font-bold tracking-tight text-white font-sans-custom">MC</span>
            </div>
            {/* Visa */}
            <div className="h-6 w-9 rounded-xs bg-[#142FBD] p-1 flex items-center justify-center border border-black/10">
              <span className="text-[9px] font-bold tracking-tight text-white italic font-sans-custom">VISA</span>
            </div>
            {/* American Express */}
            <div className="h-6 w-9 rounded-xs bg-[#0071CE] p-1 flex items-center justify-center border border-black/10">
              <span className="text-[8px] font-bold tracking-tight text-white font-sans-custom">AMEX</span>
            </div>
            {/* Discover */}
            <div className="h-6 w-9 rounded-xs bg-[#fff] p-1 flex items-center justify-center border border-black/20">
              <span className="text-[8px] font-bold tracking-tight text-[#f48120] font-sans-custom">DISC</span>
            </div>
            {/* JCB */}
            <div className="h-6 w-9 rounded-xs bg-[#fff] p-1 flex items-center justify-center border border-black/20">
              <span className="text-[8px] font-bold tracking-tight text-[#006ebc] font-sans-custom">JCB</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
