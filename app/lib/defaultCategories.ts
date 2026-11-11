export function slugify(text: string): string {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export interface DefaultCategory {
  name: string;
  slug: string;
  description: string;
  image: string;
  display_order: number;
  subcategories?: Array<{
    name: string;
    slug: string;
    description: string;
    image: string;
    display_order: number;
  }>;
}

export const COMPLETE_CATEGORIES: DefaultCategory[] = [
  // 1. SALE
  {
    name: "Sale",
    slug: "sale-1",
    description: "Exclusive discounts and promotional offers on Pakistani luxury couture.",
    image: "https://sillhouete.com/cdn/shop/files/wb-1.jpg?v=1777274033&width=2400",
    display_order: 1,
    subcategories: [],
  },
  // 2. MAAHI II LUXURY EID PRET
  {
    name: "Maahi II Luxury Eid Pret",
    slug: "maahi-ii-luxury-eid-pret",
    description: "Signature festive Eid pret collection featuring royal silhouettes and hand-embellished accents.",
    image: "https://sillhouete.com/cdn/shop/files/wb-3_bd931670-6ab7-4d15-ad52-a5ee3d462be7.jpg?v=1777274033&width=2400",
    display_order: 2,
    subcategories: [],
  },
  // 3. NEW ARRIVALS
  {
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "The freshest luxury Pakistani formal and pret arrivals from Sillhouete Atelier.",
    image: "https://sillhouete.com/cdn/shop/files/wb-banner_jpg.jpg?v=1778078549&width=2400",
    display_order: 3,
    subcategories: [
      {
        name: "Silk Solids'26",
        slug: "silk-solids26",
        description: "Pure raw silk solid tone outfits tailored with clean contemporary lines.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Mimi-Powder-Pink-Sequins-front.jpg?v=1769436688",
        display_order: 1,
      },
      {
        name: "Raha Eid Pret'26",
        slug: "raha-eid-pret26",
        description: "Effortless festive elegance designed for celebratory moments.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Sublime-Aqua-Ombre-Sequins-front.jpg?v=1769422573",
        display_order: 2,
      },
      {
        name: "Lumiere Luxury Formals'26",
        slug: "lumiere-luxury-formals26",
        description: "Handcrafted formal wear featuring intricate resham, sequins and zardozi detailing.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Galia-Grey-Sequins-front.jpg?v=1769436676",
        display_order: 3,
      },
    ],
  },
  // 4. BRIDALS
  {
    name: "Bridals",
    slug: "bridal-dresses",
    description: "Heirloom bespoke bridal lehengas, maxis, and shararas crafted with royal opulence.",
    image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Noah-mint-green-Sequins-front.jpg?v=1769436697",
    display_order: 4,
    subcategories: [
      {
        name: "Husan ara - Birdal '25",
        slug: "husan-ara-birdal-25",
        description: "Traditional red and gold heirloom bridal couture with intricate dabka work.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Noah-mint-green-Sequins-front.jpg?v=1769436697",
        display_order: 1,
      },
      {
        name: "Anarkali - Birdal '24",
        slug: "anarkali-birdal-24",
        description: "Regal kalidar silhouettes adorned with antique marori embroidery.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Sublime-Aqua-Ombre-Sequins-front.jpg?v=1769422573",
        display_order: 2,
      },
      {
        name: "Noor Jahn Bridal '23",
        slug: "noor-jahn-bridal-23",
        description: "Timeless Mughal-inspired bridal craftsmanship and royal embroidery.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Galia-Grey-Sequins-front.jpg?v=1769436676",
        display_order: 3,
      },
      {
        name: "Roshanara Bridal '22",
        slug: "roshanara-bridal-22",
        description: "Classic royal pastel and gold bridal collection.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Mimi-Powder-Pink-Sequins-front.jpg?v=1769436688",
        display_order: 4,
      },
    ],
  },
  // 5. FORMAL
  {
    name: "Formal",
    slug: "formal-dresses",
    description: "Luxury handcrafted formal wear for weddings, receptions, and celebrations.",
    image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Sublime-Aqua-Ombre-Sequins-front.jpg?v=1769422573",
    display_order: 5,
    subcategories: [
      {
        name: "Meeras",
        slug: "meeras",
        description: "Heritage inspired embroideries celebrating antique Pakistani craftsmanship.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Sublime-Aqua-Ombre-Sequins-front.jpg?v=1769422573",
        display_order: 1,
      },
      {
        name: "Zarqaa",
        slug: "zarqaa",
        description: "Stunning jewel-toned formal wear with crystal and beadwork.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Noah-mint-green-Sequins-front.jpg?v=1769436697",
        display_order: 2,
      },
      {
        name: "Riwaj Formals",
        slug: "riwaj-formals",
        description: "Classic cultural silhouettes redefined with modern elegance.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Galia-Grey-Sequins-front.jpg?v=1769436676",
        display_order: 3,
      },
      {
        name: "Rang e Bahar",
        slug: "rang-e-bahar",
        description: "Vibrant festive formals inspired by spring floral motifs and gotta patti.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Mimi-Powder-Pink-Sequins-front.jpg?v=1769436688",
        display_order: 4,
      },
      {
        name: "Tosha Kinari",
        slug: "tosha-kinari",
        description: "Delicate gotta and kinari hand-stitched masterpieces.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Zoya-Emerald-Green-Sequins-front.jpg?v=1769436706",
        display_order: 5,
      },
      {
        name: "Shawl Collection",
        slug: "luxury-shawl",
        description: "Opulent velvet and organza shawls with marori border work.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Zoya-Emerald-Green-Sequins-front.jpg?v=1769436706",
        display_order: 6,
      },
    ],
  },
  // 6. LUXURY PRET
  {
    name: "Luxury Pret",
    slug: "luxury-pret",
    description: "Semi-formal and evening luxury ready-to-wear ensembles.",
    image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Galia-Grey-Sequins-front.jpg?v=1769436676",
    display_order: 6,
    subcategories: [
      {
        name: "Maahi Luxury Pret'25",
        slug: "maahi-luxury-pret25",
        description: "Modern cuts paired with understated hand-embellished details.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Galia-Grey-Sequins-front.jpg?v=1769436676",
        display_order: 1,
      },
      {
        name: "Luxe",
        slug: "luxe-1",
        description: "High-end luxury pret pieces in rich seasonal fabrics.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Sublime-Aqua-Ombre-Sequins-front.jpg?v=1769422573",
        display_order: 2,
      },
      {
        name: "Opal",
        slug: "opal",
        description: "Soft pastel tones and lustrous silhouettes.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Mimi-Powder-Pink-Sequins-front.jpg?v=1769436688",
        display_order: 3,
      },
      {
        name: "Riwaj Luxury Pret",
        slug: "riwaj-luxury-pret",
        description: "Cultural elegance reimagined for contemporary celebrations.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Noah-mint-green-Sequins-front.jpg?v=1769436697",
        display_order: 4,
      },
    ],
  },
  // 7. PRET
  {
    name: "Pret",
    slug: "pret",
    description: "Chic ready-to-wear everyday luxury and smart-casual Pakistani suits.",
    image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Mimi-Powder-Pink-Sequins-front.jpg?v=1769436688",
    display_order: 7,
    subcategories: [
      {
        name: "Raha Pret",
        slug: "raha-pret",
        description: "Effortless lightweight pret styles for modern celebrations.",
        image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Mimi-Powder-Pink-Sequins-front.jpg?v=1769436688",
        display_order: 1,
      },
    ],
  },
  // 8. SHOP BY EVENTS
  {
    name: "Shop By Events",
    slug: "shop-by-events",
    description: "Curated wedding and festive outfits organized by celebratory ceremonies.",
    image: "https://sillhouete.com/cdn/shop/files/5_e07033cd-99f1-4016-8c06-d710e27a5b60.png?v=1771918660&width=1080",
    display_order: 8,
    subcategories: [
      {
        name: "Engagement",
        slug: "engagement-dresses",
        description: "Glamorous and romantic pastel ensembles for engagement soirees.",
        image: "https://sillhouete.com/cdn/shop/files/5_e07033cd-99f1-4016-8c06-d710e27a5b60.png?v=1771918660&width=1080",
        display_order: 1,
      },
      {
        name: "Mehndi",
        slug: "mehndi-dresses",
        description: "Vibrant yellow, lime, and fuchsia festive outfits for mehndi nights.",
        image: "https://sillhouete.com/cdn/shop/files/5_e07033cd-99f1-4016-8c06-d710e27a5b60.png?v=1771918660&width=1080",
        display_order: 2,
      },
      {
        name: "Nikkah",
        slug: "nikkah-dresses",
        description: "Pure white, ivory, and gold ethereal dresses for serene Nikkah vows.",
        image: "https://sillhouete.com/cdn/shop/files/5_e07033cd-99f1-4016-8c06-d710e27a5b60.png?v=1771918660&width=1080",
        display_order: 3,
      },
      {
        name: "Barat",
        slug: "barat-dresses",
        description: "Traditional crimson, scarlet, and royal maroons adorned with zardozi.",
        image: "https://sillhouete.com/cdn/shop/files/5_e07033cd-99f1-4016-8c06-d710e27a5b60.png?v=1771918660&width=1080",
        display_order: 4,
      },
      {
        name: "Walima",
        slug: "walima-dresses",
        description: "Regal silver, champagne, and icy-toned contemporary evening dresses.",
        image: "https://sillhouete.com/cdn/shop/files/5_e07033cd-99f1-4016-8c06-d710e27a5b60.png?v=1771918660&width=1080",
        display_order: 5,
      },
    ],
  },
  // 9. BEST SELLERS
  {
    name: "Best Sellers",
    slug: "best-sellers",
    description: "Sillhouete's most cherished and coveted couture designs.",
    image: "https://sillhouete.com/cdn/shop/files/IMG_4249_JPG.jpg?v=1776413159&width=2400",
    display_order: 9,
    subcategories: [],
  },
  // 10. SPOTTED
  {
    name: "Spotted",
    slug: "spot",
    description: "Celebrities, fashion icons, and real brides captured wearing Sillhouete.",
    image: "https://sillhouete.com/cdn/shop/files/sillhouete-formal-livia-butter-yellow-intricate-embroidery.jpg?v=1776742288",
    display_order: 10,
    subcategories: [],
  },
  // 11. ACCESSORIES
  {
    name: "Accessories",
    slug: "accessories",
    description: "Complementary handcrafted luxury accessories, clutches, and pouches.",
    image: "https://sillhouete.com/cdn/shop/files/05.png?v=1758725288&width=800",
    display_order: 11,
    subcategories: [
      {
        name: "Pouches & Clutches",
        slug: "pouches-clutches",
        description: "Hand-embroidered zardozi and raw silk heirloom potlis & evening clutches.",
        image: "https://sillhouete.com/cdn/shop/files/05.png?v=1758725288&width=800",
        display_order: 1,
      },
    ],
  },
];

