"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";

export default function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <AdminTopBar userName={userName} sidebarCollapsed={collapsed} />
      <div
        className={`transition-all duration-200 ${
          collapsed ? "ml-[68px]" : "ml-60"
        }`}
      >
        <div className="p-6 max-w-7xl">{children}</div>
      </div>
    </>
  );
}
