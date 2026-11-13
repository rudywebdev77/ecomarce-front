"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import siteData from "../site_data.json";

/* ---------- Payment icons (inline SVG) ---------- */
const PaymentIcon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 38 24" className="w-[38px] h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
    {children}
  </svg>
);

const AmexIcon = () => (
  <PaymentIcon>
    <rect width="38" height="24" rx="3" fill="#016FD0" />
    <text x="19" y="15" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">
      AMEX
    </text>
  </PaymentIcon>
);

const DinersIcon = () => (
  <PaymentIcon>
    <rect x="0.5" y="0.5" width="37" height="23" rx="3" fill="#fff" stroke="#e5e5e5" />
    <circle cx="19" cy="12" r="7.5" fill="#0079BE" />
    <circle cx="19" cy="12" r="5" fill="#fff" />
    <rect x="18.2" y="7" width="1.6" height="10" fill="#0079BE" />
  </PaymentIcon>
);

const DiscoverIcon = () => (
  <PaymentIcon>
    <rect x="0.5" y="0.5" width="37" height="23" rx="3" fill="#fff" stroke="#e5e5e5" />
    <text x="19" y="12" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#231F20" fontFamily="Arial, sans-serif">
      DISCOVER
    </text>
    <path d="M12 23.5 Q30 20 37.5 13 V20.5 a3 3 0 0 1 -3 3 Z" fill="#F58220" />
  </PaymentIcon>
);

const JcbIcon = () => (
  <PaymentIcon>
    <rect x="0.5" y="0.5" width="37" height="23" rx="3" fill="#fff" stroke="#e5e5e5" />
    <rect x="7" y="4" width="7" height="16" rx="2" fill="#0B4EA2" />
    <rect x="15.5" y="4" width="7" height="16" rx="2" fill="#E21836" />
    <rect x="24" y="4" width="7" height="16" rx="2" fill="#00A94F" />
    <g fill="#fff" fontSize="7" fontWeight="700" fontFamily="Arial, sans-serif" textAnchor="middle">
      <text x="10.5" y="15">J</text>
      <text x="19" y="15">C</text>
      <text x="27.5" y="15">B</text>
    </g>
  </PaymentIcon>
);

const MastercardIcon = () => (
  <PaymentIcon>
    <rect width="38" height="24" rx="3" fill="#1a1a1a" />
    <circle cx="15" cy="12" r="7" fill="#EB001B" />
    <circle cx="23" cy="12" r="7" fill="#F79E1B" fillOpacity="0.95" />
    <path d="M19 6.3a7 7 0 0 1 0 11.2 7 7 0 0 1 0-11.2z" fill="#FF5F00" />
  </PaymentIcon>
);

const VisaIcon = () => (
  <PaymentIcon>
    <rect width="38" height="24" rx="3" fill="#142FBD" />
    <text
      x="19"
      y="16"
      textAnchor="middle"
      fontSize="10"
      fontWeight="800"
      fontStyle="italic"
      fill="#fff"
      fontFamily="Arial, sans-serif"
    >
      VISA
    </text>
  </PaymentIcon>
);

/* ---------- Shared Constants (Single Source of Truth) ---------- */
const HELP_LINKS = [
  { name: "PRIVACY POLICY", href: "/pages/privacy-policy" },
  { name: "MADE-TO-ORDER POLICY", href: "/pages/policies" },
  { name: "EXCHANGE, REFUND & CANCELATION POLICY", href: "/pages/policies" },
  { name: "TERMS AND CONDITIONS", href: "/pages/terms-and-conditions" },
  { name: "BRAND STORY", href: "/pages/brand-story" },
  { name: "SHIPPING POLICY", href: "/pages/shipping-policy" },
  { name: "BLOG", href: "/blogs/news" },
  { name: "Contact Us.", href: "/pages/contact-us" },
  { name: "FAQS.", href: "/pages/faqs" },
];

const CONTACT_INFO = {
  pakistan: {
    office: "327-B, Street 7, Lane 15, Cavalry Ground, Lahore",
    studio: "Sillhouete, Almas Tower, MM Alam Rd, Block T, Gulberg 2, Lahore",
    phone: "+92 331 0397865",
  },
  usa: {
    company: "ADVENT BUSINESS CONSULTAX LLC",
    address: "18w100 22nd St, Ste 124, Oakbrook Terrace, IL, Zip Code 60181",
    phone: "+1 217 2909383",
  },
  email: "malikhasnain32897@gmail.com",
};

