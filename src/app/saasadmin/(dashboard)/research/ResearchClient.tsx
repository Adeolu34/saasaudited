"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GenerateModal from "@/components/admin/ai/GenerateModal";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

type GenerateType = "tool" | "review" | "blog";

const QUICK_SEARCHES = [
  "best new B2B SaaS tools 2026",
  "trending SaaS startups 2026",
  "top AI-powered SaaS tools",
  "new project management software 2026",
  "best CRM platforms for startups",
  "emerging marketing automation tools",
  "top customer support SaaS tools",
  "new HR tech platforms 2026",
  "best accounting software for businesses",
  "SaaS tools with best free tiers",
  "fastest growing SaaS companies",
  "best collaboration tools for remote teams",
];

export default function ResearchClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // Generate modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [generateType, setGenerateType] = useState<GenerateType>("tool");
  const [prefillName, setPrefillName] = useState("");

  async function handleSearch(searchQuery?: string) {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setSearching(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/saasadmin/ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      setResults(data.results || []);
      setSearchedQuery(data.query || q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    }
    setSearching(false);
  }

  function extractToolName(title: string): string {
    // Try to extract the tool/product name from the search result title
    // Common patterns: "ToolName - Description", "ToolName: Description", "ToolName | Site"
    const separators = [" - ", " — ", " | ", ": ", " · "];
    for (const sep of separators) {
      if (title.includes(sep)) {
        return title.split(sep)[0].trim();
      }
    }
    // If no separator, take first 3 words max
    return title.split(" ").slice(0, 3).join(" ");
  }

  function openGenerate(result: SearchResult, type: GenerateType) {
    setPrefillName(extractToolName(result.title));
    setGenerateType(type);
    setModalOpen(true);
  }

  function handleGenerated(data: Record<string, unknown>) {
    // Navigate to the appropriate "new" page based on type
    // Store data in sessionStorage so the form can pick it up
    sessionStorage.setItem("ai-generated-data", JSON.stringify(data));
    const routes: Record<GenerateType, string> = {
      tool: "/saasadmin/tools/new",
      review: "/saasadmin/reviews/new",
      blog: "/saasadmin/blog/new",
    };
    router.push(routes[generateType]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">travel_explore</span>
          SaaS Research
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Discover trending SaaS tools and generate content about them
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-3"
        >
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for SaaS tools, categories, or topics..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/50"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold ember-gradient text-on-primary hover:shadow-lg hover:shadow-primary/15 disabled:opacity-50 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-lg">
              {searching ? "progress_activity" : "search"}
            </span>
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Quick Search Chips */}
        <div className="mt-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mr-2">
            Quick searches:
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_SEARCHES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  handleSearch(q);
                }}
                disabled={searching}
                className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-primary hover:text-on-primary transition-all border border-outline-variant/15 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Results for &ldquo;{searchedQuery}&rdquo;
            </h2>
            <span className="text-xs text-on-surface-variant">
              {results.length} results found
            </span>
          </div>

          {results.map((result, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest ghost-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-on-surface-variant/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-on-surface hover:text-primary transition-colors truncate"
                    >
                      {result.title}
                    </a>
                  </div>
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary/70 truncate block mb-2"
                  >
                    {result.link}
                  </a>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {result.snippet}
                  </p>
                  {result.date && (
                    <span className="text-[11px] text-on-surface-variant/50 mt-1 block">
                      {result.date}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openGenerate(result, "tool")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface-variant transition-all"
                    title="Generate a Tool entry from this result"
                  >
                    <span className="material-symbols-outlined text-sm">construction</span>
                    Tool
                  </button>
                  <button
                    onClick={() => openGenerate(result, "review")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface-variant transition-all"
                    title="Generate a Review from this result"
                  >
                    <span className="material-symbols-outlined text-sm">rate_review</span>
                    Review
                  </button>
                  <button
                    onClick={() => openGenerate(result, "blog")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface-variant transition-all"
                    title="Generate a Blog Post from this result"
                  >
                    <span className="material-symbols-outlined text-sm">article</span>
                    Blog
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!searching && results.length === 0 && !error && (
        <div className="bg-surface-container-lowest ghost-border rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4 block">
            travel_explore
          </span>
          <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
            Discover SaaS tools to write about
          </h3>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            Search for trending tools, categories, or topics. Click a quick search chip above or type your own query. Then generate Tool entries, Reviews, or Blog Posts directly from the results.
          </p>
        </div>
      )}

      {/* Generate Modal */}
      <GenerateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contentType={generateType}
        onGenerated={handleGenerated}
      />

      {/* Hidden: pass prefill name to modal via DOM */}
      {modalOpen && prefillName && (
        <PrefillScript name={prefillName} type={generateType} />
      )}
    </div>
  );
}

/** Small helper to prefill the modal form field after it renders */
function PrefillScript({ name, type }: { name: string; type: GenerateType }) {
  const fieldMap: Record<GenerateType, string> = {
    tool: "toolName",
    review: "toolSlug",
    blog: "topic",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const fieldName = fieldMap[type];
      const input = document.querySelector(
        `input[name="${fieldName}"]`
      ) as HTMLInputElement | null;
      if (input) {
        nativeSet(input, name);
      }

      // For review, also prefill toolName if it exists
      if (type === "review") {
        const toolNameInput = document.querySelector(
          'input[name="toolName"]'
        ) as HTMLInputElement | null;
        if (toolNameInput) {
          nativeSet(toolNameInput, name);
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [name, type]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function nativeSet(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
