"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export interface CarouselReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date?: string;
  productTitle?: string;
  productImage?: string;
}

// 15 Authentic Sillhouete customer reviews matching sillhouete.com
export const FEATURED_CAROUSEL_REVIEWS: CarouselReview[] = [
  {
    id: "cr-1",
    rating: 5,
    title: "Very Pretty! Beautiful than",
    body: "Very Pretty! Beautiful than pics",
    author: "Zaidi",
    date: "06/09/2026",
    productTitle: "Velour",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Noah-mint-green-Sequins-front_70x70.jpg?v=1769436697",
  },
  {
    id: "cr-2",
    rating: 5,
    title: "Would love to purchase again!",
    body: "Beautiful outfit, great quality and fit perfectly!",
    author: "Ameena Raja",
    date: "06/09/2026",
    productTitle: "Freya",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-iris-royal-blue-intricate-embroidery_70x70.jpg?v=1776742287",
  },
  {
    id: "cr-3",
    rating: 5,
    title: "Nice",
    body: "Nice",
    author: "Sayada Mim",
    date: "06/05/2026",
    productTitle: "Iris",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-iris-royal-blue-intricate-embroidery_70x70.jpg?v=1776742287",
  },
  {
    id: "cr-4",
    rating: 5,
    title: "Very Pretty as shown in",
    body: "Very Pretty as shown in picture",
    author: "Anonymous",
    date: "06/05/2026",
    productTitle: "IVY",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Noah-mint-green-Sequins-front_70x70.jpg?v=1769436697",
  },
  {
    id: "cr-5",
    rating: 5,
    title: "It’s very beautiful",
    body: "It’s very beautiful,can’t wait to wear it.",
    author: "Anonymous",
    date: "05/28/2026",
    productTitle: "Iris",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-iris-royal-blue-intricate-embroidery_70x70.jpg?v=1776742287",
  },
  {
    id: "cr-6",
    rating: 5,
    title: "Layl",
    body: "It was beautiful and what I wanted. Thank you",
    author: "Anonymous",
    date: "05/20/2026",
    productTitle: "Layl",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-layal-red-exquisite-embroidery-front_70x70.jpg?v=1768978807",
  },
  {
    id: "cr-7",
    rating: 5,
    title: "Beautiful",
    body: "Beautiful outfit",
    author: "ISRAT SUFIAN",
    date: "08/07/2026",
    productTitle: "Layl",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-layal-red-exquisite-embroidery-front_70x70.jpg?v=1768978807",
  },
  {
    id: "cr-8",
    rating: 5,
    title: "😍🫰🏻",
    body: "😍🌸",
    author: "bibi fatima hedari",
    date: "08/06/2026",
    productTitle: "Iris",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-iris-royal-blue-intricate-embroidery_70x70.jpg?v=1776742287",
  },
  {
    id: "cr-9",
    rating: 5,
    title: "Loved the outfit",
    body: "Loved the outfit, very chic , looks exactly like in picture however the sleeves were so tight that I had to..",
    author: "Jovaria Naeem",
    date: "08/06/2026",
    productTitle: "Serea (RLP 8)",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/web_images_0006_2_70x70.jpg?v=1758812672",
  },
  {
    id: "cr-10",
    rating: 5,
    title: "Gorgeous outfit ! Such a beautiful soothing colour",
    body: "Gorgeous outfit ! Such a beautiful soothing colour.",
    author: "Anu",
    date: "09/28/2026",
    productTitle: "Noah",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Noah-mint-green-Sequins-front_70x70.jpg?v=1769436697",
  },
  {
    id: "cr-11",
    rating: 5,
    title: "Stunning Piece!",
    body: "Beautifully made with an excellent fit! The delivery was fast and hassle-free, and I can’t wait to wear it to my sister’s wedding. Highly recommend!",
    author: "Caitlin Hartley",
    date: "07/13/2026",
    productTitle: "Iris",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-iris-royal-blue-intricate-embroidery_70x70.jpg?v=1776742287",
  },
  {
    id: "cr-12",
    rating: 5,
    title: "Dress is on the dot!",
    body: "Loved the color. Fabric is nice and light. Work done was on point! Highly recommended",
    author: "Shajia",
    date: "07/04/2026",
    productTitle: "Iris",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-iris-royal-blue-intricate-embroidery_70x70.jpg?v=1776742287",
  },
  {
    id: "cr-13",
    rating: 5,
    title: "Great experience",
    body: "Great experience, good quality, beautiful embroidery",
    author: "Salma Jabeen",
    date: "08/08/2026",
    productTitle: "Ayzel",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-ayzel-ivory-delicate-embroidery_70x70.jpg?v=1768978410",
  },
  {
    id: "cr-14",
    rating: 5,
    title: "Pure Luxury",
    body: "I loved my dress, the quality of the fabric and work was to the point. Will definitely order again for my family as well.",
    author: "Laiba",
    date: "09/15/2026",
    productTitle: "Solara",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/webimages_0038_DSC07835_70x70.jpg?v=1767273372",
  },
  {
    id: "cr-15",
    rating: 5,
    title: "Beautiful dress",
    body: "Beautiful dress. They have great customer service",
    author: "Anonymous",
    date: "08/14/2026",
    productTitle: "Noah",
    productImage:
      "https://cdn.shopify.com/s/files/1/0709/7755/2627/files/sillhouete-formal-dress-Noah-mint-green-Sequins-front_70x70.jpg?v=1769436697",
  },
];

