import React from "react";
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

export default function Home() {
  const [coll1, coll2, coll3, coll4, coll5] = siteData.collections;

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

        {/* 4. Collection 1: MAAHI II LUXURY EID PRET (No button) */}
        {coll1 && (
          <CollectionSection
            id={coll1.id}
            title={coll1.title}
            link={coll1.link}
            products={coll1.products}
            showViewAll={false}
          />
        )}

        {/* 5. Collection 2: Silk Solids'26 (No button) */}
        {coll2 && (
          <CollectionSection
            id={coll2.id}
            title={coll2.title}
            link={coll2.link}
            products={coll2.products}
            showViewAll={false}
          />
        )}

        {/* 6. Collection 3: Raha Eid Pret'26 (View All with Red text as in Image 1) */}
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

        {/* 7. Collection 4: Best Sellers (View All with White text as in Image 2) */}
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

        {/* 8. Collection 5: Formals (View All with White text as in Image 2) */}
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

        {/* 9. Video & Image Media Grid */}
        <CustomMediaSection />

        {/* 10. SHOP BY EVENT */}
        <ShopByEventSection />

        {/* 11. Follow Us on Instagram Feed */}
        <InstagramFeedSection />

        {/* 12. Newsletter Subscription */}
        <NewsletterSection />
      </main>

      {/* 12. Site Footer */}
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
