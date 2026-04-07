"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Toast() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success) setMessage({ text: success, type: "success" });
    else if (error) setMessage({ text: error, type: "error" });
    else setMessage(null);
  }, [searchParams]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-[fadeIn_200ms_ease-out] ${
        message.type === "success"
          ? "bg-green-800 text-white"
          : "bg-error text-on-error"
      }`}
    >
      <span className="material-symbols-outlined text-lg">
        {message.type === "success" ? "check_circle" : "error"}
      </span>
      {message.text}
    </div>
  );
}
