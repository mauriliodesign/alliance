import { useEffect, useRef } from "react";

// Adds the `is-visible` class when the element scrolls into view.
export function useReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px", ...options }
    );

    const targets = el.querySelectorAll(".reveal");
    if (el.classList.contains("reveal")) io.observe(el);
    targets.forEach((t) => io.observe(t));

    return () => io.disconnect();
  }, []);

  return ref;
}
