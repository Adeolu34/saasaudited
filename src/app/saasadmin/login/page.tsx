"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/auth/actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-headline text-3xl font-bold text-on-surface">
            Saas<span className="text-primary">Audited</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-2">
            Admin Dashboard
          </p>
        </div>

        <form
          action={formAction}
          className="bg-surface-container-lowest ghost-border rounded-2xl p-8 shadow-editorial space-y-6"
        >
          <div>
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
              Sign in
            </h2>
            <p className="text-on-surface-variant text-sm">
              Enter your admin credentials to continue.
            </p>
          </div>

          {state?.error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full ember-gradient text-on-primary py-3 rounded-xl font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="text-center text-on-surface-variant text-xs mt-6">
          Protected admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
