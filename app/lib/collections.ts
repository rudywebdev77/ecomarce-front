import rawProductsData from "../raw_products.json";
import siteData from "../site_data.json";
import { Product } from "../components/ProductCard";
import { SALE_PRODUCTS } from "./saleProducts";
import authenticProductsMap from "./authentic_collection_products.json";
import seoArticlesMap from "./collection_seo_articles.json";
import collectionTitlesMap from "./collection_titles.json";

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
  created_at?: string;
  published_at?: string;
}

const rawProducts = rawProductsData as RawProduct[];

// Helper to format raw product to Product interface
function formatRawProduct(p: RawProduct): Product {
  const currentPrice = p.variants[0]?.price
    ? `Rs.${parseFloat(p.variants[0].price).toLocaleString()}`
    : "Rs.32,900";
  const comparePrice = p.variants[0]?.compare_at_price
    ? `Rs.${parseFloat(p.variants[0].compare_at_price).toLocaleString()}`
    : null;

  const isSale =
    Boolean(comparePrice) ||
    p.tags.some((t) => t.toLowerCase() === "sale" || t.toLowerCase().includes("discount"));

  const isNew = p.tags.some((t) => t.toLowerCase() === "new" || t.toLowerCase() === "new arrivals");

  return {
    handle: p.handle,
    title: p.title,
    link: `/products/${p.handle}`,
    currentPrice,
    comparePrice,
    isNew,
    isSale,
    isSoldOut: false,
    primaryImage: p.images[0]?.src || "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png",
    secondaryImage: p.images[1]?.src || p.images[0]?.src,
    extraImages: p.images.slice(2).map((img) => img.src),
    productType: p.product_type,
    createdAt: p.published_at || p.created_at,
  };
}

// Pre-filter valid products with images
const validRawProducts = rawProducts.filter(
  (p) => p.images && p.images.length > 0 && p.title && p.title.trim() !== ""
);

export interface CollectionInfo {
  handle: string;
  title: string;
  description?: string;
  notice?: string;
  subCollections?: { text: string; href: string; isRed?: boolean }[];
  parentTitle?: string;
  seoHtml?: string;
}

