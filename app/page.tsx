import React, { Suspense } from "react";
import siteData from "./site_data.json";
import AnnouncementBar from "./components/AnnouncementBar";
import Header from "./components/Header";
import HeroSlideshow from "./components/HeroSlideshow";
import CollectionSection from "./components/CollectionSection";
import CustomMediaSection from "./components/CustomMediaSection";
import ShopByEventSection from "./components/ShopByEventSection";
import InstagramFeedSection from "./components/InstagramFeedSection";
import NewsletterSection from "./components/NewsletterSection";
import Footer from "./components/Footer";
import MobileNavDrawer from "./components/MobileNavDrawer";
import CartDrawer from "./components/CartDrawer";
import SearchModal from "./components/SearchModal";
import ProductQuickViewModal from "./components/ProductQuickViewModal";
import CurrencySwitcher from "./components/CurrencySwitcher";
import WhatsAppButton from "./components/WhatsAppButton";
import { API_BASE } from "./lib/api";
import { Product } from "./components/CollectionSection";
import { connectDB, Product as ProductModel } from "./lib/db";

export const dynamic = "force-dynamic";

async function LiveHomeCollections() {
  const [coll1, coll2, coll3, coll4, coll5] = siteData.collections;

  let dbProducts: any[] = [];
  try {
    try {
      await connectDB();
      dbProducts = await ProductModel.find().lean();
    } catch {
      const res = await fetch(`${API_BASE}/products?limit=150`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        dbProducts = data.products || [];
      }
    }
  } catch {
    // fallback gracefully
  }

  const mapDbProduct = (p: any): Product => ({
    handle: p.handle,
    title: p.title,
    link: `/products/${p.handle}`,
    currentPrice: `Rs.${Number(p.price || 0).toLocaleString()}`,
    comparePrice: p.compare_at_price ? `Rs.${Number(p.compare_at_price).toLocaleString()}` : null,
    isNew: !!p.is_new,
    isSoldOut: p.in_stock === false,
    primaryImage: p.images?.[0] || "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png",
    secondaryImage: p.images?.[1] || p.images?.[0] || "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png",
    extraImages: p.images?.slice(2) || [],
  });

  const getMergedProducts = (colTitle: string, colLink: string, staticProducts: any[]): Product[] => {
    const tLower = colTitle.toLowerCase();
    const lLower = colLink.toLowerCase();

    const liveMatches = dbProducts
      .filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const pType = (p.product_type || "").toLowerCase();
        const tags = (p.tags || []).map((t: string) => t.toLowerCase());
        const pTitle = (p.title || "").toLowerCase();

        if (tLower.includes("best") || lLower.includes("best")) {
          return p.is_featured || tags.some((t: string) => t.includes("best"));
        }
        if (tLower.includes("formal") || lLower.includes("formal")) {
          return (
            cat.includes("formal") ||
            pType.includes("formal") ||
            tags.some((t: string) => t.includes("formal")) ||
            cat.includes("lumiere") ||
            cat.includes("zarqaa") ||
            cat.includes("meeras") ||
            cat.includes("tosha") ||
            cat.includes("riwaj")
          );
        }
        if (tLower.includes("silk") || lLower.includes("silk") || tLower.includes("solid")) {
          return (
            cat.includes("silk") ||
            cat.includes("solid") ||
            pType.includes("silk") ||
            tags.some((t: string) => t.includes("silk") || t.includes("solid")) ||
            pTitle.includes("silk")
          );
        }
        if (tLower.includes("raha") || lLower.includes("raha")) {
          return cat.includes("raha") || tags.some((t: string) => t.includes("raha")) || pTitle.includes("raha");
        }
        if (tLower.includes("maahi") || lLower.includes("maahi") || tLower.includes("mahi")) {
          return (
            cat.includes("maahi") ||
            cat.includes("mahi") ||
            tags.some((t: string) => t.includes("maahi") || t.includes("mahi")) ||
            pTitle.includes("maahi") ||
            pTitle.includes("mahi")
          );
        }
        return cat === tLower || cat.includes(lLower) || pType === tLower;
      })
      .map(mapDbProduct);

    const formattedStatic: Product[] = staticProducts.map((sp) => ({
      handle: sp.handle,
      title: sp.title,
      link: sp.link || `/products/${sp.handle}`,
      currentPrice: sp.currentPrice,
      comparePrice: sp.comparePrice,
      isNew: sp.isNew,
      isSoldOut: sp.isSoldOut,
      primaryImage: sp.primaryImage,
      secondaryImage: sp.secondaryImage || sp.primaryImage,
      extraImages: sp.extraImages,
    }));

    const merged = [...liveMatches];
    const seen = new Set(liveMatches.map((p) => p.handle.toLowerCase()));
    for (const sp of formattedStatic) {
      if (!seen.has(sp.handle.toLowerCase())) {
        seen.add(sp.handle.toLowerCase());
        merged.push(sp);
      }
    }
    return merged;
  };

  const saleLiveProducts = dbProducts
    .filter((p) => {
      const cat = (p.category || "").toLowerCase();
      const pType = (p.product_type || "").toLowerCase();
      const tags = (p.tags || []).map((t: string) => t.toLowerCase());
      return (
        cat.includes("sale") ||
        pType.includes("sale") ||
        tags.some((t: string) => t.includes("sale")) ||
        p.is_sale === true ||
        (p.compare_at_price && Number(p.compare_at_price) > Number(p.price))
      );
    })
    .map(mapDbProduct);

  const bridalLiveProducts = dbProducts
    .filter((p) => {
      const cat = (p.category || "").toLowerCase();
      const pType = (p.product_type || "").toLowerCase();
      const tags = (p.tags || []).map((t: string) => t.toLowerCase());
      return (
        cat.includes("bridal") ||
        cat.includes("birdal") ||
        cat.includes("barat") ||
        cat.includes("walima") ||
        pType.includes("bridal") ||
        tags.some((t: string) => t.includes("bridal") || t.includes("birdal") || t.includes("barat") || t.includes("walima"))
      );
    })
    .map(mapDbProduct);

  return (
    <>
      {saleLiveProducts.length > 0 && (
        <CollectionSection
          id="festive-sale"
          title="SILLHOUETE SALE / FESTIVE OFFERS"
          link="/collections/sale-1"
          products={saleLiveProducts}
          showViewAll={true}
          viewAllTextColor="red"
        />
      )}
      {coll1 && (
        <CollectionSection
          id={coll1.id}
          title={coll1.title}
          link={coll1.link}
          products={getMergedProducts(coll1.title, coll1.link, coll1.products)}
          showViewAll={false}
        />
      )}
      {coll2 && (
        <CollectionSection
          id={coll2.id}
          title={coll2.title}
          link={coll2.link}
          products={getMergedProducts(coll2.title, coll2.link, coll2.products)}
          showViewAll={false}
        />
      )}
      {coll3 && (
        <CollectionSection
          id={coll3.id}
          title={coll3.title}
          link={coll3.link}
          products={getMergedProducts(coll3.title, coll3.link, coll3.products)}
          showViewAll={true}
          viewAllTextColor="red"
        />
      )}
      {coll4 && (
        <CollectionSection
          id={coll4.id}
          title={coll4.title}
          link={coll4.link}
          products={getMergedProducts(coll4.title, coll4.link, coll4.products)}
          showViewAll={true}
          viewAllTextColor="white"
        />
      )}
      {coll5 && (
        <CollectionSection
          id={coll5.id}
          title={coll5.title}
          link={coll5.link}
          products={getMergedProducts(coll5.title, coll5.link, coll5.products)}
          showViewAll={true}
          viewAllTextColor="white"
        />
      )}
      {bridalLiveProducts.length > 0 && (
        <CollectionSection
          id="live-bridal-couture"
          title="BESPOKE BRIDAL COUTURE"
          link="/collections/bridal-dresses"
          products={bridalLiveProducts}
          showViewAll={true}
          viewAllTextColor="white"
        />
      )}
    </>
  );
}

