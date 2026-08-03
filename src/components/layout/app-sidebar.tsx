"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCrmStore } from "@/lib/store";
import {
  LayoutGrid,
  Users,
  Calendar,
  Building2,
  PackageCheck,
  BarChart3,
  MessageSquare,
  Settings,
  ShieldCheck,
  Radio,
  CheckSquare,
  UserCheck,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Tổng Quan",
    href: "/",
    icon: LayoutGrid,
  },
  {
    title: "Quản Lý Talent",
    href: "/talents",
    icon: Users,
  },
  {
    title: "Lịch Live",
    href: "/schedule",
    icon: Calendar,
  },
  {
    title: "Brand & SKU",
    href: "/brands",
    icon: Building2,
  },
  {
    title: "Chiến Dịch",
    href: "/campaigns",
    icon: PackageCheck,
  },
  {
    title: "Nhiệm Vụ",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Báo Cáo",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Quản Lý Nhân Viên",
    href: "/users",
    icon: ShieldCheck,
  },
  {
    title: "Cấu Hình",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser, isSidebarCollapsed } = useCrmStore();

  const isNavItemVisible = (item: NavItem) => {
    if (!currentUser) return true;
    if (currentUser.role === "ADMIN") return true;

    const perms = currentUser.permissions || {};
    switch (item.href) {
      case "/talents":
        return !!perms.manageTalents;
      case "/schedule":
        return !!perms.manageSchedule;
      case "/brands":
      case "/campaigns":
        return !!perms.manageCampaigns;
      case "/reports":
        return !!perms.viewReports;
      case "/users":
        return !!perms.manageUsers;
      case "/settings":
        return !!perms.manageSettings;
      default:
        return true; // "/", "/tasks"
    }
  };

  const visibleNavItems = navItems.filter(isNavItemVisible);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 z-40 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 select-none",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      <div>
        {/* Logo Section */}
        <div className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-wide truncate">
                PEAKCOM
              </h1>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                Commerce Growth Agency
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-1">
          {visibleNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm transition-all group relative",
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                )}
                title={isSidebarCollapsed ? item.title : undefined}
              >
                <Icon
                  strokeWidth={1.75}
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                  )}
                />

                {!isSidebarCollapsed && (
                  <span className="truncate flex-1">{item.title}</span>
                )}

                {!isSidebarCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      {!isSidebarCollapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Hệ Thống Trực Tuyến
          </div>
          <p className="text-[10px] text-slate-500">
            Phiên bản CRM 2.5 (RBAC Enterprise)
          </p>
        </div>
      )}
    </aside>
  );
}
