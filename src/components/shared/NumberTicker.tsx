"use client";

import { useEffect, useRef, useState } from "react";

/**
 * NumberTicker — animates a number counting up from 0 to the target
 * when scrolled into view. Works with integers and formatted strings
 * like "1,200+" or "142k".
 */

interface NumberTickerProps {
  value: string;
  className?: string;
  duration?: number;
}

export default function NumberTicker({
  value,
  className = "",
  duration = 1800,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateValue();
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function animateValue() {
    // Extract the numeric part
    const numericStr = value.replace(/[^0-9.]/g, "");
    const target = parseFloat(numericStr);
    if (isNaN(target)) return;

    const prefix = value.match(/^[^0-9]*/)?.[0] || "";
    const suffix = value.replace(numericStr, "").replace(prefix, "");
    const hasCommas = value.includes(",");
    const isFloat = numericStr.includes(".");
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = target * eased;

      let formatted: string;
      if (isFloat) {
        formatted = current.toFixed(1);
      } else {
        const rounded = Math.round(current);
        formatted = hasCommas ? rounded.toLocaleString() : String(rounded);
      }

      setDisplay(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    }

    setDisplay(`${prefix}0${suffix}`);
    requestAnimationFrame(tick);
  }

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
