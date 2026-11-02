"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore, formatPrice } from "../../store/useStore";
import ProductReviewsWidget from "../../components/ProductReviewsWidget";
import FeaturedReviewsCarousel from "../../components/FeaturedReviewsCarousel";
import KeyActivesSection from "../../components/KeyActivesSection";
import FloatingProductVideo from "../../components/FloatingProductVideo";

export interface ProductDetailProps {
  product: {
    id: number | string;
    title: string;
    handle: string;
    vendor?: string;
    body_html?: string;
    price: string;
    comparePrice?: string | null;
    images: string[];
    variants?: Array<{
      id: number | string;
      title: string;
      price: string;
      compare_at_price?: string | null;
    }>;
    tags?: string[];
    collectionTitle?: string;
  };
  similarProducts: Array<{
    handle: string;
    title: string;
    price: string;
    image: string;
    secondaryImage?: string;
  }>;
}

export default function ProductDetailClient({
  product,
  similarProducts,
}: ProductDetailProps) {
  const { addToCart, currentCurrency } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [quantity, setQuantity] = useState(1);
  const [isExpedited, setIsExpedited] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (thumbnailRefs.current[activeImageIndex]) {
      thumbnailRefs.current[activeImageIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [activeImageIndex]);

  const images = product.images.length > 0 ? product.images : ["/favicon.ico"];

  // Base price calculation
  const rawPriceNum = parseFloat(product.price.replace(/[^\d.]/g, "")) || 32900;
  const expediteCost = isExpedited ? 8000 : 0;
  const totalPriceNum = rawPriceNum + expediteCost;
  const formattedTotalPrice = `Rs.${totalPriceNum.toLocaleString()}`;

  const sizes = ["XS", "S", "M", "L", "XL", "Custom"];

  const handleAddToCart = () => {
    let customNotes = `Size: ${selectedSize}`;
    if (isExpedited) customNotes += " | Expedited (5-6 Days)";

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${product.handle}-${selectedSize}-${isExpedited ? "exp" : ""}`,
        title: `${product.title} (${customNotes})`,
        price: formattedTotalPrice,
        image: images[0],
        size: selectedSize,
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  // WhatsApp link with prefilled text
  const whatsappUrl = `https://wa.me/923268282601?text=${encodeURIComponent(
    `Hi Sillhouete! I am interested in ordering "${product.title}" (${formatPrice(
      formattedTotalPrice,
      currentCurrency
    )}) in Size: ${selectedSize}. Please assist me with my order.`
  )}`;

  return (
    <div className="bg-white text-[#111111] min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-[#f2f2f2] bg-[#fbfbfb]">
        <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 py-3 text-[12px] font-serif text-[#777777] flex items-center space-x-2">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#555555]">
            {product.collectionTitle || "Collections"}
          </span>
          <span>/</span>
          <span className="text-[#111111] font-medium">{product.title}</span>
        </div>
      </div>

      {/* Main Product Showcase: Left Sticky Gallery + Right Scrolling Content */}
      <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ================= LEFT: MEDIA GALLERY (6 Cols on LG - 50% width - STICKY) ================= */}
          <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4 product-gallery-sticky lg:sticky lg:top-6 self-start z-10 md:items-stretch">
            {/* Vertical Thumbnail Strip */}
            {images.length > 1 && (
              <div className="relative md:w-[80px] shrink-0 flex flex-col justify-between">
                {/* Scroll Up Arrow */}
                {activeImageIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => Math.max(0, prev - 1))}
                    className="hidden md:flex w-full items-center justify-center py-1.5 text-[#333333] hover:text-black cursor-pointer transition-colors shrink-0"
                    aria-label="Scroll up"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                ) : (
                  <div className="hidden md:block h-0" />
                )}

                {/* Thumbnails scroller */}
                <div className="flex md:flex-col items-center gap-3 overflow-x-auto md:overflow-y-auto flex-1 max-h-[760px] scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      ref={(el) => {
                        thumbnailRefs.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-[70px] h-[105px] md:w-[80px] md:h-[120px] shrink-0 overflow-hidden bg-[#f7f7f7] cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-2 border-black"
                          : "border-2 border-transparent"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} thumb ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover object-center"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>

                {/* Scroll Down Arrow */}
                {activeImageIndex < images.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        Math.min(images.length - 1, prev + 1)
                      )
                    }
                    className="hidden md:flex w-full items-center justify-center py-1.5 text-[#333333] hover:text-black cursor-pointer transition-colors shrink-0"
                    aria-label="Scroll down"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <div className="hidden md:block h-0" />
                )}
              </div>
            )}

            {/* Large Active Main Image with Horizontal Right-to-Left Sliding Transition */}
            <div className="relative flex-1 bg-[#f9f9f9] overflow-hidden aspect-[2/3] max-h-[820px] border border-[#f0f0f0]">
              {/* Horizontal Sliding Track */}
              <div
                className="flex w-full h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
              >
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-full h-full shrink-0">
                    <Image
                      src={img}
                      alt={`${product.title} image ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT: PRODUCT DETAILS & FORM (6 Cols on LG - 50% width) ================= */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            {/* Brand / Designer Tag & SKU */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#888888] font-sans-custom font-semibold">
                {product.vendor || "SILLHOUETE"}
              </span>
              <span className="text-[11px] uppercase tracking-[0.1em] text-[#888888] font-sans-custom">
                RSS – 4-XS
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-[26px] sm:text-[30px] font-normal tracking-[0.03em] font-serif text-[#111111] mt-1.5 leading-snug">
              {product.title}
            </h1>

            {/* Review Preview Badge (Judge.me Style) */}
            <a
              href="#customer-reviews"
              className="mt-1 inline-flex items-center space-x-1.5 text-[#108474] hover:opacity-80 transition-opacity cursor-pointer group"
            >
              <div className="flex text-[14px] tracking-[1px]">★★★★★</div>
              <span className="text-[12px] font-serif text-[#555555] group-hover:underline">
                1 review
              </span>
            </a>

            {/* Price */}
            <div className="mt-2.5 flex items-baseline space-x-3">
              <span className="text-[22px] sm:text-[24px] font-serif font-bold text-[#111111]">
                {formatPrice(formattedTotalPrice, currentCurrency)}
              </span>
              {product.comparePrice && (
                <span className="text-[16px] text-[#888888] line-through font-serif">
                  {formatPrice(product.comparePrice, currentCurrency)}
                </span>
              )}
            </div>

            {/* Shipping Info */}
            <p className="text-[12px] text-[#777777] font-serif mt-1">
              Shipping calculated at checkout.
            </p>

            {/* World Wide Shipping Badge */}
            <div className="mt-3 flex items-center space-x-2 text-[13px] font-serif text-[#111111]">
              <svg className="w-4 h-4 text-[#444444] fill-none stroke-current stroke-1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>World Wide Shipping</span>
            </div>

            {/* Size Selector */}
            <div className="mt-5 pt-4 border-t border-[#f0f0f0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-sans-custom uppercase tracking-[0.15em] font-bold text-[#111111]">
                  Size
                </span>
                <button
                  onClick={() => setShowSizeModal(true)}
                  className="text-[11px] underline text-[#777777] hover:text-black font-sans-custom transition-colors cursor-pointer"
                >
                  Size Chart
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[44px] h-9 px-3 text-[12px] font-sans-custom font-semibold transition-all cursor-pointer rounded-none border ${
                      selectedSize === s
                        ? "border-black bg-black text-white"
                        : "border-[#d8d8d8] bg-white text-[#111111] hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Expedite Order Checkbox */}
            <div className="mt-5">
              <span className="block text-[12px] font-sans-custom uppercase tracking-[0.15em] font-bold text-[#111111] mb-2">
                Expedite Order
              </span>
              <label className="flex items-center space-x-3 p-3 bg-white border border-[#d8d8d8] cursor-pointer hover:border-black transition-colors">
                <input
                  type="checkbox"
                  checked={isExpedited}
                  onChange={(e) => setIsExpedited(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-400 rounded-none focus:ring-black cursor-pointer"
                />
                <span className="text-[11px] font-sans-custom uppercase tracking-[0.1em] font-semibold text-[#111111]">
                  Express-Shipping (5-6 Working Days) [+PKR 8000]
                </span>
              </label>
            </div>

            {/* Quantity Selector */}
            <div className="mt-5">
              <div className="inline-flex items-center border border-[#d8d8d8] rounded-full px-2 py-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center hover:text-black text-[#666666] text-[18px] cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-[13px] font-sans-custom font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center hover:text-black text-[#666666] text-[18px] cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy It Now */}
            <div className="mt-5 space-y-2.5">
              {/* Add to Cart Button (Solid Black as in Screenshot 1) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-[#111111] hover:bg-[#2c2c2c] text-white py-3.5 text-[12px] font-extrabold uppercase tracking-[0.25em] font-sans-custom transition-all duration-300 cursor-pointer shadow-sm rounded-none"
              >
                Add to Cart
              </button>

              {/* Buy It Now Button (White with Black Border as in Screenshot 1) */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-[#111111] py-3.5 text-[12px] font-extrabold uppercase tracking-[0.25em] font-sans-custom transition-all duration-300 cursor-pointer shadow-xs rounded-none"
              >
                Buy It Now
              </button>

              {/* Payment Icons */}
              <div className="flex items-center justify-center space-x-2 pt-1 text-[11px] font-sans-custom text-[#777777]">
                <span>We accept</span>
                <span className="inline-flex items-center px-1.5 py-0.5 border border-gray-300 rounded text-[10px] font-medium text-black">
                  GPay
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 border border-gray-300 rounded text-[10px] font-medium text-black">
                  Apple Pay
                </span>
              </div>

              {/* Order / Chat with Fashion Consultant WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#008000] hover:bg-[#006e00] text-white py-3 px-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] font-sans-custom transition-colors flex items-center justify-center gap-2.5 shadow-sm rounded-none"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Chat with Fashion Consultant
              </a>
            </div>

            {/* Making Time & Delivery Estimate */}
            <div className="mt-6 p-4 bg-[#f9f9f9] border border-[#f0f0f0] text-[13px] font-serif text-[#333333] leading-relaxed">
              <p>
                <strong className="text-black">Making Time:</strong> 12-15 days.
              </p>
              <p className="mt-1">
                <strong className="text-black">Transit time:</strong> Normal 10-12 days, Express 5-6 days.
              </p>
            </div>

            {/* Collapsible Tabs: FAQ and Delivery Policy */}
            <div className="mt-6 border-t border-[#f0f0f0]">
              {/* FAQ Trigger */}
              <button
                onClick={() => setIsFaqOpen(!isFaqOpen)}
                className="w-full py-4 flex items-center justify-between text-left text-[14px] font-serif font-semibold text-[#111111] border-b border-[#f0f0f0] cursor-pointer"
              >
                <span>Frequently Asked Questions (FAQS)</span>
                <span className="text-[18px] font-light text-[#555555]">
                  {isFaqOpen ? "−" : "+"}
                </span>
              </button>
              {isFaqOpen && (
                <div className="py-4 px-1 text-[13px] text-[#555555] font-serif leading-relaxed border-b border-[#f0f0f0] space-y-3">
                  <p>
                    <strong className="text-black">Do you deliver worldwide?</strong>
                    <br />
                    Yes, we deliver worldwide across the USA, UK, Canada, UAE, Europe, and Australia.
                  </p>
                  <p>
                    <strong className="text-black">Can I customize my outfit?</strong>
                    <br />
                    Size customization is available on all couture orders. Please contact our consultant for bespoke adjustments.
                  </p>
                </div>
              )}

              {/* Delivery & Care Trigger */}
              <button
                onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
                className="w-full py-4 flex items-center justify-between text-left text-[14px] font-serif font-semibold text-[#111111] border-b border-[#f0f0f0] cursor-pointer"
              >
                <span>Care Instructions & Fabric Quality</span>
                <span className="text-[18px] font-light text-[#555555]">
                  {isDeliveryOpen ? "−" : "+"}
                </span>
              </button>
              {isDeliveryOpen && (
                <div className="py-4 px-1 text-[13px] text-[#555555] font-serif leading-relaxed border-b border-[#f0f0f0] space-y-2">
                  <p>• Dry clean only recommended for all embellished and silk garments.</p>
                  <p>• Do not use bleach or stain removing chemicals.</p>
                  <p>• Iron at moderate temperature on the reverse side of embellishments.</p>
                </div>
              )}
            </div>

            {/* Full Product Description (HTML or parsed) */}
            {product.body_html && (
              <div className="mt-6 pt-2 text-[14px] font-serif text-[#333333] leading-relaxed prose prose-stone max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: product.body_html }}
                  className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-2 [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto"
                />
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 pt-4 border-t border-[#f0f0f0]">
              <p className="text-[13px] font-serif text-[#333333] leading-relaxed">
                <strong className="text-[#111111]">Disclaimer:</strong> Product color may slightly vary due to photographic lighting sources or your monitor setting.
              </p>
            </div>

            {/* Social Share Buttons */}
            <div className="mt-5 flex items-center gap-6 text-[13px] font-serif text-[#333333]">
              {/* Facebook Share */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://sillhouete.com/products/${product.handle}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#1877F2] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                </svg>
                <span>Share</span>
              </a>

              {/* X (Twitter) Share */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.title)}&url=${encodeURIComponent(`https://sillhouete.com/products/${product.handle}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-black transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Share</span>
              </a>

              {/* Pinterest Pin It */}
              <a
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`https://sillhouete.com/products/${product.handle}`)}&media=${encodeURIComponent(images[0] || "")}&description=${encodeURIComponent(product.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#E60023] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0a12 12 0 00-4.373 23.178c-.07-.633-.134-1.606.028-2.298.146-.625.938-3.977.938-3.977s-.24-.48-.24-1.188c0-1.112.645-1.943 1.448-1.943.683 0 1.012.512 1.012 1.127 0 .687-.437 1.714-.663 2.668-.188.796.4 1.446 1.185 1.446 1.423 0 2.515-1.5 2.515-3.664 0-1.915-1.377-3.255-3.342-3.255-2.276 0-3.612 1.707-3.612 3.472 0 .688.265 1.425.595 1.826a.24.24 0 01.056.228c-.06.252-.196.796-.223.907-.035.146-.116.177-.268.107-1-.465-1.624-1.926-1.624-3.1 0-2.523 1.834-4.84 5.286-4.84 2.775 0 4.932 1.977 4.932 4.62 0 2.757-1.739 4.976-4.151 4.976-.811 0-1.573-.421-1.834-.919l-.498 1.902c-.181.695-.669 1.566-.995 2.097A12 12 0 1012 0z" />
                </svg>
                <span>Pin it</span>
              </a>
            </div>

            {/* Judge.me Style Review Rating */}
            <div className="mt-5 pt-4 border-t border-[#f0f0f0] flex items-center gap-2">
              <div className="flex text-[16px] text-[#008060]">★★★★★</div>
              <span className="text-[13px] font-serif text-[#333333]">1 review</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SIMILAR PRODUCTS SECTION ================= */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="py-14 sm:py-20 border-t border-[#f2f2f2] bg-white">
          <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-[22px] sm:text-[25px] font-semibold uppercase tracking-[0.08em] font-serif text-[#111111]">
                Similar Products
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[18px]">
              {similarProducts.slice(0, 4).map((item) => (
                <Link
                  key={item.handle}
                  href={`/products/${item.handle}`}
                  className="product-card group flex flex-col"
                >
                  <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#f9f9f9]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center"
                      unoptimized
                    />
                    {item.secondaryImage && item.secondaryImage !== item.image && (
                      <Image
                        src={item.secondaryImage}
                        alt={`${item.title} back`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="pt-3 pb-1 text-center">
                    <h3 className="text-[14px] sm:text-[15px] font-serif tracking-[0.025em] text-[#111111] group-hover:text-[#666666] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[14px] text-[#1c1d1d] font-serif font-medium">
                      {formatPrice(item.price, currentCurrency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= SECTION 1: CUSTOMER REVIEWS (JUDGE.ME STYLE - IMAGES 1 & 2) ================= */}
      <ProductReviewsWidget
        productHandle={product.handle}
        productTitle={product.title}
      />

      {/* ================= SECTION 2: LET CUSTOMERS SPEAK FOR US CAROUSEL (IMAGE 3) ================= */}
      <FeaturedReviewsCarousel />

      {/* ================= KEY ACTIVES (EXACT ICONS & DESIGN FROM SILLHOUETE) ================= */}
      <KeyActivesSection />

      {/* ================= SIZE CHART MODAL ================= */}
      {showSizeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setShowSizeModal(false)}
          />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
              <h3 className="text-[18px] font-serif font-bold text-[#111111]">
                Size Guide & Measurement Chart
              </h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-[13px] text-center border-collapse font-sans-custom">
                <thead>
                  <tr className="bg-[#f7f7f7] text-[#111111] uppercase tracking-wider font-semibold border-b">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest (in)</th>
                    <th className="py-2.5 px-3">Waist (in)</th>
                    <th className="py-2.5 px-3">Hip (in)</th>
                    <th className="py-2.5 px-3">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-serif">
                  <tr>
                    <td className="py-2.5 font-bold">XS</td>
                    <td>34</td>
                    <td>26</td>
                    <td>36</td>
                    <td>48</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">S</td>
                    <td>36</td>
                    <td>28</td>
                    <td>38</td>
                    <td>48</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">M</td>
                    <td>38</td>
                    <td>30</td>
                    <td>40</td>
                    <td>49</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">L</td>
                    <td>41</td>
                    <td>33</td>
                    <td>43</td>
                    <td>50</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">XL</td>
                    <td>44</td>
                    <td>36</td>
                    <td>46</td>
                    <td>50</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[12px] font-serif text-[#777777] text-center">
              *All measurements are in inches. Custom sizing is also accommodated upon request via WhatsApp.
            </p>
          </div>
        </div>
      )}
      {/* ================= FLOATING PRODUCT SHORT VIDEO (SILLHOUETE PV-FLOAT) ================= */}
      <FloatingProductVideo
        productHandle={product.handle}
        productTitle={product.title}
      />
    </div>
  );
}
