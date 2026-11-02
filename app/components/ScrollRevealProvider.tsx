"use client";

import { useEffect } from "react";

export default function ScrollRevealProvider() {
  useEffect(() => {
    const TARGET_SELECTORS = [
      ".product-card",
      ".spotted-item",
      ".event-card",
      ".custom-media-card",
      ".reveal-item",
      "[data-aos]",
    ].join(", ");

    const observedSet = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("aos-animate");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -30px 0px",
        threshold: 0.05,
      }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll(TARGET_SELECTORS);
      elements.forEach((el) => {
        if (!observedSet.has(el)) {
          observedSet.add(el);
          observer.observe(el);
        }
      });
    };

    // Run after hydration has settled
    const timer = setTimeout(observeElements, 50);

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
