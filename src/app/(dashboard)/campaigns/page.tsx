"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import { BookingCampaign, PlatformType, SampleStatus } from "@/types";
import { formatVND } from "@/lib/utils";
import {
  PackageCheck,
  Plus,
  Search,
  Calendar,
  Building2,
  Users,
  ExternalLink,
  Truck,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Boxes,
  Eye,
  Pencil,
  Trash2,
  Link2,
} from "lucide-react";

export default function CampaignsPage() {
  const router = useRouter();
  const { campaigns, brands, talents, skus, shifts, addCampaign, updateCampaign, addShift, currentUser } = useCrmStore();
  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "COORDINATOR";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("ALL");

  const [notification, setNotification] = useState<CustomNotification | null>(null);

  // Campaign Create/Edit Modal State
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<BookingCampaign | null>(null);

  const [campaignForm, setCampaignForm] = useState({
    brandId: brands[0]?.id || "",
    campaignName: "",
    budget: "100000000",
    targetGmv: "500000000",
    startDate: "2026-08-01",
    endDate: "2026-08-15",
    description: "Chiến dịch livestream bùng nổ doanh số đẩy mạnh các SKU chủ lực của thương hiệu với deal ưu đãi mua 1 tặng 1.",
    scriptUrl: "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
  });

  // Host Dispatch Modal State
  const [allocatingCampaign, setAllocatingCampaign] = useState<BookingCampaign | null>(null);
  const [dispatchForm, setDispatchForm] = useState({
    talentId: talents[0]?.id || "",
    platform: "TIKTOK_LIVE" as PlatformType,
    location: "Studio 1 - Q7",
    date: "2026-08-05",
    startTime: "09:00",
    endTime: "12:00",
    selectedSkuIds: [] as string[],
    scriptUrl: "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
  });

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brandName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrandFilter === "ALL" || c.brandId === selectedBrandFilter;
    return matchesSearch && matchesBrand;
  });

  const handleOpenAddCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm({
      brandId: brands[0]?.id || "",
      campaignName: "",
      budget: "100000000",
      targetGmv: "500000000",
      startDate: "2026-08-01",
      endDate: "2026-08-15",
      description: "Chiến dịch livestream bùng nổ doanh số đẩy mạnh các SKU chủ lực của thương hiệu.",
      scriptUrl: "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
    });
    setIsAddCampaignOpen(true);
  };

  const handleOpenEditCampaignModal = (cam: BookingCampaign) => {
    setEditingCampaign(cam);
    setCampaignForm({
      brandId: cam.brandId,
      campaignName: cam.campaignName,
      budget: cam.budget.toString(),
      targetGmv: cam.targetGmv.toString(),
      startDate: cam.startDate,
      endDate: cam.endDate,
      description: cam.description || "Chiến dịch livestream bùng nổ doanh số...",
      scriptUrl: cam.scriptUrl || "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
    });
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.campaignName || !campaignForm.brandId) return;

    const brand = brands.find((b) => b.id === campaignForm.brandId) || brands[0];

    if (editingCampaign) {
      updateCampaign(editingCampaign.id, {
        brandId: brand.id,
        brandName: brand.brandName,
        campaignName: campaignForm.campaignName,
        budget: parseFloat(campaignForm.budget) || 0,
        targetGmv: parseFloat(campaignForm.targetGmv) || 0,
        startDate: campaignForm.startDate,
        endDate: campaignForm.endDate,
        description: campaignForm.description,
        scriptUrl: campaignForm.scriptUrl,
      });

      setEditingCampaign(null);
      setNotification({
        type: "success",
        title: "Cập Nhật Chiến Dịch Thành Công",
        message: `Đã lưu các chỉnh sửa cho chiến dịch ${campaignForm.campaignName}.`,
      });
    } else {
      addCampaign({
        brandId: brand.id,
        brandName: brand.brandName,
        campaignName: campaignForm.campaignName,
        budget: parseFloat(campaignForm.budget) || 0,
        targetGmv: parseFloat(campaignForm.targetGmv) || 0,
        startDate: campaignForm.startDate,
        endDate: campaignForm.endDate,
        description: campaignForm.description,
        scriptUrl: campaignForm.scriptUrl,
      });

      setIsAddCampaignOpen(false);
      setNotification({
        type: "success",
        title: "Tạo Chiến Dịch Mới Thành Công",
        message: `Đã khởi tạo thành công chiến dịch ${campaignForm.campaignName} cho brand ${brand.brandName}.`,
      });
    }
  };

  const handleOpenDispatchModal = (campaign: BookingCampaign) => {
    setAllocatingCampaign(campaign);
    const brandSkus = skus.filter((s) => s.brandId === campaign.brandId);

    setDispatchForm({
      talentId: talents[0]?.id || "",
      platform: "TIKTOK_LIVE",
      location: "Studio 1 - Q7",
      date: campaign.startDate || "2026-08-05",
      startTime: "09:00",
      endTime: "12:00",
      selectedSkuIds: brandSkus.map((s) => s.id),
      scriptUrl: campaign.scriptUrl || "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
    });
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingCampaign) return;

    const talent = talents.find((t) => t.id === dispatchForm.talentId);
    if (!talent) return;

    const assignedSkusList = skus.filter((s) => dispatchForm.selectedSkuIds.includes(s.id));

    addShift({
      campaignId: allocatingCampaign.id,
      campaignName: allocatingCampaign.campaignName,
      brandName: allocatingCampaign.brandName,
      talentId: talent.id,
      talentName: talent.stageName,
      talentType: talent.talentType,
      platform: dispatchForm.platform,
      location: dispatchForm.location,
      date: dispatchForm.date,
      startTime: dispatchForm.startTime,
      endTime: dispatchForm.endTime,
      shiftStatus: "CONFIRMED",
      assignedSkus: assignedSkusList,
      actualGmv: 0,
      actualViews: 0,
      peakConcurrent: 0,
      scriptUrl: dispatchForm.scriptUrl,
    });

    const campaignName = allocatingCampaign.campaignName;
    const talentStageName = talent.stageName;

    setAllocatingCampaign(null);

    setNotification({
      type: "success",
      title: "Điều Phối Host Thành Công",
      message: `Đã điều phối thành công Host ${talentStageName} cho chiến dịch ${campaignName}! Ca live đã được tự động thêm vào Lịch Làm Việc.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Custom Centered Notification Dialog */}
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-indigo-600" />
            Danh Sách Chiến Dịch Booking ({campaigns.length})
          </h3>
          <p className="text-xs text-slate-500">
            Quản lý chiến dịch booking, ngân sách, mục tiêu GMV và kịch bản file Docs/Drive
          </p>
        </div>

        {canEdit && (
          <Button
            onClick={handleOpenAddCampaign}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tạo Campaign Mới
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm tên chiến dịch, brand đối tác..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
            >
              <option value="ALL">Tất cả Brand Đối Tác</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.brandName}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* DATA TABLE VIEW OF CAMPAIGNS (ĐÃ BỎ CỘT THAO TÁC THEO YÊU CẦU NGUYÊN BẢN) */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Bảng Thông Tin Chiến Dịch Booking ({filteredCampaigns.length})
            </span>
            <span className="text-xs text-slate-500 font-normal">Click vào bất kỳ chiến dịch nào để vào trang chi tiết & điều phối ca live</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900/50 whitespace-nowrap">
                <TableHead className="w-12 text-center font-bold whitespace-nowrap">STT</TableHead>
                <TableHead className="w-64 whitespace-nowrap">Tên Chiến Dịch</TableHead>
                <TableHead className="whitespace-nowrap">Brand Đối Tác</TableHead>
                <TableHead className="whitespace-nowrap">Kịch Bản Livestream (URL)</TableHead>
                <TableHead className="whitespace-nowrap">Thời Gian Live</TableHead>
                <TableHead className="text-right whitespace-nowrap">Ngân Sách</TableHead>
                <TableHead className="text-right whitespace-nowrap">Mục Tiêu GMV</TableHead>
                <TableHead className="text-center whitespace-nowrap">Host / Ca Live Đã Xếp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((cam, idx) => {
                const campaignShifts = shifts.filter((s) => s.campaignId === cam.id);
                const allocatedShiftsCount = campaignShifts.length || cam.shiftsCount || 0;

                return (
                  <TableRow
                    key={cam.id}
                    onClick={() => router.push(`/campaigns/${cam.id}`)}
                    className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors whitespace-nowrap cursor-pointer group/row"
                  >
                    <TableCell className="text-center font-bold text-slate-500 text-xs whitespace-nowrap">
                      {idx + 1}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white group-hover/row:text-indigo-600 group-hover/row:underline flex items-center gap-1.5">
                        {cam.campaignName}
                        <ExternalLink className="w-3 h-3 text-indigo-600 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap font-semibold text-indigo-600 dark:text-indigo-400">
                      {cam.brandName}
                    </TableCell>

                    <TableCell className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {cam.scriptUrl ? (
                        <a
                          href={cam.scriptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          <Link2 className="w-3 h-3" />
                          Link Kịch Bản Docs <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Chưa cập nhật URL</span>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-600 shrink-0" />
                        {cam.startDate} - {cam.endDate}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-bold text-slate-900 dark:text-white whitespace-nowrap text-xs">
                      {formatVND(cam.budget)}
                    </TableCell>

                    <TableCell className="text-right font-bold text-emerald-600 whitespace-nowrap text-xs">
                      {formatVND(cam.targetGmv)}
                    </TableCell>

                    <TableCell className="text-center whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                        {allocatedShiftsCount} Ca Live
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE OR EDIT CAMPAIGN MODAL DIALOG */}
      {(isAddCampaignOpen || editingCampaign) && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="w-4.5 h-4.5 text-indigo-600" />
                {editingCampaign ? "Điều Chỉnh Thông Tin Chiến Dịch" : "Tạo Chiến Dịch Booking Mới"}
              </h3>
              <button
                onClick={() => {
                  setIsAddCampaignOpen(false);
                  setEditingCampaign(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chọn Brand Đối Tác</label>
                <select
                  value={campaignForm.brandId}
                  onChange={(e) => setCampaignForm({ ...campaignForm, brandId: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-semibold"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.brandName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên Chiến Dịch (Campaign Name)</label>
                <Input
                  required
                  placeholder="Mega Sale 9.9 - Ra Mắt SP Mới"
                  value={campaignForm.campaignName}
                  onChange={(e) => setCampaignForm({ ...campaignForm, campaignName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngân Sách Chiến Dịch (VNĐ)</label>
                  <Input
                    type="number"
                    placeholder="100000000"
                    value={campaignForm.budget}
                    onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mục Tiêu GMV (VNĐ)</label>
                  <Input
                    type="number"
                    placeholder="500000000"
                    value={campaignForm.targetGmv}
                    onChange={(e) => setCampaignForm({ ...campaignForm, targetGmv: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Bắt Đầu Live</label>
                  <Input
                    type="date"
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Kết Thúc</label>
                  <Input
                    type="date"
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Đường Dẫn Kịch Bản Livestream (URL File Google Docs / Drive / Notion)
                </label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/document/d/1..."
                  value={campaignForm.scriptUrl}
                  onChange={(e) => setCampaignForm({ ...campaignForm, scriptUrl: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 mt-1">Dán link Google Docs/Drive chứa kịch bản chi tiết để Host và Agency truy cập nhanh.</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô Tả & Mục Tiêu Chiến Dịch</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả mục tiêu bùng nổ doanh số, ưu đãi Mua 1 Tặng 1..."
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="w-full p-2 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddCampaignOpen(false);
                    setEditingCampaign(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  {editingCampaign ? "Lưu Thay Đổi" : "Khởi Tạo Campaign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
