"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileNavDrawer from "../components/MobileNavDrawer";
import CartDrawer from "../components/CartDrawer";
import SearchModal from "../components/SearchModal";
import CurrencySwitcher from "../components/CurrencySwitcher";
import WhatsAppButton from "../components/WhatsAppButton";
import { API_BASE } from "../lib/api";
import { AccountSkeleton } from "../components/SkeletonLoaders";

function parsePriceToNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let s = String(val).trim();
  s = s.replace(/^(Rs\.?|PKR|USD|\$|£|€|CAD\s*\$)\s*/i, "").trim();
  s = s.replace(/,/g, "");
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return 0;
  const n = parseFloat(m[0]);
  return isNaN(n) ? 0 : n;
}

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";
  const urlOrderId = searchParams.get("orderId") || "";

  // Auth states
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login / Register / Forgot Tabs
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [authEmail, setAuthEmail] = useState(urlEmail);
  const [authPassword, setAuthPassword] = useState("");
  const [authFirstName, setAuthFirstName] = useState("");
  const [authLastName, setAuthLastName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState<"request" | "verify_pin" | "new_password">("request");
  const [forgotEmail, setForgotEmail] = useState(urlEmail);
  const [forgotPin, setForgotPin] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  // Cancellation Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const supportWhatsApp = settings?.whatsapp || settings?.store_info?.whatsapp || "";
  const rawWhatsApp = supportWhatsApp ? supportWhatsApp.replace(/[^0-9]/g, "") : "";
  const supportPhone = settings?.phone || settings?.store_info?.phone || "";
  const estimatedDelivery = settings?.estimated_delivery || "3 - 7 Business Days (Worldwide Couture Delivery)";

  const accountConfig = settings?.account_page || {};
  const bannerSubtitle = accountConfig.banner_subtitle || "Sillhouete Atelier • Customer Care";
  const bannerTitle = accountConfig.banner_title || "Customer Account & Orders";
  const bannerDescription = accountConfig.banner_description || "Sign in with the email you used while shopping, or create an account to view your live order tracking.";
  const emptyOrdersTitle = accountConfig.empty_orders_title || "No Shopping Orders Yet";
  const emptyOrdersDesc = accountConfig.empty_orders_description || "When you purchase any Pakistani designer dress from Sillhouete, its live tailoring and delivery status will appear here automatically.";
  const emptyOrdersBtnText = accountConfig.empty_orders_btn_text || "Explore Bridal & Formal Collections";
  const emptyOrdersBtnLink = accountConfig.empty_orders_btn_link || "/collections/all";
  const whatsappTemplate = accountConfig.whatsapp_inquiry_template || "Hello Sillhouete Boutique, I want to inquire about my order {order_id}.";
  const helplineLabel = accountConfig.helpline_label || "Boutique Helpline";

  const handleLogout = () => {
    setToken(null);
    setCustomer(null);
    setOrders([]);
    setActiveOrder(null);
    setAuthMode("login");
    setForgotStep("request");
    setForgotEmail("");
    setForgotPin("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotSuccessMsg("");
    setForgotError("");
    setAuthPassword("");
    setAuthError("");
    localStorage.removeItem("sillhouete_cust_token");
    localStorage.removeItem("sillhouete_cust_user");
  };

  const autoLoginWithEmail = async (email: string) => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers/access-by-order-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setCustomer(data.customer);
        setOrders(data.orders || []);
        localStorage.setItem("sillhouete_cust_token", data.token);
        localStorage.setItem("sillhouete_cust_user", JSON.stringify(data.customer));
        if (data.orders && data.orders.length > 0) {
          if (urlOrderId) {
            const found = data.orders.find(
              (o: any) => o.id?.toLowerCase() === urlOrderId.toLowerCase() || String(o.order_number) === urlOrderId
            );
            setActiveOrder(found || data.orders[0]);
          } else {
            setActiveOrder(data.orders[0]);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setAuthLoading(false);
      setLoadingAuth(false);
    }
  };

  // Restore customer session on load
  useEffect(() => {
    const savedToken = localStorage.getItem("sillhouete_cust_token");
    const savedCust = localStorage.getItem("sillhouete_cust_user");

    if (savedToken) {
      setToken(savedToken);
      if (savedCust) {
        try {
          setCustomer(JSON.parse(savedCust));
        } catch {
          // ignore
        }
      }

      // Verify and fetch live orders
      fetch(`${API_BASE}/customers/portal/orders`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Session expired");
          return res.json();
        })
        .then((data) => {
          if (data.customer) {
            setCustomer(data.customer);
            localStorage.setItem("sillhouete_cust_user", JSON.stringify(data.customer));
          }
          if (data.orders) {
            setOrders(data.orders);
            if (data.orders.length > 0) {
              // If URL has specific orderId, pick that one; else default to most recent
              if (urlOrderId) {
                const found = data.orders.find(
                  (o: any) => o.id?.toLowerCase() === urlOrderId.toLowerCase() || String(o.order_number) === urlOrderId
                );
                setActiveOrder(found || data.orders[0]);
              } else {
                setActiveOrder(data.orders[0]);
              }
            }
          }
        })
        .catch(() => {
          handleLogout();
        })
        .finally(() => {
          setLoadingAuth(false);
        });
    } else {
      // Auto-lookup if coming from checkout / order-success with URL email
      if (urlEmail) {
        autoLoginWithEmail(urlEmail);
      } else {
        setLoadingAuth(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlEmail, urlOrderId]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE}/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please verify your email address.");
      }

      setToken(data.token);
      setCustomer(data.customer);
      setOrders(data.orders || []);
      localStorage.setItem("sillhouete_cust_token", data.token);
      localStorage.setItem("sillhouete_cust_user", JSON.stringify(data.customer));

      if (data.orders && data.orders.length > 0) {
        setActiveOrder(data.orders[0]);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE}/customers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: authFirstName,
          last_name: authLastName,
          email: authEmail,
          password: authPassword,
          phone: authPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sign up failed.");
      }

      setToken(data.token);
      setCustomer(data.customer);
      setOrders(data.orders || []);
      localStorage.setItem("sillhouete_cust_token", data.token);
      localStorage.setItem("sillhouete_cust_user", JSON.stringify(data.customer));

      if (data.orders && data.orders.length > 0) {
        setActiveOrder(data.orders[0]);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccessMsg("");
    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE}/customers/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset PIN.");
      }

      setForgotSuccessMsg(data.message);
      setForgotStep("verify_pin");
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccessMsg("");

    const cleanPin = (forgotPin || "").trim();
    if (!cleanPin || cleanPin.length !== 6) {
      setForgotError("Please enter the complete 6-digit verification PIN.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE}/customers/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, pin: cleanPin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid PIN. Please check the code sent to your email.");
      }

      setForgotSuccessMsg(data.message || "PIN verified successfully! Now choose your new password.");
      setForgotStep("new_password");
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccessMsg("");

    if (forgotNewPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match. Please re-enter identical passwords.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE}/customers/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          pin: forgotPin,
          new_password: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setToken(data.token);
      setCustomer(data.customer);
      setOrders(data.orders || []);
      localStorage.setItem("sillhouete_cust_token", data.token);
      localStorage.setItem("sillhouete_cust_user", JSON.stringify(data.customer));

      if (data.orders && data.orders.length > 0) {
        setActiveOrder(data.orders[0]);
      }

      // Reset forgot password state completely so next session or logout goes to normal login
      setAuthMode("login");
      setForgotStep("request");
      setForgotPin("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setForgotError("");
      setForgotSuccessMsg("");
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCancelAndRefund = async () => {
    if (!activeOrder?.id) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${activeOrder.id}/cancel-and-refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.isShipped && data.redirectTo) {
          setShowCancelModal(false);
          alert(data.error);
          router.push(data.redirectTo);
          return;
        }
        throw new Error(data.error || "Failed to cancel order.");
      }
      setShowCancelModal(false);
      setCancelSuccessMsg(
        data.message || `Order ${activeOrder.id} has been cancelled and refunded to your payment card.`
      );
      if (data.order) {
        setActiveOrder(data.order);
        // Update in orders list
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const copyOrderNumber = () => {
    if (!activeOrder?.id) return;
    navigator.clipboard.writeText(activeOrder.id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  // 5-Stage Stepper logic (Dynamic from MongoDB)
  const getStageInfo = (status: string) => {
    const s = (status || "").toLowerCase();
    const stageDefs = accountConfig.stages || {};
    if (stageDefs[s]) return stageDefs[s];
    if (s === "cancelled") {
      return { stage: 0, label: "Order Cancelled & Refunded", isCancelled: true };
    }
    if (s === "delivered") {
      return { stage: 5, label: "Delivered", isCancelled: false };
    }
    if (s === "shipped") {
      return { stage: 4, label: "Dispatched & In Transit", isCancelled: false };
    }
    if (s === "confirmed") {
      return { stage: 3, label: "Quality Inspection & Packed", isCancelled: false };
    }
    if (s === "processing") {
      return { stage: 2, label: "Atelier Stitching & Tailoring", isCancelled: false };
    }
    return stageDefs.default || { stage: 1, label: "Order Placed & Confirmed", isCancelled: false };
  };

  const currentStage = activeOrder ? getStageInfo(activeOrder.order_status) : null;

  const progressionSteps = Array.isArray(accountConfig.progression_steps) && accountConfig.progression_steps.length > 0
    ? accountConfig.progression_steps
    : [
        {
          step: 1,
          title: "Order Placed",
          desc: "Order confirmed & payment verified",
          icon: "✓",
        },
        {
          step: 2,
          title: "Atelier Tailoring",
          desc: "Bespoke stitching & luxury craftsmanship",
          icon: "✂",
        },
        {
          step: 3,
          title: "Quality Check",
          desc: "Hand inspection & signature packaging",
          icon: "★",
        },
        {
          step: 4,
          title: "Dispatched",
          desc: "Handed over to courier with tracking",
          icon: "✈",
        },
        {
          step: 5,
          title: "Delivered",
          desc: "Safely received at customer address",
          icon: "♥",
        },
      ];

  if (loadingAuth) {
    return <AccountSkeleton />;
  }

  // ========================================================
  // 1. NOT LOGGED IN: CUSTOMER SIGN IN & REGISTRATION SCREEN
  // ========================================================
  if (!token) {
    return (
      <div className="max-w-[500px] mx-auto py-16 px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-[11px] font-sans-custom uppercase tracking-[0.25em] text-[#888888] font-bold mb-2">
            {bannerSubtitle}
          </p>
          <h1 className="text-[26px] sm:text-[32px] font-semibold uppercase tracking-[0.05em] text-[#111111]">
            {bannerTitle}
          </h1>
          <p className="text-[13px] text-[#666666] font-sans-custom mt-2 leading-relaxed">
            {bannerDescription}
          </p>
        </div>

        <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 sm:p-8 shadow-xs font-sans-custom">
          {authMode === "forgot" ? (
            /* FORGOT PASSWORD WORKFLOW */
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#f0f0f0]">
                <div>
                  <h3 className="text-[16px] font-bold text-[#111111] uppercase tracking-wider">
                    {forgotStep === "request"
                      ? "Reset Password"
                      : forgotStep === "verify_pin"
                      ? "Verify PIN Code"
                      : "Create New Password"}
                  </h3>
                  <p className="text-[12px] text-[#666666] mt-0.5">
                    {forgotStep === "request"
                      ? "Enter your email to receive a 6-digit PIN code"
                      : forgotStep === "verify_pin"
                      ? `Enter the 6-digit PIN code sent to ${forgotEmail}`
                      : "Enter and confirm your new secure password"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setForgotStep("request");
                    setForgotError("");
                    setForgotSuccessMsg("");
                    setForgotPin("");
                    setForgotNewPassword("");
                    setForgotConfirmPassword("");
                  }}
                  className="text-[12px] font-bold text-[#0e3359] hover:underline cursor-pointer"
                >
                  &larr; Back to Login
                </button>
              </div>

              {forgotSuccessMsg && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] rounded-md flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{forgotSuccessMsg}</span>
                </div>
              )}

              {forgotError && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-[12px] rounded-md flex items-start gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotStep === "request" ? (
                /* STEP 1: REQUEST 6-DIGIT PIN */
                <form onSubmit={handleForgotRequest} className="space-y-4 text-[13px]">
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">
                      Account / Shopping Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-[#0e3359] hover:bg-[#0a2542] text-white py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Sending PIN Code...</span>
                        </>
                      ) : (
                        <span>Send Verification PIN &rarr;</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : forgotStep === "verify_pin" ? (
                /* STEP 2: VERIFY 6-DIGIT PIN ONLY */
                <form onSubmit={handleVerifyPinSubmit} className="space-y-4 text-[13px]">
                  <div>
                    <label className="block text-[#444444] font-medium mb-1 text-center">
                      6-Digit Verification PIN
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="------"
                      value={forgotPin}
                      onChange={(e) => setForgotPin(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3.5 py-3 border-2 border-[#0e3359] focus:border-black outline-none rounded-md bg-white text-black text-center text-2xl font-mono tracking-[0.35em] font-bold"
                      autoFocus
                    />
                    <p className="text-[11px] text-[#777777] mt-1 text-center">
                      Please enter the 6-digit code sent to your email.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-[#0e3359] hover:bg-[#0a2542] text-white py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Verifying PIN...</span>
                        </>
                      ) : (
                        <span>Verify PIN Code &rarr;</span>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleForgotRequest}
                      disabled={forgotLoading}
                      className="text-[12px] text-[#777777] hover:text-[#0e3359] underline cursor-pointer"
                    >
                      Didn&apos;t receive the code? Resend PIN
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 3: SET NEW PASSWORD AFTER PIN IS VERIFIED */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-[13px]">
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showForgotNewPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-black p-1 cursor-pointer transition-colors"
                        title={showForgotNewPassword ? "Hide password" : "Show password"}
                      >
                        {showForgotNewPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#444444] font-medium mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showForgotConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Re-enter new password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-black p-1 cursor-pointer transition-colors"
                        title={showForgotConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showForgotConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-[#0e3359] hover:bg-[#0a2542] text-white py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Save New Password &amp; Log In &rarr;</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Tabs: Login / Sign Up */}
              <div className="flex border-b border-[#e5e5e5] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                  className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                    authMode === "login"
                      ? "border-[#0e3359] text-[#0e3359]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }`}
                >
                  Sign In / Order Access
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                  }}
                  className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                    authMode === "register"
                      ? "border-[#0e3359] text-[#0e3359]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {authError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-[12px] rounded-md flex items-start gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{authError}</span>
                </div>
              )}

              {authMode === "login" ? (
                /* SIGN IN FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-[13px]">
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">
                      Shopping / Account Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="The email you used during checkout"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[#444444] font-medium">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("forgot");
                          setForgotStep("request");
                          setForgotEmail(authEmail);
                          setForgotError("");
                          setForgotSuccessMsg("");
                        }}
                        className="text-[12px] text-[#0e3359] hover:underline font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your account password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full px-3.5 py-3 pr-11 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-black p-1 cursor-pointer transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-[#0e3359] hover:bg-[#0a2542] text-white py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                    >
                      {authLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Verifying Orders...</span>
                        </>
                      ) : (
                        <span>Access My Dashboard &rarr;</span>
                      )}
                    </button>
                  </div>

                  <div className="pt-3 text-center text-[12px] text-[#777777] border-t border-[#f0f0f0]">
                    <p>
                      Did you place an order without a password? Just enter your checkout email above and click <strong>Access My Dashboard</strong> to view your live orders.
                    </p>
                  </div>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-[13px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#444444] font-medium mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        placeholder="First Name"
                        value={authFirstName}
                        onChange={(e) => setAuthFirstName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Last Name</label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={authLastName}
                        onChange={(e) => setAuthLastName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#444444] font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="your-email@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[#444444] font-medium mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[#444444] font-medium mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 border border-[#d6d6d6] focus:border-black outline-none rounded-md bg-white text-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-black p-1 cursor-pointer transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-[#0e3359] hover:bg-[#0a2542] text-white py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                    >
                      {authLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <span>Create Customer Account &rarr;</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ========================================================
  // 2. LOGGED IN: CUSTOMER DASHBOARD & ORDER PROGRESSION VIEW
  // ========================================================
  return (
    <div className="max-w-[1050px] mx-auto py-10 sm:py-16 px-4 sm:px-6">
      {/* Customer Profile Banner */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 sm:p-8 shadow-xs mb-8 font-sans-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#f0f0f0] gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#0e3359] text-white flex items-center justify-center font-serif font-bold text-[22px] shrink-0">
              {customer?.first_name ? customer.first_name.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[20px] font-serif font-bold text-black">
                  Welcome, {customer?.first_name} {customer?.last_name}
                </h1>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                  Verified Customer
                </span>
              </div>
              <p className="text-[13px] text-[#6b7280] font-mono mt-0.5">{customer?.email}</p>
              {customer?.phone && (
                <p className="text-[12px] text-[#6b7280] font-mono">{customer.phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/collections/all"
              className="px-4 py-2 border border-[#d1d5db] text-[#374151] hover:text-black hover:bg-[#f3f4f6] text-[11px] font-bold uppercase tracking-wider rounded transition-colors"
            >
              Shop Couture ↗
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 text-[11px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-center sm:text-left">
          <div className="p-3 bg-[#fafafa] rounded-lg border border-[#f0f0f0]">
            <span className="text-[11px] text-[#888888] uppercase tracking-wider">Total Orders</span>
            <p className="text-[18px] font-bold font-mono text-black mt-0.5">{orders.length}</p>
          </div>
          <div className="p-3 bg-[#fafafa] rounded-lg border border-[#f0f0f0]">
            <span className="text-[11px] text-[#888888] uppercase tracking-wider">Active Orders</span>
            <p className="text-[18px] font-bold font-mono text-emerald-700 mt-0.5">
              {orders.filter((o) => o.order_status !== "cancelled" && o.order_status !== "delivered").length}
            </p>
          </div>
          <div className="p-3 bg-[#fafafa] rounded-lg border border-[#f0f0f0]">
            <span className="text-[11px] text-[#888888] uppercase tracking-wider">Total Spent</span>
            <p className="text-[18px] font-bold font-mono text-black mt-0.5">
              Rs.{orders.reduce((sum, o) => sum + (parsePriceToNumber(o.total) || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-[#fafafa] rounded-lg border border-[#f0f0f0]">
            <span className="text-[11px] text-[#888888] uppercase tracking-wider">Default Delivery</span>
            <p className="text-[13px] font-medium text-black mt-1 truncate">
              {customer?.city || customer?.country || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Success Banner */}
      {cancelSuccessMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-sans-custom rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-semibold">Order Cancelled &amp; Refunded</p>
            <p className="mt-0.5">{cancelSuccessMsg}</p>
          </div>
        </div>
      )}

      {/* ORDERS SECTION */}
      {orders.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-12 text-center font-sans-custom space-y-4">
          <div className="w-16 h-16 bg-[#f3f4f6] text-[#9ca3af] rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-[20px] font-serif font-bold text-black">{emptyOrdersTitle}</h2>
          <p className="text-[13px] text-[#666666] max-w-[420px] mx-auto">
            {emptyOrdersDesc}
          </p>
          <div className="pt-2">
            <Link
              href={emptyOrdersBtnLink}
              className="inline-block bg-[#0e3359] hover:bg-[#0a2542] text-white px-8 py-3 text-[12px] font-bold uppercase tracking-[0.2em] rounded-md transition-colors"
            >
              {emptyOrdersBtnText}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6 font-sans-custom">
          {/* Order Selector (if customer has multiple orders) */}
          {orders.length > 1 && (
            <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[12px] font-bold text-[#444444] uppercase tracking-wider">
                  Select Order to Track:
                </span>
                <span className="text-[11px] text-[#777777]">{orders.length} Orders Found</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {orders.map((ord) => {
                  const isSelected = activeOrder?.id === ord.id;
                  const st = getStageInfo(ord.order_status);
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => setActiveOrder(ord)}
                      className={`px-4 py-2.5 rounded-lg text-left shrink-0 transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#0e3359] text-white border-[#0e3359] shadow-xs"
                          : "bg-[#f8fafc] text-[#334155] border-[#e2e8f0] hover:bg-[#e2e8f0]"
                      }`}
                    >
                      <div className="font-mono font-bold text-[13px]">{ord.id}</div>
                      <div className={`text-[11px] ${isSelected ? "text-blue-100" : "text-[#6b7280]"}`}>
                        Rs.{parsePriceToNumber(ord.total).toLocaleString()} &bull; {st.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE ORDER PROGRESSION CARD */}
          {activeOrder && (
            <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#f0f0f0] gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[20px] sm:text-[24px] font-serif font-bold text-black">
                      Order {activeOrder.id}
                    </span>
                    <button
                      type="button"
                      onClick={copyOrderNumber}
                      className="text-[11px] text-[#6b7280] hover:text-black bg-[#f3f4f6] px-2.5 py-1 rounded cursor-pointer font-mono font-medium"
                    >
                      {copiedOrderId ? "✓ Copied" : "Copy Order ID"}
                    </button>
                  </div>
                  <p className="text-[12px] text-[#6b7280] mt-1">
                    Placed on{" "}
                    {activeOrder.created_at
                      ? new Date(activeOrder.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      currentStage?.isCancelled
                        ? "bg-rose-100 text-rose-800"
                        : activeOrder.order_status === "delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-50 text-[#0e3359] border border-blue-200"
                    }`}
                  >
                    {currentStage?.label}
                  </span>

                  <span
                    className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                      activeOrder.payment_status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : activeOrder.payment_status === "refunded"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {activeOrder.payment_status === "paid"
                      ? "✓ Paid (Stripe)"
                      : activeOrder.payment_status === "refunded"
                      ? "✓ Refunded to Card"
                      : "Payment Pending"}
                  </span>
                </div>
              </div>

              {/* 5-Stage Stepper Progression Bar */}
              {!currentStage?.isCancelled ? (
                <div className="py-8">
                  <div className="relative">
                    {/* Progress Bar Line */}
                    <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-[#e5e7eb] -translate-y-1/2 z-0">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((currentStage?.stage || 1) - 1) * 25))}%`,
                        }}
                      />
                    </div>

                    {/* Step Nodes */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                      {progressionSteps.map((st: any) => {
                        const isCompleted = (currentStage?.stage || 1) >= st.step;
                        const isCurrent = (currentStage?.stage || 1) === st.step;

                        return (
                          <div key={st.step} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] transition-transform shrink-0 ${
                                isCompleted
                                  ? "bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50"
                                  : "bg-white text-[#9ca3af] border-2 border-[#e5e7eb]"
                              } ${isCurrent ? "scale-110 ring-4 ring-blue-100" : ""}`}
                            >
                              {st.icon}
                            </div>
                            <div>
                              <p
                                className={`text-[13px] font-bold ${
                                  isCompleted ? "text-black" : "text-[#9ca3af]"
                                }`}
                              >
                                {st.title}
                              </p>
                              <p className="text-[11px] text-[#6b7280] leading-tight mt-0.5">
                                {st.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Courier tracking alert */}
                  {activeOrder.tracking_number && (
                    <div className="mt-8 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-between flex-wrap gap-3 text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#64748b]">Courier Tracking Number:</span>
                        <span className="font-mono font-bold text-black">{activeOrder.tracking_number}</span>
                      </div>
                      <span className="text-emerald-700 font-semibold text-[12px]">
                        ✓ Dispatched with tracking
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="font-serif font-bold text-[18px] text-black">
                    This Order Has Been Cancelled
                  </h3>
                  <p className="text-[13px] text-[#666666] max-w-[480px] mx-auto mt-1">
                    Full payment of Rs.{parsePriceToNumber(activeOrder.total).toLocaleString()} has been refunded back to your debit/credit card.
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#f0f0f0] flex items-center justify-between flex-wrap gap-3">
                {rawWhatsApp ? (
                  <a
                    href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent(
                      whatsappTemplate.replace("{order_id}", activeOrder.id || "")
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-bold text-[#25D366] hover:underline flex items-center gap-1.5"
                  >
                    <span>💬 Ask Studio via WhatsApp</span>
                  </a>
                ) : (
                  <span />
                )}

                {!currentStage?.isCancelled && activeOrder.order_status !== "delivered" && (
                  <button
                    type="button"
                    onClick={() => {
                      const statusLower = (activeOrder.order_status || "").toLowerCase();
                      const isShipped =
                        ["shipped", "dispatched", "in_transit"].includes(statusLower) ||
                        (currentStage?.stage ?? 1) >= 4;

                      if (isShipped) {
                        alert(
                          `Order ${activeOrder.id} has already been dispatched/shipped and cannot be cancelled automatically. Redirecting you to Customer Support...`
                        );
                        router.push(
                          `/pages/contact-us?orderId=${encodeURIComponent(activeOrder.id)}&reason=cancellation`
                        );
                      } else {
                        setShowCancelModal(true);
                      }
                    }}
                    style={{ color: "#d92d20", borderColor: "#fecdd3", backgroundColor: "#fff1f2" }}
                    className="px-4 py-2 border text-[11px] font-bold uppercase tracking-wider rounded transition-colors hover:bg-rose-100 cursor-pointer"
                  >
                    Cancel Order &amp; Request Refund
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ACTIVE ORDER ITEMS & DELIVERY DETAILS */}
          {activeOrder && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items List */}
              <div className="lg:col-span-2 bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-[14px] uppercase tracking-wider text-black pb-3 border-b border-[#f0f0f0]">
                  Items in this Order ({activeOrder.items?.length || 0})
                </h3>

                <div className="divide-y divide-[#f0f0f0]">
                  {activeOrder.items?.map((item: any, idx: number) => {
                    const itemImg = item.image || item.selectedOptions?.image || "";
                    return (
                      <div key={idx} className="py-4 flex items-start gap-4">
                        <div className="w-16 h-20 relative rounded bg-[#f7f7f7] overflow-hidden border border-[#e5e5e5] shrink-0 flex items-center justify-center text-[#9ca3af]">
                          {itemImg ? (
                            <Image
                              src={itemImg}
                              alt={item.title || "Product"}
                              fill
                              className="object-cover object-top"
                            />
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-[14px] text-black truncate">
                            {item.title}
                          </h4>
                          <div className="text-[12px] text-[#666666] space-y-0.5 mt-1 font-mono">
                            {item.size && (
                              <div>
                                Size: <span className="text-black font-semibold">{item.size}</span>
                              </div>
                            )}
                            {item.selectedOptions?.sleeves && (
                              <div>
                                Sleeves: <span className="text-black">{item.selectedOptions.sleeves}</span>
                              </div>
                            )}
                            <div>
                              Qty: <span className="text-black font-semibold">{item.quantity || 1}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-semibold text-[13px] text-black font-mono">
                            Rs.{parsePriceToNumber(item.price || item.raw_price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-[#f0f0f0] space-y-2 text-[13px]">
                  <div className="flex justify-between text-[#666666]">
                    <span>Subtotal</span>
                    <span className="font-mono text-black">
                      Rs.{parsePriceToNumber(activeOrder.subtotal || activeOrder.total).toLocaleString()}
                    </span>
                  </div>
                  {activeOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span className="font-mono">-Rs.{parsePriceToNumber(activeOrder.discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#666666]">
                    <span>Worldwide Shipping</span>
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-[16px] font-bold text-black pt-2 border-t border-[#f0f0f0]">
                    <span>Total Charged</span>
                    <span className="font-mono">Rs.{parsePriceToNumber(activeOrder.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-xs space-y-5 text-[13px]">
                <div>
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-black mb-3">
                    Shipping Address
                  </h3>
                  <div className="space-y-1 text-[#555555]">
                    <p className="font-semibold text-black">
                      {activeOrder.customer?.first_name} {activeOrder.customer?.last_name}
                    </p>
                    <p>{activeOrder.customer?.address}</p>
                    {activeOrder.customer?.apartment && <p>{activeOrder.customer.apartment}</p>}
                    <p>
                      {activeOrder.customer?.city ? `${activeOrder.customer.city}, ` : ""}
                      {activeOrder.customer?.country || ""}
                    </p>
                    {activeOrder.customer?.postal_code && (
                      <p className="font-mono">{activeOrder.customer.postal_code}</p>
                    )}
                    {activeOrder.customer?.phone && (
                      <p className="pt-2 text-black font-mono font-medium">{activeOrder.customer.phone}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f0f0f0]">
                  <h4 className="font-bold text-[12px] uppercase tracking-wider text-black mb-2">
                    Estimated Delivery
                  </h4>
                  <p className="text-[#555555]">
                    {currentStage?.isCancelled ? "Cancelled" : estimatedDelivery}
                  </p>
                </div>

                {supportPhone ? (
                  <div className="pt-4 border-t border-[#f0f0f0]">
                    <h4 className="font-bold text-[12px] uppercase tracking-wider text-black mb-2">
                      {helplineLabel}
                    </h4>
                    <a
                      href={`tel:${supportPhone.replace(/[^0-9]/g, "")}`}
                      className="block text-center py-2 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-black font-bold text-[12px] rounded transition-colors"
                    >
                      Call: {supportPhone}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-2xs font-sans-custom">
          <div className="bg-white max-w-[480px] w-full p-6 sm:p-8 rounded-lg shadow-2xl text-left space-y-4 border border-[#e5e7eb]">
            <div className="flex items-center gap-3 text-[#b42318]">
              <div className="w-10 h-10 rounded-full bg-[#fee4e2] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-[#d92d20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-[18px] text-black">
                Cancel Order &amp; Refund Payment?
              </h3>
            </div>

            <p className="text-[13px] text-[#475467] leading-relaxed">
              Are you sure you want to cancel order <strong className="text-black font-mono">{activeOrder.id}</strong>?
            </p>

            <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-[13px] text-[#334155] space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-[#e2e8f0]">
                <span className="text-[#64748b]">Refund Amount:</span>
                <strong className="text-emerald-700 font-mono text-[15px]">
                  Rs.{parsePriceToNumber(activeOrder.total).toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#e2e8f0]">
                <span className="text-[#64748b]">Refund Destination:</span>
                <span className="font-semibold text-black">Original Card (via Stripe)</span>
              </div>
              <div className="text-[11px] text-[#64748b] leading-normal pt-1">
                ✓ Full payment will be credited back immediately to your bank account / card.
              </div>
            </div>

            <div className="pt-3 border-t border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setShowCancelModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 border border-[#cccccc] text-[#333333] hover:bg-[#f5f5f5] text-[12px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelAndRefund}
                style={{ backgroundColor: "#d92d20", color: "#ffffff", border: "1px solid #b42318" }}
                className="w-full sm:w-auto px-6 py-2.5 text-[12px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:opacity-95"
              >
                {isCancelling ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Processing Refund...</span>
                  </>
                ) : (
                  <span>Yes, Cancel &amp; Refund Payment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-serif">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 bg-[#fafafa]">
        <Suspense fallback={<AccountSkeleton />}>
          <AccountContent />
        </Suspense>
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
