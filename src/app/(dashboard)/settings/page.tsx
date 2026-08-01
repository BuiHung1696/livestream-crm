"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import {
  User,
  Key,
  Shield,
  Settings,
  Save,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Building2,
  Bell,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const { currentUser, updateUser } = useCrmStore();
  const [notification, setNotification] = useState<CustomNotification | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "system">("profile");

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "0987654321",
    avatarUrl: currentUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    department: currentUser?.department || "Ban Giám Đốc",
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    agencyName: "LiveAgency Booking CRM",
    defaultAgencyCommission: "15",
    tiktokAppKey: "tt_app_live_89201948",
    tiktokAppSecret: "••••••••••••••••••••••••",
    shopeePartnerId: "shp_partner_90182",
    ghnApiToken: "ghn_token_889102",
    autoConflictCheck: true,
    emailNotifications: true,
  });

  // Save Account Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateUser(currentUser.id, {
      fullName: profileForm.fullName,
      email: profileForm.email,
      phone: profileForm.phone,
      avatarUrl: profileForm.avatarUrl,
      department: profileForm.department,
    });

    setNotification({
      type: "success",
      title: "Cập Nhật Hồ Sơ Thành Công",
      message: "Thông tin cá nhân tài khoản của bạn đã được lưu lại trên hệ thống CRM.",
    });
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (currentUser.password && passwordForm.currentPassword !== currentUser.password) {
      setNotification({
        type: "error",
        title: "Mật Khẩu Hiện Tại Không Đúng",
        message: "Vui lòng kiểm tra và nhập lại chính xác mật khẩu hiện tại của bạn.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setNotification({
        type: "warning",
        title: "Mật Khẩu Quá Ngắn",
        message: "Mật khẩu mới phải chứa ít nhất 6 ký tự để bảo mật tài khoản.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotification({
        type: "warning",
        title: "Mật Khẩu Không Trùng Khớp",
        message: "Mật khẩu mới và mật khẩu xác nhận không giống nhau.",
      });
      return;
    }

    updateUser(currentUser.id, {
      password: passwordForm.newPassword,
    });

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setNotification({
      type: "success",
      title: "Đổi Mật Khẩu Thành Công",
      message: "Mật khẩu tài khoản của bạn đã được cập nhật mới thành công.",
    });
  };

  // Save System Settings Handler
  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification({
      type: "success",
      title: "Lưu Cấu Hình Thành Công",
      message: "Các thiết lập hệ thống Agency và quy tắc vận hành đã được cập nhật.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          Tài Khoản Cá Nhân & Cấu Hình Hệ Thống
        </h2>
        <p className="text-xs text-slate-500">
          Quản lý thông tin hồ sơ cá nhân, đổi mật khẩu đăng nhập và thiết lập tham số hệ thống CRM
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <User className="w-4 h-4" />
          Hồ Sơ Cá Nhân
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "password"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Key className="w-4 h-4" />
          Đổi Mật Khẩu
        </button>

        {currentUser?.role === "ADMIN" && (
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "system"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Settings className="w-4 h-4" />
            Cấu Hình Hệ Thống (Admin)
          </button>
        )}
      </div>

      {/* TAB 1: ACCOUNT PROFILE FORM */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Thông Tin Cá Nhân & Avatar
              </CardTitle>
              <CardDescription>Cập nhật ảnh đại diện, họ tên hiển thị và thông tin liên hệ của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-xs">
              {/* Avatar Preview Section */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Avatar className="w-16 h-16 border-2 border-indigo-500 shadow-md">
                  <AvatarImage src={profileForm.avatarUrl} alt={profileForm.fullName} />
                  <AvatarFallback className="bg-indigo-600 text-white font-bold text-lg">
                    {profileForm.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Đường Dẫn Ảnh Đại Diện (Avatar URL)</label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={profileForm.avatarUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Hỗ trợ đường dẫn ảnh HTTPS công khai từ Unsplash, Imgur hoặc Drive</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Họ và Tên Hiển Thị</label>
                  <Input
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Đăng Nhập</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      required
                      type="email"
                      className="pl-9"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Số Điện Thoại Liên Hệ</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      className="pl-9"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phòng Ban / Chức Danh</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      className="pl-9"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Role Badge Status */}
              <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 block">Vai Trò Vai Trò Hệ Thống Đang Kích Hoạt</span>
                  <p className="font-bold text-indigo-700 dark:text-indigo-300 text-xs">
                    {currentUser?.role === "ADMIN"
                      ? "Admin - Quản Trị Viên Toàn Quyền"
                      : currentUser?.role === "COORDINATOR"
                      ? "Coordinator - Điều Phối Ca Live & Booking"
                      : currentUser?.role === "ACCOUNTANT"
                      ? "Kế Toán - Theo Dõi Doanh Số & Hợp Đồng"
                      : "Staff - Vận Hành Studio"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white uppercase tracking-wider">
                  {currentUser?.role}
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9">
                  <Save className="w-4 h-4" />
                  Lưu Cập Nhật Hồ Sơ
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* TAB 2: CHANGE PASSWORD FORM */}
      {activeTab === "password" && (
        <form onSubmit={handleChangePassword} className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                Thay Đổi Mật Khẩu Đăng Nhập
              </CardTitle>
              <CardDescription>Bảo mật tài khoản của bạn bằng cách thiết lập mật khẩu mạnh định kỳ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mật Khẩu Hiện Tại</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    required
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="pl-9 pr-10"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mật Khẩu Mới</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      required
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Ít nhất 6 ký tự..."
                      className="pl-9 pr-10"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Xác Nhận Mật Khẩu Mới</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      required
                      type="password"
                      placeholder="Nhập lại mật khẩu mới..."
                      className="pl-9"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Quy định độ an toàn mật khẩu:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-700 dark:text-amber-400">
                  <li>Độ dài tối thiểu từ 6 ký tự trở lên.</li>
                  <li>Sau khi đổi thành công, hệ thống sẽ tự động cập nhật tài khoản của bạn.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9">
                  <Save className="w-4 h-4" />
                  Xác Nhận Đổi Mật Khẩu
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* TAB 3: SYSTEM CONFIGURATION FORM (ADMIN ONLY) */}
      {activeTab === "system" && currentUser?.role === "ADMIN" && (
        <form onSubmit={handleSaveSystemSettings} className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                1. Cấu Hình Chung Agency
              </CardTitle>
              <CardDescription>Thiết lập thông tin tên Agency và tỷ lệ chiết khấu quản lý booking mặc định</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tên Agency / Công Ty</label>
                  <Input
                    value={systemSettings.agencyName}
                    onChange={(e) => setSystemSettings({ ...systemSettings, agencyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tỷ Lệ Chiết Khấu Agency Mặc Định (%)</label>
                  <Input
                    type="number"
                    value={systemSettings.defaultAgencyCommission}
                    onChange={(e) => setSystemSettings({ ...systemSettings, defaultAgencyCommission: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                2. Kết Nối API TikTok Shop & Shopee Live
              </CardTitle>
              <CardDescription>Nhập API Credentials để tự động đồng bộ doanh số GMV ca live</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">TikTok Shop Open API Key</label>
                  <Input
                    value={systemSettings.tiktokAppKey}
                    onChange={(e) => setSystemSettings({ ...systemSettings, tiktokAppKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">TikTok Shop Secret</label>
                  <Input
                    type="password"
                    value={systemSettings.tiktokAppSecret}
                    onChange={(e) => setSystemSettings({ ...systemSettings, tiktokAppSecret: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Shopee Live Partner ID</label>
                  <Input
                    value={systemSettings.shopeePartnerId}
                    onChange={(e) => setSystemSettings({ ...systemSettings, shopeePartnerId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">GHN Express API Token</label>
                  <Input
                    type="password"
                    value={systemSettings.ghnApiToken}
                    onChange={(e) => setSystemSettings({ ...systemSettings, ghnApiToken: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9">
              <Save className="w-4 h-4" />
              Lưu Cấu Hình Hệ Thống
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
