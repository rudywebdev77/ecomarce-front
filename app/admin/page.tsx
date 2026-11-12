"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { API_BASE } from "../lib/api";

type Tab = "dashboard" | "products" | "categories" | "orders" | "invoices" | "customers" | "inquiries" | "blogs" | "settings" | "profile";

const VALID_TABS: Tab[] = [
  "dashboard",
  "products",
  "categories",
  "orders",
  "invoices",
  "customers",
  "inquiries",
  "blogs",
  "settings",
  "profile",
];

const DEFAULT_FALLBACK_IMAGE =
  "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-livia-butter-yellow-intricate-embroidery.jpg?v=1776742288";

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

function AdminThumbnail({
  src,
  alt,
  className = "w-12 h-16",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_FALLBACK_IMAGE);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || DEFAULT_FALLBACK_IMAGE);
    setHasError(false);
  }, [src]);

  return (
    <div
      className={`relative ${className} bg-[#f3f4f6] overflow-hidden border border-[#e5e7eb] shrink-0 flex items-center justify-center`}
    >
      {!hasError ? (
        <img
          src={imgSrc}
          alt={alt}
          onError={() => {
            if (imgSrc !== DEFAULT_FALLBACK_IMAGE) {
              setImgSrc(DEFAULT_FALLBACK_IMAGE);
            } else {
              setHasError(true);
            }
          }}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-[#f9fafb]">
          <svg className="w-4 h-4 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[7px] text-[#9ca3af] uppercase font-mono mt-0.5">Outfit</span>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [tabReady, setTabReady] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem("sillhouete_admin_tab", tab);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    } catch {}
  };
  const [loading, setLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Login form (empty for security - credentials required)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
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

  // Collections & Categories Management
  const [categories, setCategories] = useState<any[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryHierarchyFilter, setCategoryHierarchyFilter] = useState<"all" | "parents" | "subcategories">("all");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    slug: "",
    parent_id: "",
    description: "",
    image: "",
    display_order: 1,
    is_active: true,
  });
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");
  const [catSuccess, setCatSuccess] = useState("");
  const [resettingCategories, setResettingCategories] = useState(false);
  const [showQuickAddCat, setShowQuickAddCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState("");
  const [quickCatLoading, setQuickCatLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  // Invoices
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoicePaymentFilter, setInvoicePaymentFilter] = useState("all");
  const [invoiceMethodFilter, setInvoiceMethodFilter] = useState("all");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  // Customers
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [_selectedCustomer, _setSelectedCustomer] = useState<any | null>(null);

  // Inquiries / Contact
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [_inquiryFilter, _setInquiryFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [activeInquiry, setActiveInquiry] = useState<any | null>(null);

  // Blogs
  const [blogs, setBlogs] = useState<any[]>([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);

  // Settings
  const [settings, setSettings] = useState<any>({});
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState("");
  const [newDiscountPercent, setNewDiscountPercent] = useState<number | "">("");
  const [newDiscountDesc, setNewDiscountDesc] = useState("");

  const handleAddDiscountCode = () => {
    if (!newDiscountCode.trim() || !newDiscountPercent) {
      alert("Please enter both a discount code and percentage.");
      return;
    }
    const currentCodes = Array.isArray(settings.discount_codes) ? [...settings.discount_codes] : [];
    const cleanCode = newDiscountCode.trim().toUpperCase();
    if (currentCodes.some((c: any) => c.code?.toUpperCase() === cleanCode)) {
      alert("This discount code already exists!");
      return;
    }
    const updated = [
      ...currentCodes,
      {
        code: cleanCode,
        discount_percent: Number(newDiscountPercent),
        description: newDiscountDesc.trim() || `${newDiscountPercent}% Discount`,
        active: true,
      },
    ];
    setSettings({ ...settings, discount_codes: updated });
    setNewDiscountCode("");
    setNewDiscountPercent("");
    setNewDiscountDesc("");
  };

  const handleToggleDiscountCode = (idx: number) => {
    const currentCodes = Array.isArray(settings.discount_codes) ? [...settings.discount_codes] : [];
    currentCodes[idx] = {
      ...currentCodes[idx],
      active: currentCodes[idx].active === false ? true : false,
    };
    setSettings({ ...settings, discount_codes: currentCodes });
  };

  const handleDeleteDiscountCode = (idx: number) => {
    const currentCodes = Array.isArray(settings.discount_codes) ? [...settings.discount_codes] : [];
    currentCodes.splice(idx, 1);
    setSettings({ ...settings, discount_codes: currentCodes });
  };

  // Admin Profile & Security State
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (adminUser) {
      setAdminProfileForm((prev) => ({
        ...prev,
        name: adminUser.name || "Sillhouete Boutique Admin",
        email: adminUser.email || "admin@sillhouete.com",
        currentPassword: adminUser.currentPassword || prev.currentPassword || "admin123",
      }));
    }
  }, [adminUser]);

  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    if (adminProfileForm.newPassword) {
      if (!adminProfileForm.currentPassword) {
        setProfileError("Current password is required to change password.");
        return;
      }
      if (adminProfileForm.newPassword.length < 6) {
        setProfileError("New password must be at least 6 characters long.");
        return;
      }
      if (adminProfileForm.newPassword !== adminProfileForm.confirmPassword) {
        setProfileError("New password and confirm password do not match.");
        return;
      }
    }

    setProfileSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: adminProfileForm.name,
          email: adminProfileForm.email,
          currentPassword: adminProfileForm.currentPassword || undefined,
          newPassword: adminProfileForm.newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      if (data.user) {
        setAdminUser(data.user);
        try {
          localStorage.setItem("sillhouete_admin_user", JSON.stringify(data.user));
        } catch { }
      }
      if (data.token) {
        setToken(data.token);
        try {
          localStorage.setItem("sillhouete_admin_token", data.token);
        } catch { }
      }

      const updatedPassword = data.user?.currentPassword || adminProfileForm.newPassword || adminProfileForm.currentPassword || "admin123";
      setAdminProfileForm((prev) => ({
        ...prev,
        currentPassword: updatedPassword,
        newPassword: "",
        confirmPassword: "",
      }));
      setProfileSuccess("Admin name, email & security settings updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  // Product Form State
  const [prodForm, setProdForm] = useState({
    title: "",
    category: "Formal",
    price: "",
    compare_at_price: "",
    front_image: "",
    hover_image: "",
    gallery_images: [] as string[],
    video_url: "",
    fabric: "Pure Raw Silk 80g",
    color: "",
    pieces: "3-Piece (Shirt, Dupatta & Trouser)",
    dress_style: "Kalidar Maxi",
    work_details: "Handcrafted Zardozi, Kora Dabka, Resham and Sequins",
    delivery_time: "Ready to Dispatch (3-5 business days)",
    care_instructions: "Dry Clean Only",
    description: "<p>Pakistani luxury designer outfit crafted with premium fabrics and detailed handwork.</p>",
    sizes: "XS, S, M, L, XL, Custom Size",
    tags: "Formal, Luxury Couture, Handcrafted",
    in_stock: true,
    is_new: true,
    is_featured: false,
  });
  const [galleryInput, setGalleryInput] = useState("");

  // Media Upload States & Refs
  const [frontUploadMode, setFrontUploadMode] = useState<"file" | "url">("file");
  const [hoverUploadMode, setHoverUploadMode] = useState<"file" | "url">("file");
  const [galleryUploadMode, setGalleryUploadMode] = useState<"file" | "url">("file");
  const [videoUploadMode, setVideoUploadMode] = useState<"file" | "url">("file");
  const [catUploadMode, setCatUploadMode] = useState<"file" | "url">("file");

  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingHover, setIsUploadingHover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingCat, setIsUploadingCat] = useState(false);

  const frontFileRef = useRef<HTMLInputElement>(null);
  const hoverFileRef = useRef<HTMLInputElement>(null);
  const galleryFilesRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const catFileRef = useRef<HTMLInputElement>(null);

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

  const handleLogout = () => {
    setToken(null);
    setAdminUser(null);
    try {
      localStorage.removeItem("sillhouete_admin_token");
      localStorage.removeItem("sillhouete_admin_user");
    } catch {}
  };

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedInvoiceOrder(null);
        setSelectedOrder(null);
        setShowAddProductModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check existing token, restore active tab, & verify authenticity against backend
  useEffect(() => {
    try {
      const urlTab = new URLSearchParams(window.location.search).get("tab") as Tab | null;
      const savedTab = localStorage.getItem("sillhouete_admin_tab") as Tab | null;
      const targetTab =
        urlTab && VALID_TABS.includes(urlTab)
          ? urlTab
          : savedTab && VALID_TABS.includes(savedTab)
          ? savedTab
          : "dashboard";
      setActiveTab(targetTab);
      const url = new URL(window.location.href);
      if (url.searchParams.get("tab") !== targetTab) {
        url.searchParams.set("tab", targetTab);
        window.history.replaceState(null, "", url.toString());
      }
    } catch {}
    setTabReady(true);

    const savedToken = localStorage.getItem("sillhouete_admin_token");
    const savedUser = localStorage.getItem("sillhouete_admin_user");
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setAdminUser(parsed);
          setAdminProfileForm((prev) => ({
            ...prev,
            name: parsed.name || "Sillhouete Boutique Admin",
            email: parsed.email || "admin@sillhouete.com",
            currentPassword: parsed.currentPassword || "admin123",
          }));
        } catch {}
      }

      // Security check: verify token against backend
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (!res.ok) {
            handleLogout();
          } else {
            return res.json();
          }
        })
        .then((data) => {
          if (data?.user) {
            setAdminUser(data.user);
            try {
              localStorage.setItem("sillhouete_admin_user", JSON.stringify(data.user));
            } catch {}
            setAdminProfileForm((prev) => ({
              ...prev,
              name: data.user.name || "Sillhouete Boutique Admin",
              email: data.user.email || "admin@sillhouete.com",
              currentPassword: data.user.currentPassword || "admin123",
            }));
          }
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed fetching categories:", err);
    }
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    const authHeaders = { Authorization: `Bearer ${token}` };
    setTabLoading(true);

    try {
      if (activeTab === "dashboard") {
        const res = await fetch(`${API_BASE}/stats`, { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } else if (activeTab === "products") {
        const [res] = await Promise.all([
          fetch(`${API_BASE}/products?limit=500`),
          fetchCategories(),
        ]);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } else if (activeTab === "categories") {
        await fetchCategories();
      } else if (activeTab === "orders" || activeTab === "invoices") {
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
    } finally {
      setTabLoading(false);
    }
  };

  // Fetch data when authenticated or active tab changes
  useEffect(() => {
    if (token && tabReady) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTab, tabReady]);

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
      setAdminProfileForm({
        name: data.user.name || "Sillhouete Boutique Admin",
        email: data.user.email || "admin@sillhouete.com",
        currentPassword: data.user.currentPassword || loginPassword || "admin123",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setLoginError(err.message || "Invalid email or password.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Consolidate images array:
    // images[0] = front_image
    // images[1] = hover_image
    // images[2...] = gallery_images
    const allImages: string[] = [];
    if (prodForm.front_image && prodForm.front_image.trim()) {
      allImages.push(prodForm.front_image.trim());
    }
    if (prodForm.hover_image && prodForm.hover_image.trim()) {
      allImages.push(prodForm.hover_image.trim());
    }
    (prodForm.gallery_images || []).forEach((img) => {
      const trimmed = (img || "").trim();
      if (trimmed && !allImages.includes(trimmed)) {
        allImages.push(trimmed);
      }
    });
    if (allImages.length === 0) {
      allImages.push(DEFAULT_FALLBACK_IMAGE);
    }

    const payload = {
      title: prodForm.title.trim(),
      category: prodForm.category,
      product_type: prodForm.category,
      price: parseFloat(prodForm.price) || 0,
      compare_at_price: prodForm.compare_at_price ? parseFloat(prodForm.compare_at_price) : null,
      images: allImages,
      video_url: prodForm.video_url.trim(),
      fabric: prodForm.fabric.trim(),
      color: prodForm.color.trim(),
      pieces: prodForm.pieces.trim(),
      dress_style: prodForm.dress_style.trim(),
      work_details: prodForm.work_details.trim(),
      delivery_time: prodForm.delivery_time.trim(),
      care_instructions: prodForm.care_instructions.trim(),
      description: prodForm.description,
      in_stock: prodForm.in_stock,
      is_new: prodForm.is_new,
      is_featured: prodForm.is_featured,
      sizes: prodForm.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      tags: (() => {
        const userTags = prodForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
        if (prodForm.category && !userTags.some((t) => t.toLowerCase() === prodForm.category.toLowerCase())) {
          userTags.unshift(prodForm.category);
        }
        return userTags;
      })(),
    };

    try {
      const url = editingProduct
        ? `${API_BASE}/products/${editingProduct.id || editingProduct._id}`
        : `${API_BASE}/products`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save product");
      }

      setShowAddProductModal(false);
      setEditingProduct(null);
      fetchDashboardData();
      const pRes = await fetch(`${API_BASE}/products?limit=500`);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData.products || []);
      }
    } catch (err: any) {
      alert(err.message || "Failed to save product");
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
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddGalleryImage = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const trimmed = galleryInput.trim();
    if (!trimmed) return;
    if (!prodForm.gallery_images.includes(trimmed)) {
      setProdForm((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, trimmed],
      }));
    }
    setGalleryInput("");
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setProdForm((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Upload Helpers for Images & Media
  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/upload/single`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "File upload failed");
    }
    const data = await res.json();
    return data.url;
  };

  const handleFrontFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFront(true);
    try {
      const url = await uploadSingleFile(file);
      setProdForm((prev) => ({ ...prev, front_image: url }));
    } catch (err: any) {
      alert("Front image upload failed: " + err.message);
    } finally {
      setIsUploadingFront(false);
      if (frontFileRef.current) frontFileRef.current.value = "";
    }
  };

  const handleHoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingHover(true);
    try {
      const url = await uploadSingleFile(file);
      setProdForm((prev) => ({ ...prev, hover_image: url }));
    } catch (err: any) {
      alert("Hover image upload failed: " + err.message);
    } finally {
      setIsUploadingHover(false);
      if (hoverFileRef.current) hoverFileRef.current.value = "";
    }
  };

  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      const res = await fetch(`${API_BASE}/upload/multiple`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Multiple images upload failed");
      }
      const data = await res.json();
      if (data.urls && Array.isArray(data.urls)) {
        setProdForm((prev) => ({
          ...prev,
          gallery_images: [...prev.gallery_images, ...data.urls],
        }));
      }
    } catch (err: any) {
      alert("Gallery images upload failed: " + err.message);
    } finally {
      setIsUploadingGallery(false);
      if (galleryFilesRef.current) galleryFilesRef.current.value = "";
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    try {
      const url = await uploadSingleFile(file);
      setProdForm((prev) => ({ ...prev, video_url: url }));
    } catch (err: any) {
      alert("Video upload failed: " + err.message);
    } finally {
      setIsUploadingVideo(false);
      if (videoFileRef.current) videoFileRef.current.value = "";
    }
  };

  const handleCatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCat(true);
    try {
      const url = await uploadSingleFile(file);
      setCatForm((prev) => ({ ...prev, image: url }));
    } catch (err: any) {
      alert("Category image upload failed: " + err.message);
    } finally {
      setIsUploadingCat(false);
      if (catFileRef.current) catFileRef.current.value = "";
    }
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCatError("");
    setCatSuccess("");
    setCatLoading(true);

    const selectedParent = categories.find((c) => (c.id || c._id) === catForm.parent_id);
    const payload = {
      name: catForm.name.trim(),
      slug: catForm.slug.trim() || undefined,
      parent_id: catForm.parent_id || null,
      parent_name: selectedParent ? selectedParent.name : null,
      description: catForm.description.trim(),
      image: catForm.image.trim(),
      display_order: Number(catForm.display_order) || 1,
      is_active: catForm.is_active,
    };

    try {
      const url = editingCategory
        ? `${API_BASE}/categories/${editingCategory.id || editingCategory._id}`
        : `${API_BASE}/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      setCatSuccess(data.message || "Category saved successfully!");
      setShowCategoryModal(false);
      setEditingCategory(null);
      await fetchCategories();
      // Also refresh products in case any category rename synchronized existing outfits
      const pRes = await fetch(`${API_BASE}/products?limit=500`);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData.products || []);
      }
    } catch (err: any) {
      setCatError(err.message || "Failed to save category");
    } finally {
      setCatLoading(false);
    }
  };

  const handleResetAllCategories = async () => {
    if (!token) return;
    if (!confirm("Are you sure you want to reset and restore all 34 Couture Collections and Subcategories from the store navigation? Existing custom categories will be refreshed to default.")) return;
    setResettingCategories(true);
    setCatError("");
    try {
      const res = await fetch(`${API_BASE}/categories/reset-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset categories");
      }
      setCatSuccess(data.message || "Successfully restored all 34 categories!");
      await fetchCategories();
      const pRes = await fetch(`${API_BASE}/products?limit=500`);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData.products || []);
      }
    } catch (err: any) {
      alert(err.message || "Failed to reset categories");
    } finally {
      setResettingCategories(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete category "${cat.name}"? Outfits in this collection will not be deleted.`)) return;

    try {
      const res = await fetch(`${API_BASE}/categories/${cat.id || cat._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category");
      }
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  const handleQuickAddCategory = async () => {
    if (!token || !quickCatName.trim()) return;
    setQuickCatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: quickCatName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create category");
      }
      await fetchCategories();
      setProdForm((prev) => ({ ...prev, category: data.category.name }));
      setQuickCatName("");
      setShowQuickAddCat(false);
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    } finally {
      setQuickCatLoading(false);
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
      featured_image: blogForm.featured_image || "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-sublime-Lilac-intricate-embroidery.jpg?v=1776332402",
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
                  placeholder="Enter administrator email"
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
                  placeholder="Enter administrator password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none bg-white text-[#111]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#0e3359] text-white py-3 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a2542] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
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
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col md:flex-row font-sans-custom text-[#111111]">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* ========================================================= */}
      {/* LUXURY MODERN SIDEBAR                                      */}
      {/* ========================================================= */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-white text-[#374151] flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-[#e5e7eb] shrink-0 select-none shadow-xs ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
          <div>
            <Link href="/" className="inline-block">
              <span className="font-serif text-[20px] font-bold tracking-[0.25em] uppercase text-black block">
                SILLHOUETE
              </span>
            </Link>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden text-[#9ca3af] hover:text-black p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#9ca3af] font-semibold px-3 mb-2">
              Store Management
            </p>
            <nav className="space-y-1">
              {[
                {
                  id: "dashboard",
                  label: "Dashboard",
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-4a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
                    </svg>
                  ),
                },
                {
                  id: "products",
                  label: "Products Catalog",
                  badge: products.length || "167",
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  ),
                },
                {
                  id: "categories",
                  label: "Collections & Categories",
                  badge: categories.length || undefined,
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ),
                },
                {
                  id: "orders",
                  label: "Orders & Stripe",
                  badge: orders.length || "3",
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  ),
                },
                {
                  id: "invoices",
                  label: "Invoices",
                  badge: orders.length || "3",
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                },
                {
                  id: "customers",
                  label: "Customers",
                  badge: customers.length || "4",
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      selectTab(item.id as Tab);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium rounded-xs transition-all cursor-pointer ${isActive
                        ? "bg-[#0e3359] text-white font-semibold shadow-xs"
                        : "text-[#4b5563] hover:text-[#0e3359] hover:bg-[#f3f4f6]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive
                            ? "bg-white text-[#0e3359] font-bold"
                            : "bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]"
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#9ca3af] font-semibold px-3 mb-2">
              Content & Settings
            </p>
            <nav className="space-y-1">
              {[
                {
                  id: "inquiries",
                  label: "Messages & Inquiries",
                  badge: stats?.metrics?.unreadMessagesCount > 0 ? `${stats.metrics.unreadMessagesCount} new` : null,
                  badgeHighlight: true,
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ),
                },
                {
                  id: "blogs",
                  label: "Editorial Blogs",
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  ),
                },
                {
                  id: "settings",
                  label: "Website Settings",
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
                {
                  id: "profile",
                  label: "Admin Account & Security",
                  icon: (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      selectTab(item.id as Tab);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium rounded-xs transition-all cursor-pointer ${isActive
                        ? "bg-[#0e3359] text-white font-semibold shadow-xs"
                        : "text-[#4b5563] hover:text-[#0e3359] hover:bg-[#f3f4f6]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${item.badgeHighlight
                            ? isActive
                              ? "bg-amber-300 text-black"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                            : isActive
                              ? "bg-white text-[#0e3359]"
                              : "bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]"
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT WRAPPER                                       */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#e5e7eb] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-[#4b5563] hover:text-black rounded-xs border border-[#e5e7eb] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-[16px] font-bold text-[#111827] font-serif tracking-wide">
                Admin Dashboard
              </h1>
              {tabLoading && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0e3359] bg-[#eef2ff] px-2.5 py-0.5 rounded-full border border-[#c7d2fe]">
                  <span className="w-2 h-2 rounded-full bg-[#0e3359] animate-pulse" />
                  Loading...
                </span>
              )}
            </div>
          </div>

          {/* User Account Avatar & Dropdown Card */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-1 rounded-full hover:bg-[#f3f4f6] border border-transparent hover:border-[#e5e7eb] transition-all cursor-pointer flex items-center justify-center"
              title="Admin Account"
            >
              <div className="w-9 h-9 rounded-full bg-[#0e3359] text-white flex items-center justify-center font-bold text-[13px] shadow-xs hover:scale-105 transition-transform">
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "S"}
              </div>
            </button>

            {/* Dropdown Card */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e5e7eb] shadow-xl rounded-xs p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-[#f0f0f0]">
                  <div className="w-10 h-10 rounded-full bg-[#0e3359] text-white flex items-center justify-center font-bold text-[14px] shrink-0">
                    {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#111827] truncate font-serif">
                      {adminUser?.name || "Sillhouete Boutique Admin"}
                    </p>
                    <p className="text-[11px] text-[#6b7280] truncate font-mono">
                      {adminUser?.email || "admin@sillhouete.com"}
                    </p>
                  </div>
                </div>

                <div className="py-2 border-b border-[#f0f0f0]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      selectTab("profile");
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-[12px] font-medium text-[#111827] hover:bg-[#f3f4f6] rounded-xs transition-colors cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#0e3359]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account &amp; Password
                    </span>
                    <span className="text-[11px] text-[#0e3359] font-bold">Edit →</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold uppercase tracking-wider pt-3">
                  <Link
                    href="/"
                    target="_blank"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="text-center py-2 bg-white text-[#374151] hover:text-black hover:bg-[#f3f4f6] border border-[#d1d5db] transition-colors rounded-xs shadow-2xs"
                  >
                    STORE ↗
                  </Link>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="py-2 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 transition-colors rounded-xs cursor-pointer shadow-2xs"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {/* ========================================================= */}
          {/* 1. DASHBOARD OVERVIEW TAB                                 */}
          {/* ========================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 border border-[#e5e5e5] rounded-lg shadow-xs">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#777777]">Total Sales (PKR)</p>
                  <p className="text-[26px] font-serif font-bold text-black mt-2">
                    Rs.{Number(stats?.metrics?.totalRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                    ✓ Verified Stripe &amp; Completed Orders
                  </p>
                </div>

                <div className="bg-white p-6 border border-[#e5e5e5] rounded-lg shadow-xs">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#777777]">Total Orders</p>
                  <p className="text-[26px] font-serif font-bold text-black mt-2">
                    {stats?.metrics?.totalOrders || 0}
                  </p>
                  <p className="text-[11px] text-[#666666] mt-1">
                    Active fulfillment pipeline
                  </p>
                </div>

                <div className="bg-white p-6 border border-[#e5e5e5] rounded-lg shadow-xs">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#777777]">Catalog Outfits</p>
                  <p className="text-[26px] font-serif font-bold text-black mt-2">
                    {stats?.metrics?.totalProducts || 0}
                  </p>
                  <p className="text-[11px] text-[#666666] mt-1">
                    Bridal, Formals, &amp; Luxury Pret
                  </p>
                </div>

                <div className="bg-white p-6 border border-[#e5e5e5] rounded-lg shadow-xs">
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
              <div className="bg-white p-6 border border-[#e5e5e5] rounded-lg shadow-xs">
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-black mb-4">
                  Order Fulfillment Pipeline
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-[12px]">
                  <div className="p-3 bg-[#fafafa] border border-[#f0f0f0] rounded-md">
                    <p className="text-[#777777] uppercase text-[11px]">Pending</p>
                    <p className="text-[20px] font-bold text-amber-600 mt-1">{stats?.statusCounts?.pending || 0}</p>
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#f0f0f0] rounded-md">
                    <p className="text-[#777777] uppercase text-[11px]">Processing</p>
                    <p className="text-[20px] font-bold text-blue-600 mt-1">{stats?.statusCounts?.processing || 0}</p>
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#f0f0f0] rounded-md">
                    <p className="text-[#777777] uppercase text-[11px]">Shipped</p>
                    <p className="text-[20px] font-bold text-indigo-600 mt-1">{stats?.statusCounts?.shipped || 0}</p>
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#f0f0f0] rounded-md">
                    <p className="text-[#777777] uppercase text-[11px]">Delivered</p>
                    <p className="text-[20px] font-bold text-emerald-600 mt-1">{stats?.statusCounts?.delivered || 0}</p>
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#f0f0f0] rounded-md">
                    <p className="text-[#777777] uppercase text-[11px]">Cancelled</p>
                    <p className="text-[20px] font-bold text-red-600 mt-1">{stats?.statusCounts?.cancelled || 0}</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
                  <h3 className="text-[14px] font-bold uppercase tracking-wider text-black">
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => selectTab("orders")}
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
                      {(stats?.recentOrders || []).map((o: any, idx: number) => (
                        <tr key={o._id || o.id || idx} className="hover:bg-[#fafafa]">
                          <td className="py-4 px-6 font-mono font-semibold text-black">{o.id}</td>
                          <td className="py-4 px-6">
                            <p className="font-medium text-black">{o.customer?.first_name} {o.customer?.last_name}</p>
                            <p className="text-[11px] text-[#777777]">{o.customer?.email}</p>
                          </td>
                          <td className="py-4 px-6">{o.items?.length || 0} dress(es)</td>
                          <td className="py-4 px-6 font-semibold text-black">Rs.{Number(o.total || 0).toLocaleString()}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold uppercase rounded-xs ${o.payment_status === "paid" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800"
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

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProdForm({
                        title: "",
                        category: categories[0]?.name || "Formal",
                        price: "45000",
                        compare_at_price: "",
                        front_image: "",
                        hover_image: "",
                        gallery_images: [],
                        video_url: "",
                        fabric: "Pure Raw Silk 80g",
                        color: "",
                        pieces: "3-Piece (Shirt, Dupatta & Trouser)",
                        dress_style: "Kalidar Maxi",
                        work_details: "Handcrafted Zardozi, Kora Dabka, Resham and Sequins",
                        delivery_time: "Ready to Dispatch (3-5 business days)",
                        care_instructions: "Dry Clean Only",
                        sizes: "XS, S, M, L, XL, Custom Size",
                        tags: "Formal, Luxury Couture, Handcrafted",
                        description: "<p>Pakistani luxury designer outfit crafted with premium fabrics and detailed handwork.</p>",
                        in_stock: true,
                        is_new: true,
                        is_featured: false,
                      });
                      setGalleryInput("");
                      setFrontUploadMode("file");
                      setHoverUploadMode("file");
                      setGalleryUploadMode("file");
                      setVideoUploadMode("file");
                      setShowAddProductModal(true);
                    }}
                    className="bg-[#0e3359] text-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#0a2542] transition-colors cursor-pointer shadow-xs flex items-center gap-2 rounded-md"
                  >
                    + Add New Outfit
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-white p-4 border border-[#e5e5e5] rounded-lg shadow-xs flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title, tag, or handle..."
                  className="flex-1 px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none text-[13px] w-full rounded-md"
                />
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none text-[13px] bg-white w-full sm:w-auto rounded-md font-medium"
                >
                  <option value="all">All Collections ({products.length})</option>
                  {categories
                    .filter((c) => !c.parent_id)
                    .map((parent) => {
                      const subs = categories.filter((s) => s.parent_id === (parent.id || parent._id));
                      return (
                        <optgroup key={parent.id || parent._id || parent.name} label={`📁 ${parent.name}`}>
                          <option value={parent.name}>
                            {parent.name} ({parent.product_count ?? 0})
                          </option>
                          {subs.map((sub) => (
                            <option key={sub.id || sub._id || sub.name} value={sub.name}>
                              &nbsp;&nbsp;↳ {sub.name} ({sub.product_count ?? 0})
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  {/* Any fallback categories from existing products */}
                  {Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
                    .filter((catName) => !categories.some((c) => c.name.toLowerCase() === catName.toLowerCase()))
                    .map((extraCat) => (
                      <option key={extraCat} value={extraCat}>
                        {extraCat}
                      </option>
                    ))}
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
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
                            (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase())) ||
                            (Array.isArray(p.tags) && p.tags.some((t: string) => String(t).toLowerCase().includes(productSearch.toLowerCase())));

                          const matchesCat = (() => {
                            if (productCategory === "all") return true;
                            const selCat = productCategory.trim().toLowerCase();
                            const pCat = (p.category || "").trim().toLowerCase();
                            const pType = (p.product_type || "").trim().toLowerCase();
                            const pTags = Array.isArray(p.tags) ? p.tags.map((t: string) => String(t).trim().toLowerCase()) : [];
                            const pTitle = (p.title || "").trim().toLowerCase();

                            // 1. Direct or partial match on category, product_type or tags
                            if (pCat === selCat || pType === selCat || pTags.includes(selCat)) return true;
                            if (pCat.includes(selCat) || pTags.some((t: string) => t.includes(selCat) || selCat.includes(t))) return true;

                            // 2. Parent collection match (all products in parent or its subcategories)
                            const parentCat = categories.find((c) => !c.parent_id && c.name.toLowerCase() === selCat);
                            if (parentCat) {
                              const subCats = categories.filter((s) => s.parent_id === (parentCat.id || parentCat._id));
                              const subNames = subCats.map((s) => s.name.toLowerCase());
                              const subSlugs = subCats.map((s) => (s.slug || "").toLowerCase()).filter(Boolean);

                              if (subNames.includes(pCat) || subSlugs.includes(pCat)) return true;
                              if (pTags.some((t: string) => subNames.includes(t) || subSlugs.includes(t))) return true;
                              if (subNames.some((sn: string) => pCat.includes(sn) || pTags.some((t: string) => t.includes(sn)))) return true;
                            }

                            // 3. Subcategory match by name, slug or root keywords
                            const targetCat = categories.find((c) => c.name.toLowerCase() === selCat);
                            if (targetCat) {
                              const targetSlug = (targetCat.slug || "").toLowerCase();
                              if (targetSlug && (pCat === targetSlug || pTags.includes(targetSlug))) return true;
                              
                              const rootWords = targetCat.name
                                .toLowerCase()
                                .split(/[^a-z0-9]+/)
                                .filter((w: string) => w.length >= 4 && !["luxury", "pret", "formals", "formal", "dresses", "collection", "birdal", "bridal", "arrivals"].includes(w));
                              if (rootWords.length > 0 && rootWords.some((rw: string) => pTitle.includes(rw) || pCat.includes(rw) || pTags.some((t: string) => t.includes(rw)))) {
                                return true;
                              }
                            }

                            return false;
                          })();
                          return matchesSearch && matchesCat;
                        })
                        .slice(0, 500)
                        .map((prod: any, idx: number) => (
                          <tr key={prod._id || prod.id || idx} className="hover:bg-[#fafafa]">
                            <td className="py-3 px-6">
                              <AdminThumbnail
                                src={prod.images && prod.images[0]}
                                alt={prod.title}
                              />
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
                              <span className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase ${prod.in_stock !== false ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                                }`}>
                                {prod.in_stock !== false ? "In Stock" : "Sold Out"}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right space-x-2">
                              <button
                                onClick={() => {
                                  const prodImages = Array.isArray(prod.images) ? prod.images : [];
                                  const frontImg = prodImages[0] || "";
                                  const hoverImg = prodImages[1] || "";
                                  const galleryImgs = prodImages.slice(2);

                                  setEditingProduct(prod);
                                  setProdForm({
                                    title: prod.title || "",
                                    category: prod.category || (categories[0]?.name || "Formal"),
                                    price: prod.price !== undefined ? String(prod.price) : "",
                                    compare_at_price: prod.compare_at_price ? String(prod.compare_at_price) : "",
                                    front_image: frontImg,
                                    hover_image: hoverImg,
                                    gallery_images: galleryImgs,
                                    video_url: prod.video_url || "",
                                    fabric: prod.fabric || "Pure Raw Silk 80g",
                                    color: prod.color || "",
                                    pieces: prod.pieces || "3-Piece (Shirt, Dupatta & Trouser)",
                                    dress_style: prod.dress_style || "Kalidar Maxi",
                                    work_details: prod.work_details || "",
                                    delivery_time: prod.delivery_time || "Ready to Dispatch (3-5 business days)",
                                    care_instructions: prod.care_instructions || "Dry Clean Only",
                                    sizes: Array.isArray(prod.sizes) ? prod.sizes.join(", ") : "XS, S, M, L, XL, Custom Size",
                                    tags: Array.isArray(prod.tags) ? prod.tags.join(", ") : "",
                                    description: prod.description || "",
                                    in_stock: prod.in_stock !== false,
                                    is_new: !!prod.is_new,
                                    is_featured: !!prod.is_featured,
                                  });
                                  setGalleryInput("");
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
              </div>

              {/* Modal for Add / Edit Product */}
              {showAddProductModal && (
                <div
                  className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setShowAddProductModal(false);
                  }}
                >
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
                    {/* Fixed Modal Header */}
                    <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between shrink-0 bg-white">
                      <div>
                        <h3 className="text-[17px] font-serif font-bold uppercase tracking-wider text-black">
                          {editingProduct ? "Edit Designer Outfit" : "Add New Designer Outfit"}
                        </h3>
                        <p className="text-[12px] text-[#666666] mt-0.5">
                          Configure front &amp; hover photography, gallery images, video reel, and couture tailoring specs.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-black hover:bg-[#f1f5f9] rounded-full transition-colors cursor-pointer text-lg font-bold"
                        title="Close"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Scrollable Modal Form Body */}
                    <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto flex flex-col">
                      <div className="p-6 space-y-6 text-[13px] flex-1 overflow-y-auto">
                        {/* 1. Basic Information & Collection */}
                        <div className="bg-[#fafbfc] border border-[#e2e8f0] p-4 sm:p-5 rounded-lg space-y-4">
                          <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#0e3359] border-b border-[#e2e8f0] pb-2 flex items-center gap-1.5">
                            <span>1. Essential Information &amp; Pricing</span>
                          </h4>

                          <div>
                            <label className="block text-[#334155] font-semibold mb-1">Product Title *</label>
                            <input
                              type="text"
                              required
                              value={prodForm.title}
                              onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                              placeholder="e.g. Zarqaa Embroidered Raw Silk 3-Piece"
                              className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black font-medium"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[#334155] font-semibold">Collection / Category *</label>
                                <button
                                  type="button"
                                  onClick={() => setShowQuickAddCat(!showQuickAddCat)}
                                  className="text-[11px] text-[#0e3359] hover:underline font-bold cursor-pointer"
                                >
                                  {showQuickAddCat ? "Cancel" : "+ New"}
                                </button>
                              </div>

                              {showQuickAddCat && (
                                <div className="flex gap-1.5 mb-2 p-1.5 bg-white border border-[#cbd5e1] rounded">
                                  <input
                                    type="text"
                                    placeholder="Category name..."
                                    value={quickCatName}
                                    onChange={(e) => setQuickCatName(e.target.value)}
                                    className="flex-1 px-2 py-1 text-[11px] border border-[#94a3b8] rounded outline-none"
                                  />
                                  <button
                                    type="button"
                                    disabled={quickCatLoading || !quickCatName.trim()}
                                    onClick={handleQuickAddCategory}
                                    className="px-2.5 py-1 bg-[#0e3359] text-white text-[10px] font-bold uppercase rounded cursor-pointer disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                </div>
                              )}

                              <select
                                value={prodForm.category}
                                onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none bg-white rounded-md font-medium text-[12.5px]"
                              >
                                <option value="" disabled>Select collection...</option>
                                {categories
                                  .filter((c) => !c.parent_id)
                                  .map((parent) => {
                                    const subs = categories.filter((s) => s.parent_id === (parent.id || parent._id));
                                    return (
                                      <optgroup key={parent.id || parent._id || parent.name} label={`📁 ${parent.name}`}>
                                        <option value={parent.name}>{parent.name} (Main Collection)</option>
                                        {subs.map((sub) => (
                                          <option key={sub.id || sub._id || sub.name} value={sub.name}>
                                            &nbsp;&nbsp;↳ {sub.name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    );
                                  })}
                                {categories.filter((c) => c.parent_id && !categories.some((p) => (p.id || p._id) === c.parent_id)).length > 0 && (
                                  <optgroup label="Other Subcategories">
                                    {categories
                                      .filter((c) => c.parent_id && !categories.some((p) => (p.id || p._id) === c.parent_id))
                                      .map((sub) => (
                                        <option key={sub.id || sub._id || sub.name} value={sub.name}>
                                          {sub.name}
                                        </option>
                                      ))}
                                  </optgroup>
                                )}
                                {prodForm.category && !categories.some((c) => c.name.toLowerCase() === prodForm.category.toLowerCase()) && (
                                  <optgroup label="Custom / Legacy">
                                    <option value={prodForm.category}>{prodForm.category}</option>
                                  </optgroup>
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[#334155] font-semibold mb-1">Selling Price (PKR) *</label>
                              <input
                                type="number"
                                required
                                value={prodForm.price}
                                onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                                placeholder="45000"
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black font-semibold text-[13px]"
                              />
                            </div>

                            <div>
                              <label className="block text-[#334155] font-semibold mb-1">
                                Compare Price (Optional Sale)
                              </label>
                              <input
                                type="number"
                                value={prodForm.compare_at_price}
                                onChange={(e) => setProdForm({ ...prodForm, compare_at_price: e.target.value })}
                                placeholder="e.g. 55000"
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black text-[13px]"
                              />
                              <span className="text-[10px] text-[#64748b] block mt-0.5">Shows crossed-out original price</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Front & Hover Imagery (Card Views) */}
                        <div className="bg-[#fafbfc] border border-[#e2e8f0] p-4 sm:p-5 rounded-lg space-y-4">
                          <div>
                            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#0e3359] flex items-center justify-between">
                              <span>2. Product Photography (Front &amp; Hover Views)</span>
                              <span className="text-[11px] text-[#64748b] font-normal normal-case">Choose file from device or paste link</span>
                            </h4>
                            <p className="text-[11px] text-[#64748b] mt-0.5">
                              Upload directly from computer/mobile or paste links. Front image displays by default; hover image smoothly reveals when shoppers mouseover the outfit card.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Front Image Box */}
                            <div className="bg-white p-3.5 border border-[#e2e8f0] rounded-lg flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-[12px] font-bold text-black uppercase tracking-wide">
                                    Primary / Front Image *
                                  </label>
                                  <div className="inline-flex rounded-md border border-[#cbd5e1] p-0.5 bg-[#f1f5f9] text-[10.5px]">
                                    <button
                                      type="button"
                                      onClick={() => setFrontUploadMode("file")}
                                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                        frontUploadMode === "file" ? "bg-[#0e3359] text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                      }`}
                                    >
                                      📁 Upload File
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setFrontUploadMode("url")}
                                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                        frontUploadMode === "url" ? "bg-[#0e3359] text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                      }`}
                                    >
                                      🔗 Paste URL
                                    </button>
                                  </div>
                                </div>

                                {frontUploadMode === "file" ? (
                                  <div>
                                    <input
                                      type="file"
                                      ref={frontFileRef}
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleFrontFileChange}
                                    />
                                    <div
                                      onClick={() => frontFileRef.current?.click()}
                                      className={`border-2 border-dashed rounded-lg p-3.5 text-center cursor-pointer transition-all ${
                                        isUploadingFront
                                          ? "border-[#0e3359] bg-[#f0f9ff]"
                                          : "border-[#cbd5e1] hover:border-[#0e3359] hover:bg-[#f8fafc]"
                                      }`}
                                    >
                                      {isUploadingFront ? (
                                        <div className="py-2 text-[#0e3359] text-[12px] font-semibold flex items-center justify-center gap-2">
                                          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                          Uploading front photo...
                                        </div>
                                      ) : (
                                        <div className="py-1">
                                          <span className="text-xl block mb-1">📁</span>
                                          <span className="text-[12px] font-bold text-[#0e3359] block">
                                            {prodForm.front_image ? "Click to change / replace front photo" : "Click to select Front Photo from Computer"}
                                          </span>
                                          <span className="text-[10px] text-[#64748b] block mt-0.5">
                                            Supports JPG, PNG, WEBP from your hard drive or phone
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <input
                                      type="text"
                                      value={prodForm.front_image}
                                      onChange={(e) => setProdForm({ ...prodForm, front_image: e.target.value })}
                                      placeholder="https://..."
                                      className="w-full px-3 py-1.5 border border-[#cbd5e1] focus:border-[#0e3359] outline-none rounded text-[12px] text-black"
                                    />
                                    <span className="text-[10px] text-[#64748b] block mt-1">Paste online image link</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9]">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-14 h-20 bg-[#f1f5f9] rounded border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center">
                                    {prodForm.front_image ? (
                                      <img
                                        src={prodForm.front_image}
                                        alt="Front Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                                        }}
                                      />
                                    ) : (
                                      <span className="text-[9px] text-[#94a3b8]">No Photo</span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#64748b]">
                                    <span className="font-semibold text-black block">Front View Preview</span>
                                    {prodForm.front_image ? "✓ Ready for Catalog" : "No image selected yet"}
                                  </div>
                                </div>
                                {prodForm.front_image && (
                                  <button
                                    type="button"
                                    onClick={() => setProdForm({ ...prodForm, front_image: "" })}
                                    className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
                                  >
                                    Clear ✕
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Hover Image Box */}
                            <div className="bg-white p-3.5 border border-[#e2e8f0] rounded-lg flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-[12px] font-bold text-black uppercase tracking-wide">
                                    Secondary / Hover Image
                                  </label>
                                  <div className="inline-flex rounded-md border border-[#cbd5e1] p-0.5 bg-[#f1f5f9] text-[10.5px]">
                                    <button
                                      type="button"
                                      onClick={() => setHoverUploadMode("file")}
                                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                        hoverUploadMode === "file" ? "bg-amber-600 text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                      }`}
                                    >
                                      📁 Upload File
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setHoverUploadMode("url")}
                                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                        hoverUploadMode === "url" ? "bg-amber-600 text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                      }`}
                                    >
                                      🔗 Paste URL
                                    </button>
                                  </div>
                                </div>

                                {hoverUploadMode === "file" ? (
                                  <div>
                                    <input
                                      type="file"
                                      ref={hoverFileRef}
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleHoverFileChange}
                                    />
                                    <div
                                      onClick={() => hoverFileRef.current?.click()}
                                      className={`border-2 border-dashed rounded-lg p-3.5 text-center cursor-pointer transition-all ${
                                        isUploadingHover
                                          ? "border-amber-600 bg-amber-50"
                                          : "border-[#cbd5e1] hover:border-amber-600 hover:bg-[#fffbeb]"
                                      }`}
                                    >
                                      {isUploadingHover ? (
                                        <div className="py-2 text-amber-700 text-[12px] font-semibold flex items-center justify-center gap-2">
                                          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                          Uploading hover photo...
                                        </div>
                                      ) : (
                                        <div className="py-1">
                                          <span className="text-xl block mb-1">✨</span>
                                          <span className="text-[12px] font-bold text-amber-800 block">
                                            {prodForm.hover_image ? "Click to change hover photo" : "Click to select Hover Photo from Computer"}
                                          </span>
                                          <span className="text-[10px] text-[#64748b] block mt-0.5">
                                            Reveals smoothly on mouse hover
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <input
                                      type="text"
                                      value={prodForm.hover_image}
                                      onChange={(e) => setProdForm({ ...prodForm, hover_image: e.target.value })}
                                      placeholder="https://..."
                                      className="w-full px-3 py-1.5 border border-[#cbd5e1] focus:border-[#0e3359] outline-none rounded text-[12px] text-black"
                                    />
                                    <span className="text-[10px] text-[#64748b] block mt-1">Paste online image link</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9]">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-14 h-20 bg-[#f1f5f9] rounded border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center">
                                    {prodForm.hover_image ? (
                                      <img
                                        src={prodForm.hover_image}
                                        alt="Hover Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                                        }}
                                      />
                                    ) : (
                                      <span className="text-[9px] text-[#94a3b8]">Optional</span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#64748b]">
                                    <span className="font-semibold text-black block">Catalog Hover Preview</span>
                                    {prodForm.hover_image ? "✓ Hover effect active" : "Optional secondary view"}
                                  </div>
                                </div>
                                {prodForm.hover_image && (
                                  <button
                                    type="button"
                                    onClick={() => setProdForm({ ...prodForm, hover_image: "" })}
                                    className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
                                  >
                                    Clear ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Additional Gallery Photos & Video Showcase */}
                        <div className="bg-[#fafbfc] border border-[#e2e8f0] p-4 sm:p-5 rounded-lg space-y-5">
                          <div>
                            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#0e3359] flex items-center justify-between">
                              <span>3. Outfit Gallery Photos &amp; Video Showcase</span>
                              <span className="text-[11px] text-[#64748b] font-normal normal-case">Select Multiple Photos at Once</span>
                            </h4>
                            <p className="text-[11px] text-[#64748b] mt-0.5">
                              Add detailed close-ups (Dupatta, Back cut, Embroidery, Sleeves) and optional video reel.
                            </p>
                          </div>

                          {/* Gallery Photos Upload */}
                          <div className="bg-white p-4 border border-[#e2e8f0] rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[12px] font-bold text-black uppercase tracking-wide">
                                Gallery Photos ({prodForm.gallery_images?.length || 0} Photos Added)
                              </label>
                              <div className="inline-flex rounded-md border border-[#cbd5e1] p-0.5 bg-[#f1f5f9] text-[10.5px]">
                                <button
                                  type="button"
                                  onClick={() => setGalleryUploadMode("file")}
                                  className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                    galleryUploadMode === "file" ? "bg-[#0e3359] text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                  }`}
                                >
                                  📁 Upload from Computer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setGalleryUploadMode("url")}
                                  className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                    galleryUploadMode === "url" ? "bg-[#0e3359] text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                  }`}
                                >
                                  🔗 Paste URL
                                </button>
                              </div>
                            </div>

                            {galleryUploadMode === "file" ? (
                              <div>
                                <input
                                  type="file"
                                  ref={galleryFilesRef}
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleGalleryFilesChange}
                                />
                                <div
                                  onClick={() => galleryFilesRef.current?.click()}
                                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                                    isUploadingGallery
                                      ? "border-[#0e3359] bg-[#f0f9ff]"
                                      : "border-[#cbd5e1] hover:border-[#0e3359] hover:bg-[#f8fafc]"
                                  }`}
                                >
                                  {isUploadingGallery ? (
                                    <div className="py-2 text-[#0e3359] text-[12px] font-semibold flex items-center justify-center gap-2">
                                      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                      Uploading photos to server...
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-2xl block mb-1">📸</span>
                                      <span className="text-[13px] font-bold text-[#0e3359] block">
                                        Click to Choose Multiple Photos from Computer
                                      </span>
                                      <span className="text-[11px] text-[#64748b] block mt-0.5">
                                        Select 1, 5, or 10 photos simultaneously (Dupatta, Back, Sleeves, Embroidery closeups)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={galleryInput}
                                  onChange={(e) => setGalleryInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddGalleryImage();
                                    }
                                  }}
                                  placeholder="Paste image link here and click '+ Add Photo'..."
                                  className="flex-1 px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black text-[12.5px]"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddGalleryImage}
                                  className="px-4 py-2 bg-[#0e3359] text-white text-[12px] font-bold uppercase rounded-md hover:bg-[#0a2542] transition-colors cursor-pointer shrink-0"
                                >
                                  + Add Photo
                                </button>
                              </div>
                            )}

                            {/* Gallery Photos Grid Preview */}
                            {prodForm.gallery_images && prodForm.gallery_images.length > 0 ? (
                              <div className="mt-3 flex flex-wrap gap-2.5 p-3 bg-[#fafbfc] border border-[#e2e8f0] rounded-md">
                                {prodForm.gallery_images.map((gImg, gIdx) => (
                                  <div
                                    key={gIdx}
                                    className="relative group w-20 h-28 rounded-md border border-[#cbd5e1] overflow-hidden bg-white shadow-xs shrink-0"
                                  >
                                    <img
                                      src={gImg}
                                      alt={`Gallery photo ${gIdx + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                                      }}
                                    />
                                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] font-bold text-center py-0.5">
                                      Photo #{gIdx + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveGalleryImage(gIdx)}
                                      className="absolute top-1 right-1 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-md cursor-pointer transition-transform hover:scale-110"
                                      title="Remove photo"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-[#64748b] italic">
                                No additional gallery photos added yet. Use the upload box above to select photos from your device.
                              </p>
                            )}
                          </div>

                          {/* Video Showcase Upload */}
                          <div className="bg-white p-4 border border-[#e2e8f0] rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[12px] font-bold text-black uppercase tracking-wide">
                                Outfit Video Reel Showcase
                              </label>
                              <div className="inline-flex rounded-md border border-[#cbd5e1] p-0.5 bg-[#f1f5f9] text-[10.5px]">
                                <button
                                  type="button"
                                  onClick={() => setVideoUploadMode("file")}
                                  className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                    videoUploadMode === "file" ? "bg-[#0e3359] text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                  }`}
                                >
                                  📁 Upload Video (.mp4)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setVideoUploadMode("url")}
                                  className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                    videoUploadMode === "url" ? "bg-[#0e3359] text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                  }`}
                                >
                                  🔗 YouTube / Video URL
                                </button>
                              </div>
                            </div>

                            {videoUploadMode === "file" ? (
                              <div>
                                <input
                                  type="file"
                                  ref={videoFileRef}
                                  accept="video/mp4,video/webm,video/quicktime,video/mkv"
                                  className="hidden"
                                  onChange={handleVideoFileChange}
                                />
                                <div
                                  onClick={() => videoFileRef.current?.click()}
                                  className={`border-2 border-dashed rounded-lg p-3.5 text-center cursor-pointer transition-all ${
                                    isUploadingVideo
                                      ? "border-[#0e3359] bg-[#f0f9ff]"
                                      : "border-[#cbd5e1] hover:border-[#0e3359] hover:bg-[#f8fafc]"
                                  }`}
                                >
                                  {isUploadingVideo ? (
                                    <div className="py-2 text-[#0e3359] text-[12px] font-semibold flex items-center justify-center gap-2">
                                      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                      Uploading video file (this may take a few moments)...
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-xl block mb-1">🎬</span>
                                      <span className="text-[12px] font-bold text-[#0e3359] block">
                                        {prodForm.video_url ? "Click to change / replace video file" : "Click to select Video file from Computer (.mp4, .mov)"}
                                      </span>
                                      <span className="text-[10px] text-[#64748b] block mt-0.5">
                                        Up to 60MB video reel
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <input
                                  type="text"
                                  value={prodForm.video_url}
                                  onChange={(e) => setProdForm({ ...prodForm, video_url: e.target.value })}
                                  placeholder="e.g. https://www.youtube.com/watch?v=... or direct MP4 URL"
                                  className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black font-mono text-[12px]"
                                />
                              </div>
                            )}

                            {prodForm.video_url && (
                              <div className="mt-2 flex items-center justify-between p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                                <div className="flex items-center gap-2 truncate">
                                  <span className="text-emerald-600 font-bold">✓ Video Attached:</span>
                                  <span className="text-[11px] font-mono text-[#334155] truncate max-w-md">{prodForm.video_url}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setProdForm({ ...prodForm, video_url: "" })}
                                  className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer shrink-0 ml-2"
                                >
                                  Remove Video ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 4. Pakistani Couture Garment Specifications */}
                        <div className="bg-[#fafbfc] border border-[#e2e8f0] p-4 sm:p-5 rounded-lg space-y-4">
                          <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#0e3359] border-b border-[#e2e8f0] pb-2 flex items-center gap-1.5">
                            <span>4. Pakistani Couture Garment Specifications</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[#334155] font-semibold mb-1">Fabric Details</label>
                              <input
                                type="text"
                                value={prodForm.fabric}
                                onChange={(e) => setProdForm({ ...prodForm, fabric: e.target.value })}
                                placeholder="e.g. Pure Raw Silk 80g, Pure Organza Dupatta"
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black"
                              />
                            </div>

                            <div>
                              <label className="block text-[#334155] font-semibold mb-1">Color / Palette</label>
                              <input
                                type="text"
                                value={prodForm.color}
                                onChange={(e) => setProdForm({ ...prodForm, color: e.target.value })}
                                placeholder="e.g. Powder Pink, Emerald Green, Ivory Gold"
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black"
                              />
                            </div>

                            <div>
                              <label className="block text-[#334155] font-semibold mb-1">Pieces Included</label>
                              <select
                                value={prodForm.pieces}
                                onChange={(e) => setProdForm({ ...prodForm, pieces: e.target.value })}
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black"
                              >
                                <option value="3-Piece (Shirt, Dupatta & Trouser)">3-Piece (Shirt, Dupatta &amp; Trouser)</option>
                                <option value="2-Piece (Shirt & Dupatta)">2-Piece (Shirt &amp; Dupatta)</option>
                                <option value="2-Piece (Shirt & Trouser)">2-Piece (Shirt &amp; Trouser)</option>
                                <option value="1-Piece (Embroidered Shirt / Kurta)">1-Piece (Embroidered Shirt / Kurta)</option>
                                <option value="Bridal Set (Lehenga, Choli & Dupatta)">Bridal Set (Lehenga, Choli &amp; Dupatta)</option>
                                <option value="4-Piece Bespoke Couture Set">4-Piece Bespoke Couture Set</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[#334155] font-semibold mb-1">Silhouette / Cut Style</label>
                              <input
                                type="text"
                                value={prodForm.dress_style}
                                onChange={(e) => setProdForm({ ...prodForm, dress_style: e.target.value })}
                                placeholder="e.g. Kalidar Maxi, Straight Kurta, Anarkali, Sharara"
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[#334155] font-semibold mb-1">Craftsmanship &amp; Hand Embellishments</label>
                              <input
                                type="text"
                                value={prodForm.work_details}
                                onChange={(e) => setProdForm({ ...prodForm, work_details: e.target.value })}
                                placeholder="e.g. Handcrafted Zardozi, Kora Dabka, Resham, Sequins, Pearls, and Cutdana"
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black"
                              />
                            </div>

                            <div>
                              <label className="block text-[#334155] font-semibold mb-1">Dispatch &amp; Delivery Timeline</label>
                              <input
                                type="text"
                                value={prodForm.delivery_time}
                                onChange={(e) => setProdForm({ ...prodForm, delivery_time: e.target.value })}
                                placeholder="e.g. Ready to Dispatch (3-5 business days)"
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black"
                              />
                            </div>

                            <div>
                              <label className="block text-[#334155] font-semibold mb-1">Care Instructions</label>
                              <input
                                type="text"
                                value={prodForm.care_instructions}
                                onChange={(e) => setProdForm({ ...prodForm, care_instructions: e.target.value })}
                                placeholder="e.g. Dry Clean Only, Steam Iron on Low"
                                className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 5. Sizing, Tags & Description */}
                        <div className="bg-[#fafbfc] border border-[#e2e8f0] p-4 sm:p-5 rounded-lg space-y-4">
                          <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#0e3359] border-b border-[#e2e8f0] pb-2 flex items-center gap-1.5">
                            <span>5. Sizes, Search Tags &amp; Detailed Description</span>
                          </h4>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[#334155] font-semibold">Available Sizes (Comma separated)</label>
                              <div className="flex items-center gap-1">
                                {["XS", "S", "M", "L", "XL", "Custom Size"].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      const current = prodForm.sizes
                                        .split(",")
                                        .map((x) => x.trim())
                                        .filter(Boolean);
                                      if (current.includes(s)) {
                                        setProdForm({ ...prodForm, sizes: current.filter((x) => x !== s).join(", ") });
                                      } else {
                                        setProdForm({ ...prodForm, sizes: [...current, s].join(", ") });
                                      }
                                    }}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${
                                      prodForm.sizes.includes(s)
                                        ? "bg-[#0e3359] text-white border-[#0e3359]"
                                        : "bg-white text-[#64748b] border-[#cbd5e1] hover:border-[#0e3359]"
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <input
                              type="text"
                              value={prodForm.sizes}
                              onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })}
                              placeholder="XS, S, M, L, XL, Custom Size"
                              className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black text-[12.5px]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#334155] font-semibold mb-1">Search &amp; Filter Tags</label>
                            <input
                              type="text"
                              value={prodForm.tags}
                              onChange={(e) => setProdForm({ ...prodForm, tags: e.target.value })}
                              placeholder="e.g. Formal, Raw Silk, Handcrafted, Luxury Pret"
                              className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black text-[12.5px]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#334155] font-semibold mb-1">Story &amp; Description</label>
                            <textarea
                              rows={3}
                              value={prodForm.description}
                              onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                              className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black font-mono text-[12px]"
                              placeholder="Detailed outfit description, cut details, dupatta styling..."
                            />
                          </div>
                        </div>

                        {/* 6. Badges & Store Availability */}
                        <div className="bg-[#fafbfc] border border-[#e2e8f0] p-4 rounded-lg flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="in_stock_chk"
                              checked={prodForm.in_stock}
                              onChange={(e) => setProdForm({ ...prodForm, in_stock: e.target.checked })}
                              className="w-4 h-4 accent-[#0e3359] cursor-pointer"
                            />
                            <label htmlFor="in_stock_chk" className="text-[#334155] font-medium cursor-pointer">
                              In Stock and Available for Purchase
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="is_new_chk"
                              checked={prodForm.is_new}
                              onChange={(e) => setProdForm({ ...prodForm, is_new: e.target.checked })}
                              className="w-4 h-4 accent-[#0e3359] cursor-pointer"
                            />
                            <label htmlFor="is_new_chk" className="text-[#334155] font-medium cursor-pointer">
                              Mark as New Arrival (Displays &quot;NEW&quot; badge)
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="is_featured_chk"
                              checked={prodForm.is_featured}
                              onChange={(e) => setProdForm({ ...prodForm, is_featured: e.target.checked })}
                              className="w-4 h-4 accent-[#0e3359] cursor-pointer"
                            />
                            <label htmlFor="is_featured_chk" className="text-[#334155] font-medium cursor-pointer">
                              Featured Outfit (Homepage Spotlights)
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Pinned Modal Footer */}
                      <div className="px-6 py-3.5 border-t border-[#e5e5e5] bg-[#f9fafb] flex items-center justify-end gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowAddProductModal(false)}
                          className="px-4 py-2 border border-[#d6d6d6] text-[#666666] hover:text-black hover:border-black text-[12px] font-bold uppercase rounded-md cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#0e3359] text-white hover:bg-[#0a2542] text-[12px] font-bold uppercase tracking-wider rounded-md cursor-pointer shadow-xs transition-colors"
                        >
                          {editingProduct ? "Update Outfit" : "Save Outfit"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2.5 COLLECTIONS & CATEGORIES TAB                          */}
          {/* ========================================================= */}
          {activeTab === "categories" && (() => {
            const topLevelParents = categories.filter((c) => !c.parent_id);
            const subcategoriesList = categories.filter((c) => !!c.parent_id);

            // Build hierarchical ordering: Parent -> its subcategories
            const hierarchicalCategories: any[] = [];
            topLevelParents.forEach((parent) => {
              hierarchicalCategories.push(parent);
              const children = subcategoriesList.filter((s) => s.parent_id === (parent.id || parent._id));
              children.forEach((child) => hierarchicalCategories.push(child));
            });
            // Include orphan subcategories if any
            subcategoriesList.forEach((sub) => {
              if (!topLevelParents.some((p) => (p.id || p._id) === sub.parent_id)) {
                hierarchicalCategories.push(sub);
              }
            });

            const sourceList =
              categoryHierarchyFilter === "parents"
                ? topLevelParents
                : categoryHierarchyFilter === "subcategories"
                ? subcategoriesList
                : hierarchicalCategories;

            const filteredCategories = sourceList.filter((c) => {
              if (!categorySearch) return true;
              const q = categorySearch.toLowerCase();
              return (
                c.name?.toLowerCase().includes(q) ||
                c.slug?.toLowerCase().includes(q) ||
                c.parent_name?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q)
              );
            });

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[22px] font-serif font-bold text-black uppercase tracking-wide">
                      Collections &amp; Categories ({categories.length})
                    </h1>
                    <p className="text-[13px] text-[#666666]">
                      Organize all {topLevelParents.length} Main Collections and {subcategoriesList.length} Subcategories from the store navigation menu.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCatForm({
                          name: "",
                          slug: "",
                          parent_id: "",
                          description: "",
                          image: DEFAULT_FALLBACK_IMAGE,
                          display_order: categories.length + 1,
                          is_active: true,
                        });
                        setCatError("");
                        setCatSuccess("");
                        setShowCategoryModal(true);
                      }}
                      className="bg-[#0e3359] text-white px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#0a2542] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 rounded-md whitespace-nowrap"
                    >
                      <span>+ Add New Category</span>
                    </button>
                  </div>
                </div>

                {catSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-md flex items-center justify-between">
                    <span>{catSuccess}</span>
                    <button onClick={() => setCatSuccess("")} className="text-emerald-600 hover:text-emerald-900 font-bold ml-4">✕</button>
                  </div>
                )}

                {/* Category Quick Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 border border-[#e5e5e5] rounded-lg shadow-xs">
                    <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block mb-1">
                      Main Collections &amp; Subcategories
                    </span>
                    <p className="text-[26px] font-bold font-serif text-[#0e3359]">
                      {topLevelParents.length} <span className="text-[15px] font-sans font-normal text-[#64748b]">Main</span> + {subcategoriesList.length} <span className="text-[15px] font-sans font-normal text-[#64748b]">Subs</span>
                    </p>
                    <p className="text-[12px] text-[#777777] mt-1">{categories.length} total categories registered</p>
                  </div>
                  <div className="bg-white p-5 border border-[#e5e5e5] rounded-lg shadow-xs">
                    <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block mb-1">
                      Total Categorized Outfits
                    </span>
                    <p className="text-[26px] font-bold font-serif text-emerald-700">
                      {categories.reduce((acc, c) => acc + (c.product_count || 0), 0)}
                    </p>
                    <p className="text-[12px] text-[#777777] mt-1">Dresses assigned to collections</p>
                  </div>
                  <div className="bg-white p-5 border border-[#e5e5e5] rounded-lg shadow-xs">
                    <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block mb-1">
                      Store Active Status
                    </span>
                    <p className="text-[26px] font-bold font-serif text-[#111111]">
                      {categories.filter((c) => c.is_active !== false).length} / {categories.length}
                    </p>
                    <p className="text-[12px] text-[#777777] mt-1">Active collections in store navigation</p>
                  </div>
                </div>

                {/* Search & Hierarchy Filter Tabs */}
                <div className="bg-white p-4 border border-[#e5e5e5] rounded-lg shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories by name, slug, or parent collection..."
                    className="flex-1 px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none text-[13px] w-full rounded-md"
                  />
                  <div className="flex items-center gap-1 border border-[#e2e8f0] p-1 rounded-md bg-[#f8fafc] w-full md:w-auto text-[12px] font-medium">
                    <button
                      type="button"
                      onClick={() => setCategoryHierarchyFilter("all")}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        categoryHierarchyFilter === "all"
                          ? "bg-[#0e3359] text-white font-bold"
                          : "text-[#64748b] hover:text-black"
                      }`}
                    >
                      All ({categories.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryHierarchyFilter("parents")}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        categoryHierarchyFilter === "parents"
                          ? "bg-[#0e3359] text-white font-bold"
                          : "text-[#64748b] hover:text-black"
                      }`}
                    >
                      Main Only ({topLevelParents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryHierarchyFilter("subcategories")}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        categoryHierarchyFilter === "subcategories"
                          ? "bg-[#0e3359] text-white font-bold"
                          : "text-[#64748b] hover:text-black"
                      }`}
                    >
                      Subcategories ({subcategoriesList.length})
                    </button>
                  </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#f9f9f9] text-[#777777] uppercase text-[11px] font-semibold border-b border-[#e5e5e5]">
                        <tr>
                          <th className="py-3.5 px-6">Image</th>
                          <th className="py-3.5 px-6">Collection / Category Name</th>
                          <th className="py-3.5 px-6">Hierarchy</th>
                          <th className="py-3.5 px-6">Slug</th>
                          <th className="py-3.5 px-6">Total Outfits</th>
                          <th className="py-3.5 px-6">Status</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0f0]">
                        {filteredCategories.map((cat) => {
                          const isSub = Boolean(cat.parent_id);
                          const childCount = isSub ? 0 : subcategoriesList.filter((s) => s.parent_id === (cat.id || cat._id)).length;

                          return (
                            <tr
                              key={cat.id || cat._id}
                              className={`transition-colors ${
                                isSub ? "bg-[#fafbfc] hover:bg-[#f1f5f9]" : "bg-white hover:bg-[#f8fafc]"
                              }`}
                            >
                              <td className="py-3.5 px-6">
                                <AdminThumbnail
                                  src={cat.image || DEFAULT_FALLBACK_IMAGE}
                                  alt={cat.name}
                                  className={`rounded-md ${isSub ? "w-10 h-12 ml-4" : "w-12 h-14"}`}
                                />
                              </td>
                              <td className="py-3.5 px-6">
                                <div className="flex items-center gap-2">
                                  {isSub ? (
                                    <span className="text-[#94a3b8] font-mono text-[14px]">↳</span>
                                  ) : null}
                                  <div>
                                    <span className={`block text-[14px] ${isSub ? "font-medium text-[#1e293b]" : "font-bold text-[#0e3359]"}`}>
                                      {cat.name}
                                    </span>
                                    <span className="text-[11px] text-[#888888]">
                                      Order: {cat.display_order ?? 0}
                                      {!isSub && childCount > 0 ? ` • ${childCount} sub-collections` : ""}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-6">
                                {isSub ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                                    <span className="text-[#94a3b8]">Sub of:</span>
                                    <span className="font-bold text-[#0e3359]">{cat.parent_name || "Main Collection"}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-[#0e3359]/10 text-[#0e3359] border border-[#0e3359]/20">
                                    ★ Main Collection
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-6">
                                <code className="text-[12px] bg-[#f3f4f6] px-2 py-0.5 rounded text-[#4b5563] font-mono">
                                  {cat.slug}
                                </code>
                              </td>
                              <td className="py-3.5 px-6">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductCategory(cat.name);
                                    selectTab("products");
                                  }}
                                  className="px-2.5 py-1 bg-[#0e3359]/10 text-[#0e3359] hover:bg-[#0e3359] hover:text-white rounded-full text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Click to view outfits in this category"
                                >
                                  {cat.product_count ?? 0} Outfits &rarr;
                                </button>
                              </td>
                              <td className="py-3.5 px-6">
                                {cat.is_active !== false ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    ● Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                    Hidden
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-6 text-right space-x-3">
                                <button
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setCatForm({
                                      name: cat.name,
                                      slug: cat.slug,
                                      parent_id: cat.parent_id || "",
                                      description: cat.description || "",
                                      image: cat.image || "",
                                      display_order: cat.display_order || 1,
                                      is_active: cat.is_active !== false,
                                    });
                                    setCatError("");
                                    setCatSuccess("");
                                    setShowCategoryModal(true);
                                  }}
                                  className="text-[#0e3359] hover:underline font-bold text-[12px] cursor-pointer"
                                >
                                  EDIT
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="text-rose-600 hover:underline font-bold text-[12px] cursor-pointer"
                                >
                                  DELETE
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredCategories.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-[#888888]">
                              No categories match your search or filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add / Edit Category Modal */}
                {showCategoryModal && (
                  <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setShowCategoryModal(false);
                    }}
                  >
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
                      {/* Fixed Modal Header */}
                      <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between shrink-0 bg-white">
                        <h2 className="text-[17px] font-serif font-bold uppercase tracking-wide text-black">
                          {editingCategory ? "Edit Category" : "Create New Category"}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setShowCategoryModal(false)}
                          className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-black hover:bg-[#f1f5f9] rounded-full transition-colors cursor-pointer text-lg font-bold"
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Scrollable Modal Body Form */}
                      <form onSubmit={handleSaveCategory} className="flex-1 overflow-y-auto flex flex-col">
                        <div className="p-5 sm:p-6 space-y-3.5 text-[13px] flex-1 overflow-y-auto">
                          {catError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-[12px]">
                              {catError}
                            </div>
                          )}

                          <div>
                            <label className="block text-[#444444] font-medium mb-1">Category / Collection Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Formal, Bridals, Silk Solids'26"
                              value={catForm.name}
                              onChange={(e) => {
                                const nameVal = e.target.value;
                                setCatForm({
                                  ...catForm,
                                  name: nameVal,
                                  slug: editingCategory ? catForm.slug : nameVal.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
                                });
                              }}
                              className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black font-medium"
                              autoFocus
                            />
                          </div>

                          <div>
                            <label className="block text-[#444444] font-medium mb-1">
                              Parent Category (Optional Hierarchy)
                            </label>
                            <select
                              value={catForm.parent_id}
                              onChange={(e) => setCatForm({ ...catForm, parent_id: e.target.value })}
                              className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black font-medium"
                            >
                              <option value="">None (Top-Level Main Collection)</option>
                              {topLevelParents
                                .filter((p) => !editingCategory || (p.id !== editingCategory.id && p._id !== editingCategory._id))
                                .map((p) => (
                                  <option key={p.id || p._id} value={p.id || p._id}>
                                    📁 {p.name} (Main Collection)
                                  </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-[#64748b] mt-1">
                              Assign under a main collection (e.g. Under &quot;Formal&quot; or &quot;Bridals&quot;), or leave as None to display as a top-level collection.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[#444444] font-medium mb-1">Slug / URL</label>
                              <input
                                type="text"
                                required
                                placeholder="formal-dresses"
                                value={catForm.slug}
                                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                                className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black font-mono text-[12px]"
                              />
                            </div>
                            <div>
                              <label className="block text-[#444444] font-medium mb-1">Display Order</label>
                              <input
                                type="number"
                                min={0}
                                value={catForm.display_order}
                                onChange={(e) => setCatForm({ ...catForm, display_order: parseInt(e.target.value, 10) || 0 })}
                                className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[#444444] font-medium mb-1">Description</label>
                            <textarea
                              rows={2}
                              placeholder="Handcrafted Pakistani luxury formal wear..."
                              value={catForm.description}
                              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                              className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black text-[12.5px]"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[#444444] font-medium text-[12.5px]">Cover Image</label>
                              <div className="inline-flex rounded border border-[#cbd5e1] p-0.5 bg-[#f1f5f9] text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setCatUploadMode("file")}
                                  className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                    catUploadMode === "file" ? "bg-[#0e3359] text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                  }`}
                                >
                                  📁 Upload File
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCatUploadMode("url")}
                                  className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                    catUploadMode === "url" ? "bg-[#0e3359] text-white shadow-2xs" : "text-[#475569] hover:text-black"
                                  }`}
                                >
                                  🔗 Paste URL
                                </button>
                              </div>
                            </div>

                            {catUploadMode === "file" ? (
                              <div>
                                <input
                                  type="file"
                                  ref={catFileRef}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleCatFileChange}
                                />
                                <div
                                  onClick={() => catFileRef.current?.click()}
                                  className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                                    isUploadingCat
                                      ? "border-[#0e3359] bg-[#f0f9ff]"
                                      : "border-[#cbd5e1] hover:border-[#0e3359] hover:bg-[#f8fafc]"
                                  }`}
                                >
                                  {isUploadingCat ? (
                                    <div className="py-1 text-[#0e3359] text-[11px] font-semibold flex items-center justify-center gap-1.5">
                                      <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                                      Uploading category image...
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-[11.5px] font-bold text-[#0e3359] block">
                                        {catForm.image ? "✓ Image chosen (Click to replace)" : "📁 Click to select Cover Image from Computer"}
                                      </span>
                                      <span className="text-[9.5px] text-[#64748b] block">JPG, PNG, WEBP</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <input
                                type="text"
                                placeholder="https://sillhouete.com/cdn/shop/files/..."
                                value={catForm.image}
                                onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                                className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none rounded-md bg-white text-black text-[12.5px]"
                              />
                            )}

                            {catForm.image && (
                              <div className="mt-2 flex items-center gap-2 p-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                                <img
                                  src={catForm.image}
                                  alt="Category preview"
                                  className="w-8 h-8 rounded object-cover border border-[#cbd5e1]"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                                  }}
                                />
                                <span className="text-[10.5px] text-[#334155] font-mono truncate flex-1">{catForm.image}</span>
                                <button
                                  type="button"
                                  onClick={() => setCatForm({ ...catForm, image: "" })}
                                  className="text-[10px] text-rose-600 hover:underline font-bold"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="cat_active"
                              checked={catForm.is_active}
                              onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })}
                              className="w-4 h-4 accent-[#0e3359] cursor-pointer"
                            />
                            <label htmlFor="cat_active" className="text-[#333333] cursor-pointer font-medium">
                              Active in Store (Visible in product assignment and navigation)
                            </label>
                          </div>
                        </div>

                        {/* Pinned Modal Footer */}
                        <div className="px-6 py-3.5 border-t border-[#e5e5e5] bg-[#f9fafb] flex items-center justify-end gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowCategoryModal(false)}
                            className="px-4 py-2 border border-[#d6d6d6] text-[#666666] hover:text-black hover:border-black text-[12px] font-bold uppercase rounded-md cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={catLoading}
                            className="px-5 py-2 bg-[#0e3359] text-white hover:bg-[#0a2542] text-[12px] font-bold uppercase tracking-wider rounded-md cursor-pointer disabled:opacity-50 shadow-xs transition-colors"
                          >
                            {catLoading ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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
              <div className="bg-white p-4 border border-[#e5e5e5] rounded-lg shadow-xs flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order ID, customer name, email, tracking..."
                  className="flex-1 px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none text-[13px] w-full rounded-md"
                />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none text-[13px] bg-white w-full sm:w-auto rounded-md"
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
              <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
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
                        .map((o: any, idx: number) => (
                          <tr key={o._id || o.id || idx} className="hover:bg-[#fafafa]">
                            <td className="py-4 px-6 font-mono font-bold text-black">{o.id}</td>
                            <td className="py-4 px-6 text-[12px] text-[#666666]">
                              {o.created_at
                                ? new Date(o.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td className="py-4 px-6">
                              <p className="font-semibold text-black">{o.customer?.first_name} {o.customer?.last_name}</p>
                              <p className="text-[11px] text-[#777777]">{o.customer?.email} • {o.customer?.city}</p>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase ${o.payment_status === "paid"
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
                            <td className="py-4 px-6 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setTrackingInput(o.tracking_number || "");
                                }}
                                className="bg-[#0e3359] text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-[#0a2542] cursor-pointer transition-colors shadow-2xs"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => setSelectedInvoiceOrder(o)}
                                className="bg-white text-[#0e3359] border border-[#0e3359] hover:bg-[#0e3359] hover:text-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs"
                                title="View & Print Official Invoice"
                              >
                                Invoice 📄
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Details Drawer / Modal */}
              {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white max-w-[700px] w-full p-6 sm:p-8 border border-[#e5e5e5] rounded-xl shadow-2xl my-8">
                    <div className="flex justify-between items-center pb-4 border-b border-[#e5e5e5] mb-6">
                      <div>
                        <h3 className="text-[18px] font-serif font-bold uppercase tracking-wider">
                          Order Details: {selectedOrder.id}
                        </h3>
                        <p className="text-[11px] text-[#777777] font-mono">
                          Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedInvoiceOrder(selectedOrder)}
                          className="bg-white text-[#0e3359] border border-[#0e3359] hover:bg-[#0e3359] hover:text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs rounded-xs flex items-center gap-1.5"
                        >
                          <span>Print Invoice 📄</span>
                        </button>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="text-[#999999] hover:text-black text-[22px]"
                        >
                          ✕
                        </button>
                      </div>
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
                                <AdminThumbnail
                                  src={item.image}
                                  alt={item.title}
                                  className="w-10 h-14"
                                />
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
                            className="bg-[#0e3359] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-[#0a2542] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
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
          {/* INVOICES & BILLING TAB                                    */}
          {/* ========================================================= */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-[22px] font-serif font-bold text-black uppercase tracking-wide">
                  Customer Invoices &amp; Receipts
                </h1>
                <p className="text-[13px] text-[#666666]">
                  Official boutique billing statements, verified payment receipts, and printable PDF invoices.
                </p>
              </div>

              {/* Invoices Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 border border-[#e5e5e5] rounded-lg shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Total Invoiced</p>
                  <p className="text-[22px] font-serif font-bold text-black mt-1">
                    Rs.{orders.reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[#666666] mt-0.5">Across {orders.length} order statements</p>
                </div>

                <div className="bg-white p-5 border border-[#e5e5e5] rounded-lg shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Paid Invoices</p>
                  <p className="text-[22px] font-serif font-bold text-emerald-700 mt-1">
                    {orders.filter((o) => o.payment_status === "paid").length}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1 font-medium">
                    ✓ Verified Stripe &amp; COD Completed
                  </p>
                </div>

                <div className="bg-white p-5 border border-[#e5e5e5] rounded-lg shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Pending / COD Due</p>
                  <p className="text-[22px] font-serif font-bold text-amber-600 mt-1">
                    {orders.filter((o) => o.payment_status !== "paid").length}
                  </p>
                  <p className="text-[11px] text-[#666666] mt-0.5">Awaiting delivery collection</p>
                </div>

                <div className="bg-white p-5 border border-[#e5e5e5] rounded-lg shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Average Invoice</p>
                  <p className="text-[22px] font-serif font-bold text-black mt-1">
                    Rs.{orders.length ? Math.round(orders.reduce((sum, o) => sum + Number(o.total || 0), 0) / orders.length).toLocaleString() : 0}
                  </p>
                  <p className="text-[11px] text-[#666666] mt-0.5">Average checkout value</p>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-white p-4 border border-[#e5e5e5] rounded-lg shadow-xs flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Search by invoice # (e.g. INV-SIL-1006), order ID, customer name, email..."
                  className="flex-1 px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none text-[13px] w-full rounded-md"
                />
                <select
                  value={invoicePaymentFilter}
                  onChange={(e) => setInvoicePaymentFilter(e.target.value)}
                  className="px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none text-[13px] bg-white w-full sm:w-auto rounded-md"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="unpaid">Unpaid</option>
                </select>
                <select
                  value={invoiceMethodFilter}
                  onChange={(e) => setInvoiceMethodFilter(e.target.value)}
                  className="px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none text-[13px] bg-white w-full sm:w-auto rounded-md"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="stripe">Stripe Card</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                </select>
              </div>

              {/* Invoices Table */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#f9f9f9] text-[#777777] uppercase text-[11px] font-semibold border-b border-[#e5e5e5]">
                      <tr>
                        <th className="py-3.5 px-6">Invoice #</th>
                        <th className="py-3.5 px-6">Order Ref</th>
                        <th className="py-3.5 px-6">Date</th>
                        <th className="py-3.5 px-6">Customer / Billed To</th>
                        <th className="py-3.5 px-6">Payment</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6">Amount</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {orders
                        .filter((o) => {
                          const matchesPayment =
                            invoicePaymentFilter === "all" || o.payment_status === invoicePaymentFilter;
                          const matchesMethod =
                            invoiceMethodFilter === "all" || o.payment_method === invoiceMethodFilter;
                          const q = invoiceSearch.toLowerCase();
                          const matchesSearch =
                            !q ||
                            `inv-${o.id}`.toLowerCase().includes(q) ||
                            o.id.toLowerCase().includes(q) ||
                            (o.customer?.email && o.customer.email.toLowerCase().includes(q)) ||
                            (o.customer?.first_name && o.customer.first_name.toLowerCase().includes(q)) ||
                            (o.customer?.last_name && o.customer.last_name.toLowerCase().includes(q)) ||
                            (o.customer?.city && o.customer.city.toLowerCase().includes(q));
                          return matchesPayment && matchesMethod && matchesSearch;
                        })
                        .map((o: any, idx: number) => (
                          <tr key={o._id || o.id || idx} className="hover:bg-[#fafafa]">
                            <td className="py-4 px-6 font-mono font-bold text-[#0e3359]">
                              INV-{o.id}
                            </td>
                            <td className="py-4 px-6 font-mono text-[12px] text-[#555555]">
                              {o.id}
                            </td>
                            <td className="py-4 px-6 text-[12px] text-[#666666]">
                              {o.created_at
                                ? new Date(o.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td className="py-4 px-6">
                              <p className="font-semibold text-black">
                                {o.customer?.first_name} {o.customer?.last_name}
                              </p>
                              <p className="text-[11px] text-[#777777]">
                                {o.customer?.email} • {o.customer?.city || "Pakistan"}
                              </p>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-[12px] font-medium text-[#444444] capitalize">
                                {o.payment_method === "stripe" ? "Stripe Card" : "Cash on Delivery"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${o.payment_status === "paid"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                                  }`}
                              >
                                {o.payment_status === "paid" ? "✓ Paid" : "Payment Due"}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-semibold text-black">
                              Rs.{Number(o.total || 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right space-x-2">
                              <button
                                onClick={() => setSelectedInvoiceOrder(o)}
                                className="bg-[#0e3359] text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-[#0a2542] cursor-pointer transition-colors shadow-2xs rounded-xs"
                              >
                                View Invoice 📄
                              </button>
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

              <div className="bg-white p-4 border border-[#e5e5e5] rounded-lg shadow-xs">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers by name, email, phone, city..."
                  className="w-full px-3.5 py-2 border border-[#d6d6d6] focus:border-[#0e3359] outline-none text-[13px] rounded-md"
                />
              </div>

              <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
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
                        .map((cust: any, idx: number) => (
                          <tr key={cust._id || cust.id || cust.email || idx} className="hover:bg-[#fafafa]">
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
                <div className="md:col-span-5 bg-white border border-[#e5e5e5] rounded-lg shadow-xs divide-y divide-[#f0f0f0] max-h-[700px] overflow-y-auto">
                  {inquiries.length === 0 ? (
                    <p className="p-6 text-center text-[#999]">No messages received yet.</p>
                  ) : (
                    inquiries.map((m: any, idx: number) => (
                      <div
                        key={m._id || m.id || idx}
                        onClick={() => {
                          setActiveInquiry(m);
                          setReplyText(m.reply || "");
                        }}
                        className={`p-4 cursor-pointer transition-colors ${activeInquiry?.id === m.id ? "bg-[#fafafa] border-l-4 border-[#0e3359]" : "hover:bg-[#fcfcfc]"
                          }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-black">{m.name}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs ${m.status === "new" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
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
                <div className="md:col-span-7 bg-white p-6 border border-[#e5e5e5] rounded-lg shadow-xs">
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
                          className="bg-[#0e3359] text-white px-6 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#0a2542] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
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
                      featured_image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-sublime-Lilac-intricate-embroidery.jpg?v=1776332402",
                      tags: "Trends, Style Guide",
                      published: true,
                    });
                    setShowBlogModal(true);
                  }}
                  className="bg-[#0e3359] text-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#0a2542] transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  + Write Article
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((b: any, idx: number) => (
                  <div key={b._id || b.id || idx} className="bg-white border border-[#e5e5e5] rounded-lg shadow-xs overflow-hidden flex flex-col">
                    <div className="relative h-[200px] w-full bg-[#f0f0f0]">
                      <AdminThumbnail
                        src={b.featured_image}
                        alt={b.title}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs ${b.published ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
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
                  <div className="bg-white max-w-[700px] w-full p-6 sm:p-8 border border-[#e5e5e5] rounded-xl shadow-xl my-8">
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
                          className="px-6 py-2.5 bg-[#0e3359] text-white text-[12px] font-bold uppercase tracking-wider hover:bg-[#0a2542] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
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

              <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 border border-[#e5e5e5] rounded-lg shadow-xs space-y-5 text-[13px]">
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

                {/* DISCOUNT & PROMOTIONAL CODES SECTION */}
                <div className="pt-4 border-t border-[#e5e5e5]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[14px] uppercase tracking-wider text-black">
                        Discount &amp; Promotional Codes
                      </h3>
                      <p className="text-[12px] text-[#666666]">
                        Manage discount coupons redeemable by customers on the checkout page.
                      </p>
                    </div>
                  </div>

                  {/* Existing Codes List */}
                  <div className="space-y-2 mb-4">
                    {(!settings.discount_codes || settings.discount_codes.length === 0) ? (
                      <p className="text-[12px] text-[#888888] italic py-2">No discount codes configured yet.</p>
                    ) : (
                      <div className="border border-[#e5e5e5] rounded-md divide-y divide-[#eeeeee] overflow-hidden">
                        {settings.discount_codes.map((item: any, idx: number) => (
                          <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-[#fafafa] transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-[13px] bg-[#f0f4f8] text-[#0e3359] px-2.5 py-1 rounded border border-[#d0dbe5]">
                                {item.code}
                              </span>
                              <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                {item.discount_percent}% OFF
                              </span>
                              {item.description && (
                                <span className="text-[12px] text-[#666666] hidden sm:inline">
                                  • {item.description}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleDiscountCode(idx)}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded cursor-pointer transition-colors ${item.active !== false
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                  }`}
                              >
                                {item.active !== false ? "Active" : "Disabled"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDiscountCode(idx)}
                                className="text-[#d11a2a] hover:text-red-700 text-[13px] font-bold px-2 py-1 cursor-pointer"
                                title="Delete code"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Code Subform */}
                  <div className="bg-[#f9fafb] p-3.5 border border-[#e5e5e5] rounded-md space-y-3">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#333333]">
                      + Add New Discount Code
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#555555] font-medium mb-1">Coupon Code</label>
                        <input
                          type="text"
                          placeholder="e.g. SUMMER15"
                          value={newDiscountCode}
                          onChange={(e) => setNewDiscountCode(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-black outline-none font-mono text-[12px] uppercase bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#555555] font-medium mb-1">Discount %</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="e.g. 15"
                          value={newDiscountPercent}
                          onChange={(e) => setNewDiscountPercent(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-black outline-none text-[12px] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#555555] font-medium mb-1">Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Summer Collection Sale"
                          value={newDiscountDesc}
                          onChange={(e) => setNewDiscountDesc(e.target.value)}
                          className="w-full px-3 py-2 border border-[#d6d6d6] focus:border-black outline-none text-[12px] bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddDiscountCode}
                        className="bg-[#0e3359] hover:bg-[#0a2542] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded"
                      >
                        + Add Discount Code
                      </button>
                    </div>
                  </div>
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
                    className="bg-[#0e3359] text-white px-8 py-3 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a2542] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    Save Store Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. ADMIN PROFILE & SECURITY SETTINGS TAB                  */}
          {/* ========================================================= */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-[800px]">
              <div>
                <h1 className="text-[22px] font-serif font-bold text-black uppercase tracking-wide">
                  Admin Account &amp; Security Settings
                </h1>
                <p className="text-[13px] text-[#666666]">
                  Update administrator profile details, login email address, and security password.
                </p>
              </div>

              {profileSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-xs flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xs flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{profileError}</span>
                </div>
              )}

              {/* Admin Identity Card */}
              <div className="bg-white p-6 border border-[#e5e5e5] rounded-lg shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#0e3359] text-white flex items-center justify-center font-serif font-bold text-[24px] shadow-sm shrink-0">
                    {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[17px] font-bold text-black font-serif">
                        {adminUser?.name || "Sillhouete Boutique Admin"}
                      </h2>
                      <span className="bg-[#e0f2fe] text-[#0369a1] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {adminUser?.role || "SUPERADMIN"}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#6b7280] font-mono mt-0.5">
                      {adminUser?.email || "admin@sillhouete.com"}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      Authenticated &bull; Full Administrative Access
                    </p>
                  </div>
                </div>
                <div className="text-right sm:border-l sm:border-[#f0f0f0] sm:pl-6 text-[12px] text-[#6b7280] space-y-1">
                  <div>Session: <span className="font-semibold text-black">Active (7 Days)</span></div>
                  <div>Status: <span className="text-emerald-700 font-semibold">Verified</span></div>
                </div>
              </div>

              {/* Profile & Security Edit Form */}
              <form onSubmit={handleUpdateAdminProfile} className="bg-white p-6 sm:p-8 border border-[#e5e5e5] rounded-lg shadow-xs space-y-6 text-[13px]">
                {/* 1. Basic Info */}
                <div>
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-black mb-1">
                    1. Profile Details
                  </h3>
                  <p className="text-[12px] text-[#666666] mb-4">
                    This name is displayed in the dashboard header and on generated client invoices.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Admin Full Name</label>
                      <input
                        type="text"
                        required
                        value={adminProfileForm.name}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none font-sans-custom bg-white"
                        placeholder="e.g. Sillhouete Boutique Admin"
                      />
                    </div>

                    <div>
                      <label className="block text-[#444444] font-medium mb-1">Admin Login Email</label>
                      <input
                        type="email"
                        required
                        value={adminProfileForm.email}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none font-mono text-[13px] bg-white"
                        placeholder="admin@sillhouete.com"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Password & Security */}
                <div className="pt-6 border-t border-[#e5e5e5]">
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-black mb-1">
                    2. Security &amp; Password
                  </h3>
                  <p className="text-[12px] text-[#666666] mb-4">
                    Leave password fields blank if you only want to update your name or email.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[#444444] font-medium">Current Password</label>
                        <span className="text-[11px] text-[#6b7280]">
                          Click <strong>Show</strong> to reveal your active password
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? "text" : "password"}
                          value={adminProfileForm.currentPassword || "admin123"}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, currentPassword: e.target.value })}
                          className="w-full px-3.5 py-2.5 pr-12 border border-[#d6d6d6] focus:border-black outline-none font-mono text-[13px] bg-white text-black"
                          placeholder="Current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0e3359] hover:text-black font-semibold text-[12px] cursor-pointer px-1 py-0.5"
                        >
                          {showCurrentPass ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#444444] font-medium mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPass ? "text" : "password"}
                            value={adminProfileForm.newPassword}
                            onChange={(e) => setAdminProfileForm({ ...adminProfileForm, newPassword: e.target.value })}
                            className="w-full px-3.5 py-2.5 pr-10 border border-[#d6d6d6] focus:border-black outline-none font-mono text-[13px] bg-white"
                            placeholder="Min 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-black text-[12px]"
                          >
                            {showNewPass ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#444444] font-medium mb-1">Confirm New Password</label>
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={adminProfileForm.confirmPassword}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, confirmPassword: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-[#d6d6d6] focus:border-black outline-none font-mono text-[13px] bg-white"
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-[#e5e5e5] flex items-center justify-between flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="bg-[#0e3359] text-white px-8 py-3 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a2542] transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center gap-2"
                  >
                    {profileSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <span>Save Admin Settings</span>
                    )}
                  </button>
                  <p className="text-[11px] text-[#888888]">
                    Changes take effect immediately across all dashboard sessions.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* LUXURY PRINTABLE INVOICE MODAL                            */}
          {/* ========================================================= */}
          {selectedInvoiceOrder && (
            <div
              className="fixed inset-0 bg-black/75 z-50 overflow-y-auto p-3 sm:p-6 flex justify-center items-start backdrop-blur-2xs"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedInvoiceOrder(null);
              }}
            >
              {/* Embedded Print Styles */}
              <style dangerouslySetInnerHTML={{
                __html: `
              @media print {
                body * {
                  visibility: hidden;
                }
                #sillhouete-printable-invoice, #sillhouete-printable-invoice * {
                  visibility: visible;
                }
                #sillhouete-printable-invoice {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}} />

              <div
                id="sillhouete-printable-invoice"
                className="bg-white max-w-[850px] w-full p-6 sm:p-10 border border-[#e5e5e5] rounded-xl shadow-2xl my-4 sm:my-8 relative text-[#111111]"
              >
                {/* Prominent Floating Close Button on Top Right */}
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="no-print absolute top-3 right-3 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-[#f3f4f6] hover:bg-red-50 text-[#374151] hover:text-red-600 border border-[#e5e7eb] hover:border-red-200 flex items-center justify-center font-bold text-[18px] transition-all cursor-pointer shadow-xs z-30"
                  title="Close Invoice (Esc)"
                >
                  ✕
                </button>

                {/* Modal Top Actions (Hidden on Print) */}
                <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-[#e5e5e5] pr-12">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#666666]">
                      Invoice Preview
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#eef3f8] text-[#0e3359] rounded-xs">
                      INV-{selectedInvoiceOrder.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="bg-[#0e3359] text-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#0a2542] cursor-pointer transition-colors shadow-xs rounded-xs flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print / Save PDF</span>
                    </button>
                    <button
                      onClick={() => setSelectedInvoiceOrder(null)}
                      className="bg-white text-[#374151] hover:text-black hover:bg-[#f3f4f6] border border-[#d1d5db] px-4 py-2 text-[12px] font-bold uppercase tracking-wider transition-colors rounded-xs cursor-pointer"
                    >
                      Close ✕
                    </button>
                  </div>
                </div>

                {/* INVOICE CONTENT */}
                <div className="space-y-8">
                  {/* Brand & Invoice Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-[#0e3359]">
                    <div>
                      <h2 className="font-serif text-[26px] font-bold tracking-[0.25em] uppercase text-black">
                        SILLHOUETE
                      </h2>
                      <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#666666] mt-0.5">
                        Haute Couture &amp; Luxury Pret Atelier
                      </p>
                      <p className="text-[11px] text-[#888888] mt-1 font-mono">
                        MM Alam Road, Gulberg III, Lahore, Pakistan • NTN: 8492011-8
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-serif text-[22px] font-bold uppercase tracking-wider text-[#0e3359]">
                        TAX INVOICE
                      </p>
                      <p className="font-mono text-[13px] font-bold text-black mt-0.5">
                        INV-{selectedInvoiceOrder.id}
                      </p>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-xs ${selectedInvoiceOrder.payment_status === "paid"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                        >
                          {selectedInvoiceOrder.payment_status === "paid"
                            ? "✓ PAID & VERIFIED"
                            : "PAYMENT DUE (COD)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata & Billing Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[12px]">
                    <div className="p-4 bg-[#fafafa] border border-[#f0f0f0] rounded-md space-y-1">
                      <p className="font-bold uppercase tracking-wider text-[#777777] text-[10px] mb-1">
                        Billed &amp; Shipped To
                      </p>
                      <p className="text-[14px] font-bold text-black">
                        {selectedInvoiceOrder.customer?.first_name} {selectedInvoiceOrder.customer?.last_name}
                      </p>
                      <p className="text-[#555555]">
                        {selectedInvoiceOrder.customer?.address || "Address on file"}
                      </p>
                      <p className="text-[#555555]">
                        {selectedInvoiceOrder.customer?.city || "Lahore"}, {selectedInvoiceOrder.customer?.country || "Pakistan"}
                      </p>
                      <p className="text-[#777777] font-mono pt-1">
                        Phone: {selectedInvoiceOrder.customer?.phone || "—"}
                      </p>
                      <p className="text-[#777777] font-mono">
                        Email: {selectedInvoiceOrder.customer?.email}
                      </p>
                    </div>

                    <div className="p-4 bg-[#fafafa] border border-[#f0f0f0] rounded-md space-y-1">
                      <p className="font-bold uppercase tracking-wider text-[#777777] text-[10px] mb-1">
                        Invoice Details
                      </p>
                      <div className="flex justify-between py-0.5 border-b border-[#ececec]">
                        <span className="text-[#666666]">Invoice Date:</span>
                        <span className="font-medium text-black">
                          {selectedInvoiceOrder.created_at
                            ? new Date(selectedInvoiceOrder.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-[#ececec]">
                        <span className="text-[#666666]">Order Reference:</span>
                        <span className="font-mono font-bold text-black">{selectedInvoiceOrder.id}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-[#ececec]">
                        <span className="text-[#666666]">Payment Method:</span>
                        <span className="font-medium text-black capitalize">
                          {selectedInvoiceOrder.payment_method === "stripe" ? "Stripe Direct Card" : "Cash on Delivery"}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-[#666666]">Tracking / Courier:</span>
                        <span className="font-mono text-[#0e3359] font-semibold">
                          {selectedInvoiceOrder.tracking_number || "Dispatched via DHL / TCS"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items Purchased Table */}
                  <div className="border border-[#e5e5e5] rounded-md overflow-hidden">
                    <table className="w-full text-left text-[12px]">
                      <thead className="bg-[#f5f5f5] text-[#555555] uppercase text-[10px] font-bold border-b border-[#e5e5e5]">
                        <tr>
                          <th className="py-3 px-4">Item &amp; Description</th>
                          <th className="py-3 px-4">Size</th>
                          <th className="py-3 px-4 text-center">Qty</th>
                          <th className="py-3 px-4 text-right">Unit Price</th>
                          <th className="py-3 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeeee]">
                        {(selectedInvoiceOrder.items && selectedInvoiceOrder.items.length > 0
                          ? selectedInvoiceOrder.items
                          : [
                            {
                              title: "Pakistani Designer Couture Outfit",
                              size: "Custom S",
                              quantity: 1,
                              price: selectedInvoiceOrder.total || 45000,
                            },
                          ]
                        ).map((item: any, i: number) => {
                          const qty = Math.max(1, parsePriceToNumber(item.quantity || 1));
                          let price = parsePriceToNumber(item.price || item.raw_price || 0);
                          if (!price || isNaN(price)) {
                            price = Math.max(0, Math.round(parsePriceToNumber(selectedInvoiceOrder.total || 0) / qty));
                          }
                          return (
                            <tr key={i}>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-black">{item.title}</p>
                                <p className="text-[11px] text-[#777777]">Handcrafted bespoke couture</p>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-medium text-[#444444]">
                                {item.size || "Standard"}
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold">{qty}</td>
                              <td className="py-3.5 px-4 text-right font-mono text-[#444444]">
                                Rs.{price.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-black">
                                Rs.{(price * qty).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Totals */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="text-[11px] text-[#777777] max-w-sm">
                      <p className="font-bold text-black uppercase tracking-wider mb-1">Authenticity &amp; Terms</p>
                      <p>
                        Every Sillhouete garment is 100% authentic designer apparel tailored with hand-picked fabrics and delicate artisanal zardozi embroidery.
                      </p>
                    </div>

                    <div className="w-full sm:w-72 space-y-2 text-[12px]">
                      <div className="flex justify-between text-[#666666]">
                        <span>Subtotal:</span>
                        <span className="font-mono text-black font-medium">
                          Rs.{parsePriceToNumber(selectedInvoiceOrder.subtotal || selectedInvoiceOrder.total || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#666666]">
                        <span>Delivery / Shipping:</span>
                        <span className="text-emerald-700 font-bold uppercase text-[11px]">
                          {parsePriceToNumber(selectedInvoiceOrder.shipping_fee) > 0
                            ? `Rs.${parsePriceToNumber(selectedInvoiceOrder.shipping_fee).toLocaleString()}`
                            : "FREE (Complimentary)"}
                        </span>
                      </div>
                      {parsePriceToNumber(selectedInvoiceOrder.discount) > 0 ? (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Promotional Discount:</span>
                          <span className="font-mono">-Rs.{parsePriceToNumber(selectedInvoiceOrder.discount).toLocaleString()}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between pt-2 border-t-2 border-[#0e3359] text-[15px] font-bold text-black">
                        <span>Total Amount:</span>
                        <span className="font-mono text-[#0e3359]">
                          Rs.{parsePriceToNumber(selectedInvoiceOrder.total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Authorized Atelier Signoff */}
                  <div className="pt-6 border-t border-[#f0f0f0] flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#999999] uppercase tracking-wider font-mono">
                    <span>Authorized Signature: Sillhouete Accounts Atelier</span>
                    <span>Computer Generated Luxury Tax Receipt • Valid Without Physical Stamp</span>
                  </div>

                  {/* Bottom Action Footer Bar (Visible on Screen, Hidden on Print) */}
                  <div className="no-print pt-6 border-t border-[#e5e5e5] flex flex-wrap justify-end items-center gap-3">
                    <button
                      onClick={() => setSelectedInvoiceOrder(null)}
                      className="px-6 py-2.5 bg-white border border-[#d1d5db] text-[#374151] hover:text-black hover:bg-[#f3f4f6] text-[12px] font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                    >
                      Close Invoice ✕
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-2.5 bg-[#0e3359] text-white text-[12px] font-bold uppercase tracking-wider hover:bg-[#0a2542] rounded-xs cursor-pointer transition-colors shadow-xs flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print / Save PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

