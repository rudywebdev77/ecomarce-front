import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import rawProductsData from "../../raw_products.json";
import siteData from "../../site_data.json";
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MobileNavDrawer from "../../components/MobileNavDrawer";
import CartDrawer from "../../components/CartDrawer";
import SearchModal from "../../components/SearchModal";
import CurrencySwitcher from "../../components/CurrencySwitcher";
import WhatsAppButton from "../../components/WhatsAppButton";
import ProductDetailClient from "./ProductDetailClient";
import { API_BASE } from "../../lib/api";
import { connectDB, Product } from "../../lib/db";
import { ProductDetailSkeleton } from "../../components/SkeletonLoaders";

export const dynamic = "force-dynamic";

interface RawProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: Array<{
    id: number;
    title: string;
    price: string;
    compare_at_price: string | null;
  }>;
  images: Array<{
    id: number;
    src: string;
    width: number;
    height: number;
  }>;
}

const rawProducts = rawProductsData as RawProduct[];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle).toLowerCase().trim();
  const cleanH = decodedHandle.replace(/[^a-z0-9\-]+/g, "");

  try {
    await connectDB();
    const escaped = decodedHandle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(decodedHandle);

    let doc = await Product.findOne({
      $or: [
        { handle: decodedHandle },
        { handle: cleanH },
        { id: decodedHandle },
        { title: new RegExp(`^${escaped}$`, "i") },
        { _id: isMongoId ? decodedHandle : null },
      ],
    }).lean();

    if (!doc && cleanH) {
      doc = await Product.findOne({
        $or: [
          { handle: new RegExp(`^${cleanH}$`, "i") },
          { handle: new RegExp(cleanH, "i") },
          { title: new RegExp(escaped, "i") },
        ],
      }).lean();
    }

    if (doc) {
      return {
        title: `${doc.title} – Sillhouete`,
        description:
          doc.description ||
          `Shop ${doc.title} online at Sillhouete. Luxury Pakistani couture, bridal and formal wear.`,
      };
    }
  } catch {
    // ignore and fallback
  }

  const product =
    rawProducts.find((p) => p.handle.toLowerCase() === decodedHandle) ||
    rawProducts.find((p) => p.title.toLowerCase().trim() === decodedHandle);

  if (product) {
    return {
      title: `${product.title} – Sillhouete`,
      description: `Shop ${product.title} online at Sillhouete. Luxury Pakistani couture, bridal and formal wear.`,
    };
  }

  const cleanTitle = decodedHandle
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${cleanTitle} – Sillhouete`,
    description: `Shop ${cleanTitle} online at Sillhouete. Luxury Pakistani couture, bridal and formal wear.`,
  };
}

async function ProductContent({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle).toLowerCase().trim();
  const cleanH = decodedHandle.replace(/[^a-z0-9\-]+/g, "");

  // Try DB first
  let dbProduct: any = null;
  let dbSimilar: any[] = [];

  try {
    await connectDB();
    const escaped = decodedHandle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(decodedHandle);

    dbProduct = await Product.findOne({
      $or: [
        { handle: decodedHandle },
        { handle: cleanH },
        { id: decodedHandle },
        { title: new RegExp(`^${escaped}$`, "i") },
        { _id: isMongoId ? decodedHandle : null },
      ],
    }).lean();

    if (!dbProduct && cleanH) {
      dbProduct = await Product.findOne({
        $or: [
          { handle: new RegExp(`^${cleanH}$`, "i") },
          { handle: new RegExp(cleanH, "i") },
          { title: new RegExp(escaped, "i") },
        ],
      }).lean();
    }

    if (!dbProduct) {
      const searchRegex = new RegExp(escaped, "i");
      dbProduct = await Product.findOne({
        $or: [
          { title: searchRegex },
          { handle: searchRegex },
          { tags: searchRegex },
        ],
      }).lean();
    }

    if (dbProduct) {
      dbSimilar = await Product.find({
        id: { $ne: dbProduct.id },
        category: dbProduct.category,
      })
        .limit(4)
        .lean();
    }
  } catch (err) {
    console.warn("DB query in ProductContent:", err);
  }

  // 1. If found in Database (e.g. added via Admin panel)
  if (dbProduct) {
    let similarProducts: Array<{
      handle: string;
      title: string;
      price: string;
      image: string;
      secondaryImage?: string;
    }> = dbSimilar.map((p) => ({
      handle: p.handle,
      title: p.title,
      price: `Rs.${Number(p.price || 0).toLocaleString()}`,
      image: p.images?.[0] || "",
      secondaryImage: p.images?.[1] || undefined,
    }));

    if (similarProducts.length < 4) {
      const otherProducts = rawProducts
        .filter((p) => p.handle !== dbProduct.handle && p.images && p.images.length > 0)
        .slice(0, 4 - similarProducts.length)
        .map((p) => ({
          handle: p.handle,
          title: p.title,
          price: `Rs.${parseFloat(p.variants[0]?.price || "32900").toLocaleString()}`,
          image: p.images[0]?.src || "",
          secondaryImage: p.images[1]?.src,
        }));
      similarProducts = [...similarProducts, ...otherProducts];
    }

    const formattedProduct = {
      id: dbProduct.id || dbProduct._id,
      title: dbProduct.title,
      handle: dbProduct.handle,
      vendor: dbProduct.vendor || "SILLHOUETE",
      body_html: dbProduct.description || "",
      price: dbProduct.price
        ? `Rs.${Number(dbProduct.price).toLocaleString()}`
        : "Rs.32,900",
      comparePrice: dbProduct.compare_at_price
        ? `Rs.${Number(dbProduct.compare_at_price).toLocaleString()}`
        : null,
      images: Array.isArray(dbProduct.images) && dbProduct.images.length > 0 ? dbProduct.images : [],
      video_url: dbProduct.video_url || "",
      fabric: dbProduct.fabric || "",
      color: dbProduct.color || "",
      pieces: dbProduct.pieces || "",
      dress_style: dbProduct.dress_style || "",
      work_details: dbProduct.work_details || "",
      delivery_time: dbProduct.delivery_time || "",
      care_instructions: dbProduct.care_instructions || "",
      variants:
        dbProduct.variants && dbProduct.variants.length > 0
          ? dbProduct.variants.map((v: any, idx: number) => ({
              id: v.id || idx,
              title: v.title,
              price: `Rs.${Number(v.price).toLocaleString()}`,
              compare_at_price: v.compare_at_price
                ? `Rs.${Number(v.compare_at_price).toLocaleString()}`
                : null,
            }))
          : dbProduct.sizes && dbProduct.sizes.length > 0
          ? dbProduct.sizes.map((s: string, idx: number) => ({
              id: idx,
              title: s,
              price: `Rs.${Number(dbProduct.price).toLocaleString()}`,
              compare_at_price: dbProduct.compare_at_price
                ? `Rs.${Number(dbProduct.compare_at_price).toLocaleString()}`
                : null,
            }))
          : [],
      tags: dbProduct.tags || [],
      collectionTitle: dbProduct.category || "Luxury Pret",
    };

    return (
      <ProductDetailClient
        product={formattedProduct}
        similarProducts={similarProducts}
      />
    );
  }

  // 2. Find product in raw_products.json fallback
  let product = rawProducts.find(
    (p) => p.handle.toLowerCase() === decodedHandle
  );

  // 3. If not found by handle, try matching with title in site_data.json
  if (!product) {
    const allSiteProducts = siteData.collections.flatMap((c) => c.products);
    const siteMatch = allSiteProducts.find(
      (p) =>
        p.handle.toLowerCase() === decodedHandle ||
        p.handle.toLowerCase() === cleanH ||
        p.title.toLowerCase().trim() === decodedHandle
    );
    if (siteMatch) {
      product = rawProducts.find(
        (p) => p.title.toLowerCase().trim() === siteMatch.title.toLowerCase().trim()
      );
      if (!product) {
        return (
          <ProductDetailClient
            product={{
              id: siteMatch.handle,
              title: siteMatch.title,
              handle: siteMatch.handle,
              vendor: "SILLHOUETE",
              body_html: "",
              price: siteMatch.currentPrice,
              comparePrice: siteMatch.comparePrice,
              images: [siteMatch.primaryImage, ...(siteMatch.secondaryImage ? [siteMatch.secondaryImage] : [])],
              tags: [],
              collectionTitle: "Luxury Pret",
            }}
            similarProducts={[]}
          />
        );
      }
    }
  }

  if (!product) {
    notFound();
  }

  // Find parent collection title if possible
  const parentCollection = siteData.collections.find((col) =>
    col.products.some(
      (p) =>
        p.handle.toLowerCase() === product?.handle.toLowerCase() ||
        p.title.toLowerCase().trim() === product?.title.toLowerCase().trim()
    )
  );

  // Find 4 similar products
  let similarProducts: Array<{
    handle: string;
    title: string;
    price: string;
    image: string;
    secondaryImage?: string;
  }> = [];

  if (parentCollection) {
    similarProducts = parentCollection.products
      .filter((p) => p.handle.toLowerCase() !== product?.handle.toLowerCase())
      .slice(0, 4)
      .map((p) => ({
        handle: p.handle,
        title: p.title,
        price: p.currentPrice,
        image: p.primaryImage,
        secondaryImage: p.secondaryImage,
      }));
  }

  // Fallback similar products if collection had fewer than 4
  if (similarProducts.length < 4) {
    const otherProducts = rawProducts
      .filter((p) => p.handle !== product?.handle && p.images && p.images.length > 0)
      .slice(0, 4 - similarProducts.length)
      .map((p) => ({
        handle: p.handle,
        title: p.title,
        price: `Rs.${parseFloat(p.variants[0]?.price || "32900").toLocaleString()}`,
        image: p.images[0]?.src || "",
        secondaryImage: p.images[1]?.src,
      }));
    similarProducts = [...similarProducts, ...otherProducts];
  }

  const formattedProduct = {
    id: product.id,
    title: product.title,
    handle: product.handle,
    vendor: product.vendor || "SILLHOUETE",
    body_html: product.body_html || "",
    price: product.variants[0]?.price
      ? `Rs.${parseFloat(product.variants[0].price).toLocaleString()}`
      : "Rs.32,900",
    comparePrice: product.variants[0]?.compare_at_price
      ? `Rs.${parseFloat(product.variants[0].compare_at_price).toLocaleString()}`
      : null,
    images: product.images.map((img) => img.src),
    variants: product.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: `Rs.${parseFloat(v.price).toLocaleString()}`,
      compare_at_price: v.compare_at_price
        ? `Rs.${parseFloat(v.compare_at_price).toLocaleString()}`
        : null,
    })),
    tags: product.tags,
    collectionTitle: parentCollection?.title || "Luxury Pret",
  };

  return (
    <ProductDetailClient
      product={formattedProduct}
      similarProducts={similarProducts}
    />
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Header */}
      <Header />

      {/* 3. Main Product Details View wrapped in Suspense */}
      <main className="flex-1">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductContent params={params} />
        </Suspense>
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* Interactive Drawers & Modals */}
      <MobileNavDrawer />
      <CartDrawer />
      <SearchModal />
      <CurrencySwitcher />
      <WhatsAppButton />
    </div>
  );
}
