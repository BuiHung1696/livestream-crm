"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import {
  Settings,
  Shield,
  Key,
  Bell,
  Save,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const { currentUser } = useCrmStore();
  const [notification, setNotification] = useState<CustomNotification | null>(null);

  const [settings, setSettings] = useState({
    agencyName: "LiveAgency Booking CRM",
    defaultAgencyCommission: "15",
    tiktokAppKey: "tt_app_live_89201948",
    tiktokAppSecret: "••••••••••••••••••••••••",
    shopeePartnerId: "shp_partner_90182",
    ghnApiToken: "ghn_token_889102",
    autoConflictCheck: true,
    emailNotifications: true,
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification({
      type: "success",
      title: "Lưu Cấu Hình Thành Công",
      message: "Các thiết lập hệ thống Agency, API Keys và Quy tắc cảnh báo đã được lưu lại.",
    });
  };

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Truy Cập Bị Hạn Chế (403 Access Denied)</h3>
        <p className="text-xs text-slate-500">
          Trang Cấu hình Hệ thống dành riêng cho tài khoản Quản Trị Viên (Admin). Vui lòng liên hệ Admin để thay đổi tham số hệ thống.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Cấu Hình Hệ Thống CRM
        </h2>
        <p className="text-xs text-slate-500">
          Quản lý thiết lập chung Agency, kết nối API các sàn TikTok/Shopee và quy tắc cảnh báo vận hành
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* General Agency Settings */}
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
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tỷ Lệ Chiết Khấu Agency Mặc Định (%)</label>
                <Input
                  type="number"
                  value={settings.defaultAgencyCommission}
                  onChange={(e) => setSettings({ ...settings, defaultAgencyCommission: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Integration Settings */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              2. Kết Nối API TikTok Shop, Shopee Live & Vận Chuyển
            </CardTitle>
            <CardDescription>Nhập API Credentials để tự động đồng bộ doanh số GMV và theo dõi mã vận đơn sample</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">TikTok Shop Open API Key</label>
                <Input
                  value={settings.tiktokAppKey}
                  onChange={(e) => setSettings({ ...settings, tiktokAppKey: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">TikTok Shop App Secret</label>
                <Input
                  type="password"
                  value={settings.tiktokAppSecret}
                  onChange={(e) => setSettings({ ...settings, tiktokAppSecret: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shopee Live Partner ID</label>
                <Input
                  value={settings.shopeePartnerId}
                  onChange={(e) => setSettings({ ...settings, shopeePartnerId: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">GHN Express API Token</label>
                <Input
                  type="password"
                  value={settings.ghnApiToken}
                  onChange={(e) => setSettings({ ...settings, ghnApiToken: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Rules & System Notifications */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              3. Quy Tắc Cảnh Báo & Thông Báo Vận Hành
            </CardTitle>
            <CardDescription>Bật/tắt chế độ tự động phát hiện trùng ca live và gửi thông báo hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Tự động phát hiện trùng ca live Talent</p>
                <p className="text-[11px] text-slate-500">Cảnh báo nếu 1 Talent bị xếp trùng giờ trực ở 2 studio khác nhau</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoConflictCheck}
                onChange={(e) => setSettings({ ...settings, autoConflictCheck: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Gửi thông báo ca live mới qua Email & Zalo</p>
                <p className="text-[11px] text-slate-500">Gửi nhắc nhở tự động cho Host 2 tiếng trước giờ lên sóng</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
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
    </div>
  );
}
