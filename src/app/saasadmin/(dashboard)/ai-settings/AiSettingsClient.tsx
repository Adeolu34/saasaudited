"use client";

import { useEffect, useState, useCallback } from "react";

type TabKey = "general" | "blog" | "tool" | "review" | "comparison" | "category" | "topics";

interface SettingsDoc {
  config_key: string;
  ai_model?: string;
  temperature?: number;
  max_tokens?: number;
  search_enabled?: boolean;
  auto_generate_images?: boolean;
  system_prompt?: string;
  user_prompt_template?: string;
  topic_pool?: string[];
  search_queries?: string[];
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "general", label: "General", icon: "tune" },
  { key: "blog", label: "Blog", icon: "article" },
  { key: "tool", label: "Tool", icon: "construction" },
  { key: "review", label: "Review", icon: "rate_review" },
  { key: "comparison", label: "Comparison", icon: "compare" },
  { key: "category", label: "Category", icon: "category" },
  { key: "topics", label: "Topics", icon: "list" },
];

const MODEL_OPTIONS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"];

const TEMPLATE_VARS: Record<string, string[]> = {
  blog: ["topic", "category", "keywords", "searchResults", "year"],
  tool: ["toolName", "category", "searchResults"],
  review: ["toolSlug", "toolName", "toolDescription", "searchResults"],
  comparison: ["toolASlug", "toolBSlug", "toolAName", "toolBName", "searchResults"],
  category: ["categoryName", "searchResults"],
};