// Collection metadata registry matching sillhouete.com exactly
export const COLLECTIONS_REGISTRY: Record<string, CollectionInfo> = {
  "sale-1": {
    handle: "sale-1",
    title: "Sillhouete Sale",
    notice: "Sales items will not be return , exchange or refunded.",
    description:
      "Shop special marked-down pieces and promotional festive offers across past pret and luxury formal edits.",
  },
  "sale": {
    handle: "sale-1",
    title: "Sillhouete Sale",
    notice: "Sales items will not be return , exchange or refunded.",
    description:
      "Shop special marked-down pieces and promotional festive offers across past pret and luxury formal edits.",
  },
  "maahi-ii-luxury-eid-pret": {
    handle: "maahi-ii-luxury-eid-pret",
    title: "Maahi II Luxury Eid Pret",
    description:
      "A tribute to modern couture — showcasing Korean raw silks, intricate Swarovski crystal work, and delicate dupattas.",
  },
  "new-arrivals": {
    handle: "new-arrivals",
    title: "New Arrivals",
    description:
      "Explore the latest seasonal drops and fresh festive edits from Sillhouete.",
    subCollections: [
      { text: "Maahi II Luxury Eid Pret", href: "/collections/maahi-ii-luxury-eid-pret" },
      { text: "Silk Solids'26", href: "/collections/silk-solids26" },
      { text: "Raha Eid Pret'26", href: "/collections/raha-eid-pret26", isRed: true },
      { text: "Lumiere Luxury Formals'26", href: "/collections/lumiere-luxury-formals26" },
    ],
  },
  "silk-solids26": {
    handle: "silk-solids26",
    title: "Silk Solids'26",
    description:
      "Vibrant luxury raw silk 2-piece and 3-piece ensembles with fine hand-embroidery and sequins detailing.",
  },
  "raha-eid-pret26": {
    handle: "raha-eid-pret26",
    title: "Raha Eid Pret'26",
    description:
      "Effortless elegance for festive occasions. Features lightweight organza, raw silks, and contemporary cuts.",
  },
  "lumiere-luxury-formals26": {
    handle: "lumiere-luxury-formals26",
    title: "Lumiere Luxury Formals'26",
    description:
      "Heavily embellished luxury formal wear designed for grand wedding receptions, nikkahs, and evening parties.",
  },
  "bridal-dresses": {
    handle: "bridal-dresses",
    title: "BRIDALS",
    description:
      "Heritage bridal couture crafted with traditional zardozi, kora, dabka, and resham on opulent farshis, lehengas, and peshwas.",
    subCollections: [
      { text: "Husan ara - Birdal '25", href: "/collections/husan-ara-birdal-25" },
      { text: "Anarkali - Birdal '24", href: "/collections/anarkali-birdal-24" },
      { text: "Noor Jahn Bridal '23", href: "/collections/noor-jahn-bridal-23" },
      { text: "Roshanara Bridal '22", href: "/collections/roshanara-bridal-22" },
    ],
  },
  "husan-ara-birdal-25": {
    handle: "husan-ara-birdal-25",
    title: "Husan ara - Birdal '25",
    description:
      "A grand symphony of regal gold embellishments and handcrafted dabka for the quintessential Pakistani bride.",
    parentTitle: "Bridals",
  },
  "anarkali-birdal-24": {
    handle: "anarkali-birdal-24",
    title: "Anarkali - Birdal '24",
    description:
      "Timeless Mughal-inspired bridal ensembles celebrating poetic silhouettes and artisan craftsmanship.",
    parentTitle: "Bridals",
  },
  "noor-jahn-bridal-23": {
    handle: "noor-jahn-bridal-23",
    title: "Noor Jahn Bridal '23",
    description:
      "Classic regal aesthetics reimagined with intricate gota, mirror, and antique zardozi.",
    parentTitle: "Bridals",
  },
  "roshanara-bridal-22": {
    handle: "roshanara-bridal-22",
    title: "Roshanara Bridal '22",
    description:
      "Heritage couture with heavy farshi shararas and embellished dupattas for ceremonial events.",
    parentTitle: "Bridals",
  },
  "formal-dresses": {
    handle: "formal-dresses",
    title: "FORMALS",
    description:
      "Intricately embellished formal silhouettes and festive dresses for wedding guests and special celebrations.",
    subCollections: [
      { text: "Lumiere Luxury Formals'26", href: "/collections/lumiere-luxury-formals26" },
      { text: "Meeras", href: "/collections/meeras", isRed: true },
      { text: "Zarqaa", href: "/collections/zarqaa" },
      { text: "Riwaj Formals", href: "/collections/riwaj-formals" },
      { text: "Rang e Bahar", href: "/collections/rang-e-bahar" },
      { text: "Tosha Kinari", href: "/collections/tosha-kinari" },
      { text: "Shawl Collection", href: "/collections/luxury-shawl" },
    ],
  },
  "meeras": {
    handle: "meeras",
    title: "Meeras - Formal Collection '25",
    description:
      "Timeless heritage designs and fine needlework capturing the essence of cultural luxury.",
    parentTitle: "Formal",
  },
  "zarqaa": {
    handle: "zarqaa",
    title: "Zarqaa",
    description:
      "Intricate threadwork, delicate cutwork, and glistening Swarovski accents on pure fabrics.",
    parentTitle: "Formal",
  },
  "riwaj-formals": {
    handle: "riwaj-formals",
    title: "Riwaj Formals",
    description:
      "Traditional craftsmanship meeting modern silhouettes for glamorous evening occasions.",
    parentTitle: "Formal",
  },
  "rang-e-bahar": {
    handle: "rang-e-bahar",
    title: "Rang e Bahar",
    description:
      "A festive celebration of vibrant hues, delicate floral embroideries, and ethereal dupattas.",
    parentTitle: "Formal",
  },
  "tosha-kinari": {
    handle: "tosha-kinari",
    title: "Tosha Kinari",
    description:
      "Signature kinari borders and intricate hand-embellished details on tailored raw silk ensembles.",
    parentTitle: "Formal",
  },
  "luxury-shawl": {
    handle: "luxury-shawl",
    title: "Luxury Shawl",
    description:
      "Opulent velvet, silk, and organza shawls featuring regal motifs and delicate borders.",
    parentTitle: "Formal",
  },
  "luxury-pret": {
    handle: "luxury-pret",
    title: "Luxury Pret Dresses for Women",
    description:
      "Effortlessly stylish ready-to-wear luxury designs created for festive celebrations and modern gatherings.",
    subCollections: [
      { text: "Maahi II Luxury Eid Pret", href: "/collections/maahi-ii-luxury-eid-pret" },
      { text: "Silk Solids'26", href: "/collections/silk-solids26" },
      { text: "Maahi Luxury Pret'25", href: "/collections/maahi-luxury-pret25" },
      { text: "Luxe", href: "/collections/luxe-1" },
      { text: "Opal", href: "/collections/opal" },
      { text: "Riwaj Luxury Pret", href: "/collections/riwaj-luxury-pret" },
    ],
  },
  "maahi-luxury-pret25": {
    handle: "maahi-luxury-pret25",
    title: "Maahi Luxury Pret'25",
    description: "The celebrated festive pret line featuring timeless embroidered shirts and sleek culottes.",
    parentTitle: "Luxury Pret",
  },
  "luxe-1": {
    handle: "luxe-1",
    title: "Luxe",
    description: "Contemporary cuts and understated elegance crafted in rich silks and delicate embellishments.",
    parentTitle: "Luxury Pret",
  },
  "opal": {
    handle: "opal",
    title: "Opal",
    description: "Luminous pastel tones adorned with subtle crystals and intricate floral embroideries.",
    parentTitle: "Luxury Pret",
  },
  "riwaj-luxury-pret": {
    handle: "riwaj-luxury-pret",
    title: "Riwaj Luxury Pret",
    description: "Classic styling paired with sophisticated craftsmanship for effortless luxury wear.",
    parentTitle: "Luxury Pret",
  },
  "pret": {
    handle: "pret",
    title: "Pret",
    description: "Ready-to-wear stitched designer wear tailored with precision and contemporary flair.",
    subCollections: [
      { text: "Raha Eid Pret'26", href: "/collections/raha-eid-pret26", isRed: true },
    ],
  },
  "shop-by-events": {
    handle: "shop-by-events",
    title: "Shop By Events",
    description:
      "Curated outfits for weddings, engagements, mehndi, nikkah, barat, and walima ceremonies.",
    subCollections: [
      { text: "Engagement", href: "/collections/engagement-dresses" },
      { text: "Mehndi", href: "/collections/mehndi-dresses" },
      { text: "Nikkah", href: "/collections/nikkah-dresses" },
      { text: "Barat", href: "/collections/barat-dresses" },
      { text: "Walima", href: "/collections/walima-dresses" },
    ],
  },
  "engagement-dresses": {
    handle: "engagement-dresses",
    title: "Engagement",
    description: "Dreamy pastels, glistening Swarovski crystals, and elegant gowns for your engagement day.",
    parentTitle: "Shop By Events",
  },
  "mehndi-dresses": {
    handle: "mehndi-dresses",
    title: "Mehndi",
    description: "Lively yellows, emerald greens, and vibrant multi-colored lehengas and peshwas for festive mehndis.",
    parentTitle: "Shop By Events",
  },
  "nikkah-dresses": {
    handle: "nikkah-dresses",
    title: "Nikkah",
    description: "Ethereal ivory, soft blush, and serene whites intricately worked with naqshi and dabka for Nikkah ceremonies.",
    parentTitle: "Shop By Events",
  },
  "barat-dresses": {
    handle: "barat-dresses",
    title: "Barat",
    description: "Majestic deep crimsons, traditional reds, and heavy zardozi farshi shararas for Barat brides.",
    parentTitle: "Shop By Events",
  },
  "walima-dresses": {
    handle: "walima-dresses",
    title: "Walima",
    description: "Opulent metallic silvers, rose golds, and champagne gowns crafted for grandeur on your Walima evening.",
    parentTitle: "Shop By Events",
  },
  "best-sellers": {
    handle: "best-sellers",
    title: "Best Sellers",
    description: "Our most coveted couture pieces and customer favorites worldwide.",
  },
  "accessories": {
    handle: "accessories",
    title: "Accessories",
    description: "Finishing touches of elegance — hand-embellished pouches and artisanal clutches.",
    subCollections: [
      { text: "Pouches & Clutches", href: "/collections/pouches-clutches" },
    ],
  },
  "pouches-clutches": {
    handle: "pouches-clutches",
    title: "Pouches & Clutches",
    description: "Bespoke handcrafted clutches and potlis adorned with matching couture embroidery.",
    parentTitle: "Accessories",
  },
  "all": {
    handle: "all",
    title: "All Products",
    description: "Browse the complete collection of designer Pakistani couture and luxury pret at Sillhouete.",
  },
};

