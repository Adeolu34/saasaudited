"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <span className="material-symbols-outlined text-6xl text-error/30 mb-6">
        error
      </span>
      <h1 className="font-headline text-5xl font-bold text-on-surface mb-4">
        Something went wrong
      </h1>
      <p className="text-on-surface-variant text-lg mb-10 max-w-md">
        We encountered an unexpected error. Please try again.
      </p>
      <button
        onClick={reset}
        className="ember-gradient text-white px-8 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
      >
        Try again
      </button>
    </div>
  );
}
