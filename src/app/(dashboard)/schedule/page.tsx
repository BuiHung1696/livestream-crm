"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TalentBadge } from "@/components/talents/talent-badge";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import { BookingShift, PlatformType, ShiftStatus } from "@/types";
import { formatVND } from "@/lib/utils";
import {
  CalendarDays,
  AlertTriangle,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  DollarSign,
  Clock,
} from "lucide-react";

const DAYS_OF_WEEK = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

export default function SchedulePage() {
  const { talents, brands, skus, campaigns, shifts, addShift, updateShift, deleteShift, updateShiftActualResults } = useCrmStore();

  // Active Month & Year State (Default August 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed: 7 = August

  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [notification, setNotification] = useState<CustomNotification | null>(null);

  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<BookingShift | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState<BookingShift | null>(null);

  // Add Shift Form
  const [shiftForm, setShiftForm] = useState({
    talentId: talents[0]?.id || "",
    brandId: brands[0]?.id || "",
    campaignId: campaigns[0]?.id || "",
    platform: "TIKTOK_LIVE" as PlatformType,
    location: "Studio A - Q7",
    date: "2026-08-01",
    startTime: "09:00",
    endTime: "12:00",
    scriptUrl: "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
  });

  // Edit Shift Form
  const [editForm, setEditForm] = useState({
    talentId: "",
    brandName: "",
    campaignName: "",
    platform: "TIKTOK_LIVE" as PlatformType,
    location: "",
    date: "",
    startTime: "",
    endTime: "",
    shiftStatus: "SCHEDULED" as ShiftStatus,
    scriptUrl: "",
  });

  // Manual Results Entry Form
  const [resultForm, setResultForm] = useState({
    actualGmv: "45000000",
    actualViews: "18500",
    peakConcurrent: "1250",
  });

  // Month Navigation Logic
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar Calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const filteredShifts = shifts.filter((s) => {
    const matchesPlatform = selectedPlatform === "ALL" || s.platform === selectedPlatform;
    const matchesSearch =
      s.talentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.campaignName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const talent = talents.find((t) => t.id === shiftForm.talentId);
    const campaign = campaigns.find((c) => c.id === shiftForm.campaignId);
    const brand = brands.find((b) => b.id === shiftForm.brandId);

    if (!talent || !campaign || !brand) return;

    addShift({
      campaignId: campaign.id,
      campaignName: campaign.campaignName,
      brandName: brand.brandName,
      talentId: talent.id,
      talentName: talent.stageName,
      talentType: talent.talentType,
      platform: shiftForm.platform,
      location: shiftForm.location,
      date: shiftForm.date,
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
      shiftStatus: "SCHEDULED",
      assignedSkus: skus.filter((s) => s.brandId === brand.id),
      actualGmv: 0,
      actualViews: 0,
      peakConcurrent: 0,
      scriptUrl: shiftForm.scriptUrl,
    });

    setIsAddShiftOpen(false);

    setNotification({
      type: "success",
      title: "Lên Lịch Ca Live Thành Công",
      message: `Đã xếp ca live cho Host ${talent.stageName} ngày ${shiftForm.date} (${shiftForm.startTime} - ${shiftForm.endTime}).`,
    });
  };

  const handleOpenEditShift = (shift: BookingShift) => {
    setEditingShift(shift);
    setEditForm({
      talentId: shift.talentId,
      brandName: shift.brandName,
      campaignName: shift.campaignName,
      platform: shift.platform,
      location: shift.location,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      shiftStatus: shift.shiftStatus,
      scriptUrl: shift.scriptUrl || "",
    });
  };

  const handleSaveEditShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;

    const talent = talents.find((t) => t.id === editForm.talentId);

    updateShift(editingShift.id, {
      talentId: editForm.talentId,
      talentName: talent?.stageName || editingShift.talentName,
      talentType: talent?.talentType || editingShift.talentType,
      platform: editForm.platform,
      location: editForm.location,
      date: editForm.date,
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      shiftStatus: editForm.shiftStatus,
      scriptUrl: editForm.scriptUrl,
    });

    setEditingShift(null);

    setNotification({
      type: "success",
      title: "Cập Nhật Ca Trực Thành Công",
      message: "Thông tin ca livestream đã được lưu và cập nhật.",
    });
  };

  const handleDeleteShift = (shiftId: string) => {
    setNotification({
      type: "confirm",
      title: "Xác Nhận Xóa Ca Live",
      message: "Bạn có chắc chắn muốn xóa ca live này khỏi lịch trực hệ thống?",
      confirmText: "Xóa Ca Trực",
      cancelText: "Hủy",
      onConfirm: () => {
        deleteShift(shiftId);
        setEditingShift(null);
      },
    });
  };

  const handleSaveActualResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isResultModalOpen) return;

    updateShiftActualResults(
      isResultModalOpen.id,
      parseFloat(resultForm.actualGmv) || 0,
      parseInt(resultForm.actualViews) || 0,
      parseInt(resultForm.peakConcurrent) || 0
    );

    const gmvVal = resultForm.actualGmv;
    setIsResultModalOpen(null);

    setNotification({
      type: "success",
      title: "Đã Nhập Doanh Số GMV Thực Tế",
      message: `Đã cập nhật doanh số ${formatVND(parseFloat(gmvVal) || 0)} cho ca live và hoàn thành ca.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Custom Centered Notification Popup */}
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Top Filter & Multi-Month Navigation Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm Host, Brand, Ca trực..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">Tất cả Kênh Live</option>
                <option value="TIKTOK_LIVE">TikTok Live</option>
                <option value="SHOPEE_LIVE">Shopee Live</option>
                <option value="FACEBOOK_LIVE">FB Live</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                  title="Tháng trước"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                </button>
                <span className="min-w-[110px] text-center font-bold text-indigo-600 dark:text-indigo-400">
                  Tháng {currentMonth + 1} / {currentYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                  title="Tháng sau"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                </button>
              </div>

              <Button
                onClick={() => setIsAddShiftOpen(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Lên Lịch Ca Live Mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <AlertTriangle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Lịch Trực Theo Ngày:</p>
          <p className="text-slate-600 dark:text-slate-300">
            Dễ dàng di chuyển qua lại các tháng để lên lịch trước cho tương lai. Click vào bất kỳ ca trực nào để <b>Chỉnh sửa, Xóa ca</b> hoặc <b>Nhập GMV Thực Tế Thủ Công</b>.
          </p>
        </div>
      </div>

      {/* FULL MONTH CALENDAR GRID VIEW */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              Lịch Phân Ca Livestream - Tháng {currentMonth + 1} Năm {currentYear}
            </span>
            <div className="flex items-center gap-4 text-xs font-normal">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đã hoàn thành (Có GMV)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Đã chốt ca
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Chờ live
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold text-center py-2.5">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 dark:divide-slate-800 min-h-[520px]">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`offset-${idx}`} className="bg-slate-50/30 dark:bg-slate-950/20 min-h-[110px]" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const formattedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const formattedDate = `${currentYear}-${formattedMonth}-${formattedDay}`;

              const dayShifts = filteredShifts.filter((s) => s.date === formattedDate);

              return (
                <div
                  key={dayNum}
                  className="p-2 min-h-[115px] bg-white dark:bg-slate-900 hover:bg-slate-50/50 transition-colors flex flex-col justify-start space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        dayNum === 1
                          ? "w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {dayNum}
                    </span>
                    <button
                      onClick={() => {
                        setShiftForm({ ...shiftForm, date: formattedDate });
                        setIsAddShiftOpen(true);
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 font-bold transition-opacity"
                    >
                      + Lên ca
                    </button>
                  </div>

                  <div className="space-y-1.5 flex-1 overflow-y-auto">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        onClick={() => handleOpenEditShift(shift)}
                        className={`p-2 rounded-lg text-xs space-y-1 shadow-2xs border transition-all cursor-pointer ${
                          shift.shiftStatus === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                            : shift.shiftStatus === "IN_PROGRESS"
                            ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate">{shift.talentName}</span>
                          <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-white/40 border">
                            {shift.platform === "TIKTOK_LIVE" ? "TikTok" : "Shopee"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] opacity-90">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {shift.startTime} - {shift.endTime}
                          </span>
                          <span className="font-bold truncate max-w-[70px]">{shift.brandName}</span>
                        </div>

                        {shift.actualGmv > 0 ? (
                          <div className="pt-1 border-t border-emerald-200 text-[10px] font-bold text-emerald-700 flex items-center justify-between">
                            <span>GMV: {formatVND(shift.actualGmv)}</span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="pt-1 flex items-center justify-between gap-1 text-[10px]" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEditShift(shift)}
                              className="text-indigo-600 dark:text-indigo-300 hover:underline font-semibold flex items-center gap-0.5"
                            >
                              <Pencil className="w-2.5 h-2.5" /> Sửa
                            </button>
                            <button
                              onClick={() => setIsResultModalOpen(shift)}
                              className="text-emerald-600 hover:underline font-bold flex items-center gap-0.5"
                            >
                              <DollarSign className="w-2.5 h-2.5" /> Nhập GMV
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal 1: Create New Shift */}
      {isAddShiftOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Lên Lịch Ca Livestream / Booking Mới</h3>
              <button onClick={() => setIsAddShiftOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chọn Talent</label>
                  <select
                    value={shiftForm.talentId}
                    onChange={(e) => setShiftForm({ ...shiftForm, talentId: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                  >
                    {talents.map((t) => (
                      <option key={t.id} value={t.id}>{t.stageName} ({t.talentType})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chọn Brand</label>
                  <select
                    value={shiftForm.brandId}
                    onChange={(e) => setShiftForm({ ...shiftForm, brandId: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.brandName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Platform Kênh Live</label>
                  <select
                    value={shiftForm.platform}
                    onChange={(e) => setShiftForm({ ...shiftForm, platform: e.target.value as PlatformType })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                  >
                    <option value="TIKTOK_LIVE">TikTok Live</option>
                    <option value="SHOPEE_LIVE">Shopee Live</option>
                    <option value="FACEBOOK_LIVE">Facebook Live</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Địa Điểm / Studio</label>
                  <Input
                    value={shiftForm.location}
                    onChange={(e) => setShiftForm({ ...shiftForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Trực</label>
                  <Input
                    type="date"
                    value={shiftForm.date}
                    onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Bắt Đầu</label>
                  <Input
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Kết Thúc</label>
                  <Input
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Đường Dẫn File Kịch Bản (Google Docs / Driver URL)</label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={shiftForm.scriptUrl}
                  onChange={(e) => setShiftForm({ ...shiftForm, scriptUrl: e.target.value })}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddShiftOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Xác Nhận Xếp Ca</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit & Delete Scheduled Shift */}
      {editingShift && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Điều Chỉnh Lịch Ca Live</h3>
              <button onClick={() => setEditingShift(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveEditShift} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chọn Talent</label>
                  <select
                    value={editForm.talentId}
                    onChange={(e) => setEditForm({ ...editForm, talentId: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                  >
                    {talents.map((t) => (
                      <option key={t.id} value={t.id}>{t.stageName} ({t.talentType})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trạng Thái Ca Live</label>
                  <select
                    value={editForm.shiftStatus}
                    onChange={(e) => setEditForm({ ...editForm, shiftStatus: e.target.value as ShiftStatus })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                  >
                    <option value="SCHEDULED">Đã lên lịch</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="IN_PROGRESS">Đang Live</option>
                    <option value="COMPLETED">Đã Hoàn Thành</option>
                    <option value="CANCELLED">Hủy ca</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Trực</label>
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Bắt Đầu</label>
                  <Input
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Kết Thúc</label>
                  <Input
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Địa Điểm / Studio</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDeleteShift(editingShift.id)}
                  className="gap-1.5 text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa Ca Live
                </Button>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingShift(null)}>Hủy</Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Lưu Thay Đổi</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Manual Entry of Actual Live Results */}
      {isResultModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Nhập Thủ Công Dữ Liệu GMV & View Thực Tế
              </h3>
              <button onClick={() => setIsResultModalOpen(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveActualResults} className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <p className="font-bold">{isResultModalOpen.talentName} - {isResultModalOpen.brandName}</p>
                <p className="text-[11px] text-slate-500">Ca live ngày {isResultModalOpen.date} ({isResultModalOpen.startTime} - {isResultModalOpen.endTime})</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">GMV Thực Tế Bán Được (VND)</label>
                <Input
                  required
                  type="number"
                  placeholder="45000000"
                  value={resultForm.actualGmv}
                  onChange={(e) => setResultForm({ ...resultForm, actualGmv: e.target.value })}
                  className="font-bold text-emerald-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tổng Lượt Xem (Views)</label>
                  <Input
                    type="number"
                    placeholder="18500"
                    value={resultForm.actualViews}
                    onChange={(e) => setResultForm({ ...resultForm, actualViews: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mắt Xem Đỉnh Điểm (Peak)</label>
                  <Input
                    type="number"
                    placeholder="1250"
                    value={resultForm.peakConcurrent}
                    onChange={(e) => setResultForm({ ...resultForm, peakConcurrent: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsResultModalOpen(null)}>Hủy</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Lưu GMV & Hoàn Thành Ca</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
