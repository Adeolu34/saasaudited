"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ToolResult {
  name: string;
  slug: string;
  category: string;
  overall_score: number;
  logo_url?: string;
}

export default function ToolPicker() {
  const router = useRouter();
  const [toolA, setToolA] = useState<ToolResult | null>(null);
  const [toolB, setToolB] = useState<ToolResult | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ToolResult[]>([]);
  const [categoryTools, setCategoryTools] = useState<ToolResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({ q: value });
          if (toolA) params.set("category", toolA.category);
          const res = await fetch(`/api/tools?${params}`);
          const data: ToolResult[] = await res.json();
          // Filter out already-selected tool
          setResults(
            toolA ? data.filter((t) => t.slug !== toolA.slug) : data
          );
          setOpen(true);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [toolA]
  );

  // Load category tools when Tool A is selected
  useEffect(() => {
    if (!toolA) {
      setCategoryTools([]);
      return;
    }
    (async () => {
      const res = await fetch(
        `/api/tools?category=${encodeURIComponent(toolA.category)}`
      );
      const data: ToolResult[] = await res.json();
      setCategoryTools(data.filter((t) => t.slug !== toolA.slug));
    })();
  }, [toolA]);

  function selectToolA(tool: ToolResult) {
    setToolA(tool);
    setToolB(null);
    setSearch("");
    setResults([]);
    setOpen(false);
  }

  function selectToolB(tool: ToolResult) {
    setToolB(tool);
    setSearch("");
    setResults([]);
    setOpen(false);
  }

  function handleCompare() {
    if (!toolA || !toolB) return;
    const slugs = [toolA.slug, toolB.slug].sort();
    router.push(`/compare/build/${slugs[0]}-vs-${slugs[1]}`);
  }

  function reset() {
    setToolA(null);
    setToolB(null);
    setSearch("");
    setResults([]);
    setCategoryTools([]);
    setOpen(false);
  }

  const isPickingA = !toolA;
  const isPickingB = toolA && !toolB;

  return (
    <div className="space-y-8">
      {/* Steps indicator */}
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
        <span
          className={`flex items-center gap-2 ${isPickingA ? "text-primary font-bold" : "text-on-surface-variant"}`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              toolA
                ? "bg-primary text-on-primary"
                : isPickingA
                  ? "bg-primary/20 text-primary"
                  : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {toolA ? (
              <span className="material-symbols-outlined text-sm">check</span>
            ) : (
              "1"
            )}
          </span>
          Pick a tool
        </span>
        <span className="w-8 h-px bg-outline-variant" />
        <span
          className={`flex items-center gap-2 ${isPickingB ? "text-primary font-bold" : "text-on-surface-variant"}`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              toolB
                ? "bg-primary text-on-primary"
                : isPickingB
                  ? "bg-primary/20 text-primary"
                  : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {toolB ? (
              <span className="material-symbols-outlined text-sm">check</span>
            ) : (
              "2"
            )}
          </span>
          Pick opponent
        </span>
        <span className="w-8 h-px bg-outline-variant" />
        <span
          className={`flex items-center gap-2 ${toolA && toolB ? "text-primary font-bold" : "text-on-surface-variant"}`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              toolA && toolB
                ? "bg-primary/20 text-primary"
                : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            3
          </span>
          Compare
        </span>
      </div>

      {/* Selected tools display */}
      {toolA && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-surface-container-lowest ghost-border rounded-xl px-6 py-4 flex items-center gap-4">
            <div>
              <p className="font-headline text-lg font-bold">{toolA.name}</p>
              <p className="font-mono text-xs text-on-surface-variant">
                {toolA.category} &middot; {toolA.overall_score.toFixed(1)}/10
              </p>
            </div>
            <button
              onClick={reset}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Remove tool selection"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {toolB && (
            <>
              <span className="font-headline text-2xl text-primary italic font-light">
                vs
              </span>
              <div className="bg-surface-container-lowest ghost-border rounded-xl px-6 py-4 flex items-center gap-4">
                <div>
                  <p className="font-headline text-lg font-bold">
                    {toolB.name}
                  </p>
                  <p className="font-mono text-xs text-on-surface-variant">
                    {toolB.category} &middot;{" "}
                    {toolB.overall_score.toFixed(1)}/10
                  </p>
                </div>
                <button
                  onClick={() => setToolB(null)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                  aria-label="Remove opponent selection"
                >
                  <span className="material-symbols-outlined text-sm">
                    close
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search input */}
      {(!toolA || !toolB) && (
        <div ref={containerRef} className="relative max-w-lg">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={
                isPickingA
                  ? "Search for a SaaS tool..."
                  : `Search ${toolA?.category} tools...`
              }
              className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest ghost-border rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              aria-label={
                isPickingA ? "Search for a tool" : "Search for an opponent"
              }
            />
            {loading && (
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant animate-spin text-xl">
                progress_activity
              </span>
            )}
          </div>

          {/* Search results dropdown */}
          {open && results.length > 0 && (
            <ul className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl ghost-border shadow-editorial max-h-80 overflow-y-auto">
              {results.map((tool) => (
                <li key={tool.slug}>
                  <button
                    onClick={() =>
                      isPickingA ? selectToolA(tool) : selectToolB(tool)
                    }
                    className="w-full text-left px-6 py-4 hover:bg-surface-container-low transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {tool.name}
                      </p>
                      <p className="font-mono text-xs text-on-surface-variant">
                        {tool.category}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-on-surface-variant">
                      {tool.overall_score.toFixed(1)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {open && search.trim() && results.length === 0 && !loading && (
            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl ghost-border shadow-editorial px-6 py-8 text-center text-on-surface-variant">
              No tools found matching &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Category suggestions (when picking Tool B) */}
      {isPickingB && categoryTools.length > 0 && (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant mb-4">
            Other {toolA?.category} tools
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryTools.map((tool) => (
              <button
                key={tool.slug}
                onClick={() => selectToolB(tool)}
                className="bg-surface-container-lowest ghost-border rounded-xl px-5 py-4 text-left hover:shadow-editorial hover:border-primary/20 transition-all group"
              >
                <p className="font-medium group-hover:text-primary transition-colors">
                  {tool.name}
                </p>
                <p className="font-mono text-xs text-on-surface-variant mt-1">
                  Score: {tool.overall_score.toFixed(1)}/10
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compare button */}
      {toolA && toolB && (
        <button
          onClick={handleCompare}
          className="ember-gradient text-white px-10 py-4 rounded-xl font-semibold text-lg active:scale-95 transition-transform flex items-center gap-3"
        >
          Compare {toolA.name} vs {toolB.name}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      )}
    </div>
  );
}
