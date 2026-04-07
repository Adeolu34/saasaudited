import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 w-full pt-20 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-16 relative">
        {/* Top: Editorial signature */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-sm">
            <span className="text-3xl font-headline italic text-white mb-4 block">
              SaasAudited
            </span>
            <div className="w-12 h-[2px] bg-gradient-to-r from-primary to-transparent mb-4" />
            <p className="text-stone-400 text-sm leading-relaxed">
              The Digital Curator for modern enterprise stacks. We believe
              software should enable growth, not complexity.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-1">Product</span>
              <Link
                href="/reviews"
                className="text-stone-400 hover:text-white text-sm transition-colors link-underline w-fit"
              >
                Reviews
              </Link>
              <Link
                href="/compare"
                className="text-stone-400 hover:text-white text-sm transition-colors link-underline w-fit"
              >
                Compare
              </Link>
              <Link
                href="/categories"
                className="text-stone-400 hover:text-white text-sm transition-colors link-underline w-fit"
              >
                Categories
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-1">Company</span>
              <Link
                href="/blog"
                className="text-stone-400 hover:text-white text-sm transition-colors link-underline w-fit"
              >
                Blog
              </Link>
              <Link
                href="/blog"
                className="text-stone-400 hover:text-white text-sm transition-colors link-underline w-fit"
              >
                Newsletter
              </Link>
              <Link
                href="/"
                className="text-stone-400 hover:text-white text-sm transition-colors link-underline w-fit"
              >
                Privacy
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-1">Social</span>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-white text-sm transition-colors link-underline w-fit"
              >
                LinkedIn
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-white text-sm transition-colors link-underline w-fit"
              >
                X (Twitter)
              </a>
              <a
                href="/rss.xml"
                className="text-stone-400 hover:text-white text-sm transition-colors link-underline w-fit"
              >
                RSS Feed
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar with editorial treatment */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5 text-[11px] font-label uppercase tracking-widest text-stone-500">
          <span>&copy; 2026 SaasAudited. The Digital Curator.</span>
          <div className="flex gap-8">
            <Link
              href="/"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
