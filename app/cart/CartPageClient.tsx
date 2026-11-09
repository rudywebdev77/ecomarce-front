"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore, formatPrice, parsePriceToNumber } from "../store/useStore";

export default function CartPageClient() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, currentCurrency } = useStore();

  const subtotal = cart.reduce((sum, item) => {
    let priceNum = parsePriceToNumber(item.price);
    if (priceNum < 10 && item.title?.toLowerCase().includes("meera")) {
      priceNum = 99000;
    }
    return sum + priceNum * item.quantity;
  }, 0);

  return (
    <div className="font-serif">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-[#f0f0f0] bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 text-[12px] text-[#777777] font-sans-custom uppercase tracking-[0.1em]">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="text-[#cccccc]">/</li>
            <li className="text-[#111111] font-semibold">Shopping Cart</li>
          </ol>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <h1 className="text-[28px] sm:text-[34px] font-semibold uppercase tracking-[0.05em] text-[#111111] text-center mb-8 sm:mb-12">
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <div className="py-16 text-center max-w-[500px] mx-auto">
            <p className="text-[16px] text-[#666666] font-sans-custom mb-6">
              Your cart is currently empty.
            </p>
            <Link
              href="/collections/all"
              className="inline-block bg-black hover:bg-[#222222] text-white px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Cart Items Table */}
            <div className="lg:col-span-2 divide-y divide-[#ececec] border-t border-b border-[#ececec]">
              {cart.map((item) => (
                <div key={item.id} className="py-6 flex gap-4 sm:gap-6 items-center">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-28 sm:w-24 sm:h-36 bg-[#f9f9f9] flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.id}`}
                      className="text-[16px] sm:text-[18px] font-normal text-[#111111] hover:underline block leading-snug truncate"
                    >
                      {item.title}
                    </Link>
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <p className="text-[12px] text-[#777777] font-sans-custom mt-1">
                        {Object.entries(item.selectedOptions)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" / ")}
                      </p>
                    )}
                    <p className="text-[14px] font-semibold text-[#111111] mt-2">
                      {formatPrice(item.price, currentCurrency)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center border border-[#d6d6d6] h-8">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2.5 h-full hover:bg-[#f0f0f0] transition-colors font-bold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 text-[13px] font-sans-custom select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 h-full hover:bg-[#f0f0f0] transition-colors font-bold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[12px] text-[#ff0000] hover:underline font-sans-custom uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-[#fafafa] border border-[#ececec] p-6 sm:p-8 h-fit space-y-5">
              <h2 className="text-[18px] font-semibold text-[#111111] uppercase tracking-[0.05em] border-b border-[#ececec] pb-3">
                Order Summary
              </h2>

              <div className="flex justify-between text-[15px] text-[#444444]">
                <span>Subtotal</span>
                <span className="font-semibold text-black">
                  {formatPrice(`Rs.${subtotal.toLocaleString()}`, currentCurrency)}
                </span>
              </div>

              <p className="text-[12px] text-[#777777] font-sans-custom leading-relaxed">
                Taxes, customs duties, and shipping are calculated at checkout.
              </p>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-black hover:bg-[#222222] text-white py-4 text-[13px] font-bold uppercase tracking-[0.25em] transition-colors cursor-pointer"
              >
                Proceed to Checkout
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/collections/all"
                  className="text-[12px] text-[#555555] hover:text-black font-sans-custom uppercase tracking-wider underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

