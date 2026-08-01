"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TalentBadge } from "@/components/talents/talent-badge";
import { TalentMediaGallery } from "@/components/talents/talent-media-gallery";
import { useCrmStore } from "@/lib/store";
import { Talent, TalentType, TalentMedia, PlatformType } from "@/types";
import { formatVND, formatNumber, compressImageFile, getChannelUrl } from "@/lib/utils";
import { PREDEFINED_CATEGORIES } from "@/app/(dashboard)/talents/page";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import {
  ArrowLeft,
  Star,
  Phone,
  Mail,
  Tv,
  History,
  Tag,
  ShieldAlert,
  BarChart2,
  CheckCircle,
  Lock,
  MessageSquare,
  PhoneCall,
  ExternalLink,
  Pencil,
  X,
  Users,
  Check,
  Upload,
  FolderOpen,
  Video as VideoIcon,
  Trash2,
  PackageCheck,
} from "lucide-react";

export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const talentId = params?.id as string;

  const { talents, shifts, campaigns, brands, skus, currentUser, updateTalent, addShift } = useCrmStore();
  const talent = talents.find((t) => t.id === talentId);

  const canContactTalent = currentUser?.role === "ADMIN" || currentUser?.permissions?.contactTalent;
  const canEdit = currentUser?.role === "ADMIN" || currentUser?.permissions?.manageTalents;

  const [notification, setNotification] = useState<CustomNotification | null>(null);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    campaignId: campaigns[0]?.id || "",
    platform: "TIKTOK_LIVE" as PlatformType,
    location: "Studio 1 - Q7",
    date: "2026-08-05",
    startTime: "09:00",
    endTime: "12:00",
    selectedSkuIds: [] as string[],
    scriptUrl: "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
  });

  const handleOpenBookingModal = () => {
    const defaultCamp = campaigns[0];
    const brandSkus = skus.filter((s) => s.brandId === defaultCamp?.brandId);
    setBookingForm({
      campaignId: defaultCamp?.id || "",
      platform: "TIKTOK_LIVE",
      location: "Studio 1 - Q7",
      date: "2026-08-05",
      startTime: "09:00",
      endTime: "12:00",
      selectedSkuIds: brandSkus.map((s) => s.id),
      scriptUrl: defaultCamp?.scriptUrl || "https://docs.google.com/document/d/1aura-glow-mega-sale-script/edit",
    });
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCamp = campaigns.find((c) => c.id === bookingForm.campaignId) || campaigns[0];
    if (!selectedCamp || !talent) return;

    const assignedSkusList = skus.filter((s) => bookingForm.selectedSkuIds.includes(s.id));

    addShift({
      campaignId: selectedCamp.id,
      campaignName: selectedCamp.campaignName,
      brandName: selectedCamp.brandName,
      talentId: talent.id,
      talentName: talent.stageName,
      talentType: talent.talentType,
      platform: bookingForm.platform,
      location: bookingForm.location,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      shiftStatus: "CONFIRMED",
      assignedSkus: assignedSkusList,
      actualGmv: 0,
      actualViews: 0,
      peakConcurrent: 0,
      scriptUrl: bookingForm.scriptUrl,
    });

    setIsBookingModalOpen(false);
    setNotification({
      type: "success",
      title: "Booking Talent Thành Công",
      message: `Đã gán thành công Talent ${talent.stageName} vào chiến dịch ${selectedCamp.campaignName}! Ca live đã tự động lên lịch.`,
    });
  };

  const toggleBookingSkuSelection = (skuId: string) => {
    setBookingForm((prev) => {
      const exists = prev.selectedSkuIds.includes(skuId);
      if (exists) {
        return { ...prev, selectedSkuIds: prev.selectedSkuIds.filter((id) => id !== skuId) };
      } else {
        return { ...prev, selectedSkuIds: [...prev.selectedSkuIds, skuId] };
      }
    });
  };

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    stageName: "",
    talentType: "HOST" as TalentType,
    phone: "",
    email: "",
    zalo: "",
    address: "",
    avatarUrl: "",
    selectedCategories: [] as string[],
    tags: "",
    internalRating: "5.0",
    avgGmvPerHour: "30000000",
    fixedRatePerShift: "2500000",
    videoRate: "5000000",
    affiliateCommission: "10",
    exclusivityBrands: "",
    tiktokHandle: "",
    tiktokFollowers: "200000",
    tiktokViews: "15000",
    shopeeHandle: "",
    shopeeFollowers: "100000",
    bankName: "MB Bank",
    accountNumber: "999988886666",
    taxCode: "0319998881",
  });

  // Modal Media Upload State
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [modalMediaList, setModalMediaList] = useState<TalentMedia[]>([]);
  const [uploadType, setUploadType] = useState<"IMAGE_GMV" | "VIDEO_LIVE">("IMAGE_GMV");
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaGmv, setMediaGmv] = useState("50000000");
  const [mediaDate, setMediaDate] = useState("2026-08-01");
  const [mediaPlatform, setMediaPlatform] = useState<PlatformType>("TIKTOK_LIVE");
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>("");

  if (!talent) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Không Tìm Thấy Hồ Sơ Talent</h3>
        <p className="text-xs text-slate-500">Mã Talent không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
        <Button onClick={() => router.push("/talents")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleOpenEditModal = () => {
    const tiktok = talent.channels?.find((c) => c.platform === "TIKTOK_LIVE");
    const shopee = talent.channels?.find((c) => c.platform === "SHOPEE_LIVE");

    setModalMediaList(talent.mediaList || []);
    setSelectedMediaFile(null);
    setMediaPreviewUrl("");
    setMediaTitle("");

    setFormData({
      fullName: talent.fullName,
      stageName: talent.stageName,
      talentType: talent.talentType,
      phone: talent.phone,
      email: talent.email || "",
      zalo: talent.zalo || talent.phone,
      address: talent.address || "",
      avatarUrl: talent.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      selectedCategories: talent.categories.length > 0 ? talent.categories : ["Thời trang"],
      tags: talent.tags.join(", "),
      internalRating: talent.internalRating.toString(),
      avgGmvPerHour: talent.avgGmvPerHour.toString(),
      fixedRatePerShift: talent.fixedRatePerShift.toString(),
      videoRate: talent.videoRate.toString(),
      affiliateCommission: talent.affiliateCommission.toString(),
      exclusivityBrands: talent.exclusivityBrands.join(", "),
      tiktokHandle: tiktok?.handle || `@${talent.stageName.toLowerCase().replace(/\s+/g, "")}`,
      tiktokFollowers: tiktok?.followers.toString() || "200000",
      tiktokViews: tiktok?.avgViews.toString() || "15000",
      shopeeHandle: shopee?.handle || `${talent.stageName.toLowerCase().replace(/\s+/g, "")}_official`,
      shopeeFollowers: shopee?.followers.toString() || "100000",
      bankName: "MB Bank",
      accountNumber: "999988886666",
      taxCode: talent.taxCode || "0319998881",
    });

    setIsEditModalOpen(true);
  };

  const toggleCategorySelection = (categoryName: string) => {
    if (formData.selectedCategories.includes(categoryName)) {
      setFormData({
        ...formData,
        selectedCategories: formData.selectedCategories.filter((c) => c !== categoryName),
      });
    } else {
      setFormData({
        ...formData,
        selectedCategories: [...formData.selectedCategories, categoryName],
      });
    }
  };

  const handleModalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedMediaFile(file);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    if (!mediaTitle) {
      setMediaTitle(nameWithoutExt);
    }

    if (file.type.startsWith("image/")) {
      const compressedUrl = await compressImageFile(file, 800, 0.75);
      setMediaPreviewUrl(compressedUrl);
    } else if (file.type.startsWith("video/")) {
      const videoBlobUrl = URL.createObjectURL(file);
      setMediaPreviewUrl(videoBlobUrl);
    }
  };

  const handleAddMediaToTalent = () => {
    if (!mediaPreviewUrl) return;

    const newMediaItem: TalentMedia = {
      id: `med-${Date.now()}`,
      type: uploadType,
      title: mediaTitle || selectedMediaFile?.name || "Media mới",
      url: mediaPreviewUrl,
      thumbnailUrl:
        uploadType === "VIDEO_LIVE"
          ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
          : mediaPreviewUrl,
      gmvAmount: mediaGmv ? parseFloat(mediaGmv) : undefined,
      sessionDate: mediaDate,
      platform: mediaPlatform,
    };

    setModalMediaList((prev) => [newMediaItem, ...prev]);
    setSelectedMediaFile(null);
    setMediaPreviewUrl("");
    setMediaTitle("");
  };

  const handleSaveTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.stageName) return;

    const categories = formData.selectedCategories.length > 0 ? formData.selectedCategories : ["Thời trang"];
    const tags = formData.tags ? formData.tags.split(",").map((s) => s.trim()) : ["Chốt đơn nhanh"];
    const exclusivity = formData.exclusivityBrands
      ? formData.exclusivityBrands.split(",").map((s) => s.trim())
      : [];

    const channels = [
      {
        platform: "TIKTOK_LIVE" as const,
        handle: formData.tiktokHandle || `@${formData.stageName.toLowerCase().replace(/\s+/g, "")}`,
        followers: parseInt(formData.tiktokFollowers) || 200000,
        avgViews: parseInt(formData.tiktokViews) || 15000,
      },
      {
        platform: "SHOPEE_LIVE" as const,
        handle: formData.shopeeHandle || `${formData.stageName.toLowerCase().replace(/\s+/g, "")}_official`,
        followers: parseInt(formData.shopeeFollowers) || 100000,
        avgViews: 8000,
      },
    ];

    let finalMediaList = [...modalMediaList];
    if (mediaPreviewUrl) {
      const currentPendingMedia: TalentMedia = {
        id: `med-${Date.now()}`,
        type: uploadType,
        title: mediaTitle || selectedMediaFile?.name || "Media mới",
        url: mediaPreviewUrl,
        thumbnailUrl:
          uploadType === "VIDEO_LIVE"
            ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
            : mediaPreviewUrl,
        gmvAmount: mediaGmv ? parseFloat(mediaGmv) : undefined,
        sessionDate: mediaDate,
        platform: mediaPlatform,
      };
      finalMediaList.push(currentPendingMedia);
    }

    updateTalent(talent.id, {
      fullName: formData.fullName,
      stageName: formData.stageName,
      talentType: formData.talentType,
      phone: formData.phone,
      email: formData.email,
      zalo: formData.zalo,
      address: formData.address,
      avatarUrl: formData.avatarUrl,
      categories: categories,
      tags: tags,
      channels: channels,
      internalRating: parseFloat(formData.internalRating) || 5.0,
      avgGmvPerHour: parseFloat(formData.avgGmvPerHour) || 0,
      fixedRatePerShift: parseFloat(formData.fixedRatePerShift) || 0,
      videoRate: parseFloat(formData.videoRate) || 0,
      affiliateCommission: parseFloat(formData.affiliateCommission) || 0,
      exclusivityBrands: exclusivity,
      taxCode: formData.taxCode,
      mediaList: finalMediaList,
    });

    setIsEditModalOpen(false);
  };

  // Get all shifts for this talent
  const talentShifts = shifts.filter((s) => s.talentId === talent.id);
  const completedShifts = talentShifts.filter((s) => s.actualGmv > 0 || s.shiftStatus === "COMPLETED");

  const totalGmvGenerated = completedShifts.reduce((sum, s) => sum + (s.actualGmv || 0), 0) || (talent.avgGmvPerHour * 3.5);
  const totalCommissionEarned = totalGmvGenerated * (talent.affiliateCommission / 100);

  const zaloNumber = talent.zalo || talent.phone;
  const zaloUrl = `https://zalo.me/${zaloNumber.replace(/\s+/g, "")}`;

  return (
    <div className="space-y-6">
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Back Navigation & Header Buttons Toolbar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/talents")}
          className="gap-2 text-xs font-semibold border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          Quay Lại Danh Sách Talent
        </Button>

        <div className="flex items-center gap-2.5">
          {/* Edit Profile Button */}
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenEditModal}
              className="gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 text-xs font-bold shadow-xs h-9"
            >
              <Pencil className="w-4 h-4 text-indigo-600" />
              Chỉnh Sửa Hồ Sơ
            </Button>
          )}

          {canContactTalent ? (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Chat Zalo
              <ExternalLink className="w-3 h-3 opacity-80 ml-0.5" />
            </a>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Chưa Cấp Quyền Liên Hệ
            </span>
          )}

          {/* Booking Button (Phía Sau Nút Zalo) */}
          {canEdit && (
            <Button
              size="sm"
              onClick={handleOpenBookingModal}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs h-9"
            >
              <PackageCheck className="w-4 h-4" />
              Thêm Vào Chiến Dịch
            </Button>
          )}

          <span className="text-xs text-slate-500 font-medium ml-2">
            Mã Hồ Sơ CRM: <code className="font-mono font-bold text-indigo-600">{talent.id}</code>
          </span>
        </div>
      </div>

      {/* Header Profile Banner */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={talent.avatarUrl}
                alt={talent.stageName}
                className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500 shadow-xl"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{talent.stageName}</h1>
                  <TalentBadge type={talent.talentType} />
                </div>
                <p className="text-sm text-slate-300 font-medium">{talent.fullName}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" /> {talent.internalRating} / 5.0 Rating
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    {canContactTalent ? (
                      <b className="text-white">{talent.phone}</b>
                    ) : (
                      <span className="text-slate-400 italic">0987***321 (Đã khóa)</span>
                    )}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    {canContactTalent ? (
                      <b className="text-white">{talent.email || "N/A"}</b>
                    ) : (
                      <span className="text-slate-400 italic">trang***@agency.vn (Đã khóa)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Performance Summary Badge */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full md:w-auto justify-around md:justify-end">
              <div className="text-center px-3">
                <span className="text-[10px] text-slate-300 uppercase font-semibold block">Ca Live Đã Thực Hiện</span>
                <span className="text-lg font-bold text-emerald-400">{completedShifts.length || 4} Ca</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center px-3">
                <span className="text-[10px] text-slate-300 uppercase font-semibold block">Tổng GMV Tạo Ra</span>
                <span className="text-lg font-bold text-indigo-300">{formatVND(totalGmvGenerated)}</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center px-3">
                <span className="text-[10px] text-slate-300 uppercase font-semibold block">Hoa Hồng Thu Về</span>
                <span className="text-lg font-bold text-sky-400">{formatVND(totalCommissionEarned)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Section 1: Detailed Profile Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Channel Followers & Reach */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Tv className="w-4 h-4 text-indigo-600" />
              Chỉ Số Kênh Livestream
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {talent.channels.map((ch, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-indigo-600 font-extrabold">{ch.platform}</span>
                  <a
                    href={getChannelUrl(ch.platform, ch.handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Mở trang kênh ${ch.platform} (${ch.handle})`}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold transition-colors"
                  >
                    {ch.handle}
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500 opacity-80" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Followers: <b className="text-slate-900 dark:text-white">{formatNumber(ch.followers)}</b></span>
                  <span>Avg Views: <b className="text-slate-900 dark:text-white">{formatNumber(ch.avgViews)}</b></span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 2: Rate Card & Benchmarks */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              GMV Lịch Sử & Rate Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20">
              <span className="text-[10px] text-indigo-600 font-bold uppercase block">GMV Lịch Sử Trung Bình / Giờ</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{formatVND(talent.avgGmvPerHour)}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Dùng để lọc matching nhu cầu chiến dịch của Brand</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 font-semibold block">Phí Cast / Ca</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatVND(talent.fixedRatePerShift)}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 font-semibold block">% Hoa Hồng Affiliate</span>
                <span className="font-bold text-emerald-600">{talent.affiliateCommission}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Categories & Skill Tags & Tax */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              Ngành Hàng & Thông Tin Khác
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Ngành Hàng Mạnh:</span>
              <div className="flex flex-wrap gap-1">
                {talent.categories.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Skill Tags Phong Cách:</span>
              <div className="flex flex-wrap gap-1">
                {talent.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {talent.exclusivityBrands.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Độc quyền: <b>{talent.exclusivityBrands.join(", ")}</b></span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: Talent Media Gallery & GMV Proof Showcase */}
      <TalentMediaGallery talentId={talent.id} mediaList={talent.mediaList} />

      {/* SECTION 3: Campaign History & Performance Activity Log Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              Lịch Sử Hoạt Động & Hiệu Quả Chiến Dịch Đã Tham Gia ({talentShifts.length || 4})
            </span>
            <span className="text-xs text-slate-500 font-normal">Tự động lưu từ kết quả ca live thực tế</span>
          </CardTitle>
          <CardDescription>
            Click trực tiếp vào <b>Tên Chiến Dịch</b> để mở xem thông tin chi tiết của chiến dịch booking tương ứng
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="p-3 text-center w-12">STT</th>
                <th className="p-3">Chiến Dịch & Nền Tảng</th>
                <th className="p-3">Thương Hiệu (Brand)</th>
                <th className="p-3">Địa Điểm Studio</th>
                <th className="p-3">Khung Giờ Live</th>
                <th className="p-3 text-right">GMV Đạt Được</th>
                <th className="p-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {talentShifts.map((shift, idx) => (
                <tr key={shift.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3">
                    <Link href={`/campaigns/${shift.campaignId}`} className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 hover:underline">
                      {shift.campaignName}
                    </Link>
                    <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">{shift.platform}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{shift.brandName}</td>
                  <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{shift.location}</td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{shift.date}</div>
                    <div className="text-[10px] text-slate-400">{shift.startTime} - {shift.endTime}</div>
                  </td>
                  <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    {formatVND(shift.actualGmv || 45000000)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Hoàn Thành
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* EDIT TALENT PROFILE POPUP MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] !mt-0 !top-0 !left-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-600" />
                Chỉnh Sửa Hồ Sơ Talent: {talent.stageName}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTalent} className="space-y-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  1. Thông Tin Cá Nhân & Liên Hệ
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Họ và Tên Thật</label>
                    <Input
                      required
                      placeholder="Nguyễn Thu Trang"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nghệ Danh / Channel</label>
                    <Input
                      required
                      placeholder="Trang Hí Live"
                      value={formData.stageName}
                      onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Loại Talent</label>
                    <select
                      value={formData.talentType}
                      onChange={(e) => setFormData({ ...formData, talentType: e.target.value as TalentType })}
                      className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-medium"
                    >
                      <option value="HOST">Host</option>
                      <option value="KOC">KOC</option>
                      <option value="KOL">KOL</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số Điện Thoại</label>
                    <Input
                      placeholder="0987654321"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Liên Hệ</label>
                    <Input
                      placeholder="trang.nguyen@agency.vn"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Zalo / Telegram</label>
                    <Input
                      placeholder="0987654321"
                      value={formData.zalo}
                      onChange={(e) => setFormData({ ...formData, zalo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Địa Chỉ / Studio Trực Thuộc</label>
                    <Input
                      placeholder="Studio 1 - Quận 7, TP. HCM"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đường Dẫn Ảnh Đại Diện (Avatar URL)</label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-indigo-600" />
                  2. Kênh Mạng Xã Hội (TikTok / Shopee)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Handle TikTok Live</label>
                    <Input
                      placeholder="@tranghilive"
                      value={formData.tiktokHandle}
                      onChange={(e) => setFormData({ ...formData, tiktokHandle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Followers TikTok</label>
                    <Input
                      type="number"
                      placeholder="450000"
                      value={formData.tiktokFollowers}
                      onChange={(e) => setFormData({ ...formData, tiktokFollowers: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Avg Views TikTok</label>
                    <Input
                      type="number"
                      placeholder="12000"
                      value={formData.tiktokViews}
                      onChange={(e) => setFormData({ ...formData, tiktokViews: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Handle Shopee Live</label>
                    <Input
                      placeholder="tranghi_official"
                      value={formData.shopeeHandle}
                      onChange={(e) => setFormData({ ...formData, shopeeHandle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Followers Shopee</label>
                    <Input
                      type="number"
                      placeholder="180000"
                      value={formData.shopeeFollowers}
                      onChange={(e) => setFormData({ ...formData, shopeeFollowers: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-600" />
                  3. Chỉ Số GMV Lịch Sử & Rate Card
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">GMV Lịch Sử TB / Giờ (VNĐ)</label>
                    <Input
                      type="number"
                      placeholder="45000000"
                      value={formData.avgGmvPerHour}
                      onChange={(e) => setFormData({ ...formData, avgGmvPerHour: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phí Cast Trực Tiếp / Ca (VNĐ)</label>
                    <Input
                      type="number"
                      placeholder="2500000"
                      value={formData.fixedRatePerShift}
                      onChange={(e) => setFormData({ ...formData, fixedRatePerShift: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">% Hoa Hồng Affiliate Target</label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={formData.affiliateCommission}
                      onChange={(e) => setFormData({ ...formData, affiliateCommission: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Rating Đánh Giá Nội Bộ (1.0 - 5.0)</label>
                    <Input
                      placeholder="4.9"
                      value={formData.internalRating}
                      onChange={(e) => setFormData({ ...formData, internalRating: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  4. Ngành Hàng & Skill Tags
                </h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngành Hàng Thế Mạnh (Chọn nhiều)</label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900">
                    {PREDEFINED_CATEGORIES.map((cat) => {
                      const isSelected = formData.selectedCategories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => toggleCategorySelection(cat)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Skill Tags Phong Cách Live</label>
                  <Input
                    placeholder="Chốt đơn nhanh, Năng lượng cao, Cực duyên"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  5. Độc Quyền Brand & Thông Tin Ngân Hàng
                </h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thương Hiệu Độc Quyền Hạn Chế</label>
                  <Input
                    placeholder="Ví dụ: Brand CosmeA, Brand PhoneX"
                    value={formData.exclusivityBrands}
                    onChange={(e) => setFormData({ ...formData, exclusivityBrands: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số Tài Khoản Ngân Hàng</label>
                    <Input
                      placeholder="999988886666"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mã Số Thuế Cá Nhân</label>
                    <Input
                      placeholder="0319998881"
                      value={formData.taxCode}
                      onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 6. UPLOAD MEDIA BẰNG CHỨNG GMV & VIDEO PHIÊN LIVE FROM COMPUTER */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  6. Upload Media & Bằng Chứng GMV / Video Phiên Live (Chọn Tệp Máy Tính)
                </h4>

                <input
                  ref={modalFileInputRef}
                  type="file"
                  accept={uploadType === "IMAGE_GMV" ? "image/*" : "video/*"}
                  onChange={handleModalFileSelect}
                  className="hidden"
                />

                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadType("IMAGE_GMV")}
                      className={`p-2 rounded-lg border font-bold text-center transition-all text-xs flex items-center justify-center gap-1.5 ${
                        uploadType === "IMAGE_GMV"
                          ? "bg-indigo-50 border-indigo-500 text-indigo-900"
                          : "bg-white border-slate-200 text-slate-600"
                      }`}
                    >
                      📸 Ảnh GMV ({modalMediaList.filter((m) => m.type === "IMAGE_GMV").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType("VIDEO_LIVE")}
                      className={`p-2 rounded-lg border font-bold text-center transition-all text-xs flex items-center justify-center gap-1.5 ${
                        uploadType === "VIDEO_LIVE"
                          ? "bg-red-50 border-red-500 text-red-900"
                          : "bg-white border-slate-200 text-slate-600"
                      }`}
                    >
                      🎥 Video Live ({modalMediaList.filter((m) => m.type === "VIDEO_LIVE").length})
                    </button>
                  </div>

                  {!selectedMediaFile ? (
                    <div
                      onClick={() => modalFileInputRef.current?.click()}
                      className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-white dark:bg-slate-950 rounded-xl p-4 text-center cursor-pointer transition-all space-y-1"
                    >
                      <FolderOpen className="w-5 h-5 text-indigo-600 mx-auto" />
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Bấm để chọn {uploadType === "IMAGE_GMV" ? "Ảnh GMV" : "Video Live"} từ Máy Tính
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {uploadType === "IMAGE_GMV" ? "File ảnh: .PNG, .JPG, .WEBP" : "File video: .MP4, .WEBM, .MOV"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-8 h-8 rounded overflow-hidden bg-slate-900 shrink-0 flex items-center justify-center">
                            {uploadType === "IMAGE_GMV" && mediaPreviewUrl ? (
                              <img src={mediaPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <VideoIcon className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-emerald-900 text-xs truncate">{selectedMediaFile.name}</p>
                            <p className="text-[10px] text-emerald-700">{(selectedMediaFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMediaFile(null);
                            setMediaPreviewUrl("");
                          }}
                          className="text-xs text-red-600 font-bold px-2 py-1 hover:bg-red-100 rounded"
                        >
                          Đổi Tệp
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Tiêu đề tệp"
                          value={mediaTitle}
                          onChange={(e) => setMediaTitle(e.target.value)}
                          className="text-xs h-8 col-span-1"
                        />
                        <Input
                          type="number"
                          placeholder="Doanh số GMV"
                          value={mediaGmv}
                          onChange={(e) => setMediaGmv(e.target.value)}
                          className="text-xs h-8 col-span-1"
                        />
                        <Button
                          type="button"
                          onClick={handleAddMediaToTalent}
                          disabled={!mediaPreviewUrl}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs col-span-1"
                        >
                          + Thêm Media
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* LIST OF ATTACHED MEDIA ITEMS IN THIS MODAL */}
                  {modalMediaList.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span>Danh Sách Media Đã Chọn Đính Kèm ({modalMediaList.length}):</span>
                        <span className="text-[10px] text-indigo-600 font-semibold">
                          {modalMediaList.filter((m) => m.type === "IMAGE_GMV").length} Ảnh GMV • {modalMediaList.filter((m) => m.type === "VIDEO_LIVE").length} Video Live
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                        {modalMediaList.map((m) => (
                          <div
                            key={m.id}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${m.type === "IMAGE_GMV" ? "bg-indigo-100 text-indigo-800" : "bg-red-100 text-red-800"}`}>
                                {m.type === "IMAGE_GMV" ? "ẢNH GMV" : "VIDEO LIVE"}
                              </span>
                              <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{m.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setModalMediaList((prev) => prev.filter((item) => item.id !== m.id))}
                              className="text-red-500 hover:text-red-700 p-1 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Hủy Thao Tác
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                  Cập Nhật Hồ Sơ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING TALENT TO CAMPAIGN MODAL */}
      {isBookingModalOpen && talent && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] !mt-0 !top-0 !left-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-indigo-600" />
                  Booking Talent: {talent.stageName} ({talent.talentType})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Xếp ca live và gán Talent vào chiến dịch booking của Brand</p>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">1. Chọn Chiến Dịch Booking</label>
                <select
                  value={bookingForm.campaignId}
                  onChange={(e) => {
                    const campId = e.target.value;
                    const selectedC = campaigns.find((c) => c.id === campId);
                    const brandSkus = skus.filter((s) => s.brandId === selectedC?.brandId);
                    setBookingForm({
                      ...bookingForm,
                      campaignId: campId,
                      selectedSkuIds: brandSkus.map((s) => s.id),
                      scriptUrl: selectedC?.scriptUrl || bookingForm.scriptUrl,
                    });
                  }}
                  className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-indigo-600"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.campaignName} (Brand: {c.brandName} - KPI GMV: {formatVND(c.targetGmv)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày Live</label>
                  <Input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ Bắt Đầu</label>
                  <Input
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ Kết Thúc</label>
                  <Input
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Platform Kênh Live</label>
                  <select
                    value={bookingForm.platform}
                    onChange={(e) => setBookingForm({ ...bookingForm, platform: e.target.value as PlatformType })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-medium"
                  >
                    <option value="TIKTOK_LIVE">TikTok Live</option>
                    <option value="SHOPEE_LIVE">Shopee Live</option>
                    <option value="FACEBOOK_LIVE">Facebook Live</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Địa Điểm / Studio Trực</label>
                  <Input
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">2. File Kịch Bản Livestream (URL Google Docs / Drive)</label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={bookingForm.scriptUrl}
                  onChange={(e) => setBookingForm({ ...bookingForm, scriptUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Chọn SKU Sản Phẩm Đẩy Deal Ca Live
                </label>
                <div className="space-y-1.5 p-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 max-h-40 overflow-y-auto">
                  {skus.filter((s) => s.brandId === (campaigns.find((c) => c.id === bookingForm.campaignId)?.brandId || campaigns[0]?.brandId)).length > 0 ? (
                    skus
                      .filter((s) => s.brandId === (campaigns.find((c) => c.id === bookingForm.campaignId)?.brandId || campaigns[0]?.brandId))
                      .map((sku) => {
                        const isSelected = bookingForm.selectedSkuIds.includes(sku.id);
                        return (
                          <div
                            key={sku.id}
                            onClick={() => toggleBookingSkuSelection(sku.id)}
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

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Xác Nhận Booking Ca Live
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
