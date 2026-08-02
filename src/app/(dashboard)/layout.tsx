"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { useCrmStore } from "@/lib/store";

const PAGE_TITLES: Record<string, string> = {
  "/": "Tổng quan CRM & Doanh số Booking",
  "/talents": "Quản lý Hồ sơ Host Livestream, KOC & KOL",
  "/schedule": "Ma Trận Lịch Làm Việc & Điều Phối Booking",
  "/brands": "Quản lý Thương Hiệu (Brand) & Danh Mục SKU",
  "/campaigns": "Điều Phối Chiến Dịch & Quản Lý Hàng Mẫu",
  "/reports": "Báo Cáo Doanh Số & Hiệu Quả Livestream",
  "/chat": "Trao Đổi & Thảo Luận Nội Bộ CRM",
  "/users": "Tài Khoản Nhân Viên & Phân Quyền Hệ Thống",
  "/settings": "Cấu Hình Hệ Thống CRM Agency",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || "CRM Dashboard";
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    fetch("/api/db")
      .then((res) => res.json())
      .then((serverData) => {
        if (serverData && serverData.users && Array.isArray(serverData.users)) {
          useCrmStore.setState((state) => ({
            ...state,
            users: serverData.users,
            talents: Array.isArray(serverData.talents) ? serverData.talents : state.talents,
            brands: Array.isArray(serverData.brands) ? serverData.brands : state.brands,
            skus: Array.isArray(serverData.skus) ? serverData.skus : state.skus,
            campaigns: Array.isArray(serverData.campaigns) ? serverData.campaigns : state.campaigns,
            shifts: Array.isArray(serverData.shifts) ? serverData.shifts : state.shifts,
            tasks: Array.isArray(serverData.tasks) ? serverData.tasks : state.tasks,
            conversations: Array.isArray(serverData.conversations) ? serverData.conversations : state.conversations,
            chatMessages: serverData.chatMessages || state.chatMessages,
          }));
        }
      })
      .catch(() => {});
  }, []);

  if (!hasMounted) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden" suppressHydrationWarning>
      {/* Left Menubar (Sidebar) */}
      <AppSidebar />

      {/* Main Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Full-width Topbar Header */}
          <Header title={pageTitle} />

          {/* Scrollable Page Content Container */}
          <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
