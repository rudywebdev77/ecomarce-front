"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, formatPrice, formatNumberAmount } from "../store/useStore";
import { API_BASE } from "../lib/api";
import siteData from "../site_data.json";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, currentCurrency, clearCart } = useStore();

  // Form states
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("Lahore");
  const [stateRegion, setStateRegion] = useState("Punjab");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [notes, setNotes] = useState("");

  // Shipping
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod" | "bank_transfer">("stripe");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Loading & error
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Calculation
  const subtotalPKR = cart.reduce((sum, item) => {
    const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
    return sum + priceNum * item.quantity;
  }, 0);

  const shippingFeePKR = country === "Pakistan"
    ? (shippingMethod === "express" ? 1500 : 0)
    : (shippingMethod === "express" ? 8500 : 5000);

  const discountAmountPKR = Math.round((subtotalPKR * discountPercent) / 100);
  const totalPKR = Math.max(0, subtotalPKR + shippingFeePKR - discountAmountPKR);

  // Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();
    if (code === "SILLHOUETE10" || code === "WELCOME10") {
      setDiscountPercent(10);
      setCouponSuccess("10% promotional discount applied!");
    } else if (code === "BRIDAL20") {
      setDiscountPercent(20);
      setCouponSuccess("20% bridal discount applied!");
    } else {
      setCouponError("Invalid promo code. Try 'SILLHOUETE10'");
    }
  };

  // Card formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvc(raw);
  };

  // Card brand detection
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, "");
    if (clean.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "MASTERCARD";
    if (/^3[47]/.test(clean)) return "AMEX";
    if (/^6/.test(clean)) return "DISCOVER";
    return "";
  };

  // Form Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (cart.length === 0) {
      setCheckoutError("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!email || !firstName || !address || !city) {
      setCheckoutError("Please fill out all required contact and shipping fields.");
      return;
    }

    if (paymentMethod === "stripe") {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (cleanCard.length < 15 || !cardExpiry || !cardCvc || !cardName) {
        setCheckoutError("Please provide complete credit or debit card details.");
        return;
      }
    }

    setIsProcessing(true);

    try {
      const customerData = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        apartment,
        city,
        state: stateRegion,
        postal_code: postalCode,
        country,
      };

      const orderPayload = {
        customer: customerData,
        items: cart.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          raw_price: parseFloat(i.price.replace(/[^0-9.]/g, "")) || 0,
          quantity: i.quantity,
          size: i.size || "M",
          image: i.image,
        })),
        subtotal: subtotalPKR,
        shipping_fee: shippingFeePKR,
        discount: discountAmountPKR,
        total: totalPKR,
        currency: currentCurrency || "PKR",
        shipping_method: shippingMethod === "express" ? "Express Courier" : "Standard Delivery",
        notes,
      };

      if (paymentMethod === "stripe") {
        // 1. Initialize Payment Intent via backend Stripe endpoint
        const intentRes = await fetch(`${API_BASE}/payments/create-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPKR,
            currency: currentCurrency.toLowerCase() === "pkr" ? "usd" : currentCurrency.toLowerCase(),
            customer: customerData,
            items: cart,
          }),
        });

        const intentData = await intentRes.json();
        if (!intentRes.ok) {
          throw new Error(intentData.error || "Failed to initialize card payment");
        }

        // 2. Direct on-site confirmation of Stripe payment with the backend
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
          throw new Error(confirmData.error || "Failed to complete card payment transaction");
        }

        clearCart();
        router.push(
          `/order-success?orderId=${confirmData.order.id}&number=${confirmData.order.order_number}&email=${encodeURIComponent(
            email
          )}&total=${totalPKR}&method=stripe`
        );
      } else {
        // COD or Bank Transfer
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderPayload,
            payment_method: paymentMethod,
            payment_status: "pending",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to place order");
        }

        clearCart();
        router.push(
          `/order-success?orderId=${data.order.id}&number=${data.order.order_number}&email=${encodeURIComponent(
            email
          )}&total=${totalPKR}&method=${paymentMethod}`
        );
      }
    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      setCheckoutError(err.message || "An error occurred during checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-serif text-[#111111]">
      {/* Top Brand Header */}
      <header className="border-b border-[#e8e8e1] bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Image
              src={siteData.storeInfo.logo}
              alt={siteData.storeInfo.name}
              width={200}
              height={40}
              className="h-[38px] w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-3 text-[12px] font-sans-custom uppercase tracking-[0.1em] text-[#666666]">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure 256-Bit SSL Checkout
            </span>
            <span className="hidden sm:inline text-[#cccccc]">|</span>
            <Link href="/cart" className="hidden sm:inline hover:text-black hover:underline">
              Return to Bag
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {cart.length === 0 ? (
          <div className="bg-white p-12 text-center border border-[#e8e8e1] max-w-[600px] mx-auto space-y-4">
            <h2 className="text-[24px] uppercase tracking-wider font-semibold">Your Shopping Bag is Empty</h2>
            <p className="text-[14px] text-[#666666] font-sans-custom">
              You don&apos;t have any dresses in your bag yet.
            </p>
            <div className="pt-4">
              <Link
                href="/collections/all"
                className="inline-block bg-black text-white px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#222222]"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* ========================================================= */}
              {/* LEFT COLUMN: Customer, Shipping & Payment Form (7 cols)  */}
              {/* ========================================================= */}
              <div className="lg:col-span-7 space-y-8">
                {checkoutError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-[13px] font-sans-custom">
                    ⚠️ {checkoutError}
                  </div>
                )}

                {/* 1. Contact Information */}
                <div className="bg-white p-6 sm:p-8 border border-[#e8e8e1]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#111111]">
                      1. Contact Information
                    </h2>
                    <Link href="/account" className="text-[12px] text-[#666666] hover:text-black underline font-sans-custom">
                      Sign in for faster checkout
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans-custom text-[13px]">
                    <div className="sm:col-span-2">
                      <label className="block text-[#444444] mb-1 font-medium">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      />
                      <span className="text-[11px] text-[#777777] mt-1 block">
                        We will send order confirmation and tracking details to this email.
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[#444444] mb-1 font-medium">Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 300 1234567 or +1 217 555 0199"
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Address */}
                <div className="bg-white p-6 sm:p-8 border border-[#e8e8e1]">
                  <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#111111] mb-4">
                    2. Delivery Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans-custom text-[13px]">
                    <div>
                      <label className="block text-[#444444] mb-1 font-medium">First Name *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#444444] mb-1 font-medium">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[#444444] mb-1 font-medium">Country / Region *</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      >
                        <option value="Pakistan">Pakistan (Domestic Delivery)</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="Other">Other Worldwide</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[#444444] mb-1 font-medium">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Street / Road / Phase"
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#444444] mb-1 font-medium">Apartment, suite, etc. (optional)</label>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Apt, Suite, Floor"
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#444444] mb-1 font-medium">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City (e.g. Lahore, Karachi, London, New York)"
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#444444] mb-1 font-medium">State / Province</label>
                      <input
                        type="text"
                        value={stateRegion}
                        onChange={(e) => setStateRegion(e.target.value)}
                        placeholder="Punjab, Sindh, State"
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#444444] mb-1 font-medium">Postal / Zip Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="54000"
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Shipping Method */}
                <div className="bg-white p-6 sm:p-8 border border-[#e8e8e1]">
                  <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#111111] mb-4">
                    3. Shipping Method
                  </h2>
                  <div className="space-y-3 font-sans-custom text-[13px]">
                    <label
                      className={`flex items-center justify-between p-3.5 border cursor-pointer transition-colors ${
                        shippingMethod === "standard" ? "border-black bg-[#fcfcfc]" : "border-[#e0e0e0] hover:border-[#aaa]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_method"
                          checked={shippingMethod === "standard"}
                          onChange={() => setShippingMethod("standard")}
                          className="accent-black"
                        />
                        <div>
                          <p className="font-semibold text-black">Standard Courier Delivery</p>
                          <p className="text-[12px] text-[#666666]">
                            {country === "Pakistan" ? "3 to 5 business days" : "7 to 10 business days international"}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-black">
                        {country === "Pakistan" ? "FREE" : formatNumberAmount(5000, currentCurrency)}
                      </span>
                    </label>

                    <label
                      className={`flex items-center justify-between p-3.5 border cursor-pointer transition-colors ${
                        shippingMethod === "express" ? "border-black bg-[#fcfcfc]" : "border-[#e0e0e0] hover:border-[#aaa]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_method"
                          checked={shippingMethod === "express"}
                          onChange={() => setShippingMethod("express")}
                          className="accent-black"
                        />
                        <div>
                          <p className="font-semibold text-black">
                            {country === "Pakistan" ? "TCS Urgent Overnight" : "DHL Express Priority (Worldwide)"}
                          </p>
                          <p className="text-[12px] text-[#666666]">
                            {country === "Pakistan" ? "1 to 2 business days" : "3 to 5 business days worldwide"}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-black">
                        {country === "Pakistan" ? formatNumberAmount(1500, currentCurrency) : formatNumberAmount(8500, currentCurrency)}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 4. Payment Method - DIRECT STRIPE ON-SITE */}
                <div className="bg-white p-6 sm:p-8 border border-[#e8e8e1]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#111111]">
                      4. Payment
                    </h2>
                    <span className="text-[11px] font-sans-custom uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                      Encrypted Direct Checkout
                    </span>
                  </div>

                  <p className="text-[13px] text-[#666666] font-sans-custom mb-4">
                    All transactions are secure and encrypted. Enter your payment details directly below:
                  </p>

                  <div className="space-y-4">
                    {/* Stripe Card Payment Option */}
                    <div
                      className={`border p-4 transition-all ${
                        paymentMethod === "stripe" ? "border-black bg-[#fafafa]" : "border-[#e0e0e0]"
                      }`}
                    >
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={paymentMethod === "stripe"}
                            onChange={() => setPaymentMethod("stripe")}
                            className="accent-black"
                          />
                          <span className="font-semibold text-[14px]">Credit / Debit Card (Stripe)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-[#142FBD] text-white font-bold px-1.5 py-0.5 rounded-sm">VISA</span>
                          <span className="text-[10px] bg-[#EB001B] text-white font-bold px-1.5 py-0.5 rounded-sm">MC</span>
                          <span className="text-[10px] bg-[#016FD0] text-white font-bold px-1.5 py-0.5 rounded-sm">AMEX</span>
                        </div>
                      </label>

                      {/* DIRECT EMBEDDED STRIPE CARD FIELDS */}
                      {paymentMethod === "stripe" && (
                        <div className="mt-5 pt-5 border-t border-[#e8e8e1] space-y-4 font-sans-custom text-[13px]">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[#444444] font-medium">Card Number *</label>
                              {getCardBrand(cardNumber) && (
                                <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                                  {getCardBrand(cardNumber)}
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={19}
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="4242 •••• •••• 4242"
                                className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white font-mono text-[14px]"
                              />
                              <div className="absolute right-3 top-2.5 text-[#999999]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[#444444] mb-1 font-medium">Name on Card *</label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="Full name as printed on card"
                              className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#444444] mb-1 font-medium">Expiry Date *</label>
                              <input
                                type="text"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                placeholder="MM / YY"
                                className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white font-mono text-[14px]"
                              />
                            </div>
                            <div>
                              <label className="block text-[#444444] mb-1 font-medium">Security Code (CVC) *</label>
                              <input
                                type="password"
                                maxLength={4}
                                value={cardCvc}
                                onChange={handleCvcChange}
                                placeholder="CVC"
                                className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white font-mono text-[14px]"
                              />
                            </div>
                          </div>

                          <div className="p-3 bg-white border border-[#ececec] flex items-center gap-2.5 text-[11px] text-[#666666]">
                            <svg className="w-4 h-4 text-emerald-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>
                              Payment is processed directly on this page via Stripe. Your card data is never stored on our servers.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cash on Delivery (Pakistan only) */}
                    <div
                      className={`border p-4 transition-all ${
                        paymentMethod === "cod" ? "border-black bg-[#fafafa]" : "border-[#e0e0e0]"
                      }`}
                    >
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="accent-black"
                          />
                          <span className="font-semibold text-[14px]">Cash on Delivery (Pakistan Only)</span>
                        </div>
                        <span className="text-[12px] text-[#666666] font-sans-custom">Pay upon arrival</span>
                      </label>
                      {paymentMethod === "cod" && (
                        <div className="mt-3 pt-3 border-t border-[#e8e8e1] text-[12px] text-[#555555] font-sans-custom">
                          Pay cash to the courier representative when your outfit is delivered to your doorstep.
                        </div>
                      )}
                    </div>

                    {/* Direct Bank Transfer */}
                    <div
                      className={`border p-4 transition-all ${
                        paymentMethod === "bank_transfer" ? "border-black bg-[#fafafa]" : "border-[#e0e0e0]"
                      }`}
                    >
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={paymentMethod === "bank_transfer"}
                            onChange={() => setPaymentMethod("bank_transfer")}
                            className="accent-black"
                          />
                          <span className="font-semibold text-[14px]">Direct Bank Transfer</span>
                        </div>
                      </label>
                      {paymentMethod === "bank_transfer" && (
                        <div className="mt-3 pt-3 border-t border-[#e8e8e1] text-[12px] text-[#555555] font-sans-custom space-y-1.5">
                          <p><strong>Bank:</strong> Habib Bank Limited (HBL) / MCB</p>
                          <p><strong>Account Title:</strong> Sillhouete Couture Pvt Ltd</p>
                          <p><strong>IBAN:</strong> PK36HABB0001234567890123</p>
                          <p className="text-[11px] text-[#777777] pt-1">
                            Please share your payment confirmation slip on WhatsApp at +92 331 0397865 after placing your order.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Order Notes / Bespoke Custom Measurements */}
                <div className="bg-white p-6 sm:p-8 border border-[#e8e8e1]">
                  <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#111111] mb-2">
                    5. Order Notes &amp; Custom Sizing (Optional)
                  </h2>
                  <p className="text-[12px] text-[#666666] font-sans-custom mb-3">
                    If you selected Custom Size or have specific delivery requirements (e.g. wedding event date, custom blouse length), please note them below:
                  </p>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Event date is Dec 15th, please tailor shirt length to 42 inches."
                    className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none font-sans-custom text-[13px] bg-white resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-black text-white hover:bg-[#222222] py-4 text-[13px] font-bold uppercase tracking-[0.25em] transition-all cursor-pointer shadow-md disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <span>Complete Order • {formatNumberAmount(totalPKR, currentCurrency)}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* RIGHT COLUMN: Order Summary & Item List (5 cols)          */}
              {/* ========================================================= */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 sm:p-8 border border-[#e8e8e1]">
                  <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#111111] pb-4 border-b border-[#e8e8e1] flex items-center justify-between">
                    <span>Order Summary</span>
                    <span className="text-[12px] font-normal text-[#666666] font-sans-custom">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                    </span>
                  </h2>

                  {/* Cart Items list */}
                  <div className="divide-y divide-[#f0f0f0] max-h-[360px] overflow-y-auto my-4 pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="py-3 flex items-center gap-4">
                        <div className="relative w-16 h-20 bg-[#f9f9f9] border border-[#e8e8e1] flex-shrink-0 overflow-hidden">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          )}
                          <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-sans-custom font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 font-serif">
                          <h4 className="text-[13px] font-medium text-[#111111] truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[#777777] font-sans-custom uppercase mt-0.5">
                            Size: {item.size || "Standard"}
                          </p>
                          <p className="text-[13px] font-semibold text-[#111111] font-sans-custom mt-1">
                            {formatPrice(item.price, currentCurrency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code Input */}
                  <div className="pt-4 border-t border-[#e8e8e1]">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Discount code (e.g. SILLHOUETE10)"
                        className="flex-1 px-3 py-2 border border-[#d6d6d6] focus:border-black outline-none font-sans-custom text-[12px] uppercase tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-black text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-[#222222]"
                      >
                        Apply
                      </button>
                    </div>
                    {couponSuccess && (
                      <p className="text-[12px] text-emerald-700 font-sans-custom mt-2">
                        ✓ {couponSuccess}
                      </p>
                    )}
                    {couponError && (
                      <p className="text-[12px] text-red-600 font-sans-custom mt-2">
                        ⚠️ {couponError}
                      </p>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 pt-6 border-t border-[#e8e8e1] font-sans-custom text-[13px]">
                    <div className="flex justify-between text-[#555555]">
                      <span>Subtotal</span>
                      <span className="font-medium text-black">
                        {formatNumberAmount(subtotalPKR, currentCurrency)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#555555]">
                      <span>Shipping ({country})</span>
                      <span className="font-medium text-black">
                        {shippingFeePKR === 0 ? "FREE" : formatNumberAmount(shippingFeePKR, currentCurrency)}
                      </span>
                    </div>

                    {discountAmountPKR > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Promo Discount ({discountPercent}%)</span>
                        <span>-{formatNumberAmount(discountAmountPKR, currentCurrency)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-4 border-t border-[#e8e8e1] text-[16px] font-bold text-black font-serif">
                      <span>Total</span>
                      <div className="text-right">
                        <span className="text-[11px] font-normal text-[#777777] font-sans-custom block">
                          Inclusive of all taxes &amp; duties
                        </span>
                        <span>{formatNumberAmount(totalPKR, currentCurrency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust & Guarantee Box */}
                <div className="bg-white p-6 border border-[#e8e8e1] space-y-4 font-sans-custom text-[12px] text-[#555555]">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>100% Authentic Pakistani Designer Couture Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Direct Stripe on-site payment with instant receipt</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Worldwide Tracked Delivery via DHL &amp; FedEx</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

