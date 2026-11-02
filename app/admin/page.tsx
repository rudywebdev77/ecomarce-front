"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE } from "../lib/api";

type Tab = "dashboard" | "products" | "orders" | "customers" | "inquiries" | "blogs" | "settings";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);

  // Login form
  const [loginEmail, setLoginEmail] = useState("admin@sillhouete.com");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Stats
  const [stats, setStats] = useState<any>(null);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  // Customers
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Inquiries / Contact
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [activeInquiry, setActiveInquiry] = useState<any | null>(null);

  // Blogs
  const [blogs, setBlogs] = useState<any[]>([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);

  // Settings
  const [settings, setSettings] = useState<any>({});
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Product Form State
  const [prodForm, setProdForm] = useState({
    title: "",
    category: "Luxury Pret",
    price: "",
    compare_at_price: "",
    description: "",
    image: "",
    in_stock: true,
    sizes: "XS, S, M, L, XL, Custom Size",
    tags: "Luxury, Pret, Embroidered",
  });

  // Blog Form State
  const [blogForm, setBlogForm] = useState({
    title: "",
    handle: "",
    author: "Sillhouete Studio",
    excerpt: "",
    content: "",
    featured_image: "",
    tags: "Couture, Bridal, Fashion",
    published: true,
  });

  // Check existing token
  useEffect(() => {
    const savedToken = localStorage.getItem("sillhouete_admin_token");
    const savedUser = localStorage.getItem("sillhouete_admin_user");
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) setAdminUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Fetch data when authenticated or active tab changes
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setToken(data.token);
      setAdminUser(data.user);
      localStorage.setItem("sillhouete_admin_token", data.token);
      localStorage.setItem("sillhouete_admin_user", JSON.stringify(data.user));
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials. Try admin@sillhouete.com / admin123");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem("sillhouete_admin_token");
    localStorage.removeItem("sillhouete_admin_user");
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    const authHeaders = { Authorization: `Bearer ${token}` };

    try {
      if (activeTab === "dashboard") {
        const res = await fetch(`${API_BASE}/stats`, { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } else if (activeTab === "products") {
        const res = await fetch(`${API_BASE}/products?limit=150`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } else if (activeTab === "orders") {
        const res = await fetch(`${API_BASE}/orders?limit=100`, { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } else if (activeTab === "customers") {
        const res = await fetch(`${API_BASE}/customers`, { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
        }
      } else if (activeTab === "inquiries") {
        const res = await fetch(`${API_BASE}/contact`, { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          setInquiries(data.messages || []);
        }
      } else if (activeTab === "blogs") {
        const res = await fetch(`${API_BASE}/blogs?admin=true`, { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          setBlogs(data.blogs || []);
        }
      } else if (activeTab === "settings") {
        const res = await fetch(`${API_BASE}/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings || {});
        }
      }
    } catch (err) {
      console.error("Failed fetching admin data:", err);
    }
  };

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: prodForm.title,
      category: prodForm.category,
      price: parseFloat(prodForm.price),
      compare_at_price: prodForm.compare_at_price ? parseFloat(prodForm.compare_at_price) : null,
      description: prodForm.description,
      images: prodForm.image ? [prodForm.image] : ["https://sillhouete.com/cdn/shop/files/IMG_3962.jpg"],
      in_stock: prodForm.in_stock,
      sizes: prodForm.sizes.split(",").map((s) => s.trim()),
      tags: prodForm.tags.split(",").map((t) => t.trim()),
    };

    try {
      const url = editingProduct ? `${API_BASE}/products/${editingProduct.id}` : `${API_BASE}/products`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save product");

      setShowAddProductModal(false);
      setEditingProduct(null);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      setOrders(orders.map((o) => (o.id === orderId ? data.order : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.order);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tracking_number: trackingInput }),
      });

      if (!res.ok) throw new Error("Failed to save tracking");
      const data = await res.json();
      setOrders(orders.map((o) => (o.id === orderId ? data.order : o)));
      setSelectedOrder(data.order);
      alert("Tracking number saved successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Inquiry Reply
  const handleReplyInquiry = async (inquiryId: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/contact/${inquiryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: replyText }),
      });

      if (!res.ok) throw new Error("Failed to reply");
      const data = await res.json();
      setInquiries(inquiries.map((m) => (m.id === inquiryId ? data.inquiry : m)));
      setActiveInquiry(null);
      setReplyText("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Blog Actions
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: blogForm.title,
      handle: blogForm.handle,
      author: blogForm.author,
      excerpt: blogForm.excerpt,
      content: blogForm.content,
      featured_image: blogForm.featured_image || "https://sillhouete.com/cdn/shop/files/IMG_3962.jpg",
      tags: blogForm.tags.split(",").map((t) => t.trim()),
      published: blogForm.published,
    };

    try {
      const url = editingBlog ? `${API_BASE}/blogs/${editingBlog.id}` : `${API_BASE}/blogs`;
      const method = editingBlog ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save blog post");

      setShowBlogModal(false);
      setEditingBlog(null);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      const res = await fetch(`${API_BASE}/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete blog post");
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-serif text-[16px]">Loading Sillhouete Admin...</div>;
  }

  // =========================================================
  // LOGIN SCREEN
  // =========================================================
  if (!token) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-serif text-[#111111]">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-block mb-4">
            <span className="text-[28px] font-bold tracking-[0.25em] uppercase text-black">
              SILLHOUETE
            </span>
          </Link>
          <h2 className="text-[20px] font-medium tracking-wide text-[#333333]">
            Boutique Admin &amp; Store Management
          </h2>
          <p className="text-[12px] font-sans-custom text-[#777777] mt-1">
            Manage products, orders, Stripe payments, customers, and editorial journal.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-10 border border-[#e0e0e0] shadow-sm">
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] font-sans-custom">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 font-sans-custom text-[13px]">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                />
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                />
              </div>

              <div className="p-3 bg-[#fafafa] border border-[#f0f0f0] text-[11px] text-[#666666]">
                <p>Default credentials:</p>
                <p><strong>Email:</strong> admin@sillhouete.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-black text-white py-3 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#222222] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? "Authenticating..." : "Sign In to Admin Panel"}
              </button>

              <div className="text-center pt-2">
                <Link href="/" className="text-[12px] text-[#777777] hover:text-black underline">
                  ← Return to Storefront
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN ADMIN DASHBOARD INTERFACE
  // =========================================================
  return (
    <div className="min-h-screen bg-[#f7f7f8] flex flex-col font-sans-custom text-[#111111]">
      {/* Top Navbar */}
      <header className="bg-black text-white h-16 flex items-center justify-between px-4 sm:px-8 border-b border-[#222]">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[20px] font-serif font-bold tracking-[0.2em] uppercase text-white hover:opacity-80">
            SILLHOUETE
          </Link>
          <span className="hidden sm:inline bg-[#222222] text-[#e0e0e0] text-[11px] font-mono px-2.5 py-1 uppercase tracking-wider">
            ADMIN ENGINE
          </span>
        </div>

        <div className="flex items-center gap-4 text-[13px]">
          <span className="hidden md:inline text-[#aaaaaa]">
            Logged in as <strong className="text-white">{adminUser?.name || "Admin"}</strong>
          </span>
          <Link
            href="/"
            target="_blank"
            className="text-[12px] bg-[#222] text-white px-3 py-1.5 hover:bg-[#333] transition-colors uppercase tracking-wider"
          >
            View Live Site ↗
          </Link>
          <button
            onClick={handleLogout}
            className="text-[12px] border border-[#444] text-[#ccc] px-3 py-1.5 hover:text-white hover:border-white transition-colors uppercase tracking-wider cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Sub-bar / Tabs */}
      <nav className="bg-white border-b border-[#e5e5e5] px-4 sm:px-8 overflow-x-auto flex space-x-1 sm:space-x-4">
        {[
          { id: "dashboard", label: "Dashboard Overview" },
          { id: "products", label: "Products Catalog" },
          { id: "orders", label: "Orders & Stripe" },
          { id: "customers", label: "Customers" },
          { id: "inquiries", label: "Messages & Inquiries" },
          { id: "blogs", label: "Editorial Blogs" },
          { id: "settings", label: "Website Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`py-4 px-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-[#666666] hover:text-black hover:border-[#cccccc]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-8">
        {/* ========================================================= */}
        {/* 1. DASHBOARD OVERVIEW TAB                                 */}
        {/* ========================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[24px] font-serif font-bold text-black uppercase tracking-wide">
                  Store Overview &amp; Analytics
                </h1>
                <p className="text-[13px] text-[#666666]">
                  Live performance data, order fulfilment metrics, and customer activity.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setProdForm({
                      title: "",
                      category: "Luxury Pret",
                      price: "45000",
                      compare_at_price: "",
                      description: "",
                      image: "https://sillhouete.com/cdn/shop/files/IMG_3962.jpg",
                      in_stock: true,
                      sizes: "XS, S, M, L, XL, Custom Size",
                      tags: "Luxury, Pret",
                    });
                    setShowAddProductModal(true);
                  }}
                  className="bg-black text-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#222]"
                >
                  + Add Product
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="border border-[#cccccc] bg-white text-black px-4 py-2 text-[12px] font-bold uppercase tracking-wider hover:border-black"
                >
                  Manage Orders
                </button>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 border border-[#e5e5e5] shadow-xs">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#777777]">Total Sales (PKR)</p>
                <p className="text-[26px] font-serif font-bold text-black mt-2">
                  Rs.{Number(stats?.metrics?.totalRevenue || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                  ✓ Verified Stripe &amp; Completed Orders
                </p>
              </div>

              <div className="bg-white p-6 border border-[#e5e5e5] shadow-xs">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#777777]">Total Orders</p>
                <p className="text-[26px] font-serif font-bold text-black mt-2">
                  {stats?.metrics?.totalOrders || 0}
                </p>
                <p className="text-[11px] text-[#666666] mt-1">
                  Active fulfillment pipeline
                </p>
              </div>

              <div className="bg-white p-6 border border-[#e5e5e5] shadow-xs">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#777777]">Catalog Outfits</p>
                <p className="text-[26px] font-serif font-bold text-black mt-2">
                  {stats?.metrics?.totalProducts || 0}
                </p>
                <p className="text-[11px] text-[#666666] mt-1">
                  Bridal, Formals, &amp; Luxury Pret
                </p>
              </div>

              <div className="bg-white p-6 border border-[#e5e5e5] shadow-xs">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#777777]">New Inquiries</p>
                <p className="text-[26px] font-serif font-bold text-black mt-2">
                  {stats?.metrics?.unreadMessagesCount || 0}
                </p>
                <p className="text-[11px] text-[#666666] mt-1">
                  Customer care &amp; bridal consultancy
                </p>
              </div>
            </div>

            {/* Order Pipeline Status Cards */}
            <div className="bg-white p-6 border border-[#e5e5e5]">
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-black mb-4">
                Order Fulfillment Pipeline
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-[12px]">
                <div className="p-3 bg-[#fafafa] border border-[#f0f0f0]">
                  <p className="text-[#777777] uppercase text-[11px]">Pending</p>
                  <p className="text-[20px] font-bold text-amber-600 mt-1">{stats?.statusCounts?.pending || 0}</p>
                </div>
                <div className="p-3 bg-[#fafafa] border border-[#f0f0f0]">
                  <p className="text-[#777777] uppercase text-[11px]">Processing</p>
                  <p className="text-[20px] font-bold text-blue-600 mt-1">{stats?.statusCounts?.processing || 0}</p>
                </div>
                <div className="p-3 bg-[#fafafa] border border-[#f0f0f0]">
                  <p className="text-[#777777] uppercase text-[11px]">Shipped</p>
                  <p className="text-[20px] font-bold text-indigo-600 mt-1">{stats?.statusCounts?.shipped || 0}</p>
                </div>
                <div className="p-3 bg-[#fafafa] border border-[#f0f0f0]">
                  <p className="text-[#777777] uppercase text-[11px]">Delivered</p>
                  <p className="text-[20px] font-bold text-emerald-600 mt-1">{stats?.statusCounts?.delivered || 0}</p>
                </div>
                <div className="p-3 bg-[#fafafa] border border-[#f0f0f0]">
                  <p className="text-[#777777] uppercase text-[11px]">Cancelled</p>
                  <p className="text-[20px] font-bold text-red-600 mt-1">{stats?.statusCounts?.cancelled || 0}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white border border-[#e5e5e5]">
              <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-black">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-[12px] text-[#666666] hover:text-black font-semibold uppercase tracking-wider"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#f9f9f9] text-[#777777] uppercase text-[11px] font-semibold border-b border-[#e5e5e5]">
                    <tr>
                      <th className="py-3.5 px-6">Order ID</th>
                      <th className="py-3.5 px-6">Customer</th>
                      <th className="py-3.5 px-6">Items</th>
                      <th className="py-3.5 px-6">Total</th>
                      <th className="py-3.5 px-6">Payment</th>
                      <th className="py-3.5 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {(stats?.recentOrders || []).map((o: any) => (
                      <tr key={o.id} className="hover:bg-[#fafafa]">
                        <td className="py-4 px-6 font-mono font-semibold text-black">{o.id}</td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-black">{o.customer?.first_name} {o.customer?.last_name}</p>
                          <p className="text-[11px] text-[#777777]">{o.customer?.email}</p>
                        </td>
                        <td className="py-4 px-6">{o.items?.length || 0} dress(es)</td>
                        <td className="py-4 px-6 font-semibold text-black">Rs.{Number(o.total || 0).toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold uppercase rounded-xs ${
                            o.payment_status === "paid" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800"
                          }`}>
                            {o.payment_method === "stripe" ? "Stripe (Card)" : o.payment_method} • {o.payment_status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="capitalize font-medium text-[12px]">{o.order_status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. PRODUCTS CATALOG TAB                                   */}
        {/* ========================================================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-serif font-bold text-black uppercase tracking-wide">
                  Products Management ({products.length})
                </h1>
                <p className="text-[13px] text-[#666666]">
                  Add, edit, change pricing, upload imagery, and manage inventory for Sillhouete dresses.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProdForm({
                    title: "",
                    category: "Luxury Pret",
                    price: "45000",
                    compare_at_price: "",
                    description: "<p>Pakistani luxury designer outfit crafted with premium fabrics and detailed handwork.</p>",
                    image: "https://sillhouete.com/cdn/shop/files/IMG_3962.jpg",
                    in_stock: true,
                    sizes: "XS, S, M, L, XL, Custom Size",
                    tags: "Luxury Pret, Embroidered",
                  });
                  setShowAddProductModal(true);
                }}
                className="bg-black text-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#222]"
              >
                + Add New Outfit
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 border border-[#e5e5e5] flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title, tag, or handle..."
                className="flex-1 px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none text-[13px] w-full"
              />
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none text-[13px] bg-white w-full sm:w-auto"
              >
                <option value="all">All Collections</option>
                <option value="Bridal">Bridal</option>
                <option value="Formals">Formals</option>
                <option value="Luxury Pret">Luxury Pret</option>
                <option value="Silk Solids">Silk Solids</option>
                <option value="Luxury Shawl">Luxury Shawl</option>
              </select>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#e5e5e5] overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f9f9f9] text-[#777777] uppercase text-[11px] font-semibold border-b border-[#e5e5e5]">
                  <tr>
                    <th className="py-3.5 px-6">Image</th>
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6">Collection</th>
                    <th className="py-3.5 px-6">Price</th>
                    <th className="py-3.5 px-6">In Stock</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {products
                    .filter((p) => {
                      const matchesSearch =
                        !productSearch ||
                        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                        (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()));
                      const matchesCat = productCategory === "all" || p.category === productCategory;
                      return matchesSearch && matchesCat;
                    })
                    .slice(0, 50)
                    .map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#fafafa]">
                        <td className="py-3 px-6">
                          <div className="relative w-12 h-16 bg-[#f0f0f0] overflow-hidden border border-[#e0e0e0]">
                            {prod.images && prod.images[0] && (
                              <Image src={prod.images[0]} alt={prod.title} fill className="object-cover" sizes="48px" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <p className="font-semibold text-black max-w-[280px] truncate">{prod.title}</p>
                          <p className="text-[11px] text-[#777777] font-mono">{prod.handle}</p>
                        </td>
                        <td className="py-3 px-6 font-medium text-[#444444]">{prod.category || "Pret"}</td>
                        <td className="py-3 px-6 font-semibold text-black">
                          Rs.{Number(prod.price).toLocaleString()}
                        </td>
                        <td className="py-3 px-6">
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase ${
                            prod.in_stock !== false ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                          }`}>
                            {prod.in_stock !== false ? "In Stock" : "Sold Out"}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setProdForm({
                                title: prod.title,
                                category: prod.category || "Luxury Pret",
                                price: String(prod.price),
                                compare_at_price: prod.compare_at_price ? String(prod.compare_at_price) : "",
                                description: prod.description || "",
                                image: prod.images && prod.images[0] ? prod.images[0] : "",
                                in_stock: prod.in_stock !== false,
                                sizes: Array.isArray(prod.sizes) ? prod.sizes.join(", ") : "XS, S, M, L, XL",
                                tags: Array.isArray(prod.tags) ? prod.tags.join(", ") : "",
                              });
                              setShowAddProductModal(true);
                            }}
                            className="text-[12px] text-blue-600 hover:underline uppercase font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-[12px] text-red-600 hover:underline uppercase font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal for Add / Edit Product */}
            {showAddProductModal && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white max-w-[650px] w-full p-6 sm:p-8 border border-[#e5e5e5] shadow-xl my-8">
                  <div className="flex justify-between items-center pb-4 border-b border-[#e5e5e5] mb-6">
                    <h3 className="text-[16px] font-serif font-bold uppercase tracking-wider">
                      {editingProduct ? "Edit Product" : "Add New Designer Outfit"}
                    </h3>
                    <button
                      onClick={() => setShowAddProductModal(false)}
                      className="text-[#999999] hover:text-black text-[20px]"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-[13px]">
                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={prodForm.title}
                        onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                        placeholder="e.g. Zarqaa Embroidered Raw Silk 3-Piece"
                        className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#444444] font-medium mb-1">Collection / Category *</label>
                        <select
                          value={prodForm.category}
                          onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                          className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none bg-white"
                        >
                          <option value="Bridal">Bridal</option>
                          <option value="Formals">Formals</option>
                          <option value="Luxury Pret">Luxury Pret</option>
                          <option value="Silk Solids">Silk Solids</option>
                          <option value="Luxury Shawl">Luxury Shawl</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#444444] font-medium mb-1">Price (PKR) *</label>
                        <input
                          type="number"
                          required
                          value={prodForm.price}
                          onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                          placeholder="45000"
                          className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Image URL *</label>
                      <input
                        type="url"
                        value={prodForm.image}
                        onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                        placeholder="https://sillhouete.com/cdn/shop/files/..."
                        className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Available Sizes (Comma separated)</label>
                      <input
                        type="text"
                        value={prodForm.sizes}
                        onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })}
                        className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Tags (Comma separated)</label>
                      <input
                        type="text"
                        value={prodForm.tags}
                        onChange={(e) => setProdForm({ ...prodForm, tags: e.target.value })}
                        className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={prodForm.description}
                        onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                        className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none resize-none font-mono text-[12px]"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="in_stock_chk"
                        checked={prodForm.in_stock}
                        onChange={(e) => setProdForm({ ...prodForm, in_stock: e.target.checked })}
                        className="accent-black"
                      />
                      <label htmlFor="in_stock_chk" className="text-[#333333] font-medium">In Stock and Available for Purchase</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        className="px-5 py-2.5 border border-[#cccccc] text-[12px] font-bold uppercase tracking-wider hover:border-black"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-black text-white text-[12px] font-bold uppercase tracking-wider hover:bg-[#222]"
                      >
                        Save Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. ORDERS & STRIPE TAB                                    */}
        {/* ========================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-serif font-bold text-black uppercase tracking-wide">
                  Orders &amp; Stripe Transactions ({orders.length})
                </h1>
                <p className="text-[13px] text-[#666666]">
                  Track payments, update delivery status, assign courier tracking numbers (DHL, TCS, FedEx).
                </p>
              </div>
            </div>

            {/* Filter bar */}
            <div className="bg-white p-4 border border-[#e5e5e5] flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order ID, customer name, email, tracking..."
                className="flex-1 px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none text-[13px] w-full"
              />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none text-[13px] bg-white w-full sm:w-auto"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-[#e5e5e5] overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f9f9f9] text-[#777777] uppercase text-[11px] font-semibold border-b border-[#e5e5e5]">
                  <tr>
                    <th className="py-3.5 px-6">Order</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Payment</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Total</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {orders
                    .filter((o) => {
                      const matchesStatus = orderStatusFilter === "all" || o.order_status === orderStatusFilter;
                      const q = orderSearch.toLowerCase();
                      const matchesSearch =
                        !q ||
                        o.id.toLowerCase().includes(q) ||
                        (o.customer?.email && o.customer.email.toLowerCase().includes(q)) ||
                        (o.customer?.first_name && o.customer.first_name.toLowerCase().includes(q));
                      return matchesStatus && matchesSearch;
                    })
                    .map((o) => (
                      <tr key={o.id} className="hover:bg-[#fafafa]">
                        <td className="py-4 px-6 font-mono font-bold text-black">{o.id}</td>
                        <td className="py-4 px-6 text-[12px] text-[#666666]">
                          {new Date(o.created_at || Date.now()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-black">{o.customer?.first_name} {o.customer?.last_name}</p>
                          <p className="text-[11px] text-[#777777]">{o.customer?.email} • {o.customer?.city}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase ${
                            o.payment_status === "paid"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800"
                          }`}>
                            {o.payment_method === "stripe" ? "Stripe Card" : o.payment_method} • {o.payment_status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={o.order_status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="text-[12px] font-medium border border-[#d6d6d6] px-2 py-1 bg-white capitalize focus:border-black outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 font-semibold text-black">
                          Rs.{Number(o.total || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setTrackingInput(o.tracking_number || "");
                            }}
                            className="bg-black text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-[#222]"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Order Details Drawer / Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white max-w-[700px] w-full p-6 sm:p-8 border border-[#e5e5e5] shadow-2xl my-8">
                  <div className="flex justify-between items-center pb-4 border-b border-[#e5e5e5] mb-6">
                    <div>
                      <h3 className="text-[18px] font-serif font-bold uppercase tracking-wider">
                        Order Details: {selectedOrder.id}
                      </h3>
                      <p className="text-[11px] text-[#777777] font-mono">
                        Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-[#999999] hover:text-black text-[22px]"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6 text-[13px]">
                    {/* Customer & Shipping info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fafafa] p-4 border border-[#f0f0f0]">
                      <div>
                        <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#777777] mb-2">Customer</h4>
                        <p className="font-semibold text-black">{selectedOrder.customer?.first_name} {selectedOrder.customer?.last_name}</p>
                        <p className="text-[#555555]">{selectedOrder.customer?.email}</p>
                        <p className="text-[#555555]">{selectedOrder.customer?.phone}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#777777] mb-2">Shipping Address</h4>
                        <p className="text-[#555555]">{selectedOrder.customer?.address}</p>
                        {selectedOrder.customer?.apartment && <p className="text-[#555555]">{selectedOrder.customer?.apartment}</p>}
                        <p className="text-[#555555]">{selectedOrder.customer?.city}, {selectedOrder.customer?.country}</p>
                      </div>
                    </div>

                    {/* Items ordered */}
                    <div>
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#777777] mb-3">Items Ordered</h4>
                      <div className="divide-y divide-[#f0f0f0] border border-[#f0f0f0]">
                        {(selectedOrder.items || []).map((item: any, i: number) => (
                          <div key={i} className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-14 bg-[#f0f0f0] overflow-hidden border">
                                {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" sizes="40px" />}
                              </div>
                              <div>
                                <p className="font-semibold text-black">{item.title}</p>
                                <p className="text-[11px] text-[#777777]">Size: {item.size || "Standard"} • Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-black">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tracking Number Input */}
                    <div className="p-4 bg-white border border-[#e5e5e5] space-y-2">
                      <label className="block font-bold text-[11px] uppercase tracking-wider text-[#444444]">
                        Courier Tracking Number (DHL / TCS / FedEx)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="e.g. DHL-84920491 or TCS-7728190"
                          className="flex-1 px-3 py-2 border border-[#d6d6d6] focus:border-black outline-none font-mono text-[13px]"
                        />
                        <button
                          onClick={() => handleSaveTracking(selectedOrder.id)}
                          className="bg-black text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-[#222]"
                        >
                          Save Tracking
                        </button>
                      </div>
                    </div>

                    {/* Total & Payment details */}
                    <div className="flex justify-between items-center pt-4 border-t border-[#e5e5e5]">
                      <div>
                        <p className="text-[11px] text-[#777777] uppercase font-bold">Payment Method</p>
                        <p className="font-semibold capitalize text-black">
                          {selectedOrder.payment_method === "stripe" ? "Stripe (Card Direct)" : selectedOrder.payment_method} ({selectedOrder.payment_status})
                        </p>
                        {selectedOrder.stripe_payment_intent_id && (
                          <p className="text-[10px] text-[#888888] font-mono">{selectedOrder.stripe_payment_intent_id}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-[#777777] uppercase font-bold">Total Amount</p>
                        <p className="text-[20px] font-serif font-bold text-black">
                          Rs.{Number(selectedOrder.total || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. CUSTOMERS TAB                                          */}
        {/* ========================================================= */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-[22px] font-serif font-bold text-black uppercase tracking-wide">
                Customer Database ({customers.length})
              </h1>
              <p className="text-[13px] text-[#666666]">
                Registered shoppers, purchase histories, and contact information.
              </p>
            </div>

            <div className="bg-white p-4 border border-[#e5e5e5]">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers by name, email, phone, city..."
                className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none text-[13px]"
              />
            </div>

            <div className="bg-white border border-[#e5e5e5] overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f9f9f9] text-[#777777] uppercase text-[11px] font-semibold border-b border-[#e5e5e5]">
                  <tr>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">Phone</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Orders</th>
                    <th className="py-3.5 px-6">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {customers
                    .filter((c) => {
                      const q = customerSearch.toLowerCase();
                      return (
                        !q ||
                        c.first_name.toLowerCase().includes(q) ||
                        (c.last_name && c.last_name.toLowerCase().includes(q)) ||
                        c.email.toLowerCase().includes(q) ||
                        (c.city && c.city.toLowerCase().includes(q))
                      );
                    })
                    .map((cust) => (
                      <tr key={cust.id} className="hover:bg-[#fafafa]">
                        <td className="py-4 px-6 font-semibold text-black">
                          {cust.first_name} {cust.last_name}
                        </td>
                        <td className="py-4 px-6 text-[#555555]">{cust.email}</td>
                        <td className="py-4 px-6 text-[#555555]">{cust.phone || "—"}</td>
                        <td className="py-4 px-6 text-[#555555]">{cust.city || "—"}, {cust.country || "Pakistan"}</td>
                        <td className="py-4 px-6 font-semibold">{cust.total_orders || 0}</td>
                        <td className="py-4 px-6 font-semibold text-black">
                          Rs.{Number(cust.total_spent || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. MESSAGES & INQUIRIES TAB                               */}
        {/* ========================================================= */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-[22px] font-serif font-bold text-black uppercase tracking-wide">
                Customer Inquiries &amp; Contact Messages ({inquiries.length})
              </h1>
              <p className="text-[13px] text-[#666666]">
                Messages submitted via the Contact Us page and bridal appointments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Inquiries list (5 cols) */}
              <div className="md:col-span-5 bg-white border border-[#e5e5e5] divide-y divide-[#f0f0f0] max-h-[700px] overflow-y-auto">
                {inquiries.length === 0 ? (
                  <p className="p-6 text-center text-[#999]">No messages received yet.</p>
                ) : (
                  inquiries.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setActiveInquiry(m);
                        setReplyText(m.reply || "");
                      }}
                      className={`p-4 cursor-pointer transition-colors ${
                        activeInquiry?.id === m.id ? "bg-[#fafafa] border-l-4 border-black" : "hover:bg-[#fcfcfc]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-black">{m.name}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs ${
                          m.status === "new" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#444444] font-medium truncate">{m.subject}</p>
                      <p className="text-[12px] text-[#777777] line-clamp-2 mt-1">{m.message}</p>
                      <span className="text-[10px] text-[#aaaaaa] mt-2 block">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Inquiry Detail & Reply panel (7 cols) */}
              <div className="md:col-span-7 bg-white p-6 border border-[#e5e5e5]">
                {activeInquiry ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-[#f0f0f0] pb-4">
                      <div>
                        <h3 className="text-[16px] font-bold text-black">{activeInquiry.subject}</h3>
                        <p className="text-[13px] text-[#555555]">
                          From: <strong>{activeInquiry.name}</strong> ({activeInquiry.email})
                        </p>
                        {activeInquiry.phone && (
                          <p className="text-[12px] text-[#555555]">Phone: {activeInquiry.phone}</p>
                        )}
                      </div>
                      <span className="text-[11px] text-[#999999]">
                        {new Date(activeInquiry.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-[#fafafa] p-4 border border-[#f0f0f0] text-[13px] text-[#222222] leading-relaxed">
                      {activeInquiry.message}
                    </div>

                    {activeInquiry.reply && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 text-[13px] text-emerald-900">
                        <p className="font-bold text-[11px] uppercase tracking-wider mb-1">Sent Reply:</p>
                        <p>{activeInquiry.reply}</p>
                        <span className="text-[10px] text-emerald-700 block mt-2">
                          Replied on {new Date(activeInquiry.replied_at).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="pt-2">
                      <label className="block text-[#444444] font-bold text-[11px] uppercase tracking-wider mb-1">
                        Compose Response
                      </label>
                      <textarea
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write reply to send to customer care record..."
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none text-[13px] resize-none mb-3"
                      />
                      <button
                        onClick={() => handleReplyInquiry(activeInquiry.id)}
                        className="bg-black text-white px-6 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#222]"
                      >
                        Submit Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#999999]">
                    Select an inquiry from the list on the left to read and reply.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. EDITORIAL BLOGS TAB                                    */}
        {/* ========================================================= */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-serif font-bold text-black uppercase tracking-wide">
                  Editorial &amp; Style Journal ({blogs.length})
                </h1>
                <p className="text-[13px] text-[#666666]">
                  Publish articles, style guides, bridal traditions, and fashion forecasts.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingBlog(null);
                  setBlogForm({
                    title: "",
                    handle: "",
                    author: "Sillhouete Studio",
                    excerpt: "",
                    content: "<p>Write story content here...</p>",
                    featured_image: "https://sillhouete.com/cdn/shop/files/IMG_3962.jpg",
                    tags: "Trends, Style Guide",
                    published: true,
                  });
                  setShowBlogModal(true);
                }}
                className="bg-black text-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#222]"
              >
                + Write Article
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((b) => (
                <div key={b.id} className="bg-white border border-[#e5e5e5] overflow-hidden flex flex-col">
                  <div className="relative h-[200px] w-full bg-[#f0f0f0]">
                    {b.featured_image && (
                      <Image src={b.featured_image} alt={b.title} fill className="object-cover" sizes="300px" />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs ${
                        b.published ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {b.published ? "Published" : "Draft"}
                      </span>
                      <h3 className="text-[16px] font-serif font-semibold text-black mt-2 leading-snug">
                        {b.title}
                      </h3>
                      <p className="text-[12px] text-[#666666] line-clamp-2 mt-2">{b.excerpt}</p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#f0f0f0] mt-4">
                      <Link
                        href={`/blogs/${b.handle}`}
                        target="_blank"
                        className="text-[11px] font-bold uppercase tracking-wider text-black hover:underline"
                      >
                        Preview ↗
                      </Link>
                      <div className="space-x-3">
                        <button
                          onClick={() => {
                            setEditingBlog(b);
                            setBlogForm({
                              title: b.title,
                              handle: b.handle || "",
                              author: b.author || "Sillhouete Studio",
                              excerpt: b.excerpt || "",
                              content: b.content || "",
                              featured_image: b.featured_image || "",
                              tags: Array.isArray(b.tags) ? b.tags.join(", ") : "",
                              published: b.published !== false,
                            });
                            setShowBlogModal(true);
                          }}
                          className="text-[11px] font-bold uppercase text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(b.id)}
                          className="text-[11px] font-bold uppercase text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Blog Create / Edit */}
            {showBlogModal && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white max-w-[700px] w-full p-6 sm:p-8 border border-[#e5e5e5] shadow-xl my-8">
                  <div className="flex justify-between items-center pb-4 border-b border-[#e5e5e5] mb-6">
                    <h3 className="text-[16px] font-serif font-bold uppercase tracking-wider">
                      {editingBlog ? "Edit Article" : "Write New Editorial Article"}
                    </h3>
                    <button
                      onClick={() => setShowBlogModal(false)}
                      className="text-[#999999] hover:text-black text-[20px]"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveBlog} className="space-y-4 text-[13px]">
                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Article Title *</label>
                      <input
                        type="text"
                        required
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#444444] font-medium mb-1">Author</label>
                        <input
                          type="text"
                          value={blogForm.author}
                          onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                          className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[#444444] font-medium mb-1">Featured Image URL</label>
                        <input
                          type="url"
                          value={blogForm.featured_image}
                          onChange={(e) => setBlogForm({ ...blogForm, featured_image: e.target.value })}
                          className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Excerpt / Summary</label>
                      <textarea
                        rows={2}
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Article HTML Content *</label>
                      <textarea
                        rows={6}
                        required
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-black outline-none resize-none font-mono text-[12px]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="blog_pub_chk"
                        checked={blogForm.published}
                        onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                        className="accent-black"
                      />
                      <label htmlFor="blog_pub_chk" className="text-[#333333] font-medium">Publish immediately on website</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                      <button
                        type="button"
                        onClick={() => setShowBlogModal(false)}
                        className="px-5 py-2.5 border border-[#cccccc] text-[12px] font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-black text-white text-[12px] font-bold uppercase tracking-wider hover:bg-[#222]"
                      >
                        Save Article
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. WEBSITE SETTINGS & STRIPE CONFIG TAB                   */}
        {/* ========================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-[800px]">
            <div>
              <h1 className="text-[22px] font-serif font-bold text-black uppercase tracking-wide">
                Website Data &amp; Stripe Settings
              </h1>
              <p className="text-[13px] text-[#666666]">
                Configure store announcement bar, customer service lines, studio addresses, and Stripe payment credentials.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px]">
                ✓ Settings saved successfully and active across the storefront!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 border border-[#e5e5e5] space-y-5 text-[13px]">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Top Announcement Bar Text</label>
                <input
                  type="text"
                  value={settings.announcement_bar || ""}
                  onChange={(e) => setSettings({ ...settings, announcement_bar: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none font-sans-custom"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#444444] font-medium mb-1">Customer Care Phone</label>
                  <input
                    type="text"
                    value={settings.phone || ""}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#444444] font-medium mb-1">WhatsApp Hotline</label>
                  <input
                    type="text"
                    value={settings.whatsapp || ""}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Studio Address (Lahore)</label>
                <input
                  type="text"
                  value={settings.studio_address_pk || ""}
                  onChange={(e) => setSettings({ ...settings, studio_address_pk: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#e5e5e5]">
                <h3 className="font-bold text-[14px] uppercase tracking-wider text-black mb-3">
                  Stripe Payment Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">Stripe Publishable Key</label>
                    <input
                      type="text"
                      value={settings.stripe_public_key || ""}
                      onChange={(e) => setSettings({ ...settings, stripe_public_key: e.target.value })}
                      placeholder="pk_test_..."
                      className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none font-mono text-[12px]"
                    />
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    Direct on-site card checkout uses this key with Stripe Elements. In sandbox/dev mode, test payments process smoothly without live charges.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-black text-white px-8 py-3 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#222] transition-colors"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

