"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { href: "/saasadmin", icon: "dashboard", label: "Dashboard", exact: true },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/saasadmin/tools", icon: "construction", label: "Tools" },
      { href: "/saasadmin/reviews", icon: "rate_review", label: "Reviews" },
      { href: "/saasadmin/comparisons", icon: "compare", label: "Comparisons" },
      { href: "/saasadmin/blog", icon: "article", label: "Blog Posts" },
      { href: "/saasadmin/categories", icon: "category", label: "Categories" },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/saasadmin/comments", icon: "forum", label: "Comments" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/saasadmin/users", icon: "group", label: "Admin Users" },
      { href: "/saasadmin/api-keys", icon: "key", label: "API Keys" },
      { href: "/saasadmin/monitoring", icon: "monitoring", label: "Monitoring" },
    ],
  },
];

export default function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-surface-container-low border-r border-outline-variant/30 z-40 transition-all duration-200 flex flex-col ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-outline-variant/30">
        {!collapsed && (
          <Link
            href="/saasadmin"
            className="text-lg font-headline italic tracking-tight text-on-surface"
          >
            Saas<span className="text-primary">Audited</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined text-on-surface-variant text-xl">
            {collapsed ? "menu" : "menu_open"}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6 no-scrollbar">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-5 mb-2 text-[10px] uppercase tracking-[0.15em] font-label font-semibold text-on-surface-variant/60">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "ember-gradient text-white shadow-sm"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                        style={
                          isActive
                            ? { fontVariationSettings: '"FILL" 1' }
                            : undefined
                        }
                      >
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-outline-variant/30 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          title={collapsed ? "View Site" : undefined}
        >
          <span className="material-symbols-outlined text-xl">language</span>
          {!collapsed && <span>View Site</span>}
        </Link>
      </div>
    </aside>
  );
}
