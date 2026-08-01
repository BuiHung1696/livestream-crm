"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import {
  Settings,
  Shield,
  Key,
  Bell,
  Save,
} from "lucide-react";

export default function SettingsPage() {
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Custom Centered Notification Dialog */}
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Cấu Hình Hệ Thống CRM
        </h2>
        <p className="text-xs text-slate-500">
          Quản lý thiết lập chung, kết nối API các sàn TikTok/Shopee và cấu hình thông báo hệ thống
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* General Settings */}
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
                <label className="font-semibold text-slate-700 block mb-1">TikTok App Secret</label>
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
                <label className="font-semibold text-slate-700 block mb-1">GHN / GHTK Webhook API Token</label>
                <Input
                  value={settings.ghnApiToken}
                  onChange={(e) => setSettings({ ...settings, ghnApiToken: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Rules & Notifications */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              3. Quy Tắc Hệ Thống & Cảnh Báo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={settings.autoConflictCheck}
                onChange={(e) => setSettings({ ...settings, autoConflictCheck: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Tự động cảnh báo ca trùng giờ & độc quyền đối thủ</p>
                <p className="text-slate-500">Cảnh báo ngay khi xếp ca Booking trùng giờ hoặc vi phạm điều khoản thương hiệu độc quyền</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Gửi thông báo Email nhắc lịch tự động cho Host/KOC</p>
                <p className="text-slate-500">Gửi mail nhắc ca trực trước 2 tiếng cho Host và thông báo mã vận đơn sản phẩm mẫu</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs">
            <Save className="w-4 h-4" />
            Lưu Cấu Hình Hệ Thống
          </Button>
        </div>
      </form>
    </div>
  );
}
