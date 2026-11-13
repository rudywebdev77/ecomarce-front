import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MobileNavDrawer from "../../components/MobileNavDrawer";
import CartDrawer from "../../components/CartDrawer";
import SearchModal from "../../components/SearchModal";
import CurrencySwitcher from "../../components/CurrencySwitcher";
import WhatsAppButton from "../../components/WhatsAppButton";
import ContactForm from "../../components/ContactForm";
import siteData from "../../site_data.json";

interface PageProps {
  params: Promise<{ handle: string }>;
}

const PAGES_CONTENT: Record<
  string,
  {
    title: string;
    description: string;
    content: React.ReactNode;
  }
> = {
  "contact-us": {
    title: "Contact Us",
    description: "Get in touch with Sillhouete customer care and bridal consultancy.",
    content: (
      <div className="space-y-8">
        <p className="text-[15px] leading-relaxed text-[#444444]">
          We are here to assist you with inquiries regarding custom orders, size consultations,
          deliveries, and bridal appointments. Feel free to reach out to us through any of the channels below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="bg-[#fcfcfc] border border-[#f0f0f0] p-6 space-y-4">
            <h3 className="text-[16px] font-bold uppercase tracking-[0.1em] text-[#111111]">
              Customer Support &amp; Studio
            </h3>
            <p className="text-[14px] text-[#555555]">
              <strong>Phone:</strong> {siteData.storeInfo.phone}
            </p>
            <p className="text-[14px] text-[#555555]">
              <strong>WhatsApp:</strong> {siteData.storeInfo.whatsapp}
            </p>
            <p className="text-[14px] text-[#555555]">
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${siteData.storeInfo.email}`}
                className="text-[#111111] hover:underline"
              >
                {siteData.storeInfo.email}
              </a>
            </p>
            <p className="text-[14px] text-[#555555]">
              <strong>Office:</strong> DHA Phase 5, Lahore, Pakistan
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${siteData.storeInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#25D366] text-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    ),
  },
  "help-and-info": {
    title: "Help & Information",
    description: "Find helpful answers about ordering, custom sizes, international delivery, and policies.",
    content: (
      <div className="space-y-6 text-[14px] leading-relaxed text-[#444444]">
        <h3 className="text-[18px] font-semibold text-[#111111]">Ordering &amp; Customization</h3>
        <p>
          At Sillhouete, every outfit is tailored to perfection. You can select standard sizes (XS through XL) or request custom measurements for special bridal and formal orders.
        </p>

        <h3 className="text-[18px] font-semibold text-[#111111] pt-4">Worldwide Shipping</h3>
        <p>
          We offer worldwide shipping via premium DHL and FedEx couriers. Complimentary international shipping applies to qualifying orders. Delivery tracking is shared via email and SMS once dispatched.
        </p>

        <h3 className="text-[18px] font-semibold text-[#111111] pt-4">Payment Methods</h3>
        <p>
          We accept all major credit and debit cards (Visa, MasterCard, American Express, Discover, JCB) as well as direct bank transfers for local Pakistani orders.
        </p>
      </div>
    ),
  },
  "terms-and-conditions": {
    title: "Terms and Conditions",
    description: "Read our website and service terms and conditions.",
    content: (
      <div className="space-y-4 text-[14px] leading-relaxed text-[#444444]">
        <p>
          Welcome to Sillhouete. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions of use.
        </p>
        <p>
          All content, images, designs, and logos displayed on this website are the intellectual property of Sillhouete and are protected by applicable copyright and trademark laws.
        </p>
        <p>
          Product prices and availability are subject to change without prior notice. In the event of a pricing or typographical error, we reserve the right to cancel or refuse any orders placed.
        </p>
      </div>
    ),
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description: "Our commitment to protecting your privacy and personal data.",
    content: (
      <div className="space-y-4 text-[14px] leading-relaxed text-[#444444]">
        <p>
          Your privacy is paramount to us at Sillhouete. We do not sell, rent, or trade your personal information with third parties for marketing purposes.
        </p>
        <p>
          We collect personal details such as your name, billing address, delivery address, phone number, and email address solely to process your orders and provide customer support.
        </p>
        <p>
          Payment transactions are securely processed through encrypted, certified third-party payment gateways. We never store full credit or debit card numbers on our servers.
        </p>
      </div>
    ),
  },
  "shipping-policy": {
    title: "Shipping Policy",
    description: "Delivery times, tracking, and international shipping rates.",
    content: (
      <div className="space-y-4 text-[14px] leading-relaxed text-[#444444]">
        <p>
          <strong>Domestic Delivery (Pakistan):</strong> 3 to 7 working days for ready-to-wear pret. Made-to-order formals take 3 to 5 weeks.
        </p>
        <p>
          <strong>International Delivery:</strong> Standard courier delivery takes 5 to 10 working days once dispatched. Expedited DHL shipping options are available at checkout.
        </p>
        <p>
          <strong>Customs &amp; Duties:</strong> International orders may be subject to local import duties and taxes levied by your country’s customs authority. These charges are the recipient’s responsibility.
        </p>
      </div>
    ),
  },
  "faqs": {
    title: "Frequently Asked Questions",
    description: "Answers to common questions regarding sizing, custom stitching, delivery, and orders.",
    content: (
      <div className="space-y-6">
        {[
          {
            q: "Can I customize the color or size of my dress?",
            a: "Yes! Most bridal and formal ensembles offer bespoke size customization. Custom color options are available on select designs. Please consult our WhatsApp team for assistance.",
          },
          {
            q: "How do I choose the correct size?",
            a: "Please refer to the detailed size chart available on every product page. If your measurements fall between sizes, we recommend opting for custom tailoring.",
          },
          {
            q: "Do you ship internationally?",
            a: "Yes, we ship to customers worldwide including the USA, UK, Canada, Europe, Australia, and the Middle East.",
          },
          {
            q: "What is your refund or exchange policy?",
            a: "Because each piece is crafted upon order, made-to-order outfits and altered garments cannot be returned. If an item arrives damaged or defective, please contact us within 48 hours for immediate resolution.",
          },
        ].map((faq, idx) => (
          <div key={idx} className="border-b border-[#ececec] pb-4">
            <h4 className="text-[16px] font-semibold text-[#111111] mb-2">
              {faq.q}
            </h4>
            <p className="text-[14px] text-[#555555] leading-relaxed font-sans-custom">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  "brand-story": {
    title: "Brand Story",
    description: "The philosophy, heritage, and artisan story behind Sillhouete.",
    content: (
      <div className="space-y-5 text-[15px] leading-relaxed text-[#444444]">
        <p>
          Rooted in Lahore’s rich artistic heritage, <strong>Sillhouete</strong> is a contemporary Pakistani couture house dedicated to redefining luxury Eastern wear.
        </p>
        <p>
          We bridge generational artisanal craftsmanship — timeless kora, dabka, naqshi, and resham threadwork — with clean modern lines, fluid raw silks, and ethereal organzas.
        </p>
        <p>
          Each creation is crafted to celebrate milestones, from intimate Nikkah ceremonies and exuberant Mehndis to grand bridal events and modern festive soirees.
        </p>
      </div>
    ),
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const page = PAGES_CONTENT[handle] || {
    title: handle.replace(/-/g, " ").toUpperCase(),
    description: `Information about ${handle.replace(/-/g, " ")} at Sillhouete.`,
  };

  return {
    title: `${page.title} – Sillhouete`,
    description: page.description,
  };
}

async function GenericPageContent({ params }: PageProps) {
  const { handle } = await params;
  const cleanHandle = handle.toLowerCase();
  const page = PAGES_CONTENT[cleanHandle] || {
    title: cleanHandle.replace(/-/g, " ").toUpperCase(),
    description: `Information regarding ${cleanHandle.replace(/-/g, " ")}.`,
    content: (
      <p className="text-[15px] text-[#444444] leading-relaxed">
        Please contact our customer support team for inquiries regarding {cleanHandle.replace(/-/g, " ")}.
      </p>
    ),
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-[#f0f0f0] bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 text-[12px] text-[#777777] font-sans-custom uppercase tracking-[0.1em]">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="text-[#cccccc]">/</li>
            <li className="text-[#111111] font-semibold">{page.title}</li>
          </ol>
        </div>
      </nav>

      {/* Content Section */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <header className="text-center mb-10 pb-6 border-b border-[#ececec]">
          <h1 className="text-[28px] sm:text-[38px] font-semibold uppercase tracking-[0.05em] text-[#111111]">
            {page.title}
          </h1>
          {page.description && (
            <p className="mt-2 text-[14px] text-[#666666] font-sans-custom">
              {page.description}
            </p>
          )}
        </header>

        <article className="prose prose-neutral max-w-none">
          {page.content}
        </article>
      </div>
    </>
  );
}

export default function GenericPage({ params }: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-serif">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center font-serif text-[#777777]">
              Loading page...
            </div>
          }
        >
          <GenericPageContent params={params} />
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