function StarIcon({
  filled = true,
  size = 20,
  color = "#108474",
}: {
  filled?: boolean;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={filled ? "0.5" : "1.4"}
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function FeaturedReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isRewinding, setIsRewinding] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const totalReviews = FEATURED_CAROUSEL_REVIEWS.length;

  // Responsive items count (3 on desktop, 2 on tablet, 1 on mobile)
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Auto-scroll logic:
  // 1 card at a time every 5 seconds (right to left).
  // When reaching the end (all cards scrolled), rapidly rewinds left-to-right back to card 1!
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIdx = Math.max(0, totalReviews - itemsPerPage);
        if (prev >= maxIdx) {
          // Reached the end: rapid rewind from left to right back to start
          setIsRewinding(true);
          setTimeout(() => {
            setIsRewinding(false);
          }, 800);
          return 0;
        } else {
          setIsRewinding(false);
          return prev + 1;
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, totalReviews, itemsPerPage]);

  const handleNext = () => {
    const maxIdx = Math.max(0, totalReviews - itemsPerPage);
    if (currentIndex >= maxIdx) {
      setIsRewinding(true);
      setCurrentIndex(0);
      setTimeout(() => setIsRewinding(false), 800);
    } else {
      setIsRewinding(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsRewinding(false);
    const maxIdx = Math.max(0, totalReviews - itemsPerPage);
    if (currentIndex <= 0) {
      setCurrentIndex(maxIdx);
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Touch Swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="let-customers-speak-for-us"
      className="py-14 sm:py-20 border-t border-[#f0f0f0] bg-white scroll-mt-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1020px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (Matching Screenshot) */}
        <div className="text-center mb-10">
          <h2 className="text-[20px] sm:text-[22px] font-semibold uppercase tracking-[0.08em] font-serif text-[#111111]">
            LET CUSTOMERS SPEAK FOR US
          </h2>

          <div className="flex items-center justify-center space-x-2 mt-2.5">
            {/* 5 Teal Stars */}
            <div className="flex items-center space-x-[3px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} size={18} filled={true} />
              ))}
            </div>
            <span className="text-[13px] font-serif text-[#444444] font-medium ml-1.5 flex items-center gap-1.5">
              from 62 reviews
              {/* Teal Verified Checkmark Shield */}
              <svg
                className="w-3.5 h-3.5 text-[#108474] inline-block shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
          </div>
        </div>

        {/* Carousel Sliding Track:
            - Normal scroll: 500ms ease-out (1 by 1 from right to left)
            - End rewind: 750ms ease-in-out (rapidly glides back from left to right to card 1)
        */}
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`flex ${
              isRewinding
                ? "transition-transform duration-750 ease-in-out"
                : "transition-transform duration-500 ease-out"
            }`}
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
            }}
          >
            {FEATURED_CAROUSEL_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="shrink-0 px-3 sm:px-4"
                style={{ width: `${100 / itemsPerPage}%` }}
              >
                {/* Borderless, clean card matching Screenshots */}
                <div className="flex flex-col items-center text-center justify-between py-4 px-2 min-h-[240px]">
                  {/* Top: Stars, Title, Body */}
                  <div className="flex flex-col items-center w-full">
                    {/* Stars */}
                    <div className="flex items-center space-x-[3px] mb-2.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarIcon key={i} size={18} filled={i <= rev.rating} />
                      ))}
                    </div>

                    {/* Title */}
                    {rev.title && (
                      <h3 className="text-[15px] sm:text-[16px] font-serif font-bold text-[#111111] line-clamp-1 mb-1.5 leading-snug">
                        {rev.title}
                      </h3>
                    )}

                    {/* Body */}
                    <p className="text-[13px] sm:text-[14px] font-serif text-[#555555] leading-relaxed line-clamp-2 min-h-[38px]">
                      {rev.body}
                    </p>
                  </div>

                  {/* Bottom: Author Name & Product Thumbnail */}
                  <div className="mt-5 flex flex-col items-center w-full">
                    <span className="text-[12px] font-sans-custom uppercase tracking-[0.1em] text-[#777777] font-semibold mb-2.5">
                      {rev.author}
                    </span>

                    {rev.productImage && (
                      <div className="relative w-[52px] h-[52px] rounded-[2px] overflow-hidden border border-[#f0f0f0] bg-[#f9f9f9] shrink-0">
                        <Image
                          src={rev.productImage}
                          alt={rev.productTitle || "Review Product"}
                          fill
                          sizes="60px"
                          className="object-cover object-center"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Arrows Below Cards (Matching Screenshots) */}
        <div className="flex items-center justify-center space-x-6 mt-6">
          <button
            onClick={handlePrev}
            type="button"
            aria-label="Previous reviews"
            className="w-10 h-10 flex items-center justify-center text-[#777777] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5 fill-none stroke-current stroke-[2]"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            type="button"
            aria-label="Next reviews"
            className="w-10 h-10 flex items-center justify-center text-[#777777] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5 fill-none stroke-current stroke-[2]"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
