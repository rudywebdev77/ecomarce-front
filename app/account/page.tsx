"use client";

import React, { useState } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileNavDrawer from "../components/MobileNavDrawer";
import CartDrawer from "../components/CartDrawer";
import SearchModal from "../components/SearchModal";
import CurrencySwitcher from "../components/CurrencySwitcher";
import WhatsAppButton from "../components/WhatsAppButton";

export default function AccountPage() {
  const [isRecover, setIsRecover] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverSubmitted, setRecoverSubmitted] = useState(false);
  const [loginSubmitted, setLoginSubmitted] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitted(true);
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-serif">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-[480px] mx-auto">
          {!isRecover ? (
            /* Login Form */
            <div>
              <div className="text-center mb-8">
                <h1 className="text-[28px] sm:text-[32px] font-semibold uppercase tracking-[0.05em] text-[#111111]">
                  Login
                </h1>
              </div>

              {loginSubmitted ? (
                <div className="p-4 bg-[#f8f8f8] border border-[#e8e8e1] text-center mb-6 text-[14px]">
                  Welcome back! You are logged in as <span className="font-semibold">{email}</span>.
                </div>
              ) : null}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="CustomerEmail"
                    className="block text-[13px] uppercase tracking-[0.05em] font-sans-custom font-semibold text-[#333333] mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="CustomerEmail"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#e8e8e1] text-[14px] font-sans-custom outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="CustomerPassword"
                      className="block text-[13px] uppercase tracking-[0.05em] font-sans-custom font-semibold text-[#333333]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsRecover(true)}
                      className="text-[12px] font-sans-custom text-[#666666] hover:text-black hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    id="CustomerPassword"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#e8e8e1] text-[14px] font-sans-custom outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full btn-primary py-3.5 text-[12px] tracking-[0.25em]"
                  >
                    Sign In
                  </button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[13px] text-[#666666] font-sans-custom">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => alert("Registration form available. Proceeding with guest checkout.")}
                      className="text-black font-semibold hover:underline"
                    >
                      Create account
                    </button>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* Recover Password Form */
            <div>
              <div className="text-center mb-6">
                <h2 className="text-[26px] sm:text-[30px] font-semibold uppercase tracking-[0.05em] text-[#111111] mb-2">
                  Reset your password
                </h2>
                <p className="text-[14px] text-[#666666] leading-relaxed">
                  We will send you an email to reset your password.
                </p>
              </div>

              {recoverSubmitted ? (
                <div className="p-4 bg-[#f8f8f8] border border-[#e8e8e1] text-center mb-6 text-[14px] text-emerald-800">
                  We&apos;ve sent an email with password reset instructions to <span className="font-semibold">{recoverEmail}</span>.
                </div>
              ) : null}

              <form onSubmit={handleRecover} className="space-y-5">
                <div>
                  <label
                    htmlFor="RecoverEmail"
                    className="block text-[13px] uppercase tracking-[0.05em] font-sans-custom font-semibold text-[#333333] mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="RecoverEmail"
                    required
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#e8e8e1] text-[14px] font-sans-custom outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    className="w-full btn-primary py-3.5 text-[12px] tracking-[0.25em]"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecover(false);
                      setRecoverSubmitted(false);
                    }}
                    className="w-full text-center text-[13px] text-[#666666] hover:text-black font-sans-custom py-2 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <MobileNavDrawer />
      <CartDrawer />
      <SearchModal />
      <CurrencySwitcher />
      <WhatsAppButton />
    </div>
  );
}
