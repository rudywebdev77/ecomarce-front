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
  const { info, products } = getCollectionData(handle);

  return <CollectionClient info={info} initialProducts={products} />;
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
