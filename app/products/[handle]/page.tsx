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
  const decodedHandle = decodeURIComponent(handle).toLowerCase();

  const product =
    rawProducts.find((p) => p.handle.toLowerCase() === decodedHandle) ||
    rawProducts.find((p) => p.title.toLowerCase().trim() === decodedHandle);

  if (!product) {
    return {
      title: "Product Not Found | Sillhouete",
    };
  }

  return {
    title: `${product.title} – Sillhouete`,
    description: `Shop ${product.title} online at Sillhouete. Luxury Pakistani couture, bridal and formal wear.`,
  };
}

async function ProductContent({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle).toLowerCase();

  // 1. Find product in raw_products.json
  let product = rawProducts.find(
    (p) => p.handle.toLowerCase() === decodedHandle
  );

  // 2. If not found by handle, try matching with title in site_data.json
  if (!product) {
    const allSiteProducts = siteData.collections.flatMap((c) => c.products);
    const siteMatch = allSiteProducts.find(
      (p) => p.handle.toLowerCase() === decodedHandle
    );
    if (siteMatch) {
      product = rawProducts.find(
        (p) => p.title.toLowerCase().trim() === siteMatch.title.toLowerCase().trim()
      );
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
        <Suspense
          fallback={
            <div className="py-24 text-center font-serif text-[#777777]">
              Loading product details...
            </div>
          }
        >
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
