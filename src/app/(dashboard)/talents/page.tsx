"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TalentBadge } from "@/components/talents/talent-badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCrmStore } from "@/lib/store";
import { Talent, TalentType, TalentMedia, TalentChannel, PlatformType } from "@/types";
import { formatVND, formatNumber, compressImageFile, getChannelUrl } from "@/lib/utils";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Star,
  ShieldAlert,
  Eye,
  Pencil,
  Trash2,
  X,
  Users,
  Check,
  Download,
  Upload,
  FileSpreadsheet,
  Tv,
  CreditCard,
  Tag,
  History,
  FolderOpen,
  Video as VideoIcon,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

export const PREDEFINED_CATEGORIES = [
  "Thời trang",
  "Mỹ phẩm",
  "Mẹ & Bé",
  "Gia dụng",
  "Công nghệ",
  "FMCG",
  "Lifestyle",
];

export default function TalentsPage() {
  const router = useRouter();
  const { talents, addTalent, updateTalent, deleteTalent } = useCrmStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [gmvFilterRange, setGmvFilterRange] = useState<string>("ALL");
  const [castFilterRange, setCastFilterRange] = useState<string>("ALL");

  // Selection State
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);

  // Dialog Modals State
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null);

  // Media Upload State inside Add/Edit Modal
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [modalMediaList, setModalMediaList] = useState<TalentMedia[]>([]);
  const [uploadType, setUploadType] = useState<"IMAGE_GMV" | "VIDEO_LIVE">("IMAGE_GMV");
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaGmv, setMediaGmv] = useState("50000000");
  const [mediaDate, setMediaDate] = useState("2026-08-01");
  const [mediaPlatform, setMediaPlatform] = useState<PlatformType>("TIKTOK_LIVE");
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>("");

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

  // Form State for Add / Edit
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
    avgGmvPerHour: "",
    fixedRatePerShift: "",
    videoRate: "",
    affiliateCommission: "",
    exclusivityBrands: "",
    // Social channels
    tiktokHandle: "",
    tiktokFollowers: "",
    tiktokViews: "",
    shopeeHandle: "",
    shopeeFollowers: "",
    // Bank & Tax
    bankName: "",
    accountNumber: "",
    taxCode: "",
  });

  // Filter Logic
  const filteredTalents = talents.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery);

    const matchesType = selectedType === "ALL" || t.talentType === selectedType;

    const matchesCategory =
      selectedCategory === "ALL" ||
      t.categories.some((c) => c.toLowerCase().includes(selectedCategory.toLowerCase()));

    let matchesGmv = true;
    if (gmvFilterRange === "UNDER_30M") matchesGmv = t.avgGmvPerHour < 30000000;
    else if (gmvFilterRange === "30M_70M") matchesGmv = t.avgGmvPerHour >= 30000000 && t.avgGmvPerHour <= 70000000;
    else if (gmvFilterRange === "ABOVE_70M") matchesGmv = t.avgGmvPerHour > 70000000;

    let matchesCast = true;
    if (castFilterRange === "UNDER_3M") matchesCast = t.fixedRatePerShift < 3000000;
    else if (castFilterRange === "3M_10M") matchesCast = t.fixedRatePerShift >= 3000000 && t.fixedRatePerShift <= 10000000;
    else if (castFilterRange === "ABOVE_10M") matchesCast = t.fixedRatePerShift > 10000000;

    return matchesSearch && matchesType && matchesCategory && matchesGmv && matchesCast;
  });

  // Select / Deselect Logic
  const isAllFilteredSelected =
    filteredTalents.length > 0 &&
    filteredTalents.every((t) => selectedTalentIds.includes(t.id));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredIds = filteredTalents.map((t) => t.id);
      setSelectedTalentIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredTalents.map((t) => t.id);
      setSelectedTalentIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedTalentIds.includes(id)) {
      setSelectedTalentIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedTalentIds((prev) => [...prev, id]);
    }
  };

  // CSV Template Download
  const handleDownloadSampleCSV = () => {
    const csvHeader = "\uFEFFSTT,Họ và Tên,Nghệ Danh,Loại Talent (HOST/KOC/KOL/HYBRID),Số Điện Thoại,Email,Ngành Hàng,GMV Lịch Sử/h (VND),Phí Cast/Ca (VND),% Hoa Hồng,Độc Quyền\n";
    const sampleRows =
      "1,Nguyễn Văn A,An Live Shop,HOST,0987654321,ana@agency.vn,\"Thời trang, Mỹ phẩm\",35000000,2500000,10,Brand CosmeA\n" +
      "2,Trần Thị B,Bich Review,KOC,0912345678,bich@koc.vn,\"Gia dụng, Công nghệ\",25000000,3000000,12,\n";

    const blob = new Blob([csvHeader + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Talents_Sample_Template.csv";
    link.click();
  };

  // CSV Export Function
  const handleExportCSV = () => {
    const targetList =
      selectedTalentIds.length > 0
        ? talents.filter((t) => selectedTalentIds.includes(t.id))
        : filteredTalents;

    let csvContent = "\uFEFFSTT,Họ và Tên,Nghệ Danh,Loại Talent,Số Điện Thoại,Email,Ngành Hàng,GMV Lịch Sử/h (VND),Phí Cast/Ca (VND),% Hoa Hồng,Độc Quyền\n";

    targetList.forEach((t, idx) => {
      const row = [
        idx + 1,
        `"${t.fullName.replace(/"/g, '""')}"`,
        `"${t.stageName.replace(/"/g, '""')}"`,
        t.talentType,
        `"${t.phone}"`,
        `"${t.email || ""}"`,
        `"${t.categories.join(", ")}"`,
        t.avgGmvPerHour,
        t.fixedRatePerShift,
        t.affiliateCommission,
        `"${t.exclusivityBrands.join(", ")}"`,
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Talents_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // CSV Import Function
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").filter((l) => l.trim() !== "");
      if (lines.length <= 1) return;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        if (cols.length >= 4) {
          const fullName = cols[1] || "Talent Mới";
          const stageName = cols[2] || fullName;
          const rawType = (cols[3] || "HOST").toUpperCase();
          const talentType: TalentType = ["HOST", "KOC", "KOL", "HYBRID"].includes(rawType)
            ? (rawType as TalentType)
            : "HOST";

          addTalent({
            fullName: fullName,
            stageName: stageName,
            talentType: talentType,
            phone: cols[4] || "",
            email: cols[5] || "",
            address: "",
            avatarUrl: "",
            categories: cols[6] ? cols[6].split(";").map((s) => s.trim()).filter(Boolean) : [],
            tags: [],
            channels: [],
            internalRating: 5.0,
            avgGmvPerHour: parseFloat(cols[7]) || 0,
            avgViewsPerVideo: 0,
            fixedRatePerShift: parseFloat(cols[8]) || 0,
            videoRate: 0,
            affiliateCommission: parseFloat(cols[9]) || 0,
            exclusivityBrands: cols[10] ? cols[10].split(";").map((s) => s.trim()).filter(Boolean) : [],
            status: "AVAILABLE",
          });
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const toggleCategorySelection = (cat: string) => {
    if (formData.selectedCategories.includes(cat)) {
      setFormData({
        ...formData,
        selectedCategories: formData.selectedCategories.filter((c) => c !== cat),
      });
    } else {
      setFormData({
        ...formData,
        selectedCategories: [...formData.selectedCategories, cat],
      });
    }
  };

  const handleOpenAddModal = () => {
    setEditingTalent(null);
    setModalMediaList([]);
    setSelectedMediaFile(null);
    setMediaPreviewUrl("");
    setMediaTitle("");

    setFormData({
      fullName: "",
      stageName: "",
      talentType: "HOST",
      phone: "",
      email: "",
      zalo: "",
      address: "",
      avatarUrl: "",
      selectedCategories: [],
      tags: "",
      internalRating: "5.0",
      avgGmvPerHour: "",
      fixedRatePerShift: "",
      videoRate: "",
      affiliateCommission: "",
      exclusivityBrands: "",
      tiktokHandle: "",
      tiktokFollowers: "",
      tiktokViews: "",
      shopeeHandle: "",
      shopeeFollowers: "",
      bankName: "",
      accountNumber: "",
      taxCode: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (talent: Talent) => {
    setEditingTalent(talent);
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
      phone: talent.phone || "",
      email: talent.email || "",
      zalo: talent.zalo || "",
      address: talent.address || "",
      avatarUrl: talent.avatarUrl || "",
      selectedCategories: talent.categories || [],
      tags: talent.tags ? talent.tags.join(", ") : "",
      internalRating: (talent.internalRating ?? 5.0).toString(),
      avgGmvPerHour: talent.avgGmvPerHour ? talent.avgGmvPerHour.toString() : "",
      fixedRatePerShift: talent.fixedRatePerShift ? talent.fixedRatePerShift.toString() : "",
      videoRate: talent.videoRate ? talent.videoRate.toString() : "",
      affiliateCommission: talent.affiliateCommission ? talent.affiliateCommission.toString() : "",
      exclusivityBrands: talent.exclusivityBrands ? talent.exclusivityBrands.join(", ") : "",
      tiktokHandle: tiktok?.handle || "",
      tiktokFollowers: tiktok?.followers ? tiktok.followers.toString() : "",
      tiktokViews: tiktok?.avgViews ? tiktok.avgViews.toString() : "",
      shopeeHandle: shopee?.handle || "",
      shopeeFollowers: shopee?.followers ? shopee.followers.toString() : "",
      bankName: talent.bankName || "",
      accountNumber: talent.accountNumber || "",
      taxCode: talent.taxCode || "",
    });
    setIsAddModalOpen(true);
  };

  const handleSaveTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.stageName) return;

    const categories = formData.selectedCategories;
    const tags = formData.tags ? formData.tags.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const exclusivity = formData.exclusivityBrands
      ? formData.exclusivityBrands.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const channels: TalentChannel[] = [];
    if (formData.tiktokHandle.trim()) {
      channels.push({
        platform: "TIKTOK_LIVE",
        handle: formData.tiktokHandle.trim(),
        followers: parseInt(formData.tiktokFollowers) || 0,
        avgViews: parseInt(formData.tiktokViews) || 0,
      });
    }
    if (formData.shopeeHandle.trim()) {
      channels.push({
        platform: "SHOPEE_LIVE",
        handle: formData.shopeeHandle.trim(),
        followers: parseInt(formData.shopeeFollowers) || 0,
        avgViews: 0,
      });
    }

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

    if (editingTalent) {
      updateTalent(editingTalent.id, {
        fullName: formData.fullName,
        stageName: formData.stageName,
        talentType: formData.talentType,
        phone: formData.phone || "",
        email: formData.email || "",
        zalo: formData.zalo || "",
        address: formData.address || "",
        avatarUrl: formData.avatarUrl || "",
        categories: categories,
        tags: tags,
        channels: channels,
        internalRating: parseFloat(formData.internalRating) || 5.0,
        avgGmvPerHour: parseFloat(formData.avgGmvPerHour) || 0,
        fixedRatePerShift: parseFloat(formData.fixedRatePerShift) || 0,
        videoRate: parseFloat(formData.videoRate) || 0,
        affiliateCommission: parseFloat(formData.affiliateCommission) || 0,
        exclusivityBrands: exclusivity,
        bankName: formData.bankName || "",
        accountNumber: formData.accountNumber || "",
        taxCode: formData.taxCode || "",
        mediaList: finalMediaList,
      });
      setEditingTalent(null);
      setIsAddModalOpen(false);
    } else {
      addTalent({
        fullName: formData.fullName,
        stageName: formData.stageName,
        talentType: formData.talentType,
        phone: formData.phone || "",
        email: formData.email || "",
        zalo: formData.zalo || "",
        address: formData.address || "",
        avatarUrl: formData.avatarUrl || "",
        categories: categories,
        tags: tags,
        channels: channels,
        internalRating: parseFloat(formData.internalRating) || 5.0,
        avgGmvPerHour: parseFloat(formData.avgGmvPerHour) || 0,
        avgViewsPerVideo: 0,
        fixedRatePerShift: parseFloat(formData.fixedRatePerShift) || 0,
        videoRate: parseFloat(formData.videoRate) || 0,
        affiliateCommission: parseFloat(formData.affiliateCommission) || 0,
        exclusivityBrands: exclusivity,
        bankName: formData.bankName || "",
        accountNumber: formData.accountNumber || "",
        taxCode: formData.taxCode || "",
        status: "AVAILABLE",
        mediaList: finalMediaList,
      });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSampleCSV}
            className="gap-1.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Tải CSV Mẫu
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            Import CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            Export CSV ({selectedTalentIds.length > 0 ? `Đã chọn ${selectedTalentIds.length}` : "Tất cả"})
          </Button>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Thêm Talent Mới
        </Button>
      </div>

      {/* Smart Filter Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm theo tên, nghệ danh, sđt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
            >
              <option value="ALL">Tất cả Ngành Hàng</option>
              {PREDEFINED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={gmvFilterRange}
              onChange={(e) => setGmvFilterRange(e.target.value)}
              className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
            >
              <option value="ALL">GMV Lịch Sử / Giờ</option>
              <option value="UNDER_30M">Dưới 30 Triệu/h</option>
              <option value="30M_70M">30 - 70 Triệu/h</option>
              <option value="ABOVE_70M">Trên 70 Triệu/h</option>
            </select>

            <select
              value={castFilterRange}
              onChange={(e) => setCastFilterRange(e.target.value)}
              className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
            >
              <option value="ALL">Mức Phí Cast / Ca</option>
              <option value="UNDER_3M">Dưới 3 Triệu/ca</option>
              <option value="3M_10M">3 - 10 Triệu/ca</option>
              <option value="ABOVE_10M">Trên 10 Triệu/ca</option>
            </select>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {["ALL", "HOST", "KOC", "KOL", "HYBRID"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedType === type
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {type === "ALL" ? "Tất cả" : type === "HOST" ? "Host" : type === "HYBRID" ? "Hybrid" : type}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table View */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Danh Sách Hồ Sơ Talent CRM ({filteredTalents.length})
            </span>

            {selectedTalentIds.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Đã chọn {selectedTalentIds.length} Talent
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Quản lý danh sách hồ sơ Talent, nghệ danh, thông tin liên hệ, GMV lịch sử và chi tiết mức phí cast
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead className="w-10 text-center whitespace-nowrap">
                  <Checkbox
                    checked={isAllFilteredSelected}
                    onCheckedChange={toggleSelectAllFiltered}
                    aria-label="Select All"
                  />
                </TableHead>
                <TableHead className="w-12 text-center font-bold whitespace-nowrap">STT</TableHead>
                <TableHead className="w-56 whitespace-nowrap">Talent</TableHead>
                <TableHead className="whitespace-nowrap">Loại Talent</TableHead>
                <TableHead className="whitespace-nowrap">Ngành Hàng</TableHead>
                <TableHead className="text-right whitespace-nowrap">GMV Lịch Sử/h</TableHead>
                <TableHead className="text-right whitespace-nowrap">Phí Cast</TableHead>
                <TableHead className="text-center whitespace-nowrap">% Hoa Hồng</TableHead>
                <TableHead className="text-center whitespace-nowrap">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTalents.map((talent, idx) => {
                const isSelected = selectedTalentIds.includes(talent.id);

                return (
                  <TableRow
                    key={talent.id}
                    className={`transition-colors whitespace-nowrap ${
                      isSelected ? "bg-indigo-50/60 dark:bg-indigo-950/40" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(talent.id)}
                        aria-label={`Select ${talent.stageName}`}
                      />
                    </TableCell>

                    <TableCell className="text-center font-bold text-slate-500 text-xs">
                      {idx + 1}
                    </TableCell>

                    {/* Click on Talent Name -> Navigates to dedicated page /talents/[id] */}
                    <TableCell>
                      <Link
                        href={`/talents/${talent.id}`}
                        className="flex items-center gap-3 group/talent text-left"
                      >
                        <Avatar className="w-10 h-10 border border-slate-200 group-hover/talent:border-indigo-600 transition-colors">
                          <AvatarImage src={talent.avatarUrl} alt={talent.stageName} className="object-cover" />
                          <AvatarFallback className="text-xs font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300">
                            {talent.stageName ? talent.stageName.slice(0, 2).toUpperCase() : "TL"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight group-hover/talent:text-indigo-600 group-hover/talent:underline transition-colors">
                            {talent.stageName}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">{talent.fullName}</p>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <TalentBadge type={talent.talentType} />
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {talent.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {formatVND(talent.avgGmvPerHour)}
                    </TableCell>

                    <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                      {formatVND(talent.fixedRatePerShift)}
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                        {talent.affiliateCommission}%
                      </span>
                    </TableCell>

                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {/* Eye Button -> Opens Quick View Popup Dialog */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTalent(talent)}
                          title="Xem nhanh Popup"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(talent)}
                          title="Chỉnh sửa hồ sơ"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTalent(talent.id)}
                          title="Xóa Talent"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Comprehensive Add / Edit Talent Modal Dialog */}
      {(isAddModalOpen || editingTalent) && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] !mt-0 !top-0 !left-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-600" />
                {editingTalent ? `Chỉnh Sửa Hồ Sơ Talent: ${editingTalent.stageName}` : "Thêm Mới Hồ Sơ Talent (Host / KOC / KOL)"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTalent(null);
                }}
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
                      className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
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
                    <label className="font-semibold text-slate-700 block mb-1">Địa Chỉ Nhận Sample / Studio</label>
                    <Input
                      placeholder="Studio 1, Quận 7, TP.HCM"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Link Ảnh Đại Diện Avatar</label>
                  <Input
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-indigo-600" />
                  2. Kênh Mạng Xã Hội & Chỉ Số Follower
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">TikTok Handle</label>
                    <Input
                      placeholder="@tranghilive"
                      value={formData.tiktokHandle}
                      onChange={(e) => setFormData({ ...formData, tiktokHandle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">TikTok Followers</label>
                    <Input
                      type="number"
                      value={formData.tiktokFollowers}
                      onChange={(e) => setFormData({ ...formData, tiktokFollowers: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">TikTok Avg Views</label>
                    <Input
                      type="number"
                      value={formData.tiktokViews}
                      onChange={(e) => setFormData({ ...formData, tiktokViews: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Shopee Live Handle</label>
                    <Input
                      placeholder="tranghi_official"
                      value={formData.shopeeHandle}
                      onChange={(e) => setFormData({ ...formData, shopeeHandle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Shopee Followers</label>
                    <Input
                      type="number"
                      value={formData.shopeeFollowers}
                      onChange={(e) => setFormData({ ...formData, shopeeFollowers: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-600" />
                  3. Lịch Sử GMV Đã Live (Dùng để filter matching Brand) & Rate Card
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-indigo-700 block mb-1">GMV Lịch Sử Trung Bình/h (VND)</label>
                    <Input
                      type="number"
                      value={formData.avgGmvPerHour}
                      onChange={(e) => setFormData({ ...formData, avgGmvPerHour: e.target.value })}
                      className="border-indigo-300 font-bold text-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phí Ca Live Cố Định</label>
                    <Input
                      type="number"
                      value={formData.fixedRatePerShift}
                      onChange={(e) => setFormData({ ...formData, fixedRatePerShift: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phí Video Review</label>
                    <Input
                      type="number"
                      value={formData.videoRate}
                      onChange={(e) => setFormData({ ...formData, videoRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">% Hoa Hồng Affiliate</label>
                    <Input
                      type="number"
                      value={formData.affiliateCommission}
                      onChange={(e) => setFormData({ ...formData, affiliateCommission: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Đánh Giá Rating (1 - 5.0)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.internalRating}
                      onChange={(e) => setFormData({ ...formData, internalRating: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  4. Ngành Hàng Mạnh & Tags Điểm Mạnh
                </h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngành Hàng Chọn Từ Danh Sách</label>
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900">
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
                      onClick={() => {
                        setUploadType("IMAGE_GMV");
                      }}
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
                      onClick={() => {
                        setUploadType("VIDEO_LIVE");
                      }}
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
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTalent(null);
                  }}
                >
                  Hủy Thao Tác
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                  {editingTalent ? "Cập Nhật Hồ Sơ" : "Tạo Hồ Sơ Mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Talent Quick View Popup Modal */}
      {selectedTalent && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] !mt-0 !top-0 !left-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <Avatar className="w-14 h-14 border-2 border-indigo-600 shadow-sm">
                  <AvatarImage src={selectedTalent.avatarUrl} alt={selectedTalent.stageName} className="object-cover" />
                  <AvatarFallback className="text-base font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300">
                    {selectedTalent.stageName ? selectedTalent.stageName.slice(0, 2).toUpperCase() : "TL"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedTalent.stageName} ({selectedTalent.fullName})
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <TalentBadge type={selectedTalent.talentType} />
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {selectedTalent.internalRating} / 5.0 Rating
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedTalent(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-400">Thông Tin Liên Hệ & Địa Chỉ</h4>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>SĐT: <b>{selectedTalent.phone || "Chưa cập nhật"}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Email: <b>{selectedTalent.email || "Chưa cập nhật"}</b></span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Địa chỉ: <b>{selectedTalent.address || "Chưa cập nhật"}</b></span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-400">Kênh Mạng Xã Hội & Chỉ Số Viewer</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedTalent.channels.map((ch, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="text-xs font-extrabold text-indigo-600 block">{ch.platform}</span>
                    <a
                      href={getChannelUrl(ch.platform, ch.handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Mở trang kênh ${ch.platform} (${ch.handle})`}
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 hover:underline flex items-center gap-1 mt-0.5 transition-colors"
                    >
                      {ch.handle}
                      <ExternalLink className="w-3 h-3 text-indigo-500 opacity-80" />
                    </a>
                    <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5">
                      <span>Followers: <b>{formatNumber(ch.followers)}</b></span>
                      <span>Avg Views: <b>{formatNumber(ch.avgViews)}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-400">GMV Lịch Sử Đã Live & Rate Card</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20">
                  <span className="text-[10px] text-indigo-600 uppercase font-semibold block">GMV Lịch Sử/h</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">{formatVND(selectedTalent.avgGmvPerHour)}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phí Ca Live</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{formatVND(selectedTalent.fixedRatePerShift)}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">% Hoa Hồng Affiliate</span>
                  <span className="font-bold text-emerald-600 text-xs">{selectedTalent.affiliateCommission}%</span>
                </div>
              </div>
            </div>

            {selectedTalent.exclusivityBrands.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-400">Ràng Buộc Độc Quyền Đối Thủ</h4>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Đang độc quyền cho các thương hiệu: <b>{selectedTalent.exclusivityBrands.join(", ")}</b></span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {/* Option to navigate to full page from popup */}
              <Link
                href={`/talents/${selectedTalent.id}`}
                onClick={() => setSelectedTalent(null)}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Mở Trang Chi Tiết Đầy Đủ →
              </Link>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleOpenEditModal(selectedTalent);
                    setSelectedTalent(null);
                  }}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Chỉnh Sửa Hồ Sơ
                </Button>
                <Button onClick={() => setSelectedTalent(null)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-5">
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
