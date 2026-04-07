import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <span className="material-symbols-outlined text-6xl text-primary/30 mb-6">
        search_off
      </span>
      <h1 className="font-headline text-5xl font-bold text-on-surface mb-4">
        Page not found
      </h1>
      <p className="text-on-surface-variant text-lg mb-10 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="ember-gradient text-white px-8 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
        >
          Go home
        </Link>
        <Link
          href="/reviews"
          className="border border-outline-variant/30 text-on-surface px-8 py-3 rounded-xl font-semibold hover:bg-surface-container-low transition-all"
        >
          Browse reviews
        </Link>
      </div>
    </div>
  );
}