/* ---------- Header Typography ---------- */
const desktopHeadingClass =
  "text-[11px] font-bold uppercase tracking-[0.3em] text-[#111111]";

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
    <footer className="bg-white border-t border-[#e8e8e1] pt-0 lg:pt-[60px] pb-12 text-[#111111] font-serif">
      {/* ========================================================= */}
      {/* 1. DESKTOP LAYOUT (lg:grid) - 4 Columns */}
      {/* ========================================================= */}
      <div className="hidden lg:grid max-w-[1600px] mx-auto px-4 sm:px-5 lg:px-[35px] lg:grid-cols-4 gap-x-[10px] gap-y-6">
        {/* Column 1: About Us */}
        <div>
          <h3 className={`${desktopHeadingClass} mb-6`}>About Us</h3>
          <Link href="/" className="inline-block mb-5">
            <Image
              src={siteData.storeInfo.logo}
              alt={siteData.storeInfo.name}
              width={235}
              height={105}
              className="w-[235px] h-auto object-contain"
            />
          </Link>
          <p className="text-[12px] leading-[18px] text-[#111111] max-w-[240px]">
            Sillhouete is a Pakistan-based designer brand offering luxury bridal, formal, and
            ready-to-wear outfits to customers worldwide. Our collections are made for weddings
            and special occasions, with easy online shopping available globally.
          </p>
        </div>

        {/* Column 2: HELP & INFO */}
        <div>
          <h3 className={`${desktopHeadingClass} mb-6`}>Help &amp; Info</h3>
          <ul>
            {HELP_LINKS.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="block py-[6px] text-[12px] leading-[17px] text-[#111111] hover:underline"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div>
          <h3 className={`${desktopHeadingClass} mb-6`}>Contact Info</h3>
          <div className="text-[12px] leading-[18px] text-[#111111] max-w-[250px] space-y-[15px]">
            <p>
              <span className="font-bold">Pakistan (Office &amp; Studio):</span>
              <br />
              <span className="font-bold">Office Address:</span> {CONTACT_INFO.pakistan.office}
              <br />
              <span className="font-bold">Studio Address:</span> {CONTACT_INFO.pakistan.studio}
              <br />
              <span className="font-bold">Phone:</span> {CONTACT_INFO.pakistan.phone}
            </p>

            <p className="font-bold">USA Office:</p>

            <p>
              <span className="font-bold">{CONTACT_INFO.usa.company}</span>
              <br />
              {CONTACT_INFO.usa.address}
              <br />
              <span className="font-bold">Phone:</span> {CONTACT_INFO.usa.phone}
            </p>

            <p>
              <span className="font-bold">Email:</span>{" "}
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="inline-block border-b-2 border-[#111111] pb-[2px] text-[#111111]"
              >
                {CONTACT_INFO.email}
              </a>
            </p>
          </div>
        </div>

        {/* Column 4: Sign up and save */}
        <div>
          <h3 className={`${desktopHeadingClass} mb-6`}>Sign up and save</h3>
          <div className="max-w-[241px]">
            <p className="text-[12px] leading-[18px] text-[#111111] mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>

            {subscribed ? (
              <p className="text-emerald-700 text-[12px] py-2">Thank you for subscribing!</p>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex items-center border-b-2 border-[#111111]"
              >
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none py-2 text-[12px] text-[#111111] placeholder:text-[#111111]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="pl-2 pb-1 text-[#111111] cursor-pointer flex items-center justify-center"
                >
                  <svg
                    className="w-6 h-5 fill-none stroke-current"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 5h18c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </button>
              </form>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-[15px] mt-6">
              <a
                href="https://www.instagram.com/sillhouete.official"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#111111] hover:opacity-70 transition-opacity"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 32 32">
                  <path d="M16 3.094c4.206 0 4.7.019 6.363.094 1.538.069 2.369.325 2.925.544.738.287 1.262.625 1.813 1.175s.894 1.075 1.175 1.813c.212.556.475 1.387.544 2.925.075 1.662.094 2.156.094 6.363s-.019 4.7-.094 6.363c-.069 1.538-.325 2.369-.544 2.925-.288.738-.625 1.262-1.175 1.813s-1.075.894-1.813 1.175c-.556.212-1.387.475-2.925.544-1.663.075-2.156.094-6.363.094s-4.7-.019-6.363-.094c-1.537-.069-2.369-.325-2.925-.544-.737-.288-1.263-.625-1.813-1.175s-.894-1.075-1.175-1.813c-.212-.556-.475-1.387-.544-2.925-.075-1.663-.094-2.156-.094-6.363s.019-4.7.094-6.363c.069-1.537.325-2.369.544-2.925.287-.737.625-1.263 1.175-1.813s1.075-.894 1.813-1.175c.556-.212 1.388-.475 2.925-.544 1.662-.081 2.156-.094 6.363-.094zm0-2.838c-4.275 0-4.813.019-6.494.094-1.675.075-2.819.344-3.819.731-1.037.4-1.913.944-2.788 1.819S1.486 4.656 1.08 5.688c-.387 1-.656 2.144-.731 3.825-.075 1.675-.094 2.213-.094 6.488s.019 4.813.094 6.494c.075 1.675.344 2.819.731 3.825.4 1.038.944 1.913 1.819 2.788s1.756 1.413 2.788 1.819c1 .387 2.144.656 3.825.731s2.213.094 6.494.094 4.813-.019 6.494-.094c1.675-.075 2.819-.344 3.825-.731 1.038-.4 1.913-.944 2.788-1.819s1.413-1.756 1.819-2.788c.387-1 .656-2.144.731-3.825s.094-2.212.094-6.494-.019-4.813-.094-6.494c-.075-1.675-.344-2.819-.731-3.825-.4-1.038-.944-1.913-1.819-2.788s-1.756-1.413-2.788-1.819c-1-.387-2.144-.656-3.825-.731C20.812.275 20.275.256 16 .256z" />
                  <path d="M16 7.912a8.088 8.088 0 0 0 0 16.175c4.463 0 8.087-3.625 8.087-8.088s-3.625-8.088-8.088-8.088zm0 13.338a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 1 1 0 10.5zM26.294 7.594a1.887 1.887 0 1 1-3.774.002 1.887 1.887 0 0 1 3.774-.003z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/171Gb4SL8y/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#111111] hover:opacity-70 transition-opacity"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.46 11.82 5 14.5 5c1.28 0 2.38.1 2.7.14v3.13h-1.85c-1.48 0-1.77.7-1.77 1.73V12h3.46l-.45 3h-3.01v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@sillhouete.official"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-[#111111] hover:opacity-70 transition-opacity"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://www.pinterest.com/sillhoueteofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="text-[#111111] hover:opacity-70 transition-opacity"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.365-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-.998 2.352-1.488 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.372 12-12 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@sillhoueteofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-[#111111] hover:opacity-70 transition-opacity"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. RESPONSIVE / MOBILE ACCORDION (lg:hidden) - Exact Match to Screenshot */}
      {/* ========================================================= */}
      <div className="lg:hidden border-t border-[#e8e8e1]">
        {/* Accordion 1: ABOUT US */}
        <div className="border-b border-[#e8e8e1]">
          <button
            onClick={() => toggleAccordion("about")}
            className="relative w-full py-4 text-center text-[11px] font-bold uppercase tracking-[0.28em] font-serif text-[#111111] select-none cursor-pointer"
          >
            <span>ABOUT US</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                className={`w-3.5 h-2 text-[#111111] transition-transform duration-200 ${
                  openAccordion === "about" ? "rotate-180" : ""
                }`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </span>
          </button>

          {openAccordion === "about" && (
            <div className="pt-2 pb-6 px-4 text-center">
              <Link href="/" className="inline-block my-4">
                <Image
                  src={siteData.storeInfo.logo}
                  alt={siteData.storeInfo.name}
                  width={260}
                  height={100}
                  className="w-[230px] sm:w-[250px] h-auto object-contain mx-auto"
                />
              </Link>
              <p className="text-[12px] leading-[19px] text-[#333333] max-w-[340px] mx-auto pb-2">
                Sillhouete is a Pakistan-based designer brand offering luxury bridal, formal, and
                ready-to-wear outfits to customers worldwide. Our collections are made for weddings
                and special occasions, with easy online shopping available globally.
              </p>
            </div>
          )}
        </div>

        {/* Accordion 2: HELP & INFO */}
        <div className="border-b border-[#e8e8e1]">
          <button
            onClick={() => toggleAccordion("help")}
            className="relative w-full py-4 text-center text-[11px] font-bold uppercase tracking-[0.28em] font-serif text-[#111111] select-none cursor-pointer"
          >
            <span>HELP &amp; INFO</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                className={`w-3.5 h-2 text-[#111111] transition-transform duration-200 ${
                  openAccordion === "help" ? "rotate-180" : ""
                }`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </span>
          </button>

          {openAccordion === "help" && (
            <div className="pt-2 pb-6 text-center">
              <ul className="space-y-1.5">
                {HELP_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="block py-1 text-[12px] text-[#111111] hover:underline font-serif tracking-[0.04em]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Accordion 3: CONTACT INFO */}
        <div className="border-b border-[#e8e8e1]">
          <button
            onClick={() => toggleAccordion("contact")}
            className="relative w-full py-4 text-center text-[11px] font-bold uppercase tracking-[0.28em] font-serif text-[#111111] select-none cursor-pointer"
          >
            <span>CONTACT INFO</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                className={`w-3.5 h-2 text-[#111111] transition-transform duration-200 ${
                  openAccordion === "contact" ? "rotate-180" : ""
                }`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </span>
          </button>

          {openAccordion === "contact" && (
            <div className="pt-2 pb-6 px-4 text-center text-[12px] leading-[19px] text-[#111111] space-y-4 max-w-[340px] mx-auto font-serif">
              <p>
                <span className="font-bold">Pakistan (Office &amp; Studio):</span>
                <br />
                <span className="font-bold">Office Address:</span> {CONTACT_INFO.pakistan.office}
                <br />
                <span className="font-bold">Studio Address:</span> {CONTACT_INFO.pakistan.studio}
                <br />
                <span className="font-bold">Phone:</span> {CONTACT_INFO.pakistan.phone}
              </p>

              <div className="pt-1">
                <p className="font-bold mb-2">USA Office:</p>
                <p>
                  <span className="font-bold">{CONTACT_INFO.usa.company}</span>
                  <br />
                  {CONTACT_INFO.usa.address}
                  <br />
                  <span className="font-bold">Phone:</span> {CONTACT_INFO.usa.phone}
                </p>
              </div>

              <p className="pt-1">
                <span className="font-bold">Email:</span>{" "}
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="inline-block border-b-2 border-[#111111] pb-[2px] text-[#111111]"
                >
                  {CONTACT_INFO.email}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Accordion 4: SIGN UP AND SAVE */}
        <div className="border-b border-[#e8e8e1]">
          <button
            onClick={() => toggleAccordion("signup")}
            className="relative w-full py-4 text-center text-[11px] font-bold uppercase tracking-[0.28em] font-serif text-[#111111] select-none cursor-pointer"
          >
            <span>SIGN UP AND SAVE</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                className={`w-3.5 h-2 text-[#111111] transition-transform duration-200 ${
                  openAccordion === "signup" ? "rotate-180" : ""
                }`}
                viewBox="0 0 28 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m1.57 1.59 12.76 12.77L27.1 1.59" />
              </svg>
            </span>
          </button>

          {openAccordion === "signup" && (
            <div className="pt-2 pb-6 px-4 text-center max-w-[320px] mx-auto">
              <p className="text-[12px] leading-[18px] text-[#111111] mb-4">
                Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
              </p>

              {subscribed ? (
                <p className="text-emerald-700 text-[12px] py-2">Thank you for subscribing!</p>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-center border-b-2 border-[#111111] max-w-[260px] mx-auto mb-6"
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none py-2 text-[12px] text-[#111111] placeholder:text-[#111111]"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="pl-2 pb-1 text-[#111111] cursor-pointer flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-4 fill-none stroke-current"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 5h18c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </button>
                </form>
              )}

              {/* Social Icons inside Accordion */}
              <div className="flex items-center justify-center gap-[15px] pt-2">
                <a
                  href="https://www.instagram.com/sillhouete.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-[#111111] hover:opacity-70 transition-opacity"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 32 32">
                    <path d="M16 3.094c4.206 0 4.7.019 6.363.094 1.538.069 2.369.325 2.925.544.738.287 1.262.625 1.813 1.175s.894 1.075 1.175 1.813c.212.556.475 1.387.544 2.925.075 1.662.094 2.156.094 6.363s-.019 4.7-.094 6.363c-.069 1.538-.325 2.369-.544 2.925-.288.738-.625 1.262-1.175 1.813s-1.075.894-1.813 1.175c-.556.212-1.387.475-2.925.544-1.663.075-2.156.094-6.363.094s-4.7-.019-6.363-.094c-1.537-.069-2.369-.325-2.925-.544-.737-.288-1.263-.625-1.813-1.175s-.894-1.075-1.175-1.813c-.212-.556-.475-1.387-.544-2.925-.075-1.663-.094-2.156-.094-6.363s.019-4.7.094-6.363c.069-1.537.325-2.369.544-2.925.287-.737.625-1.263 1.175-1.813s1.075-.894 1.813-1.175c.556-.212 1.388-.475 2.925-.544 1.662-.081 2.156-.094 6.363-.094zm0-2.838c-4.275 0-4.813.019-6.494.094-1.675.075-2.819.344-3.819.731-1.037.4-1.913.944-2.788 1.819S1.486 4.656 1.08 5.688c-.387 1-.656 2.144-.731 3.825-.075 1.675-.094 2.213-.094 6.488s.019 4.813.094 6.494c.075 1.675.344 2.819.731 3.825.4 1.038.944 1.913 1.819 2.788s1.756 1.413 2.788 1.819c1 .387 2.144.656 3.825.731s2.213.094 6.494.094 4.813-.019 6.494-.094c1.675-.075 2.819-.344 3.825-.731 1.038-.4 1.913-.944 2.788-1.819s1.413-1.756 1.819-2.788c.387-1 .656-2.144.731-3.825s.094-2.212.094-6.494-.019-4.813-.094-6.494c-.075-1.675-.344-2.819-.731-3.825-.4-1.038-.944-1.913-1.819-2.788s-1.756-1.413-2.788-1.819c-1-.387-2.144-.656-3.825-.731C20.812.275 20.275.256 16 .256z" />
                    <path d="M16 7.912a8.088 8.088 0 0 0 0 16.175c4.463 0 8.087-3.625 8.087-8.088s-3.625-8.088-8.088-8.088zm0 13.338a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 1 1 0 10.5zM26.294 7.594a1.887 1.887 0 1 1-3.774.002 1.887 1.887 0 0 1 3.774-.003z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/171Gb4SL8y/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-[#111111] hover:opacity-70 transition-opacity"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.46 11.82 5 14.5 5c1.28 0 2.38.1 2.7.14v3.13h-1.85c-1.48 0-1.77.7-1.77 1.73V12h3.46l-.45 3h-3.01v6.8c4.56-.93 8-4.96 8-9.8z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@sillhouete.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-[#111111] hover:opacity-70 transition-opacity"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. PAYMENT BADGES & BOTTOM ROW (Exact Match to Screenshot) */}
      {/* ========================================================= */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-5 lg:px-[35px]">
        {/* Row of small payment icons (centered) */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2">
          <AmexIcon />
          <DinersIcon />
          <DiscoverIcon />
          <JcbIcon />
          <MastercardIcon />
          <VisaIcon />
        </div>

        {/* Powered by Sillhouete (centered on mobile/tablet, left on desktop) */}
        <div className="mt-5 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4">
          <span className="text-[12px] text-[#111111] font-serif text-center">
            Powered by Sillhouete
          </span>

          {/* Mastercard and Visa card boxes */}
          <div className="flex items-center justify-center gap-2">
            {/* Mastercard box */}
            <div className="w-[58px] h-[40px] rounded bg-white border border-[#e5e5e5] flex items-center justify-center shadow-2xs">
              <svg viewBox="0 0 32 20" className="w-8 h-5">
                <circle cx="11" cy="10" r="7" fill="#EB001B" />
                <circle cx="21" cy="10" r="7" fill="#F79E1B" />
                <path d="M16 4.4a7 7 0 0 1 0 11.2 7 7 0 0 1 0-11.2z" fill="#FF5F00" />
              </svg>
            </div>
            {/* Visa box */}
            <div className="w-[58px] h-[40px] rounded bg-white border border-[#e5e5e5] flex items-center justify-center shadow-2xs">
              <span className="text-[15px] font-extrabold italic tracking-tight text-[#1A1F71] font-sans">
                VISA
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
