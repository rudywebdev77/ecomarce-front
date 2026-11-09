import type { Metadata } from "next";
import "./globals.css";
import NewsletterPopupModal from "./components/NewsletterPopupModal";
import ScrollRevealProvider from "./components/ScrollRevealProvider";

export const metadata: Metadata = {
  title: "Shop Pakistani Designer Dresses for Women Online – Sillhouete",
  description:
    "Shop Pakistan designer dresses for women at Sillhouete. Explore bridal dresses, luxury formals, and elegant ready-to-wear outfits with worldwide delivery.",
  icons: {
    icon: "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1_32x32.png?v=1744702089",
  },
  openGraph: {
    title: "Shop Pakistani Designer Dresses for Women Online – Sillhouete",
    description:
      "Shop Pakistan designer dresses for women at Sillhouete. Explore bridal dresses, luxury formals, and elegant ready-to-wear outfits with worldwide delivery.",
    url: "https://sillhouete.com",
    siteName: "Sillhouete",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Halant:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#111111]">
        <ScrollRevealProvider />
        {children}
        <NewsletterPopupModal />
      </body>
    </html>
  );
}
