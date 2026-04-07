"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const navLinks = [
  { href: "/reviews", label: "Reviews" },
  { href: "/compare", label: "Compare" },
  { href: "/categories", label: "Categories" },
  { href: "/blog", label: "Blog" },
];

export default function TopNavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMenu]);

  // Close mobile menu on route change
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "h-12 bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(30,27,25,0.06)] border-b border-outline-variant/10"
          : "h-14 bg-white/80 backdrop-blur-md border-b border-surface-container"
      }`}
    >
      <div className="flex items-center justify-between px-6 max-w-7xl mx-auto h-full">
        <Link
          href="/"
          className={`font-headline italic tracking-tight text-on-surface transition-all duration-300 ${
            scrolled ? "text-lg" : "text-xl"
          }`}
        >
          Saas<span className="text-primary">Audited</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-on-surface-variant font-body hover:text-primary"
                }`}
              >
                {link.label}
                {/* Animated underline */}
                <span
                  className={`absolute -bottom-1 left-0 h-[1.5px] bg-primary transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="#newsletter"
            className="hidden sm:block ember-gradient text-on-primary px-4 py-1.5 rounded-full text-sm font-medium active:scale-95 duration-150 shadow-sm hover:shadow-md hover:shadow-primary/10 transition-all"
          >
            Newsletter &rarr;
          </Link>

          <button
            className="md:hidden flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-outlined text-on-surface" aria-hidden="true">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-surface-container px-6 py-4 space-y-3 animate-[fadeInDown_200ms_ease-out_both]">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive ? "page" : undefined}
                className={`block py-2 text-sm ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-on-surface-variant"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
