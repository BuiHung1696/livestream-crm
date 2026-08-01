"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TalentBadge } from "@/components/talents/talent-badge";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import { BookingCampaign, PlatformType, ShiftStatus } from "@/types";
import { formatVND } from "@/lib/utils";
import {
  ArrowLeft,
  PackageCheck,
  Calendar,
  Users,
  CheckCircle2,
  DollarSign,
  Pencil,
  Plus,
  Tv,
  Clock,
  MapPin,
  FileText,
  Boxes,
  Check,
  X,
  Building2,
  TrendingUp,
  ExternalLink,
  Link2,
} from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;

  const { campaigns, brands, talents, skus, shifts, updateCampaign, addShift } = useCrmStore();

  const [notification, setNotification] = useState<CustomNotification | null>(null);

  // Active Campaign
  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0];

  // Edit Campaign Modal State
  const [isEditCampaignOpen, setIsEditCampaignOpen] = useState(false);
  const [campaignEditForm, setCampaignEditForm] = useState({
    campaignName: campaign?.campaignName || "",
    brandId: campaign?.brandId || "",
    budget: campaign?.budget.toString() || "100000000",
    targetGmv: campaign?.targetGmv.toString() || "500000000",
    startDate: campaign?.startDate || "2026-08-01",
    endDate: campaign?.endDate || "2026-08-15",
    description: campaign?.description || "Chiến dịch livestream bùng nổ doanh số đẩy mạnh các SKU chủ lực của thương hiệu với deal ưu đãi mua 1 tặng 1.",
    scriptUrl: campaign?.scriptUrl || "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
  });

  // Host Dispatch Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    talentId: talents[0]?.id || "",
    platform: "TIKTOK_LIVE" as PlatformType,
    location: "Studio 1 - Q7",
    date: campaign?.startDate || "2026-08-05",
    startTime: "09:00",
    endTime: "12:00",
    selectedSkuIds: skus.filter((s) => s.brandId === campaign?.brandId).map((s) => s.id),
    scriptUrl: campaign?.scriptUrl || "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
  });

  if (!campaign) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500 font-medium">Không tìm thấy thông tin chiến dịch này.</p>
        <Button onClick={() => router.push("/campaigns")} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay Lại Danh Sách Chiến Dịch
        </Button>
      </div>
    );
  }

  // Get shifts allocated for this campaign
  const campaignShifts = shifts.filter((s) => s.campaignId === campaign.id);
  const campaignSkus = skus.filter((s) => s.brandId === campaign.brandId);

  const totalActualGmvGenerated = campaignShifts.reduce((sum, s) => sum + (s.actualGmv || 0), 0);

  const handleOpenEditCampaign = () => {
    setCampaignEditForm({
      campaignName: campaign.campaignName,
      brandId: campaign.brandId,
      budget: campaign.budget.toString(),
      targetGmv: campaign.targetGmv.toString(),
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      description: campaign.description || "Chiến dịch livestream bùng nổ doanh số...",
      scriptUrl: campaign.scriptUrl || "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
    });
    setIsEditCampaignOpen(true);
  };

  const handleSaveCampaignEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const brand = brands.find((b) => b.id === campaignEditForm.brandId);

    updateCampaign(campaign.id, {
      campaignName: campaignEditForm.campaignName,
      brandId: campaignEditForm.brandId,
      brandName: brand?.brandName || campaign.brandName,
      budget: parseFloat(campaignEditForm.budget) || 0,
      targetGmv: parseFloat(campaignEditForm.targetGmv) || 0,
      startDate: campaignEditForm.startDate,
      endDate: campaignEditForm.endDate,
      description: campaignEditForm.description,
      scriptUrl: campaignEditForm.scriptUrl,
    });

    setIsEditCampaignOpen(false);
    setNotification({
      type: "success",
      title: "Cập Nhật Chiến Dịch Thành Công",
      message: `Đã lưu thông tin cho chiến dịch ${campaignEditForm.campaignName}.`,
    });
  };

  const toggleSkuSelection = (skuId: string) => {
    setDispatchForm((prev) => {
      const exists = prev.selectedSkuIds.includes(skuId);
      if (exists) {
        return { ...prev, selectedSkuIds: prev.selectedSkuIds.filter((id) => id !== skuId) };
      } else {
        return { ...prev, selectedSkuIds: [...prev.selectedSkuIds, skuId] };
      }
    });
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const talent = talents.find((t) => t.id === dispatchForm.talentId);
    if (!talent) return;

    const assignedSkusList = skus.filter((s) => dispatchForm.selectedSkuIds.includes(s.id));

    addShift({
      campaignId: campaign.id,
      campaignName: campaign.campaignName,
      brandName: campaign.brandName,
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

    setIsDispatchModalOpen(false);

    setNotification({
      type: "success",
      title: "Điều Phối Host Thành Công",
      message: `Đã điều phối Host ${talent.stageName} cho ca live ngày ${dispatchForm.date}! Ca trực đã tự động lên lịch.`,
    });
  };

  return (
    <div className="space-y-6">
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/campaigns")}
          className="gap-2 text-xs font-semibold border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          Quay Lại Danh Sách Chiến Dịch
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEditCampaign}
            className="gap-1.5 text-xs font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <Pencil className="w-3.5 h-3.5" />
            Điều Chỉnh Thông Tin Chiến Dịch
          </Button>

          <Button
            size="sm"
            onClick={() => setIsDispatchModalOpen(true)}
            className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Users className="w-3.5 h-3.5" />
            + Điều Phối Host Mới
          </Button>
        </div>
      </div>

      {/* Top Banner Overview */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-indigo-600 text-white">
                  <PackageCheck className="w-6 h-6" />
                </span>
                <div>
                  <h1 className="text-2xl font-bold">{campaign.campaignName}</h1>
                  <p className="text-sm text-indigo-300 font-semibold flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4" /> Brand Đối Tác: <b>{campaign.brandName}</b>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-300 pt-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Thời gian: <b>{campaign.startDate}</b> đến <b>{campaign.endDate}</b>
                </span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {campaignShifts.length} Host / Ca Live Đã Điều Phối
                </span>
              </div>
            </div>

            {/* KPI Cards in Banner */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full md:w-auto justify-around md:justify-end">
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-300 uppercase font-semibold block">Ngân Sách</span>
                <span className="text-lg font-bold text-white">{formatVND(campaign.budget)}</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-300 uppercase font-semibold block">Mục Tiêu GMV</span>
                <span className="text-lg font-bold text-emerald-400">{formatVND(campaign.targetGmv)}</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-300 uppercase font-semibold block">GMV Thực Tế</span>
                <span className="text-lg font-bold text-sky-400">{formatVND(totalActualGmvGenerated)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 1: Campaign Description & Script Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Description & Script Link */}
        <Card className="md:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Mô Tả Chiến Dịch & Kịch Bản Livestream
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white text-xs block">Mô Tả & Mục Tiêu Booking:</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {campaign.description || "Chiến dịch livestream bùng nổ doanh số đẩy mạnh các SKU chủ lực của thương hiệu với deal ưu đãi mua 1 tặng 1 trong khung giờ vàng."}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 text-indigo-900 dark:text-indigo-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-indigo-600" />
                  File Kịch Bản Livestream
                </span>
              </div>

              {campaign.scriptUrl ? (
                <div>
                  <a
                    href={campaign.scriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Mở File Kịch Bản Google Docs ↗
                  </a>
                </div>
              ) : (
                <p className="text-slate-400 italic">Chưa cập nhật URL kịch bản cho chiến dịch này.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Allocated Brand SKUs */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              SKU Sản Phẩm Đẩy Deal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            {campaignSkus.length > 0 ? (
              campaignSkus.map((sku) => (
                <div key={sku.id} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white truncate max-w-[150px]">{sku.productName}</span>
                    <span className="text-emerald-600 font-bold">{sku.commissionRate}% Comm</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Mã: <b>{sku.skuCode}</b></span>
                    <span>Deal Live: <b className="text-indigo-600">{formatVND(sku.livePromoPrice)}</b></span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic text-center py-4">Chưa gán SKU sản phẩm nào</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: Allocated Host / Talent List (Danh Sách Talent Được Điều Phối) */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Danh Sách Talent Được Điều Phối Cho Chiến Dịch ({campaignShifts.length})
            </span>
            <Button
              size="sm"
              onClick={() => setIsDispatchModalOpen(true)}
              className="gap-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Điều Phối Thêm Host
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold whitespace-nowrap">
                <th className="p-3 text-center w-12 whitespace-nowrap">STT</th>
                <th className="p-3 whitespace-nowrap">Host / Talent</th>
                <th className="p-3 whitespace-nowrap">Platform Live</th>
                <th className="p-3 whitespace-nowrap">Thời Gian Live</th>
                <th className="p-3 whitespace-nowrap">Địa Điểm</th>
                <th className="p-3 text-center whitespace-nowrap">Trạng Thái</th>
                <th className="p-3 text-right whitespace-nowrap">GMV Thực Tế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {campaignShifts.map((shift, idx) => (
                <tr key={shift.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap">
                  <td className="p-3 text-center font-bold text-slate-400 whitespace-nowrap">{idx + 1}</td>
                  <td className="p-3 whitespace-nowrap">
                    <Link href={`/talents/${shift.talentId}`} className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 hover:underline">
                      {shift.talentName}
                    </Link>
                    <span className="text-[10px] text-slate-400 block">{shift.talentType}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 border">
                      {shift.platform === "TIKTOK_LIVE" ? "TikTok Live" : "Shopee Live"}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                    {shift.date} ({shift.startTime} - {shift.endTime})
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{shift.location}</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {shift.shiftStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                    {formatVND(shift.actualGmv)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* MODAL 1: EDIT CAMPAIGN DETAILS */}
      {isEditCampaignOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-indigo-600" />
                Điều Chỉnh Thông Tin Chiến Dịch
              </h3>
              <button onClick={() => setIsEditCampaignOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaignEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên Chiến Dịch</label>
                <Input
                  required
                  value={campaignEditForm.campaignName}
                  onChange={(e) => setCampaignEditForm({ ...campaignEditForm, campaignName: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Brand Đối Tác</label>
                <select
                  value={campaignEditForm.brandId}
                  onChange={(e) => setCampaignEditForm({ ...campaignEditForm, brandId: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-semibold"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.brandName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngân Sách (VND)</label>
                  <Input
                    type="number"
                    value={campaignEditForm.budget}
                    onChange={(e) => setCampaignEditForm({ ...campaignEditForm, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mục Tiêu GMV (VND)</label>
                  <Input
                    type="number"
                    value={campaignEditForm.targetGmv}
                    onChange={(e) => setCampaignEditForm({ ...campaignEditForm, targetGmv: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Bắt Đầu</label>
                  <Input
                    type="date"
                    value={campaignEditForm.startDate}
                    onChange={(e) => setCampaignEditForm({ ...campaignEditForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Kết Thúc</label>
                  <Input
                    type="date"
                    value={campaignEditForm.endDate}
                    onChange={(e) => setCampaignEditForm({ ...campaignEditForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Đường Dẫn File Kịch Bản Livestream (Google Docs / Driver / Notion)
                </label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={campaignEditForm.scriptUrl}
                  onChange={(e) => setCampaignEditForm({ ...campaignEditForm, scriptUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô Tả Chiến Dịch</label>
                <textarea
                  rows={3}
                  value={campaignEditForm.description}
                  onChange={(e) => setCampaignEditForm({ ...campaignEditForm, description: e.target.value })}
                  className="w-full p-2 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditCampaignOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Lưu Thay Đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: HOST ALLOCATION DISPATCH FOR CAMPAIGN */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Điều Phối Host Cho Chiến Dịch: {campaign.campaignName}
                </h3>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">Brand Đối Tác: {campaign.brandName}</p>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">1. Chọn Talent Phân Công (Host / KOC / KOL)</label>
                <select
                  value={dispatchForm.talentId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, talentId: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                >
                  {talents.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.stageName} ({t.talentType}) - GMV Lịch sử: {formatVND(t.avgGmvPerHour)}/h - Phí Cast: {formatVND(t.fixedRatePerShift)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày Live</label>
                  <Input
                    type="date"
                    value={dispatchForm.date}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ Bắt Đầu</label>
                  <Input
                    value={dispatchForm.startTime}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ Kết Thúc</label>
                  <Input
                    value={dispatchForm.endTime}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Platform Kênh Live</label>
                  <select
                    value={dispatchForm.platform}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, platform: e.target.value as PlatformType })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                  >
                    <option value="TIKTOK_LIVE">TikTok Live</option>
                    <option value="SHOPEE_LIVE">Shopee Live</option>
                    <option value="FACEBOOK_LIVE">Facebook Live</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Địa Điểm / Studio Trực</label>
                  <Input
                    value={dispatchForm.location}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Chọn SKU Sản Phẩm Đẩy Deal Ca Live ({campaign.brandName})
                </label>
                <div className="space-y-1.5 p-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 max-h-40 overflow-y-auto">
                  {campaignSkus.length > 0 ? (
                    campaignSkus.map((sku) => {
                      const isSelected = dispatchForm.selectedSkuIds.includes(sku.id);
                      return (
                        <div
                          key={sku.id}
                          onClick={() => toggleSkuSelection(sku.id)}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                            isSelected ? "bg-indigo-50 border-indigo-300 text-indigo-900" : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"}`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <p className="font-bold text-xs">{sku.productName}</p>
                              <p className="text-[10px] text-slate-500">Mã: {sku.skuCode} | Deal: {formatVND(sku.livePromoPrice)}</p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-600 text-xs">{sku.commissionRate}% Commission</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-400 italic text-center py-2">Chưa có SKU sản phẩm nào cho Brand này</p>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">3. Đường Dẫn File Kịch Bản (Google Docs / Driver)</label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={dispatchForm.scriptUrl}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, scriptUrl: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDispatchModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Xác Nhận Điều Phối Ca Live
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
