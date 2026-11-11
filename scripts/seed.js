const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

let envUri = "";
try {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      if (line.startsWith("MONGODB_URI=")) {
        envUri = line.replace("MONGODB_URI=", "").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
} catch {}

const MONGODB_URI =
  envUri ||
  process.env.MONGODB_URI ||
  "mongodb+srv://rudy:rudy123@cluster0.icao0sk.mongodb.net/sillhouete_db?appName=Cluster0";

// Schemas
const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    parent_id: { type: String, default: null },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const VariantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: "Standard" },
    price: { type: Number, required: true },
    compare_at_price: { type: Number, default: null },
    sku: { type: String, default: "" },
    inventory_quantity: { type: Number, default: 15 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    vendor: { type: String, default: "Sillhouete" },
    product_type: { type: String, default: "Luxury Pret" },
    category: { type: String, default: "Luxury Pret" },
    price: { type: Number, required: true },
    compare_at_price: { type: Number, default: null },
    currency: { type: String, default: "PKR" },
    images: { type: [String], default: [] },
    video_url: { type: String, default: "" },
    fabric: { type: String, default: "" },
    color: { type: String, default: "" },
    pieces: { type: String, default: "3-Piece (Shirt, Dupatta & Trouser)" },
    dress_style: { type: String, default: "" },
    work_details: { type: String, default: "" },
    delivery_time: { type: String, default: "Ready to Dispatch (3-5 business days)" },
    care_instructions: { type: String, default: "Dry Clean Only" },
    sizes: { type: [String], default: ["XS", "S", "M", "L", "XL", "Custom Size"] },
    tags: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    in_stock: { type: Boolean, default: true },
    is_new: { type: Boolean, default: false },
    is_sale: { type: Boolean, default: false },
    is_featured: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function runSeed() {
  console.log("Connecting to MongoDB Atlas at:", MONGODB_URI.replace(/:([^:@]+)@/, ":****@"));
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected successfully!");

  // 1. Seed Categories if count is 0
  const catCount = await Category.countDocuments();
  console.log("Existing categories in DB:", catCount);
  if (catCount === 0) {
    console.log("Seeding categories...");
    const rawCategories = [
      { name: "Sale", slug: "sale-1", description: "Exclusive discounts and promotional offers.", image: "https://sillhouete.com/cdn/shop/files/wb-1.jpg?v=1777274033&width=2400", display_order: 1 },
      { name: "Maahi II Luxury Eid Pret", slug: "maahi-ii-luxury-eid-pret", description: "Signature festive Eid pret collection.", image: "https://sillhouete.com/cdn/shop/files/wb-3_bd931670-6ab7-4d15-ad52-a5ee3d462be7.jpg?v=1777274033&width=2400", display_order: 2 },
      { name: "New Arrivals", slug: "new-arrivals", description: "The freshest luxury Pakistani arrivals.", image: "https://sillhouete.com/cdn/shop/files/wb-banner_jpg.jpg?v=1778078549&width=2400", display_order: 3 },
      { name: "Silk Solids'26", slug: "silk-solids26", description: "Pure raw silk solid tone outfits.", image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Mimi-Powder-Pink-Sequins-front.jpg?v=1769436688", display_order: 4 },
      { name: "Raha Eid Pret'26", slug: "raha-eid-pret26", description: "Festive Eid pret tailored to perfection.", image: "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-sublime-Lilac-intricate-embroidery.jpg?v=1776332402", display_order: 5 },
      { name: "Bridals", slug: "bridals", description: "Heirloom handcrafted wedding lehengas.", image: "https://sillhouete.com/cdn/shop/files/1_8fa00776-2abe-4dac-9fb1-261e2bbdc52e.png?v=1740993727&width=2400", display_order: 6 },
      { name: "Husan ara - Birdal '25", slug: "husan-ara-birdal-25", description: "Signature bridal collection.", image: "https://sillhouete.com/cdn/shop/files/1_8fa00776-2abe-4dac-9fb1-261e2bbdc52e.png?v=1740993727&width=2400", display_order: 7 },
      { name: "Formal", slug: "formal", description: "Regal evening couture.", image: "https://sillhouete.com/cdn/shop/files/sillhouete-formal-livia-butter-yellow-intricate-embroidery.jpg?v=1776742288", display_order: 8 },
      { name: "Lumiere Luxury Formals'26", slug: "lumiere-luxury-formals26", description: "Lustrous embellished formal suits.", image: "https://sillhouete.com/cdn/shop/files/sillhouete-formal-livia-butter-yellow-intricate-embroidery.jpg?v=1776742288", display_order: 9 },
      { name: "Tosha Kinari", slug: "tosha-kinari", description: "Gold tilla and gota kinari craftsmanship.", image: "https://sillhouete.com/cdn/shop/files/wb-3_bd931670-6ab7-4d15-ad52-a5ee3d462be7.jpg?v=1777274033&width=2400", display_order: 10 },
      { name: "Meeras", slug: "meeras", description: "Vintage mughal heritage aesthetics.", image: "https://sillhouete.com/cdn/shop/files/wb-banner_jpg.jpg?v=1778078549&width=2400", display_order: 11 },
      { name: "Zarqaa", slug: "zarqaa", description: "Opulent raw silk ensembles.", image: "https://sillhouete.com/cdn/shop/files/wb-1.jpg?v=1777274033&width=2400", display_order: 12 },
      { name: "Luxury Pret", slug: "luxury-pret", description: "Contemporary ready-to-wear silhouettes.", image: "https://sillhouete.com/cdn/shop/files/wb-banner_jpg.jpg?v=1778078549&width=2400", display_order: 13 },
      { name: "Rang e Bahar", slug: "rang-e-bahar", description: "Spring floral palette pret.", image: "https://sillhouete.com/cdn/shop/files/wb-3_bd931670-6ab7-4d15-ad52-a5ee3d462be7.jpg?v=1777274033&width=2400", display_order: 14 },
      { name: "Opal", slug: "opal", description: "Luminous sheer silhouettes.", image: "https://sillhouete.com/cdn/shop/files/wb-1.jpg?v=1777274033&width=2400", display_order: 15 },
      { name: "Pret", slug: "pret", description: "Effortless casual luxury daywear.", image: "https://sillhouete.com/cdn/shop/files/wb-banner_jpg.jpg?v=1778078549&width=2400", display_order: 16 },
      { name: "Luxury Shawl", slug: "luxury-shawl", description: "Embroidered velvet and pashmina shawls.", image: "https://sillhouete.com/cdn/shop/files/wb-3_bd931670-6ab7-4d15-ad52-a5ee3d462be7.jpg?v=1777274033&width=2400", display_order: 17 },
      { name: "Shop By Events", slug: "shop-by-events", description: "Curated Pakistani wedding guest edits.", image: "https://sillhouete.com/cdn/shop/files/wb-1.jpg?v=1777274033&width=2400", display_order: 18 },
      { name: "Mehndi", slug: "mehndi", description: "Vibrant yellow and jewel tone ensembles.", image: "https://sillhouete.com/cdn/shop/files/wb-3_bd931670-6ab7-4d15-ad52-a5ee3d462be7.jpg?v=1777274033&width=2400", display_order: 19 },
      { name: "Barat", slug: "barat", description: "Regal scarlet and maroon wedding formals.", image: "https://sillhouete.com/cdn/shop/files/1_8fa00776-2abe-4dac-9fb1-261e2bbdc52e.png?v=1740993727&width=2400", display_order: 20 },
      { name: "Walima", slug: "walima", description: "Pastel mint, lilac and silver reception dresses.", image: "https://sillhouete.com/cdn/shop/files/sillhouete-formal-livia-butter-yellow-intricate-embroidery.jpg?v=1776742288", display_order: 21 },
      { name: "Nikkah", slug: "nikkah", description: "Pristine white and champagne gold outfits.", image: "https://sillhouete.com/cdn/shop/files/wb-banner_jpg.jpg?v=1778078549&width=2400", display_order: 22 },
      { name: "Best Sellers", slug: "best-sellers", description: "Most-adored silhouettes.", image: "https://sillhouete.com/cdn/shop/files/wb-1.jpg?v=1777274033&width=2400", display_order: 23 },
    ];

    const categoryDocs = rawCategories.map((c, idx) => ({
      id: `cat_${idx + 1}`,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      parent_id: null,
      display_order: c.display_order,
    }));

    await Category.insertMany(categoryDocs);
    console.log(`✓ Seeded ${categoryDocs.length} categories into MongoDB Atlas`);
  }

  // 2. Seed Products if count is 0
  const prodCount = await Product.countDocuments();
  console.log("Existing products in DB:", prodCount);
  if (prodCount === 0) {
    console.log("Seeding products from app/raw_products.json...");
    const rawPath = path.join(__dirname, "..", "app", "raw_products.json");
    if (fs.existsSync(rawPath)) {
      const rawProducts = JSON.parse(fs.readFileSync(rawPath, "utf8"));
      const mapped = rawProducts.map((p, idx) => {
        const firstVariant = p.variants && p.variants[0] ? p.variants[0] : null;
        const priceNum = firstVariant ? parseFloat(firstVariant.price || "35000") : 35000;
        const comparePriceNum = firstVariant && firstVariant.compare_at_price ? parseFloat(firstVariant.compare_at_price) : null;

        let category = "Luxury Pret";
        const titleLower = (p.title || "").toLowerCase();
        const tagsLower = Array.isArray(p.tags) ? p.tags.map((t) => String(t).toLowerCase()) : [];

        if (tagsLower.some((t) => t.includes("maahi")) || titleLower.includes("maahi")) {
          category = "Maahi II Luxury Eid Pret";
        } else if (tagsLower.some((t) => t.includes("husan ara")) || titleLower.includes("husan ara")) {
          category = "Husan ara - Birdal '25";
        } else if (tagsLower.some((t) => t.includes("meeras")) || titleLower.includes("meeras")) {
          category = "Meeras";
        } else if (tagsLower.some((t) => t.includes("zarqaa")) || titleLower.includes("zarqaa")) {
          category = "Zarqaa";
        } else if (tagsLower.some((t) => t.includes("tosha kinari")) || titleLower.includes("tosha kinari")) {
          category = "Tosha Kinari";
        } else if (tagsLower.some((t) => t.includes("lumiere")) || titleLower.includes("lumiere")) {
          category = "Lumiere Luxury Formals'26";
        } else if (tagsLower.some((t) => t.includes("rang e bahar")) || titleLower.includes("rang e bahar")) {
          category = "Rang e Bahar";
        } else if (tagsLower.some((t) => t.includes("opal")) || titleLower.includes("opal")) {
          category = "Opal";
        } else if (tagsLower.some((t) => t.includes("silk solid")) || titleLower.includes("silk solid")) {
          category = "Silk Solids'26";
        } else if (tagsLower.some((t) => t.includes("raha")) || titleLower.includes("raha")) {
          category = "Raha Eid Pret'26";
        } else if (tagsLower.some((t) => t.includes("shawl")) || titleLower.includes("shawl")) {
          category = "Luxury Shawl";
        } else if (tagsLower.some((t) => t.includes("walima")) || titleLower.includes("walima")) {
          category = "Walima";
        } else if (tagsLower.some((t) => t.includes("barat")) || titleLower.includes("barat")) {
          category = "Barat";
        } else if (tagsLower.some((t) => t.includes("mehndi")) || titleLower.includes("mehndi")) {
          category = "Mehndi";
        } else if (tagsLower.some((t) => t.includes("nikkah")) || titleLower.includes("nikkah")) {
          category = "Nikkah";
        } else if (tagsLower.some((t) => t.includes("bridal")) || titleLower.includes("bridal")) {
          category = "Bridals";
        } else if (tagsLower.some((t) => t.includes("formal")) || titleLower.includes("formal")) {
          category = "Formal";
        }

        const images = Array.isArray(p.images)
          ? p.images.map((img) => (typeof img === "string" ? img : img.src)).filter(Boolean)
          : [];

        const isSale = Boolean(comparePriceNum && comparePriceNum > priceNum) || tagsLower.includes("sale");

        return {
          id: String(p.id || Date.now() + idx),
          title: p.title || "Sillhouete Designer Outfit",
          handle: p.handle || (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description:
            p.body_html ||
            `<p>Indulge in timeless Pakistani couture by Sillhouete. Crafted with authentic pure fabrics, intricate threadwork, and bespoke silhouette finishing.</p>`,
          vendor: p.vendor || "Sillhouete",
          product_type: category,
          category: category,
          price: priceNum,
          compare_at_price: comparePriceNum,
          currency: "PKR",
          images:
            images.length > 0
              ? images
              : ["https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-livia-butter-yellow-intricate-embroidery.jpg?v=1776742288"],
          variants: (p.variants || []).map((v, vIdx) => ({
            id: String(v.id || `${p.id}_v${vIdx}`),
            title: v.title || "Standard",
            price: parseFloat(v.price || priceNum),
            compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
            sku: v.sku || `SIL-${p.id}-${vIdx}`,
            inventory_quantity: 15,
          })),
          sizes: ["XS", "S", "M", "L", "XL", "Custom Size"],
          tags: Array.isArray(p.tags) ? p.tags : [],
          in_stock: true,
          is_new: idx < 20,
          is_sale: isSale,
          is_featured: idx < 12,
          created_at: p.created_at ? new Date(p.created_at) : new Date(),
        };
      });

      await Product.insertMany(mapped, { ordered: false });
      console.log(`✓ Seeded ${mapped.length} products into MongoDB Atlas!`);
    }
  }

  await mongoose.disconnect();
  console.log("✓ Seeding process completed successfully!");
}

runSeed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
