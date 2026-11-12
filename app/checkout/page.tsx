"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useStore, parsePriceToNumber } from "../store/useStore";
import { API_BASE } from "../lib/api";

function formatShopifyPrice(amount: number): string {
  return `Rs ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Intercept benign Stripe Dahlia test mode console notices to prevent Turbopack dev error overlays
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Unhandled paymentForm Element loaderror") ||
        args[0].includes("Unhandled paymentForm"))
    ) {
      console.warn("[Stripe Notice - Handled]:", ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, currentCurrency, clearCart } = useStore();

  // Contact States
  const [email, setEmail] = useState("");
  const [emailOffers, setEmailOffers] = useState(true);

  // Delivery States
  const [country, setCountry] = useState("Pakistan");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);

  // Payment Selection
  const [paymentOption, setPaymentOption] = useState<"credit_card">("credit_card");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, _setCardName] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const customerRef = useRef<any>({});
  const [stripeScriptLoaded, setStripeScriptLoaded] = useState(
    typeof window !== "undefined" && Boolean((window as any).Stripe)
  );
  const checkoutFormRef = useRef<any>(null);
  const actionsRef = useRef<any>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");
  const isInitializingRef = useRef<boolean>(false);

  useEffect(() => {
    // Clear any stale session storage keys on checkout page mount
    if (typeof window !== "undefined") {
      try {
        sessionStorage.clear();
        const savedUserStr = localStorage.getItem("sillhouete_cust_user");
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser?.email) setEmail((prev) => prev || savedUser.email);
          if (savedUser?.first_name) setFirstName((prev) => prev || savedUser.first_name);
          if (savedUser?.last_name) setLastName((prev) => prev || savedUser.last_name);
          if (savedUser?.phone) setPhone((prev) => prev || savedUser.phone);
          if (savedUser?.address) setAddress((prev) => prev || savedUser.address);
          if (savedUser?.city) setCity((prev) => prev || savedUser.city);
          if (savedUser?.country) setCountry(savedUser.country);
          customerRef.current = {
            ...customerRef.current,
            email: customerRef.current.email || savedUser?.email || "",
            first_name: customerRef.current.first_name || savedUser?.first_name || "",
            last_name: customerRef.current.last_name || savedUser?.last_name || "",
            phone: customerRef.current.phone || savedUser?.phone || "",
            address: customerRef.current.address || savedUser?.address || "",
            city: customerRef.current.city || savedUser?.city || "",
            country: savedUser?.country || customerRef.current.country || "Pakistan",
          };
        }
      } catch {}
    }
    if (typeof window !== "undefined" && (window as any).Stripe) {
      setStripeScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    customerRef.current = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      address,
      apartment,
      city,
      country,
      postal_code: postalCode,
    };
  }, [firstName, lastName, email, phone, address, apartment, city, country, postalCode]);

  // UI state
  const [showItemDetails, setShowItemDetails] = useState(true);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Items to display: real cart or realistic Sillhouete default from live site
  const items =
    cart.length > 0
      ? cart
      : [
          {
            id: "bella-xs-sample",
            title: "Bella",
            size: "XS",
            quantity: 1,
            price: "Rs 31,500.00",
            raw_price: 31500,
            image:
              "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-sublime-Lilac-intricate-embroidery.jpg?v=1776332402",
            color: "None",
            sleeves: "Same as sample",
          },
        ];

  // Price calculations
  const subtotalPKR = items.reduce((sum, item: any) => {
    let p = parsePriceToNumber(item.price || item.raw_price);
    if (!p || p < 10) p = 31500;
    return sum + p * (item.quantity || 1);
  }, 0);

  const shippingFeePKR = 0; // Standard Free Shipping as in official screenshot
  const discountAmountPKR = Math.round((subtotalPKR * discountPercent) / 100);
  const totalPKR = Math.max(0, subtotalPKR + shippingFeePKR - discountAmountPKR);

  // Card formatting
  const _handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const _handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)} / ${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  const _handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvc(raw);
  };

  // Coupon handler (checks database settings with fallback)
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch(`${API_BASE}/settings/discount-codes`);
      if (res.ok) {
        const data = await res.json();
        const found = (data.discount_codes || []).find(
          (c: any) => c.code?.toUpperCase() === code && c.active !== false
        );
        if (found) {
          setDiscountPercent(Number(found.discount_percent));
          setCouponSuccess(
            `${found.discount_percent}% discount applied!${found.description ? ` (${found.description})` : ""}`
          );
          return;
        }
      }
    } catch (err) {
      console.warn("Could not query dynamic discount codes:", err);
    }

    // Fallback checks
    if (code === "SILLHOUETE10" || code === "WELCOME10") {
      setDiscountPercent(10);
      setCouponSuccess("10% discount applied!");
    } else if (code === "BRIDAL20") {
      setDiscountPercent(20);
      setCouponSuccess("20% bridal discount applied!");
    } else {
      setCouponError("Enter a valid discount code");
    }
  };

  // Initialize Official Stripe Dahlia Checkout Form SDK
  useEffect(() => {
    if (paymentOption !== "credit_card" || !stripeScriptLoaded) return;
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    let isMounted = true;

    async function initStripeDahlia() {
      try {
        const pubKey =
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
          "pk_test_51UXa0rRw0xKXArPAVIU4r52Vy8hYzi8i1UrqgtTZt0iLAukBO2yLbGfi1KguWjIigB7KlZTcHj9OKJM7rGGTwMGL00aCCo9rFP";

        const StripeConstructor = (window as any).Stripe;
        if (!StripeConstructor) return;
        const stripeObj = StripeConstructor(pubKey);
        if (!stripeObj?.initCheckoutFormSdk) return;

        // Fetch fresh checkout session directly (no stale caching)
        const res = await fetch(`${API_BASE}/payments/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPKR,
            currency: (currentCurrency || "PKR").toLowerCase(),
            customer: customerRef.current,
            items,
            subtotal: subtotalPKR,
            shipping_fee: shippingFeePKR,
            discount: discountAmountPKR,
            total: totalPKR,
          }),
        });

        const data = await res.json();
        if (!data.client_secret || !isMounted) return;

        const clientSecret = data.client_secret;
        sessionIdRef.current = data.sessionId || "";

        const appearance = {
          theme: "stripe" as const,
          inputs: "spaced" as const,
          labels: "auto" as const,
          variables: {
            borderRadius: "4px",
            colorBackground: "#ffffff",
            colorDanger: "#df1b41",
            colorPrimary: "#005bd3",
            colorSuccess: "#00c853",
            colorText: "#30313d",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSizeBase: "14px",
            spacingUnit: "4px",
          },
        };

        const checkout = stripeObj.initCheckoutFormSdk({
          clientSecret,
          appearance,
        });

        if (formContainerRef.current && isMounted) {
          if (checkoutFormRef.current?.unmount) {
            try {
              checkoutFormRef.current.unmount();
            } catch {}
            checkoutFormRef.current = null;
          }

          formContainerRef.current.innerHTML = "";

          const form = checkout.createForm({
            layout: "expanded",
          });

          // Prevent unhandled error
          form.on("loaderror", () => {});
          if ((form as any).__element?.on) {
            try {
              (form as any).__element.on("loaderror", () => {});
            } catch {}
          }

          form.mount("#checkout-form");
          checkoutFormRef.current = form;

          try {
            const loadActionsResult = await checkout.loadActions();
            if (loadActionsResult?.type === "success") {
              actionsRef.current = loadActionsResult.actions;
              form.on("confirm", (event: any) => {
                if (sessionIdRef.current) {
                  fetch(`${API_BASE}/payments/update-session-customer`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    keepalive: true,
                    body: JSON.stringify({
                      sessionId: sessionIdRef.current,
                      customer: customerRef.current,
                    }),
                  }).catch(() => {});
                }
                loadActionsResult.actions.confirm({ formConfirmEvent: event });
              });
            }
          } catch (actionsErr) {
            console.warn("checkout.loadActions notice:", actionsErr);
          }
        }
      } catch (err) {
        console.warn("Stripe init notice:", err);
      } finally {
        isInitializingRef.current = false;
      }
    }

    initStripeDahlia();

    return () => {
      isMounted = false;
      isInitializingRef.current = false;
      if (checkoutFormRef.current?.unmount) {
        try {
          checkoutFormRef.current.unmount();
        } catch {}
        checkoutFormRef.current = null;
      }
    };
  }, [paymentOption, totalPKR, stripeScriptLoaded]);

  // Order Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (!email || !firstName || !address || !city) {
      setCheckoutError("Please fill out your contact name, email, and delivery address.");
      return;
    }

    if (actionsRef.current?.confirm) {
      actionsRef.current.confirm();
      return;
    }

    const cleanCard = cardNumber.replace(/\s/g, "");
    if (!cleanCard || cleanCard.length < 14) {
      setCheckoutError("Please enter a valid credit or debit card number.");
      return;
    }
    if (!cardExpiry || cardExpiry.length < 4) {
      setCheckoutError("Please enter a valid expiration date (MM / YY).");
      return;
    }
    if (!cardCvc || cardCvc.length < 3) {
      setCheckoutError("Please enter a valid 3 or 4-digit security code (CVC).");
      return;
    }

    setIsProcessing(true);

    try {
      const customerData = {
        first_name: firstName || "Customer",
        last_name: lastName || "",
        email,
        phone,
        address,
        apartment,
        city,
        country,
        postal_code: postalCode,
      };

      const orderPayload = {
        customer: customerData,
        items: items.map((i: any) => {
          const numPrice = parsePriceToNumber(i.price || i.raw_price) || 31500;
          return {
            id: i.id,
            title: i.title,
            price: `Rs.${numPrice.toLocaleString()}`,
            raw_price: numPrice,
            quantity: i.quantity || 1,
            size: i.size || "Standard",
            image: i.image,
          };
        }),
        subtotal: subtotalPKR,
        shipping_fee: shippingFeePKR,
        discount: discountAmountPKR,
        total: totalPKR,
        currency: currentCurrency || "PKR",
        shipping_method: "Standard Free Delivery",
      };

      const intentRes = await fetch(`${API_BASE}/payments/create-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPKR,
          currency: (currentCurrency || "PKR").toLowerCase(),
          customer: customerData,
          card: {
            number: cardNumber,
            expiry: cardExpiry,
            cvc: cardCvc,
            name: cardName,
          },
          items,
        }),
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentData.error || "Failed to initialize card transaction");
      }

      const confirmRes = await fetch(`${API_BASE}/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: intentData.paymentIntentId,
          ...orderPayload,
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        throw new Error(confirmData.error || "Payment transaction could not be processed");
      }

      clearCart();
      router.push(
        `/order-success?orderId=${confirmData.order.id}&number=${confirmData.order.order_number}&email=${encodeURIComponent(
          email
        )}&total=${totalPKR}&method=stripe`
      );
    } catch (err: any) {
      console.error("Order error:", err);
      setCheckoutError(err.message || "An error occurred during checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Reusable: Order Summary Content (used in both mobile & desktop)    */
  /* ------------------------------------------------------------------ */
  const renderOrderSummary = () => (
    <>
      {/* Cart Items List */}
      {items.map((item: any, idx: number) => {
        const p = parsePriceToNumber(item.price || item.raw_price) || 31500;
        return (
          <div key={item.id || idx} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {/* Thumbnail with quantity badge */}
                <div className="w-14 h-16 relative bg-white rounded-md border border-[#e5e5e5] shrink-0 overflow-visible shadow-2xs">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover rounded-md"
                      sizes="56px"
                      unoptimized
                    />
                  )}
                  <span className="absolute -top-2 -right-2 bg-[#707070] text-white text-[11px] font-medium w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-2xs">
                    {item.quantity || 1}
                  </span>
                </div>

                {/* Item Details */}
                <div>
                  <p className="text-[14px] font-medium text-[#111111] leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[12px] text-[#707070] mt-0.5">
                    {item.size || "XS"} / {item.color || "None"} / None
                  </p>
                  <p className="text-[12px] text-[#707070]">
                    Sleeves: {item.sleeves || "Same as sample"}
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowItemDetails(!showItemDetails)}
                    className="text-[12px] text-[#707070] hover:text-black flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <span>{showItemDetails ? "Hide 2 items" : "Show 2 items"}</span>
                    <span className="text-[10px]">{showItemDetails ? "▲" : "▼"}</span>
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-right text-[14px] font-normal text-[#111111] shrink-0">
                {formatShopifyPrice(p)}
              </div>
            </div>

            {/* Collapsible Indented Sub-items */}
            {showItemDetails && (
              <div className="pl-6 space-y-2 text-[12px] text-[#707070] pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-7 relative bg-white rounded-xs border border-[#e5e5e5] overflow-hidden shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="24px"
                        unoptimized
                      />
                    )}
                  </div>
                  <span>1 × {item.title}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-7 rounded-xs border border-[#e5e5e5] bg-white flex items-center justify-center text-[#aaaaaa] shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>1 × Same as Sample</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Discount Code Input Row */}
      <div className="pt-3">
        <div className="flex gap-2.5">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Discount code"
            className="flex-1 px-3.5 py-2.5 border border-[#d9d9d9] rounded-md text-[14px] bg-white text-[#333333] placeholder-[#707070] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none shadow-2xs"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="bg-[#f0f0f0] hover:bg-[#e4e4e4] text-[#333333] border border-[#d9d9d9] rounded-md px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer shadow-2xs"
          >
            Apply
          </button>
        </div>

        {couponSuccess && (
          <p className="text-[12px] text-emerald-700 mt-2">✓ {couponSuccess}</p>
        )}
        {couponError && (
          <p className="text-[12px] text-red-600 mt-2">{couponError}</p>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-3 pt-3 text-[14px]">
        <div className="flex justify-between text-[#555555]">
          <span>Subtotal</span>
          <span className="font-normal text-[#111111]">
            {formatShopifyPrice(subtotalPKR)}
          </span>
        </div>

        <div className="flex justify-between text-[#555555] items-center">
          <span className="flex items-center gap-1.5">
            <span>Shipping</span>
            <div
              className="w-3.5 h-3.5 rounded-full border border-[#999999] text-[#707070] flex items-center justify-center text-[9px] font-bold cursor-help"
              title="Standard Free Shipping across Pakistan"
            >
              ?
            </div>
          </span>
          <span className="font-normal text-[#111111]">
            {shippingFeePKR === 0 ? "FREE" : formatShopifyPrice(shippingFeePKR)}
          </span>
        </div>

        {discountAmountPKR > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount ({discountPercent}%)</span>
            <span>-{formatShopifyPrice(discountAmountPKR)}</span>
          </div>
        )}

        {/* Total Amount Row */}
        <div className="flex justify-between items-baseline pt-4 border-t border-[#e6e6e6]">
          <span className="text-[16px] font-medium text-[#111111]">Total</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[12px] text-[#707070]">PKR</span>
            <span className="text-[20px] font-semibold text-[#111111]">
              {formatShopifyPrice(totalPKR)}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white text-[#333333] font-sans antialiased selection:bg-[#005bd3] selection:text-white flex flex-col">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: Centered Logo & Right Bag Icon              */}
      {/* ========================================================= */}
      <header className="border-b border-[#e6e6e6] bg-white py-5 px-4 sm:px-8 shrink-0">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="w-8" />

          <Link href="/" className="inline-block mx-auto hover:opacity-90 transition-opacity">
            <Image
              src="https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png?v=1744702089&width=220"
              alt="Sillhouete"
              width={165}
              height={44}
              className="h-10 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>

          <Link
            href="/cart"
            className="text-[#005bd3] hover:text-[#004bb5] transition-colors p-1"
            title="Return to Cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ========================================================= */}
      {/* Mobile Order Summary Accordion (< lg screens only)         */}
      {/* ========================================================= */}
      <div className="lg:hidden border-b border-[#e6e6e6] bg-[#f5f5f5]">
        <button
          type="button"
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-[14px] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#005bd3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="font-medium text-[#005bd3]">
              {showMobileSummary ? "Hide order summary" : "Show order summary"}
            </span>
            <span className="text-[10px] text-[#707070]">{showMobileSummary ? "▲" : "▼"}</span>
          </div>
          <span className="font-semibold text-[#111111]">{formatShopifyPrice(totalPKR)}</span>
        </button>

        {showMobileSummary && (
          <div className="px-4 pb-6 pt-2 border-t border-[#e6e6e6] space-y-4">
            {renderOrderSummary()}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN CHECKOUT: Full-Bleed Two Column Flexbox Layout     */}
      {/* Left = Pure White (#ffffff)  |  Right = Soft Gray (#f5f5f5)*/}
      {/* No overflow-x-hidden → sticky works perfectly              */}
      {/* ========================================================= */}
      <div className="flex-1 w-full flex flex-col lg:flex-row min-h-[calc(100vh-85px)]">

        {/* ======================================================= */}
        {/* LEFT COLUMN: Form (56% desktop, white)                   */}
        {/* ======================================================= */}
        <div className="w-full lg:w-[56%] xl:w-[58%] bg-white flex justify-end">
          <form onSubmit={handleSubmitOrder} className="w-full max-w-[620px] px-4 sm:px-8 lg:pl-8 lg:pr-14 py-8 lg:py-10 space-y-6">

            {checkoutError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-md">
                {checkoutError}
              </div>
            )}

            {/* ----------------- A. CONTACT ----------------- */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-[17px] font-medium text-[#111111]">Contact</h2>
                <Link href="/login" className="text-[13px] text-[#005bd3] hover:underline font-normal">
                  Sign in
                </Link>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or mobile phone number"
                  className="w-full px-3.5 py-3 pr-10 border border-[#d9d9d9] rounded-md text-[14px] text-[#333333] placeholder-[#707070] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all"
                />
                <div
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-[#999999] text-[#707070] flex items-center justify-center text-[10px] font-bold cursor-help"
                  title="In case we need to contact you about your order"
                >
                  ?
                </div>
              </div>

              <label className="flex items-center gap-2.5 mt-2.5 cursor-pointer text-[13px] text-[#333333]">
                <input
                  type="checkbox"
                  checked={emailOffers}
                  onChange={(e) => setEmailOffers(e.target.checked)}
                  className="w-4 h-4 rounded-xs accent-[#005bd3] text-[#005bd3]"
                />
                <span>Email me with news and offers</span>
              </label>
            </div>

            {/* ----------------- B. DELIVERY ----------------- */}
            <div>
              <h2 className="text-[17px] font-medium text-[#111111] mb-2.5">Delivery</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#707070] uppercase tracking-wider mb-1">
                    Country/Region
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#d9d9d9] rounded-md text-[14px] text-[#333333] bg-white focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#d9d9d9] rounded-md text-[14px] text-[#333333] placeholder-[#707070] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#d9d9d9] rounded-md text-[14px] text-[#333333] placeholder-[#707070] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-3 border border-[#d9d9d9] rounded-md text-[14px] text-[#333333] placeholder-[#707070] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all"
                />

                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full px-3.5 py-3 border border-[#d9d9d9] rounded-md text-[14px] text-[#333333] placeholder-[#707070] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#d9d9d9] rounded-md text-[14px] text-[#333333] placeholder-[#707070] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Postal code (optional)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#d9d9d9] rounded-md text-[14px] text-[#333333] placeholder-[#707070] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 pr-10 border border-[#d9d9d9] rounded-md text-[14px] text-[#333333] placeholder-[#707070] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all"
                  />
                  <div
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-[#999999] text-[#707070] flex items-center justify-center text-[10px] font-bold cursor-help"
                    title="In case we need to contact you about your order"
                  >
                    ?
                  </div>
                </div>

                <label className="flex items-center gap-2.5 pt-1 cursor-pointer text-[13px] text-[#333333]">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="w-4 h-4 rounded-xs accent-[#005bd3] text-[#005bd3]"
                  />
                  <span>Save this information for next time</span>
                </label>
              </div>
            </div>

            {/* ----------------- C. SHIPPING METHOD ----------------- */}
            <div>
              <h2 className="text-[17px] font-medium text-[#111111] mb-2.5">Shipping method</h2>
              <div className="p-3.5 border border-[#005bd3] bg-[#f0f5ff] rounded-md flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#111111]">Standard</span>
                <span className="text-[14px] font-semibold text-[#111111]">FREE</span>
              </div>
            </div>

            {/* ----------------- D. PAYMENT ----------------- */}
            <div>
              <h2 className="text-[17px] font-medium text-[#111111] mb-1">Payment</h2>
              <p className="text-[13px] text-[#707070] mb-3">
                All transactions are secure and encrypted.
              </p>

              <div className="border border-[#d9d9d9] rounded-md overflow-hidden divide-y divide-[#d9d9d9]">
                {/* Option 1: Credit card */}
                <div>
                  <label
                    onClick={() => setPaymentOption("credit_card")}
                    className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                      paymentOption === "credit_card" ? "bg-[#f0f5ff]" : "bg-white hover:bg-[#fafafa]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_accordion"
                        checked={paymentOption === "credit_card"}
                        onChange={() => setPaymentOption("credit_card")}
                        className="w-4 h-4 accent-[#005bd3] text-[#005bd3]"
                      />
                      <span className="text-[14px] font-medium text-[#111111]">Credit card</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center justify-center bg-[#1434CB] text-white font-bold italic text-[9px] px-2 py-0.5 rounded-[3px] tracking-wider">VISA</span>
                      <span className="inline-flex items-center justify-center bg-white border border-[#e5e5e5] px-1 py-0.5 rounded-[3px]">
                        <svg className="w-5 h-3.5" viewBox="0 0 36 24" fill="none">
                          <circle cx="14" cy="12" r="10" fill="#EB001B" />
                          <circle cx="22" cy="12" r="10" fill="#F79E1B" fillOpacity="0.85" />
                        </svg>
                      </span>
                      <span className="inline-flex items-center justify-center bg-[#006FCF] text-white font-bold text-[8px] px-1.5 py-0.5 rounded-[3px] tracking-wider">AMEX</span>
                      <span className="inline-flex items-center justify-center bg-[#f0f0f0] text-[#555] font-semibold text-[9px] px-1.5 py-0.5 rounded-[3px] border border-[#d9d9d9]">+3</span>
                    </div>
                  </label>

                  {/* Official Stripe Dahlia Checkout Form */}
                  {paymentOption === "credit_card" && (
                    <div className="p-4 bg-white border-t border-[#d9d9d9]">
                      <div ref={formContainerRef} id="checkout-form" className="min-h-[220px]" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ----------------- E. POLICIES ----------------- */}
            <div className="pt-3 pb-4">
              <Link href="/policies" className="text-[12px] text-[#005bd3] hover:underline">
                Terms and policies
              </Link>
            </div>
          </form>
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: Order Summary (44% desktop, #f5f5f5)       */}
        {/* sticky top-0 self-start → stays pinned while scrolling   */}
        {/* No overflow-x-hidden anywhere → sticky works perfectly   */}
        {/* ======================================================= */}
        <div className="hidden lg:flex w-full lg:w-[44%] xl:w-[42%] bg-[#f5f5f5] lg:border-l border-[#e6e6e6] justify-start">
          <div className="w-full max-w-[480px] px-4 sm:px-8 lg:pr-8 lg:pl-12 py-8 lg:py-10 sticky top-0 self-start space-y-4">
            {renderOrderSummary()}
          </div>
        </div>
      </div>

      {/* Stripe Dahlia Checkout Form SDK Script */}
      <Script
        src="https://js.stripe.com/dahlia/stripe.js"
        strategy="afterInteractive"
        onLoad={() => setStripeScriptLoaded(true)}
      />
    </div>
  );
}
