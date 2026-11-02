import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnnouncementBar from "../components/AnnouncementBar";
import { API_BASE } from "../lib/api";

export const metadata = {
  title: "News & Style Journal – Sillhouete",
  description: "Explore the latest in Pakistani designer wear, bridal styling guides, wedding traditions, and luxury pret collections.",
};

async function getBlogs() {
  try {
    const res = await fetch(`${API_BASE}/blogs`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed fetching blogs");
    const data = await res.json();
    return data.blogs || [];
  } catch (err) {
    console.warn("Could not fetch blogs from API, using fallback data.");
    return [
      {
        id: "blog_1",
        title: "Kurta vs Kurti: Which Silhouette Suits You Best?",
        handle: "kurta-vs-kurti-which-silhouette-suits-you-best",
        author: "Sillhouete Editorial",
        excerpt: "Understanding the distinction between traditional kurtas and modern kurtis, tailoring techniques, and how to style them for daily elegance and festive celebrations.",
        featured_image: "https://sillhouete.com/cdn/shop/files/IMG_3962.jpg?v=1716382101",
        tags: ["Style Guide", "Pret", "Pakistani Fashion"],
        published_at: new Date().toISOString(),
      },
      {
        id: "blog_2",
        title: "Rituals Inside a Muslim Wedding Ceremony: Bridal Styling & Traditions",
        handle: "rituals-inside-a-muslim-wedding-ceremony",
        author: "Sillhouete Bridal Studio",
        excerpt: "An insider look into traditional Pakistani wedding ceremonies — from Mehndi and Mayun to the sacred Nikkah, Barat, and Walima — and what each bridal palette signifies.",
        featured_image: "https://sillhouete.com/cdn/shop/files/DSC09669.jpg?v=1716382101",
        tags: ["Bridal", "Wedding", "Tradition"],
        published_at: new Date().toISOString(),
      },
      {
        id: "blog_3",
        title: "Pakistani Fashion Trends 2026: The Rise of Luxury Pret and Bridal Couture",
        handle: "pakistani-fashion-trends-2026-luxury-pret-and-bridal",
        author: "Sillhouete Studio",
        excerpt: "Explore the emerging aesthetic in women fashion: minimal embellishments with maximalist silhouette cuts, raw silk revivals, and bespoke international sizing.",
        featured_image: "https://sillhouete.com/cdn/shop/files/IMG_3968.jpg?v=1716382101",
        tags: ["Trends 2026", "Editorial", "Couture"],
        published_at: new Date().toISOString(),
      },
    ];
  }
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-white flex flex-col font-serif text-[#111111]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-[32px] sm:text-[42px] font-normal uppercase tracking-[0.08em] text-[#111111] mb-3">
            News &amp; Editorial
          </h1>
          <p className="text-[14px] text-[#666666] font-sans-custom max-w-[600px] mx-auto">
            Stories, craftsmanship notes, bridal styling rituals, and fashion guides curated by the Sillhouete team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {blogs.map((blog: any) => (
            <article
              key={blog.id}
              className="group flex flex-col bg-white border border-[#f0f0f0] overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all"
            >
              <Link href={`/blogs/${blog.handle}`} className="relative h-[320px] w-full overflow-hidden bg-[#fafafa] block">
                {blog.featured_image ? (
                  <Image
                    src={blog.featured_image}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#999]">Sillhouete</div>
                )}
              </Link>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  {blog.tags && blog.tags[0] && (
                    <span className="text-[11px] font-sans-custom uppercase tracking-widest text-[#888888]">
                      {blog.tags[0]}
                    </span>
                  )}
                  <span className="text-[#cccccc]">•</span>
                  <span className="text-[11px] font-sans-custom text-[#888888]">
                    {new Date(blog.published_at || blog.created_at || Date.now()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="text-[18px] font-medium leading-snug text-[#111111] group-hover:text-[#555555] transition-colors mb-3">
                  <Link href={`/blogs/${blog.handle}`}>{blog.title}</Link>
                </h2>

                <p className="text-[13px] font-sans-custom text-[#666666] leading-relaxed line-clamp-3 mb-4 flex-1">
                  {blog.excerpt}
                </p>

                <div className="pt-2">
                  <Link
                    href={`/blogs/${blog.handle}`}
                    className="inline-block text-[12px] font-sans-custom font-bold uppercase tracking-[0.2em] text-[#111111] border-b border-black pb-0.5 hover:text-[#555555] hover:border-[#555555] transition-colors"
                  >
                    Read Story →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
