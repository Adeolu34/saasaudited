"use client";

import { useEffect, useRef } from "react";

/**
 * ScrollReveal — wraps children and triggers CSS entrance animations
 * when the element scrolls into view via IntersectionObserver.
 *
 * Usage:
 *   <ScrollReveal direction="up" delay={100}>
 *     <h2>Heading</h2>
 *   </ScrollReveal>
 *
 * For staggered children, use `stagger` prop on the parent
 * and wrap each child in its own <ScrollReveal>.
 */

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  delay?: number;
  className?: string;
  as?: keyof HTMLElementTagNameMap;
  stagger?: boolean;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  stagger = false,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      data-reveal={direction}
      {...(stagger ? { "data-reveal-stagger": "" } : {})}
      className={className}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
