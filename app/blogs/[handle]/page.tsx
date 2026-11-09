import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AnnouncementBar from "../../components/AnnouncementBar";
import { API_BASE } from "../../lib/api";

export const dynamic = "force-dynamic";

interface BlogProps {
  params: Promise<{ handle: string }>;
}

async function getBlogPost(handle: string) {
  try {
    const res = await fetch(`${API_BASE}/blogs/${handle}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: BlogProps) {
  const { handle } = await params;
  const data = await getBlogPost(handle);
  if (!data?.blog) {
    return { title: "Blog Not Found | Sillhouete" };
  }
  return {
    title: `${data.blog.title} – Sillhouete`,
    description: data.blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogProps) {
  const { handle } = await params;
  const data = await getBlogPost(handle);

  if (!data?.blog) {
    notFound();
  }

  const { blog, recentPosts = [] } = data;

  return (
    <div className="min-h-screen bg-white flex flex-col font-serif text-[#111111]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full">
        {/* Breadcrumb */}
        <nav className="text-[12px] font-sans-custom uppercase tracking-[0.1em] text-[#888888] mb-8">
          <Link href="/" className="hover:text-black">Home</Link>
          <span className="mx-2 text-[#cccccc]">/</span>
          <Link href="/blogs" className="hover:text-black">Journal</Link>
          <span className="mx-2 text-[#cccccc]">/</span>
          <span className="text-[#111111]">{blog.title}</span>
        </nav>

        {/* Article Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            {blog.tags && blog.tags[0] && (
              <span className="text-[11px] font-sans-custom uppercase tracking-[0.2em] font-semibold text-[#888888]">
                {blog.tags[0]}
              </span>
            )}
            <span className="text-[#cccccc]">•</span>
            <span className="text-[12px] font-sans-custom text-[#777777]">
              {blog.published_at || blog.created_at
                ? new Date(blog.published_at || blog.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent"}
            </span>
          </div>

          <h1 className="text-[28px] sm:text-[38px] leading-tight font-normal uppercase tracking-[0.04em] text-[#111111] max-w-[780px] mx-auto mb-4">
            {blog.title}
          </h1>

          <p className="text-[13px] font-sans-custom text-[#666666] tracking-wide">
            By <span className="text-black font-medium">{blog.author || "Sillhouete Editorial"}</span>
          </p>
        </header>

        {/* Featured Image */}
        {blog.featured_image && (
          <div className="relative w-full h-[380px] sm:h-[500px] mb-10 bg-[#fafafa] overflow-hidden border border-[#f0f0f0]">
            <Image
              src={blog.featured_image}
              alt={blog.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 900px) 100vw, 900px"
            />
          </div>
        )}

        {/* Article Body */}
        <div
          className="prose prose-neutral max-w-none text-[15px] sm:text-[16px] leading-[1.8] text-[#333333] font-serif border-b border-[#e8e8e1] pb-12 mb-12 space-y-5"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-12">
            <span className="text-[12px] font-sans-custom uppercase tracking-wider text-[#888888] mr-2">
              Tags:
            </span>
            {blog.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-[#f5f5f5] text-[#333333] text-[11px] font-sans-custom uppercase tracking-wider px-3 py-1.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Recent / Related Stories */}
        {recentPosts.length > 0 && (
          <div className="pt-8 border-t border-[#f0f0f0]">
            <h3 className="text-[18px] uppercase tracking-[0.1em] font-medium text-center mb-8">
              More From Sillhouete Journal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recentPosts.map((post: any) => (
                <Link key={post.id} href={`/blogs/${post.handle}`} className="group block">
                  <div className="relative h-[220px] bg-[#f9f9f9] mb-3 overflow-hidden">
                    {post.featured_image && (
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                  </div>
                  <h4 className="text-[14px] font-medium leading-snug text-[#111111] group-hover:underline">
                    {post.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center pt-12">
          <Link
            href="/blogs"
            className="inline-block text-[12px] font-sans-custom font-bold uppercase tracking-[0.2em] text-[#111111] border border-black px-6 py-3 hover:bg-black hover:text-white transition-all"
          >
            ← Back to All Articles
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

