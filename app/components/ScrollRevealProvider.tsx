"use client";

import { useEffect } from "react";

export default function ScrollRevealProvider() {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    // Wait until initial hydration has completely settled
    const timer = setTimeout(() => {
      const TARGET_SELECTORS = [
        ".product-card",
        ".spotted-item",
        ".event-card",
        ".custom-media-card",
        ".reveal-item",
        "[data-aos]",
      ].join(", ");

      const observedSet = new WeakSet<Element>();

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("aos-animate");
              observer?.unobserve(entry.target);
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
            observer?.observe(el);
          }
        });
      };

      observeElements();

      mutationObserver = new MutationObserver(() => {
        observeElements();
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }, 250);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      mutationObserver?.disconnect();
    };
  }, []);

  return null;
}
