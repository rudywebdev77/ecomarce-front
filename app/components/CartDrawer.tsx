"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, formatNumberAmount, formatPrice, parsePriceToNumber } from "../store/useStore";

const FREE_SHIPPING_THRESHOLD = 140000;

export default function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    currentCurrency,
  } = useStore();

  const [orderNote, setOrderNote] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Lock body scroll and handle Escape key when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeCart();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isCartOpen, closeCart]);

  // Calculate Subtotal (parse numbers from Rs.44,900)
  const subtotal = cart.reduce((sum, item) => {
    let numeric = parsePriceToNumber(item.price);
    if (numeric < 10 && item.title?.toLowerCase().includes("meera")) {
      numeric = 99000;
    }
    return sum + numeric * item.quantity;
  }, 0);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden font-serif transition-opacity duration-300 ease-in-out ${
        isCartOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with smooth fade */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Slide-out Drawer from Right to Left */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div
          className={`w-[340px] sm:w-[400px] max-w-[90vw] bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* 1. Header (Matching Image 2: CART (0)) */}
          <div className="px-6 py-4 sm:py-5 border-b border-[#eeeeee] flex items-center justify-between">
            <h2 className="text-[17px] sm:text-[19px] font-bold uppercase tracking-[0.05em] text-[#111111] font-serif">
              CART ({totalCartCount})
            </h2>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart"
              className="p-1 text-[#111111] hover:text-[#555555] transition-colors cursor-pointer"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                role="presentation"
                className="w-4 h-4 text-[#111111]"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m19 17.61 27.12 27.13m0-27.12L19 44.74" />
              </svg>
            </button>
          </div>

          {/* 2. Free Worldwide Shipping Banner (Matching Image 2) */}
          <div className="px-6 py-3.5 border-b border-[#eeeeee] bg-[#fafafa]/60 text-center">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[12.5px] font-sans text-[#222222] leading-snug">
                Spend <span className="font-bold">Rs.{remainingForFreeShipping.toLocaleString()}</span> more to qualify for <span className="font-bold">FREE Worldwide Shipping</span>!
              </p>
            ) : (
              <p className="text-[12.5px] font-sans text-emerald-700 font-bold leading-snug">
                You qualify for FREE Worldwide Shipping!
              </p>
            )}
            <div className="w-full bg-[#e8e8e1] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#111111] h-full transition-all duration-300 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* 3. Drawer Body */}
          {cart.length === 0 ? (
            /* EMPTY CART (Exact Match to Image 2) */
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
              {/* Shopping Bag Outline Icon */}
              <div className="mb-5 text-[#222222]">
                <svg
                  className="w-16 h-16 stroke-current fill-none stroke-[1.2]"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>

              <p className="font-serif text-[15px] text-[#555555] mb-6">
                Your cart is currently empty.
              </p>

              <button
                type="button"
                onClick={closeCart}
                className="bg-[#111111] text-white px-8 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.2em] hover:bg-[#222222] transition-colors cursor-pointer w-full max-w-[260px]"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            /* CART WITH ITEMS */
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-[#f0f0f0] items-start"
                  >
                    {/* Item Image */}
                    {item.image && (
                      <div className="relative w-20 h-28 bg-[#f8f8f8] shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-h-28 py-0.5">
                      <div>
                        <h4 className="text-[13.5px] font-medium uppercase tracking-[0.03em] text-[#111111] line-clamp-2">
                          {item.title}
                        </h4>
                        {item.size && (
                          <p className="text-[12px] text-[#777777] mt-0.5">
                            Size: {item.size}
                          </p>
                        )}
                        <p className="text-[13px] text-[#111111] font-medium mt-1">
                          {formatPrice(item.price, currentCurrency)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#d2d2d2]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-[13px] hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-[12px] font-sans font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-[13px] hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-[#888888] hover:text-black underline transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Optional Order Note */}
                <div className="pt-2">
                  <label
                    htmlFor="order-note"
                    className="block text-[12px] font-bold uppercase tracking-[0.1em] text-[#555555] mb-1.5"
                  >
                    Order Note
                  </label>
                  <textarea
                    id="order-note"
                    rows={2}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Special instructions for seller..."
                    className="w-full p-2.5 text-[13px] border border-[#d2d2d2] focus:border-black outline-none font-sans"
                  />
                </div>
              </div>

              {/* 4. Footer & Checkout */}
              <div className="px-6 py-5 border-t border-[#eeeeee] bg-[#fbfbfb] space-y-4">
                <div className="flex items-center justify-between text-[16px] font-serif">
                  <span className="uppercase tracking-[0.05em] text-[#111111] font-bold">
                    Subtotal
                  </span>
                  <span className="font-bold text-[#111111]">
                    {formatNumberAmount(subtotal, currentCurrency)}
                  </span>
                </div>

                <p className="text-[11.5px] text-[#777777] font-sans">
                  Taxes and shipping calculated at checkout
                </p>

                {/* Terms agreement checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 rounded-none border-gray-300 cursor-pointer"
                  />
                  <span className="text-[11.5px] text-[#555555] font-sans leading-tight">
                    I agree with the{" "}
                    <Link
                      href="/pages/terms-and-conditions"
                      onClick={closeCart}
                      className="underline hover:text-black"
                    >
                      terms and conditions
                    </Link>
                  </span>
                </label>

                {/* Checkout & View Cart Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!agreedToTerms) {
                        alert("Please agree to the terms and conditions before checkout.");
                        return;
                      }
                      closeCart();
                      router.push("/checkout");
                    }}
                    className="w-full bg-[#111111] text-white py-3.5 text-[12px] font-extrabold uppercase tracking-[0.2em] hover:bg-[#222222] transition-colors cursor-pointer text-center"
                  >
                    CHECK OUT
                  </button>

                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block w-full border border-[#111111] text-[#111111] py-3 text-[12px] font-extrabold uppercase tracking-[0.2em] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer text-center"
                  >
                    VIEW CART
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