function StaticHomeCollections() {
  const [coll1, coll2, coll3, coll4, coll5] = siteData.collections;
  return (
    <>
      {coll1 && (
        <CollectionSection
          id={coll1.id}
          title={coll1.title}
          link={coll1.link}
          products={coll1.products}
          showViewAll={false}
        />
      )}
      {coll2 && (
        <CollectionSection
          id={coll2.id}
          title={coll2.title}
          link={coll2.link}
          products={coll2.products}
          showViewAll={false}
        />
      )}
      {coll3 && (
        <CollectionSection
          id={coll3.id}
          title={coll3.title}
          link={coll3.link}
          products={coll3.products}
          showViewAll={true}
          viewAllTextColor="red"
        />
      )}
      {coll4 && (
        <CollectionSection
          id={coll4.id}
          title={coll4.title}
          link={coll4.link}
          products={coll4.products}
          showViewAll={true}
          viewAllTextColor="white"
        />
      )}
      {coll5 && (
        <CollectionSection
          id={coll5.id}
          title={coll5.title}
          link={coll5.link}
          products={coll5.products}
          showViewAll={true}
          viewAllTextColor="white"
        />
      )}
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3. Hero Slideshow Banner */}
        <HeroSlideshow />

        {/* 4. Live Collections with Suspense Streaming */}
        <Suspense fallback={<StaticHomeCollections />}>
          <LiveHomeCollections />
        </Suspense>

        {/* 5. Video & Image Media Grid */}
        <CustomMediaSection />

        {/* 6. SHOP BY EVENT */}
        <ShopByEventSection />

        {/* 7. Follow Us on Instagram Feed */}
        <InstagramFeedSection />

        {/* 8. Newsletter Subscription */}
        <NewsletterSection />
      </main>

      {/* 9. Site Footer */}
      <Footer />

      {/* Interactive Drawers, Modals & Floating Tools */}
      <MobileNavDrawer />
      <CartDrawer />
      <SearchModal />
      <ProductQuickViewModal />
      <CurrencySwitcher />
      <WhatsAppButton />
    </div>
  );
}
