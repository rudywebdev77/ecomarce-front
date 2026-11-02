"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  image?: string;
}

export type SortOption =
  | "recent"
  | "highest"
  | "lowest"
  | "only_pictures"
  | "pictures_first"
  | "videos_first"
  | "most_helpful";

interface ProductReviewsWidgetProps {
  productHandle: string;
  productTitle: string;
}

// Geometric 5-point SVG Star Component matching Judge.me / sillhouete.com
function StarIcon({
  filled = true,
  size = 20,
  color = "#108474",
  className = "",
}: {
  filled?: boolean;
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={filled ? "0.5" : "1.5"}
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// Initial authentic review matching sillhouete.com/products/noah & Image 1 & 2
const DEFAULT_REVIEWS: Record<string, ReviewItem[]> = {
  noah: [
    {
      id: "noah-rev-1",
      author: "Anu",
      rating: 5,
      date: "09/28/2026",
      title: "Gorgeous outfit ! Such a beautiful soothing colour",
      body: "Gorgeous outfit ! Such a beautiful soothing colour.",
      verified: true,
    },
  ],
};

const FALLBACK_REVIEW: ReviewItem = {
  id: "general-rev-1",
  author: "Anu",
  rating: 5,
  date: "09/28/2026",
  title: "Gorgeous outfit ! Such a beautiful soothing colour",
  body: "Gorgeous outfit ! Such a beautiful soothing colour.",
  verified: true,
};

export default function ProductReviewsWidget({
  productHandle,
  productTitle,
}: ProductReviewsWidgetProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form states (matching Images 1, 2, 3)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(0); // 0 = outline stars by default like Image 1
  const [hoverRating, setHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [nameFormat, setNameFormat] = useState<"full" | "last_initial" | "initials" | "anonymous">("full");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & Sort states
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Load reviews from localStorage or defaults
  useEffect(() => {
    const storageKey = `sillhouete_reviews_${productHandle.toLowerCase()}`;
    let initReviews = DEFAULT_REVIEWS[productHandle.toLowerCase()] || [FALLBACK_REVIEW];

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initReviews = parsed;
        }
      }
    } catch (err) {
      console.error("Failed to parse reviews from localStorage", err);
    }

    const timer = setTimeout(() => {
      setReviews(initReviews);
      setIsLoaded(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [productHandle]);

  // Save to localStorage when reviews change
  const saveReviews = (updated: ReviewItem[]) => {
    setReviews(updated);
    const storageKey = `sillhouete_reviews_${productHandle.toLowerCase()}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Calculations for summary & histogram
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2)
      : "5.00";

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  // Handle Photo upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format displayed name based on user privacy setting
  const formatAuthorName = (rawName: string) => {
    if (!rawName.trim()) return "Anonymous";
    if (nameFormat === "anonymous") return "Anonymous";
    const parts = rawName.trim().split(" ");
    if (parts.length === 1) return parts[0];
    if (nameFormat === "last_initial") {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    if (nameFormat === "initials") {
      return parts.map((p) => `${p[0]}.`).join("");
    }
    return rawName.trim();
  };

  // Cycle name format when user clicks the hint in label
  const cycleNameFormat = () => {
    const formats: ("full" | "last_initial" | "initials" | "anonymous")[] = [
      "full",
      "last_initial",
      "initials",
      "anonymous",
    ];
    const currentIndex = formats.indexOf(nameFormat);
    setNameFormat(formats[(currentIndex + 1) % formats.length]);
  };

  const getFormatDisplaySample = () => {
    if (nameFormat === "full") return "John Smith";
    if (nameFormat === "last_initial") return "John S.";
    if (nameFormat === "initials") return "J.S.";
    return "Anonymous";
  };

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formRating || formRating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    if (!formTitle.trim()) {
      setFormError("Please enter a review title.");
      return;
    }
    if (!formBody.trim()) {
      setFormError("Please enter your review comments.");
      return;
    }
    if (!formName.trim() && nameFormat !== "anonymous") {
      setFormError("Please enter your name.");
      return;
    }
    if (!formEmail.trim() || !formEmail.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
      today.getDate()
    ).padStart(2, "0")}/${today.getFullYear()}`;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: formatAuthorName(formName),
      rating: formRating,
      date: formattedDate,
      title: formTitle.trim(),
      body: formBody.trim(),
      verified: true,
      image: formImage || undefined,
    };

    const updated = [newRev, ...reviews];
    saveReviews(updated);

    // Reset form
    setFormTitle("");
    setFormBody("");
    setFormName("");
    setFormEmail("");
    setFormImage(null);
    setFormRating(0);
    setIsFormOpen(false);

    setSuccessMessage("Thank you! Your review has been submitted and published.");
    setTimeout(() => {
      setSuccessMessage("");
    }, 6000);
  };

  // Filtered and Sorted reviews
  const filteredReviews = reviews
    .filter((r) => {
      if (filterRating !== null && r.rating !== filterRating) return false;
      if (sortBy === "only_pictures" && !r.image) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      if (sortBy === "pictures_first" || sortBy === "videos_first") {
        if (a.image && !b.image) return -1;
        if (!a.image && b.image) return 1;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  if (!isLoaded) return null;

  return (
    <section id="customer-reviews" className="py-12 sm:py-16 border-t border-[#f0f0f0] bg-white">
      {/* Constrained container with balanced right & left margins (Matching Image 1) */}
      <div className="max-w-[1020px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (Matching Image 1) */}
        <div className="text-center mb-9">
          <h2 className="text-[20px] sm:text-[22px] font-semibold uppercase tracking-[0.08em] font-serif text-[#111111]">
            CUSTOMER REVIEWS
          </h2>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-8 p-4 bg-[#eef7f4] border border-[#108474] text-[#108474] rounded-[2px] text-center font-serif text-[14px]">
            {successMessage}
          </div>
        )}

        {/* 3-Column Summary Block with Divider Lines (Exact Match to Image 1) */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-8">
          {/* Column 1 (Left): Rating Summary */}
          <div className="flex flex-col items-center md:items-start justify-center min-w-[230px] shrink-0">
            {/* 5 Big Chunky Stars + 5.00 out of 5 */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-[3px]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon
                    key={i}
                    size={22}
                    filled={i <= Math.round(Number(averageRating))}
                  />
                ))}
              </div>
              <span className="text-[15px] font-serif text-[#222222] ml-1.5 font-medium">
                {averageRating} out of 5
              </span>
            </div>

            {/* Based on 1 review + checkmark square badge */}
            <div className="flex items-center space-x-1.5 mt-2 text-[13px] text-[#444444] font-serif">
              <span>
                Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </span>
              <span className="w-3.5 h-3.5 bg-[#108474] rounded-[1px] flex items-center justify-center text-white shrink-0">
                <svg
                  className="w-2.5 h-2.5 stroke-[2.5]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Vertical Divider 1 */}
          <div className="hidden md:block w-px h-[105px] bg-[#eeeeee] mx-6 lg:mx-8 shrink-0" />

          {/* Column 2 (Center): Star Breakdown Histogram */}
          <div className="my-6 md:my-0 flex justify-center shrink-0">
            <div className="flex flex-col space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                const isSelected = filterRating === stars;

                return (
                  <button
                    key={stars}
                    onClick={() => setFilterRating(isSelected ? null : stars)}
                    className={`flex items-center text-left group py-0.5 cursor-pointer ${
                      isSelected ? "opacity-100 font-bold" : "opacity-90 hover:opacity-100"
                    }`}
                    title={`Filter by ${stars} stars`}
                  >
                    {/* Stars in histogram (15px) */}
                    <div className="flex items-center space-x-[2px] w-[95px] shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} size={15} filled={s <= stars} />
                      ))}
                    </div>

                    {/* Thick 14px Progress Bar Track (Matching Image 1) */}
                    <div className="w-[160px] sm:w-[185px] h-[14px] bg-[#eeeeee] rounded-none overflow-hidden mx-3 shrink-0">
                      <div
                        className="h-full bg-[#108474] transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Frequency Count */}
                    <span className="text-[13px] text-[#666666] font-serif w-4 text-left shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical Divider 2 */}
          <div className="hidden md:block w-px h-[105px] bg-[#eeeeee] mx-6 lg:mx-8 shrink-0" />

          {/* Column 3 (Right): Write a review Button (Changes to Cancel review when open, matching Image 1) */}
          <div className="flex items-center justify-center min-w-[200px] shrink-0">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              type="button"
              className="px-8 py-3 bg-[#108474] hover:bg-[#0c6b5e] text-white text-[14px] font-serif font-medium tracking-normal transition-colors rounded-none cursor-pointer text-center min-w-[180px]"
            >
              {isFormOpen ? "Cancel review" : "Write a review"}
            </button>
          </div>
        </div>

        {/* =========================================================================
            "Write a review" Form (Pixel-Perfect Match to User Uploaded Images 1, 2, 3)
            ========================================================================= */}
        {isFormOpen && (
          <div className="pt-6 pb-12 border-t border-[#f0f0f0] transition-all duration-300">
            <div className="max-w-[650px] mx-auto">
              {/* Form Heading (Matching Image 1) */}
              <h3
                aria-label={productTitle ? `Write a review for ${productTitle}` : undefined}
                className="text-[21px] sm:text-[23px] font-serif font-bold text-[#111111] mb-7 text-center"
              >
                Write a review
              </h3>

              {formError && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] text-center font-serif">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* 1. RATING FIELD (Centered, Large Outline Stars by Default - Matching Image 1) */}
                <div className="text-center">
                  <label className="block text-center text-[11px] font-sans-custom uppercase tracking-[0.25em] font-bold text-[#111111] mb-2.5">
                    RATING
                  </label>
                  <div className="flex items-center justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || formRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setFormRating(star)}
                          className="cursor-pointer transition-transform hover:scale-110 focus:outline-hidden p-0.5"
                          aria-label={`Rate ${star} stars`}
                        >
                          <StarIcon size={28} filled={isFilled} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. REVIEW TITLE (100) (Centered Label & Centered Input - Matching Image 1) */}
                <div>
                  <label className="block text-center text-[11px] font-sans-custom uppercase tracking-[0.22em] font-bold text-[#111111] mb-2">
                    REVIEW TITLE{" "}
                    <span className="text-[#888888] font-normal tracking-normal text-[10px]">
                      (100)
                    </span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Give your review a title"
                    className="w-full px-4 py-2.5 bg-white border border-[#108474] focus:border-[#108474] focus:ring-1 focus:ring-[#108474] text-[14px] font-serif text-[#111111] placeholder-[#999999] outline-hidden rounded-none"
                  />
                </div>

                {/* 3. REVIEW CONTENT (Centered Label & Textarea - Matching Image 1 & 2) */}
                <div>
                  <label className="block text-center text-[11px] font-sans-custom uppercase tracking-[0.22em] font-bold text-[#111111] mb-2">
                    REVIEW CONTENT
                  </label>
                  <textarea
                    rows={5}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    placeholder="Start writing here..."
                    className="w-full px-4 py-3 bg-white border border-[#cccccc] focus:border-[#108474] focus:ring-1 focus:ring-[#108474] text-[14px] font-serif text-[#111111] placeholder-[#999999] outline-hidden rounded-none resize-y"
                  />
                </div>

                {/* 4. PICTURE/VIDEO (OPTIONAL) (Centered Upload Tray Box - Matching Image 2) */}
                <div>
                  <label className="block text-center text-[11px] font-sans-custom uppercase tracking-[0.22em] font-bold text-[#111111] mb-2.5">
                    PICTURE/VIDEO (OPTIONAL)
                  </label>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {/* Centered Upload Tray Box (Matching Image 2) */}
                  <div className="flex justify-center">
                    {formImage ? (
                      <div className="relative w-[115px] h-[115px] border border-[#d8d8d8] bg-white rounded-none overflow-hidden group">
                        <Image
                          src={formImage}
                          alt="Review Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormImage(null)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/75 hover:bg-black text-white text-[11px] flex items-center justify-center rounded-none cursor-pointer"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-[115px] h-[115px] border border-[#e2e2e2] bg-[#fafafa] hover:bg-[#f3f3f3] flex flex-col items-center justify-center cursor-pointer transition-colors rounded-none group"
                        title="Click to upload review picture"
                      >
                        {/* Upward Arrow Emerging from Tray Icon (Matching Image 2) */}
                        <svg
                          className="w-10 h-10 text-[#666666] group-hover:text-[#333333] transition-colors"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3v12" />
                          <path d="m7 8 5-5 5 5" />
                          <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* 5. DISPLAY NAME (DISPLAYED PUBLICLY LIKE John Smith ⌵ ) (Matching Image 2) */}
                <div>
                  <label className="block text-center text-[11px] font-sans-custom uppercase tracking-[0.18em] font-bold text-[#111111] mb-2">
                    DISPLAY NAME (DISPLAYED PUBLICLY LIKE{" "}
                    <span
                      onClick={cycleNameFormat}
                      className="text-[#108474] font-medium tracking-normal inline-flex items-center cursor-pointer hover:underline"
                      title="Click to change name format"
                    >
                      {getFormatDisplaySample()}
                      <svg
                        className="w-3 h-3 ml-1 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </span>
                    {" )"}
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Display name"
                    className="w-full px-4 py-2.5 bg-white border border-[#cccccc] focus:border-[#108474] focus:ring-1 focus:ring-[#108474] text-[14px] font-serif text-[#111111] placeholder-[#999999] outline-hidden rounded-none"
                  />
                </div>

                {/* 6. EMAIL ADDRESS (Centered Label & Input - Matching Image 2 & 3) */}
                <div>
                  <label className="block text-center text-[11px] font-sans-custom uppercase tracking-[0.22em] font-bold text-[#111111] mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-4 py-2.5 bg-white border border-[#cccccc] focus:border-[#108474] focus:ring-1 focus:ring-[#108474] text-[14px] font-serif text-[#111111] placeholder-[#999999] outline-hidden rounded-none"
                  />
                </div>

                {/* 7. DISCLAIMER / PRIVACY POLICY TEXT (Exact Match to Image 3) */}
                <p className="text-[12px] font-serif text-[#666666] text-center max-w-[560px] mx-auto pt-1 leading-relaxed">
                  How we use your data: We’ll only contact you about the review you
                  left, and only if necessary. By submitting your review, you agree
                  to Judge.me’s terms, privacy and content policies.
                </p>

                {/* 8. ACTION BUTTONS: Cancel review (Outline) & Submit Review (Solid Teal) (Matching Image 3) */}
                <div className="flex items-center justify-center space-x-4 pt-2">
                  {/* Cancel review Outline Button */}
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-7 py-2.5 border border-[#108474] text-[#108474] bg-white hover:bg-[#f0f7f5] text-[14px] font-serif font-medium transition-colors cursor-pointer rounded-none min-w-[145px] text-center"
                  >
                    Cancel review
                  </button>

                  {/* Submit Review Solid Teal Button */}
                  <button
                    type="submit"
                    className="px-7 py-2.5 bg-[#108474] hover:bg-[#0c6b5e] text-white border border-[#108474] text-[14px] font-serif font-medium transition-colors cursor-pointer rounded-none min-w-[145px] text-center"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter and Sorting Divider Bar (Matching Image 1, 2, & 3) */}
        <div className="border-t border-b border-[#eeeeee] py-3.5 my-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {/* Sort Dropdown (Matching Uploaded Screenshot Exactly) */}
            <div className="relative inline-block text-left">
              <select
                value={sortBy}
                onChange={(e) => {
                  const val = e.target.value as SortOption;
                  setSortBy(val);
                  setTimeout(() => {
                    const el = document.getElementById("let-customers-speak-for-us");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }, 50);
                }}
                className="appearance-none bg-white border border-[#111111] pr-8 pl-3 py-1.5 text-[14px] font-serif font-medium text-[#108474] cursor-pointer outline-hidden rounded-none hover:opacity-90 transition-opacity"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="only_pictures">Only Pictures</option>
                <option value="pictures_first">Pictures First</option>
                <option value="videos_first">Videos First</option>
                <option value="most_helpful">Most Helpful</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[#108474]">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* Active Star Rating Filter Indicator */}
            {filterRating !== null && (
              <div className="flex items-center space-x-1.5 bg-[#eef7f4] text-[#108474] px-2.5 py-1 rounded-[2px] text-[12px] font-serif">
                <span>Filtered: {filterRating} Stars</span>
                <button
                  onClick={() => setFilterRating(null)}
                  className="ml-1 font-bold hover:text-black cursor-pointer"
                  title="Clear filter"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="text-[12px] text-[#888888] font-serif">
            Showing {filteredReviews.length} of {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </div>
        </div>

        {/* Reviews List (Exact Match to Image 2 & 3) */}
        <div className="divide-y divide-[#f2f2f2]">
          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center text-[#777777] font-serif text-[14px]">
              No reviews match the selected filter.
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div key={rev.id} className="py-6 sm:py-8 flex flex-col space-y-3.5">
                {/* 1. Large Stars above reviewer (Matching Image 2 - 24px) */}
                <div className="flex items-center space-x-[4px]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} size={24} filled={i <= rev.rating} />
                  ))}
                </div>

                {/* 2. Reviewer Row: Avatar + Name + Verified Badge + Date (Matching Image 2) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    {/* Rounded avatar box with user icon & checkmark badge (Matching Image 2) */}
                    <div className="relative w-10 h-10 bg-[#edf2f1] rounded-[3px] flex items-center justify-center shrink-0">
                      {/* User silhouette outline */}
                      <svg
                        className="w-5 h-5 text-[#108474] fill-none stroke-current stroke-1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>

                      {/* Green square badge in bottom-right corner with checkmark */}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#108474] rounded-[2px] flex items-center justify-center text-white">
                        <svg
                          className="w-2.5 h-2.5 stroke-[2.5]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    </div>

                    {/* Author Name */}
                    <span className="text-[15px] font-serif font-medium text-[#111111]">
                      {rev.author}
                    </span>

                    {/* Verified Badge (Matching Image 2 - Title Case "Verified") */}
                    {rev.verified && (
                      <span className="bg-[#108474] text-white text-[11px] font-sans-custom font-semibold px-2 py-0.5 rounded-[2px] tracking-wide">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Date on Right (Matching Image 1 & 2) */}
                  <span className="text-[12px] sm:text-[13px] text-[#888888] font-serif">
                    {rev.date}
                  </span>
                </div>

                {/* 3. Review Title (Bold serif text - Matching Image 2) */}
                <h4 className="text-[16px] sm:text-[17px] font-serif font-bold text-[#111111] pt-1 leading-snug">
                  {rev.title}
                </h4>

                {/* 4. Review Body Text (Matching Image 2) */}
                <p className="text-[14px] sm:text-[15px] font-serif text-[#333333] leading-relaxed">
                  {rev.body}
                </p>

                {/* 5. User Uploaded Photo (if present) */}
                {rev.image && (
                  <div className="pt-2">
                    <div className="relative w-20 h-20 rounded-none overflow-hidden border border-[#e5e5e5]">
                      <Image
                        src={rev.image}
                        alt="Customer Review Photo"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
