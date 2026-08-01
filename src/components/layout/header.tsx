"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  PanelLeft,
  Command,
  User,
  Settings,
  LogOut,
  Shield,
  Building2,
  Boxes,
  Megaphone,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCrmStore } from "@/lib/store";
import { formatVND } from "@/lib/utils";

export function Header({ title }: { title: string }) {
  const router = useRouter();
  const { toggleSidebar, currentUser, logoutUser, talents, brands, skus, campaigns } = useCrmStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Cmd + K / Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Matching entities for search query
  const q = searchQuery.toLowerCase().trim();

  const matchedTalents = q
    ? talents.filter(
        (t) =>
          t.stageName.toLowerCase().includes(q) ||
          t.fullName.toLowerCase().includes(q) ||
          t.categories.some((c) => c.toLowerCase().includes(q))
      )
    : [];

  const matchedBrands = q
    ? brands.filter(
        (b) =>
          b.brandName.toLowerCase().includes(q) ||
          b.companyName.toLowerCase().includes(q) ||
          b.industry.toLowerCase().includes(q)
      )
    : [];

  const matchedSkus = q
    ? skus.filter(
        (s) =>
          s.productName.toLowerCase().includes(q) ||
          s.skuCode.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.brandName && s.brandName.toLowerCase().includes(q))
      )
    : [];

  const matchedCampaigns = q
    ? campaigns.filter(
        (c) =>
          c.campaignName.toLowerCase().includes(q) ||
          c.brandName.toLowerCase().includes(q)
      )
    : [];

  const totalMatches =
    matchedTalents.length + matchedBrands.length + matchedSkus.length + matchedCampaigns.length;

  const handleLogout = () => {
    logoutUser();
    setIsUserMenuOpen(false);
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(path);
  };

  return (
    <header className="h-16 w-full shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left Section: Sidebar Panel Trigger & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Thu gọn / Mở rộng Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <Separator orientation="vertical" className="h-4" />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right Section: Command Search, Notifications, Primary Action, User Profile */}
      <div className="flex items-center gap-3">
        {/* Command Search Bar & Live Dropdown Overlay */}
        <div ref={searchContainerRef} className="relative hidden md:flex items-center w-64 lg:w-80">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Tìm Talent, Brand, SKU..."
            className="pl-9 pr-10 h-9 text-xs bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 focus-visible:ring-indigo-600"
          />

          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-400">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          )}

          {/* Live Search Results Overlay Dropdown */}
          {isSearchOpen && q.length > 0 && (
            <div className="absolute top-11 left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto p-2 space-y-3">
              {/* Talents Results */}
              {matchedTalents.length > 0 && (
                <div className="space-y-1">
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-600" />
                    Talent ({matchedTalents.length})
                  </span>
                  {matchedTalents.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleNavigate(`/talents/${t.id}`)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img src={t.avatarUrl} alt={t.stageName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{t.stageName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{t.fullName}</p>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 shrink-0">
                        {t.talentType}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Brands Results */}
              {matchedBrands.length > 0 && (
                <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-600" />
                    Thương Hiệu ({matchedBrands.length})
                  </span>
                  {matchedBrands.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleNavigate(`/brands/${b.id}`)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img src={b.logoUrl} alt={b.brandName} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{b.brandName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{b.companyName}</p>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 shrink-0">
                        {b.industry}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* SKUs Results */}
              {matchedSkus.length > 0 && (
                <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Boxes className="w-3 h-3 text-indigo-600" />
                    Sản Phẩm SKU ({matchedSkus.length})
                  </span>
                  {matchedSkus.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleNavigate(`/brands/${s.brandId}`)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img src={s.imageUrl} alt={s.productName} className="w-7 h-7 rounded object-cover shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{s.productName}</p>
                          <span className="text-[10px] text-indigo-600 font-mono block">{s.skuCode}</span>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-emerald-600 shrink-0">{formatVND(s.livePromoPrice)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Campaigns Results */}
              {matchedCampaigns.length > 0 && (
                <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Megaphone className="w-3 h-3 text-indigo-600" />
                    Chiến Dịch ({matchedCampaigns.length})
                  </span>
                  {matchedCampaigns.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleNavigate(`/campaigns/${c.id}`)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="truncate">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{c.campaignName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{c.brandName}</p>
                      </div>
                      <span className="font-bold text-xs text-indigo-600 shrink-0">{formatVND(c.targetGmv)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* No Matches Found */}
              {totalMatches === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                  <Search className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Không tìm thấy kết quả phù hợp</p>
                  <p className="text-[10px] text-slate-400">Không có dữ liệu cho từ khóa "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <button
          className="relative w-9 h-9 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Primary Action CTA */}
        <Button
          size="sm"
          onClick={() => router.push("/schedule")}
          className="hidden sm:inline-flex gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Lên Ca Booking
        </Button>

        {/* User Profile Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700">
              <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.fullName || "User"} />
              <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
                {currentUser?.fullName?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">{currentUser?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {currentUser?.role === "ADMIN"
                    ? "Admin Quản Trị"
                    : currentUser?.role === "COORDINATOR"
                    ? "Coordinator Ca Live"
                    : currentUser?.role === "ACCOUNTANT"
                    ? "Kế Toán Doanh Số"
                    : "Nhân Viên Booking"}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Cấu Hình Tài Khoản
                </Link>
                {currentUser?.role === "ADMIN" && (
                  <Link
                    href="/users"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    Quản Lý Người Dùng & Phân Quyền
                  </Link>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng Xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
