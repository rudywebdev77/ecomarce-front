"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore, formatNumberAmount, formatPrice } from "../store/useStore";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, currentCurrency } = useStore();

  // Calculate Subtotal (parse numbers from Rs.44,900)
  const subtotal = cart.reduce((sum, item) => {
    const numeric = parseInt(item.price.replace(/[^\d]/g, ""), 10) || 0;
    return sum + numeric * item.quantity;
  }, 0);

  // Free shipping threshold: Rs. 140,000 (roughly $500 as noted in announcement)
  const freeShippingThreshold = 140000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const diffToFree = freeShippingThreshold - subtotal;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col font-serif">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#e8e8e1] flex items-center justify-between">
            <h2 className="text-[18px] font-semibold uppercase tracking-[0.05em] text-[#111111]">
              Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="p-1 text-[#666666] hover:text-black transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-[#fafafa] p-4 border-b border-[#e8e8e1] text-center">
            {diffToFree > 0 ? (
              <p className="text-[12px] sm:text-[13px] text-[#444444] mb-2 font-sans-custom">
                Spend <span className="font-semibold text-black">{formatNumberAmount(diffToFree, currentCurrency)}</span> more to qualify for <span className="font-semibold text-black">FREE Worldwide Shipping</span>!
              </p>
            ) : (
              <p className="text-[12px] sm:text-[13px] text-emerald-800 font-semibold mb-2 font-sans-custom">
                🎉 Congratulations! You qualify for FREE Worldwide Shipping!
              </p>
            )}
            <div className="w-full bg-[#e8e8e1] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#111111] h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <svg
                  className="w-12 h-12 stroke-[#999999] fill-none stroke-1 mb-4"
                  viewBox="0 0 64 64"
                >
                  <rect x="11.375" y="17.863" width="41.25" height="36.75" />
                  <path d="M22.25 18c0-7.105 4.35-9 9.75-9s9.75 1.895 9.75 9" />
                </svg>
                <p className="text-[16px] text-[#555555] mb-6">Your cart is currently empty.</p>
                <button
                  onClick={closeCart}
                  className="btn-primary"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-[#f0f0f0] items-start"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-28 object-cover bg-[#f8f8f8] flex-shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between h-28 py-0.5">
                    <div>
                      <h4 className="text-[14px] font-medium tracking-[0.03em] text-[#111111] line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[13px] text-[#666666] mt-0.5">{formatPrice(item.price, currentCurrency)}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#e8e8e1]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2.5 py-1 text-[13px] hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 text-[12px] font-sans-custom font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2.5 py-1 text-[13px] hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] text-[#888888] hover:text-red-600 underline transition-colors cursor-pointer font-sans-custom"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#e8e8e1] bg-[#fafafa]">
              <div className="flex items-center justify-between text-[16px] font-semibold tracking-[0.05em] mb-2 text-[#111111]">
                <span>SUBTOTAL</span>
                <span>{formatNumberAmount(subtotal, currentCurrency)}</span>
              </div>
              <p className="text-[11px] text-[#777777] font-sans-custom mb-4">
                Taxes and shipping calculated at checkout.
              </p>

              <button
                onClick={() => alert("Proceeding to checkout with " + cart.length + " items.")}
                className="w-full btn-primary py-3.5 text-[12px] tracking-[0.25em]"
              >
                Checkout • {formatNumberAmount(subtotal, currentCurrency)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