export function getCollectionData(handle: string): {
  info: CollectionInfo;
  products: Product[];
} {
  const cleanHandle = decodeURIComponent(handle).toLowerCase().trim();

  // Find info from registry
  let info = COLLECTIONS_REGISTRY[cleanHandle];

  if (!info) {
    const rawTitle = (collectionTitlesMap as Record<string, string>)[cleanHandle];
    const prettyTitle = rawTitle || cleanHandle
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    info = {
      handle: cleanHandle,
      title: prettyTitle,
      description: `Shop our exclusive ${prettyTitle} collection online at Sillhouete.`,
    };
  } else {
    // If exact title exists in collectionTitlesMap, apply it
    const officialTitle = (collectionTitlesMap as Record<string, string>)[cleanHandle];
    if (officialTitle && cleanHandle !== "sale-1" && cleanHandle !== "sale") {
      info = { ...info, title: officialTitle };
    }
  }

  // Attach rich SEO article HTML if present (Image 2 style)
  const seoHtml = (seoArticlesMap as Record<string, string>)[cleanHandle];
  if (seoHtml) {
    info = { ...info, seoHtml };
  }

  // 0. Special treatment for Sale collection using authentic live products
  if (cleanHandle === "sale-1" || cleanHandle === "sale") {
    return {
      info,
      products: SALE_PRODUCTS,
    };
  }

  // 1. If we have authentic collection products from sillhouete.com, return them!
  const authenticProds = (authenticProductsMap as Record<string, Product[]>)[cleanHandle];
  if (authenticProds && authenticProds.length > 0) {
    return {
      info,
      products: authenticProds,
    };
  }

  // 2. Gather curated products from site_data.json if direct match exists
  const curatedCollection = siteData.collections.find(
    (c) =>
      c.link.toLowerCase().endsWith(cleanHandle) ||
      c.id.toLowerCase() === cleanHandle ||
      c.title.toLowerCase().includes(cleanHandle)
  );

  let products: Product[] = [];

  if (curatedCollection) {
    products = curatedCollection.products.map((p) => ({
      ...p,
      link: p.link || `/products/${p.handle}`,
    }));
  }

  // 3. Query fallback products from raw_products.json based on collection handle
  const rawMatches: Product[] = [];

  for (const raw of validRawProducts) {
    const rawTags = raw.tags.map((t) => t.toLowerCase());
    const rawType = (raw.product_type || "").toLowerCase();
    const rawTitle = raw.title.toLowerCase();
    const rawHandle = raw.handle.toLowerCase();

    let matches = false;

    if (cleanHandle === "new-arrivals") {
      matches = rawTags.some((t) => t.includes("new") || t.includes("eid26") || t.includes("maahi ii"));
    } else if (cleanHandle === "maahi-ii-luxury-eid-pret") {
      matches = rawTags.some((t) => t.includes("maahi ii") || t.includes("mahi ii") || t.includes("eid26"));
    } else if (cleanHandle === "silk-solids26" || cleanHandle === "silk-solids") {
      matches = rawTags.some((t) => t.includes("silk") || t.includes("solids")) || rawTitle.includes("silk") || rawHandle.includes("meraki") || rawHandle.includes("noah");
    } else if (cleanHandle === "raha-eid-pret26" || cleanHandle === "raha") {
      matches = rawTags.some((t) => t.includes("raha")) || rawTitle.includes("raha") || rawHandle.includes("ayzel") || rawHandle.includes("layl") || rawHandle.includes("amavi");
    } else if (cleanHandle === "lumiere-luxury-formals26" || cleanHandle === "lumiere") {
      matches = rawTags.some((t) => t.includes("lumiere")) || rawTitle.includes("lumiere") || rawHandle.includes("nyah") || rawHandle.includes("solara") || rawHandle.includes("iris");
    } else if (cleanHandle.includes("bridal") || cleanHandle === "bridal-dresses") {
      matches = rawType.includes("bridal") || rawTags.some((t) => t.includes("bridal") || t.includes("lehenga") || t.includes("farshi") || t.includes("husan") || t.includes("anarkali") || t.includes("noor"));
    } else if (cleanHandle.includes("formal") || cleanHandle === "formal-dresses" || cleanHandle === "meeras" || cleanHandle === "zarqaa" || cleanHandle === "riwaj-formals" || cleanHandle === "rang-e-bahar" || cleanHandle === "tosha-kinari" || cleanHandle === "luxury-shawl") {
      matches = rawType.includes("formal") || rawTags.some((t) => t.includes("formal") || t.includes("meeras") || t.includes("zarqaa") || t.includes("riwaj") || t.includes("shawl"));
    } else if (cleanHandle.includes("pret") || cleanHandle === "luxury-pret" || cleanHandle === "maahi-luxury-pret25" || cleanHandle === "luxe-1" || cleanHandle === "opal" || cleanHandle === "riwaj-luxury-pret") {
      matches = rawType.includes("pret") || rawTags.some((t) => t.includes("pret") || t.includes("luxe") || t.includes("opal"));
    } else if (cleanHandle.includes("engagement") || cleanHandle.includes("mehndi") || cleanHandle.includes("nikkah") || cleanHandle.includes("barat") || cleanHandle.includes("walima")) {
      matches = rawTags.some((t) => t.includes("wedding") || t.includes("event") || t.includes("bridal") || t.includes("formal"));
    } else if (cleanHandle.includes("accessories") || cleanHandle.includes("clutches") || cleanHandle.includes("pouch")) {
      matches = rawType.includes("accessories") || rawTags.some((t) => t.includes("clutch") || t.includes("pouch") || t.includes("bag"));
    } else if (cleanHandle === "best-sellers") {
      matches = true;
    } else {
      matches = rawTags.some((t) => t.includes(cleanHandle)) || rawType.includes(cleanHandle) || rawTitle.includes(cleanHandle) || rawHandle.includes(cleanHandle);
    }

    if (matches) {
      rawMatches.push(formatRawProduct(raw));
    }
  }

  // Combine curated and raw products, avoiding duplicates by handle
  const combined: Product[] = [...products];
  const seenHandles = new Set(products.map((p) => p.handle.toLowerCase()));

  for (const p of rawMatches) {
    if (!seenHandles.has(p.handle.toLowerCase())) {
      seenHandles.add(p.handle.toLowerCase());
      combined.push(p);
    }
  }

  return {
    info,
    products: combined.length > 0 ? combined : validRawProducts.slice(0, 12).map(formatRawProduct),
  };
}
