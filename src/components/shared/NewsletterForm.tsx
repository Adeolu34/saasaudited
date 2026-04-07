"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-green-400 font-medium">
        Thanks for subscribing! Check your inbox.
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white"
          placeholder="Enter your work email"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="ember-gradient px-8 py-4 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-red-400 text-sm mt-3">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
