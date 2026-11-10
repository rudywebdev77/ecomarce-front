import React, { Suspense } from "react";
import { Metadata } from "next";
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MobileNavDrawer from "../../components/MobileNavDrawer";
import CartDrawer from "../../components/CartDrawer";
import SearchModal from "../../components/SearchModal";
import CurrencySwitcher from "../../components/CurrencySwitcher";
import WhatsAppButton from "../../components/WhatsAppButton";
import CollectionClient from "./CollectionClient";
import { getCollectionData, COLLECTIONS_REGISTRY } from "../../lib/collections";
import { API_BASE } from "../../lib/api";
import { Product } from "../../components/ProductCard";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const { info } = getCollectionData(handle);

  return {
    title: `${info.title} – Sillhouete`,
    description:
      info.description ||
      `Shop our latest ${info.title} collection at Sillhouete. Luxury Pakistani couture, bridal and formal wear.`,
    openGraph: {
      title: `${info.title} – Sillhouete`,
      description:
        info.description ||
        `Shop our latest ${info.title} collection at Sillhouete.`,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(COLLECTIONS_REGISTRY).map((handle) => ({
    handle,
  }));
}

async function CollectionContent({ params }: PageProps) {
  const { handle } = await params;
  const cleanHandle = decodeURIComponent(handle).toLowerCase().trim();
  const { info, products: staticProducts } = getCollectionData(handle);

  let liveProducts: Product[] = [];
  try {
    const res = await fetch(`${API_BASE}/products?limit=500`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const allDb = (data.products || []) as any[];

      const matched = allDb.filter((p) => {
        const cat = (p.category || "").toLowerCase().trim();
        const pType = (p.product_type || "").toLowerCase().trim();
        const tags = (p.tags || []).map((t: string) => t.toLowerCase().trim());
        const infoTitleLower = info.title.toLowerCase().trim();

        const pTitle = (p.title || "").toLowerCase().trim();

        // 0. Sale Collection (Check first for sale handles)
        if (cleanHandle === "sale" || cleanHandle === "sale-1") {
          return (
            cat === "sale" ||
            cat.includes("sale") ||
            pType.includes("sale") ||
            tags.some((t: string) => t === "sale" || t.includes("sale")) ||
            p.is_sale === true ||
            (p.compare_at_price && Number(p.compare_at_price) > Number(p.price))
          );
        }

        // Specific collection match by category, handle, or tags FIRST
        const matchesSpecific =
          cat === infoTitleLower ||
          cat === cleanHandle ||
          (cat && (infoTitleLower.includes(cat) || cleanHandle.includes(cat) || cat.includes(cleanHandle))) ||
          tags.some(
            (t: string) =>
              t === infoTitleLower ||
              t === cleanHandle ||
              infoTitleLower.includes(t) ||
              cleanHandle.includes(t) ||
              (t.length >= 4 && cleanHandle.includes(t.replace(/[^a-z0-9]+/g, "-")))
          );

        if (matchesSpecific) return true;

        // Distinct keywords match for specific subcollections (e.g. "maahi", "husan ara", "zarqaa", "meeras", "lumiere", "tosha kinari", "opal")
        const rootWords = cleanHandle
          .split("-")
          .filter((w) => w.length >= 4 && !["luxury", "pret", "formal", "formals", "bridal", "birdal", "dresses", "collection", "solids"].includes(w));
        if (rootWords.length > 0 && rootWords.some((rw) => pTitle.includes(rw) || cat.includes(rw) || tags.some((t: string) => t.includes(rw)))) {
          return true;
        }

        // Broad Parent Collections:
        // 1. New Arrivals
        if (cleanHandle === "new-arrivals") {
          return p.is_new === true || tags.some((t: string) => t.includes("new"));
        }

        // 3. Best Sellers
        if (cleanHandle === "best-sellers") {
          return p.is_featured === true || tags.some((t: string) => t.includes("best"));
        }

        // 4. Formals (Generic broad collection)
        if (cleanHandle === "formal-dresses" || cleanHandle === "formals" || cleanHandle === "formal") {
          return (
            cat.includes("formal") ||
            pType.includes("formal") ||
            tags.some((t: string) => t.includes("formal"))
          );
        }

        // 5. Bridals (Generic broad collection)
        if (cleanHandle === "bridal-dresses" || cleanHandle === "bridals" || cleanHandle === "bridal") {
          return (
            cat.includes("bridal") ||
            pType.includes("bridal") ||
            tags.some((t: string) => t.includes("bridal"))
          );
        }

        // 6. Pret (Generic broad collection)
        if (cleanHandle === "pret" || cleanHandle === "luxury-pret") {
          return (
            cat.includes("pret") ||
            pType.includes("pret") ||
            tags.some((t: string) => t.includes("pret"))
          );
        }

        return false;
      });

      liveProducts = matched.map((p) => ({
        handle: p.handle,
        title: p.title,
        link: `/products/${p.handle}`,
        currentPrice: `Rs.${Number(p.price || 0).toLocaleString()}`,
        comparePrice: p.compare_at_price ? `Rs.${Number(p.compare_at_price).toLocaleString()}` : null,
        isNew: !!p.is_new,
        isSale: !!p.is_sale || Boolean(p.compare_at_price) || cleanHandle.includes("sale"),
        isSoldOut: p.in_stock === false,
        primaryImage: p.images?.[0] || "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png",
        secondaryImage: p.images?.[1] || p.images?.[0] || "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png",
        extraImages: p.images?.slice(2) || [],
        productType: p.category || p.product_type || info.title,
        createdAt: p.created_at,
      }));
    }
  } catch {
    // If backend fails, fallback gracefully to static products
  }

  // Prepend live products from database so newly added outfits appear at the very front
  const combined: Product[] = [...liveProducts];
  const seenHandles = new Set(liveProducts.map((p) => p.handle.toLowerCase()));

  for (const p of staticProducts) {
    if (!seenHandles.has(p.handle.toLowerCase())) {
      seenHandles.add(p.handle.toLowerCase());
      combined.push(p);
    }
  }

  return <CollectionClient info={info} initialProducts={combined} />;
}

export default function CollectionPage({ params }: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Header Navigation */}
      <Header />

      {/* 3. Main Collection Content wrapped in Suspense */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center font-serif text-[#777777]">
              Loading collection...
            </div>
          }
        >
          <CollectionContent params={params} />
        </Suspense>
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* Interactive Overlays */}
      <MobileNavDrawer />
      <CartDrawer />
      <SearchModal />
      <CurrencySwitcher />
      <WhatsAppButton />
    </div>
  );
}
