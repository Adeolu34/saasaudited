"use client";

import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";

const breadcrumbMap: Record<string, string> = {
  "/saasadmin": "Dashboard",
  "/saasadmin/tools": "Tools",
  "/saasadmin/reviews": "Reviews",
  "/saasadmin/comparisons": "Comparisons",
  "/saasadmin/blog": "Blog Posts",
  "/saasadmin/categories": "Categories",
  "/saasadmin/comments": "Comments",
  "/saasadmin/users": "Admin Users",
  "/saasadmin/api-keys": "API Keys",
  "/saasadmin/monitoring": "Monitoring",
};

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let path = "";
  for (const part of parts) {
    path += `/${part}`;
    if (path === "/saasadmin") {
      crumbs.push({ label: "Dashboard", href: "/saasadmin" });
    } else if (breadcrumbMap[path]) {
      crumbs.push({ label: breadcrumbMap[path], href: path });
    } else if (part === "new") {
      crumbs.push({ label: "New", href: path });
    } else if (part === "edit") {
      crumbs.push({ label: "Edit", href: path });
    }
  }
  return crumbs;
}

export default function AdminTopBar({
  userName,
  sidebarCollapsed,
}: {
  userName: string;
  sidebarCollapsed: boolean;
}) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <header
      className={`sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-6 transition-all duration-200 ${
        sidebarCollapsed ? "ml-[68px]" : "ml-60"
      }`}
    >
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="material-symbols-outlined text-on-surface-variant/40 text-base">
                  chevron_right
                </span>
              )}
              {i === crumbs.length - 1 ? (
                <span className="font-medium text-on-surface">
                  {crumb.label}
                </span>
              ) : (
                <a
                  href={crumb.href}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  {crumb.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full ember-gradient flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <span className="text-sm font-medium text-on-surface hidden sm:block">
            {userName}
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