export default function AiSettingsClient() {
  const [tab, setTab] = useState<TabKey>("general");
  const [settings, setSettings] = useState<Record<string, SettingsDoc>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/saasadmin/ai-settings");
      const data = await res.json();
      const map: Record<string, SettingsDoc> = {};
      for (const doc of data.settings || []) {
        map[doc.config_key] = doc;
      }
      setSettings(map);
    } catch {
      // silently handle
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function saveSettings(configKey: string, fields: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/saasadmin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config_key: configKey, ...fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSettings((prev) => ({ ...prev, [configKey]: data.settings }));
      showToast("Settings saved successfully");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="material-symbols-outlined text-3xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">AI Settings</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Configure AI model, prompts, web search, and auto-generation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 ${
              tab === t.key
                ? "ember-gradient text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "general" && <GeneralTab settings={settings.global} onSave={(f) => saveSettings("global", f)} saving={saving} />}
      {tab === "topics" && <TopicsTab settings={settings.global} onSave={(f) => saveSettings("global", f)} saving={saving} />}
      {["blog", "tool", "review", "comparison", "category"].includes(tab) && (
        <PromptTab
          contentType={tab as "blog" | "tool" | "review" | "comparison" | "category"}
          settings={settings[tab]}
          onSave={(f) => saveSettings(tab, f)}
          saving={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-surface-container-lowest ghost-border rounded-xl px-5 py-3 shadow-lg text-sm text-on-surface z-50 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ========= General Tab ========= */
function GeneralTab({
  settings,
  onSave,
  saving,
}: {
  settings?: SettingsDoc;
  onSave: (fields: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [model, setModel] = useState(settings?.ai_model || "gpt-4o-mini");
  const [temperature, setTemperature] = useState(settings?.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(settings?.max_tokens || 8192);
  const [searchEnabled, setSearchEnabled] = useState(settings?.search_enabled ?? false);
  const [autoImages, setAutoImages] = useState(settings?.auto_generate_images ?? true);

  return (
    <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-6">
      <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">tune</span>
        Model Configuration
      </h2>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">AI Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full max-w-xs px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <p className="text-xs text-on-surface-variant mt-1">
          gpt-4o-mini is cheapest (~$0.15/M tokens). gpt-4o produces better long-form content (~$2.50/M tokens).
        </p>
      </div>

      {/* Temperature */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">
          Temperature: {temperature.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full max-w-xs accent-primary"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          Lower = more focused and deterministic. Higher = more creative and varied. Default: 0.7
        </p>
      </div>

      {/* Max Tokens */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">Max Tokens</label>
        <input
          type="number"
          min="256"
          max="16384"
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
          className="w-full max-w-xs px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          8192 recommended for 3000-4000 word blog posts. Increase if content is getting cut off.
        </p>
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-2">
        <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">settings</span>
          Features
        </h3>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={searchEnabled}
            onChange={(e) => setSearchEnabled(e.target.checked)}
            className="w-4 h-4 accent-primary rounded"
          />
          <div>
            <span className="text-sm font-medium text-on-surface">Web Search (SaaS Research)</span>
            <p className="text-xs text-on-surface-variant">
              Search the web for real, current SaaS data before generating content. Requires SERPER_API_KEY env variable.
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoImages}
            onChange={(e) => setAutoImages(e.target.checked)}
            className="w-4 h-4 accent-primary rounded"
          />
          <div>
            <span className="text-sm font-medium text-on-surface">Auto-Generate Images</span>
            <p className="text-xs text-on-surface-variant">
              Automatically generate featured images for blog posts and tool icons via Replicate.
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={() => onSave({ ai_model: model, temperature, max_tokens: maxTokens, search_enabled: searchEnabled, auto_generate_images: autoImages })}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold ember-gradient text-on-primary hover:shadow-lg hover:shadow-primary/15 disabled:opacity-50 transition-all"
      >
        <span className="material-symbols-outlined text-lg">
          {saving ? "progress_activity" : "save"}
        </span>
        {saving ? "Saving..." : "Save General Settings"}
      </button>
    </div>
  );
}

/* ========= Prompt Tab ========= */
function PromptTab({
  contentType,
  settings,
  onSave,
  saving,
}: {
  contentType: "blog" | "tool" | "review" | "comparison" | "category";
  settings?: SettingsDoc;
  onSave: (fields: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [systemPrompt, setSystemPrompt] = useState(settings?.system_prompt || "");
  const [userTemplate, setUserTemplate] = useState(settings?.user_prompt_template || "");

  const vars = TEMPLATE_VARS[contentType] || [];

  // Reset state when contentType changes
  useEffect(() => {
    setSystemPrompt(settings?.system_prompt || "");
    setUserTemplate(settings?.user_prompt_template || "");
  }, [contentType, settings]);

  return (
    <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-6">
      <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2 capitalize">
        <span className="material-symbols-outlined text-primary">edit_note</span>
        {contentType} Prompt Configuration
      </h2>

      {/* Available variables */}
      <div className="bg-surface-container rounded-lg px-4 py-3">
        <p className="text-xs font-medium text-on-surface-variant mb-2">
          Available template variables (use in User Prompt Template):
        </p>
        <div className="flex flex-wrap gap-2">
          {vars.map((v) => (
            <code
              key={v}
              className="px-2 py-0.5 rounded bg-surface-container-low text-xs font-mono text-primary"
            >
              {`{{${v}}}`}
            </code>
          ))}
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">
          System Prompt Override
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={12}
          placeholder="Leave empty to use the default system prompt..."
          className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          Overrides the built-in system prompt for {contentType} generation. Leave blank to use the default.
        </p>
      </div>

      {/* User Prompt Template */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">
          User Prompt Template
        </label>
        <textarea
          value={userTemplate}
          onChange={(e) => setUserTemplate(e.target.value)}
          rows={8}
          placeholder={`Leave empty to use the default user prompt...`}
          className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          Use {"{{variableName}}"} syntax for dynamic values. Leave blank to use the default.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onSave({ system_prompt: systemPrompt || null, user_prompt_template: userTemplate || null })}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold ember-gradient text-on-primary hover:shadow-lg hover:shadow-primary/15 disabled:opacity-50 transition-all"
        >
          <span className="material-symbols-outlined text-lg">
            {saving ? "progress_activity" : "save"}
          </span>
          {saving ? "Saving..." : "Save Prompts"}
        </button>

        <button
          onClick={() => {
            setSystemPrompt("");
            setUserTemplate("");
            onSave({ system_prompt: null, user_prompt_template: null });
          }}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-lg">restart_alt</span>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

/* ========= Topics Tab ========= */
function TopicsTab({
  settings,
  onSave,
  saving,
}: {
  settings?: SettingsDoc;
  onSave: (fields: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [topicPool, setTopicPool] = useState(
    (settings?.topic_pool || []).join("\n")
  );
  const [searchQueries, setSearchQueries] = useState(
    (settings?.search_queries || []).join("\n")
  );

  return (
    <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-6">
      <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">list</span>
        Cron Topics & Search Queries
      </h2>

      {/* Topic Pool */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">
          Blog Topic Pool (one per line)
        </label>
        <textarea
          value={topicPool}
          onChange={(e) => setTopicPool(e.target.value)}
          rows={12}
          placeholder={`Leave empty to use the default 20 built-in topics...\n\nExample topics:\nBest practices for evaluating SaaS tools in {year}\nHow AI is transforming B2B software in {year}\nThe hidden costs of free SaaS tools`}
          className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          Use {"{year}"} as a placeholder — it will be replaced with the current year. The cron job picks a random topic from this pool each time.
        </p>
      </div>

      {/* Search Queries */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">
          SaaS Research Search Queries (one per line)
        </label>
        <textarea
          value={searchQueries}
          onChange={(e) => setSearchQueries(e.target.value)}
          rows={8}
          placeholder={`Leave empty to use the default search queries...\n\nExample queries:\nbest new B2B SaaS tools launched {year}\ntrending SaaS products {year}\ntop SaaS startups to watch {year}`}
          className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          Used when web search is enabled. The system picks a random query to discover trending SaaS tools.
        </p>
      </div>

      <button
        onClick={() => {
          const topics = topicPool.split("\n").map((s) => s.trim()).filter(Boolean);
          const queries = searchQueries.split("\n").map((s) => s.trim()).filter(Boolean);
          onSave({ topic_pool: topics, search_queries: queries });
        }}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold ember-gradient text-on-primary hover:shadow-lg hover:shadow-primary/15 disabled:opacity-50 transition-all"
      >
        <span className="material-symbols-outlined text-lg">
          {saving ? "progress_activity" : "save"}
        </span>
        {saving ? "Saving..." : "Save Topics & Queries"}
      </button>
    </div>
  );
}
