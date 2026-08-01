"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import { Brand, BrandSku } from "@/types";
import { formatVND, formatNumber } from "@/lib/utils";
import { PREDEFINED_INDUSTRIES } from "@/app/(dashboard)/brands/page";
import {
  ArrowLeft,
  Building2,
  Boxes,
  Phone,
  Mail,
  MapPin,
  Star,
  ShieldAlert,
  Pencil,
  Trash2,
  Plus,
  X,
  PhoneCall,
  ExternalLink,
  Tag,
  CheckCircle2,
  FileText,
  DollarSign,
  Package,
  Megaphone,
  AlertTriangle,
} from "lucide-react";

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params?.id as string;

  const { brands, skus, campaigns, updateBrand, addSku, updateSku, deleteSku, currentUser } = useCrmStore();
  const brand = brands.find((b) => b.id === brandId);
  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "COORDINATOR";

  const [notification, setNotification] = useState<CustomNotification | null>(null);

  // Edit Brand Modal State
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false);
  const [brandForm, setBrandForm] = useState({
    brandName: "",
    companyName: "",
    taxCode: "",
    industry: "Mỹ phẩm & Skincare",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    zalo: "",
    address: "",
    logoUrl: "",
    contractStatus: "ACTIVE" as "ACTIVE" | "PROSPECT" | "PAUSED",
    rating: "5.0",
    scriptNotes: "",
  });

  // Add / Edit SKU Modal State
  const [isSkuModalOpen, setIsSkuModalOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<BrandSku | null>(null);
  const [skuForm, setSkuForm] = useState({
    skuCode: "",
    productName: "",
    category: "Mỹ phẩm",
    originalPrice: "450000",
    livePromoPrice: "299000",
    commissionRate: "18",
    keyUsp: "Dưỡng sáng da, mờ thâm trong 14 ngày",
    sampleStock: "20",
    imageUrl: "",
    scriptNotes: "Lưu ý cho Host: Đẩy mạnh quà tặng kèm Serum mini 5ml trong 20 phút đầu.",
  });

  if (!brand) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Không Tìm Thấy Hồ Sơ Thương Hiệu</h3>
        <p className="text-xs text-slate-500">Mã thương hiệu không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
        <Button onClick={() => router.push("/brands")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs">
          Quay lại danh sách Brand
        </Button>
      </div>
    );
  }

  // Filter SKUs for this brand
  const brandSkus = skus.filter((s) => s.brandId === brand.id);
  const brandCampaigns = campaigns.filter((c) => c.brandId === brand.id);

  const handleOpenEditBrand = () => {
    setBrandForm({
      brandName: brand.brandName,
      companyName: brand.companyName,
      taxCode: brand.taxCode,
      industry: brand.industry,
      contactPerson: brand.contactPerson,
      contactPhone: brand.contactPhone,
      contactEmail: brand.contactEmail,
      zalo: brand.zalo || brand.contactPhone,
      address: brand.address || "TP. Hồ Chí Minh",
      logoUrl: brand.logoUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80",
      contractStatus: brand.contractStatus,
      rating: (brand.rating || 5.0).toString(),
      scriptNotes: brand.scriptNotes || "",
    });
    setIsEditBrandOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.brandName || !brandForm.contactPerson) return;

    updateBrand(brand.id, {
      brandName: brandForm.brandName,
      companyName: brandForm.companyName,
      taxCode: brandForm.taxCode,
      industry: brandForm.industry,
      contactPerson: brandForm.contactPerson,
      contactPhone: brandForm.contactPhone,
      contactEmail: brandForm.contactEmail,
      zalo: brandForm.zalo,
      address: brandForm.address,
      logoUrl: brandForm.logoUrl,
      contractStatus: brandForm.contractStatus,
      rating: parseFloat(brandForm.rating) || 5.0,
      scriptNotes: brandForm.scriptNotes,
    });

    setIsEditBrandOpen(false);
    setNotification({
      type: "success",
      title: "Cập Nhật Hồ Sơ Brand Thành Công",
      message: `Đã lưu thông tin mới cho thương hiệu ${brandForm.brandName}.`,
    });
  };

  const handleOpenAddSku = () => {
    setEditingSku(null);
    setSkuForm({
      skuCode: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: "",
      category: brand.industry.split("&")[0].trim() || "Mỹ phẩm",
      originalPrice: "450000",
      livePromoPrice: "299000",
      commissionRate: "18",
      keyUsp: "Cấp ẩm 72h, kiềm dầu, lành tính cho da nhạy cảm",
      sampleStock: "20",
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&auto=format&fit=crop&q=80",
      scriptNotes: "Lưu ý cho Host: Đưa chai sản phẩm cận cảnh góc quay trong 15s đầu.",
    });
    setIsSkuModalOpen(true);
  };

  const handleOpenEditSku = (sku: BrandSku) => {
    setEditingSku(sku);
    setSkuForm({
      skuCode: sku.skuCode,
      productName: sku.productName,
      category: sku.category,
      originalPrice: sku.originalPrice.toString(),
      livePromoPrice: sku.livePromoPrice.toString(),
      commissionRate: sku.commissionRate.toString(),
      keyUsp: sku.keyUsp,
      sampleStock: sku.sampleStock.toString(),
      imageUrl: sku.imageUrl || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&auto=format&fit=crop&q=80",
      scriptNotes: sku.scriptNotes || "",
    });
    setIsSkuModalOpen(true);
  };

  const handleSaveSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuForm.productName || !skuForm.skuCode) return;

    if (editingSku) {
      updateSku(editingSku.id, {
        skuCode: skuForm.skuCode,
        productName: skuForm.productName,
        category: skuForm.category,
        originalPrice: parseFloat(skuForm.originalPrice) || 0,
        livePromoPrice: parseFloat(skuForm.livePromoPrice) || 0,
        commissionRate: parseFloat(skuForm.commissionRate) || 0,
        keyUsp: skuForm.keyUsp,
        sampleStock: parseInt(skuForm.sampleStock) || 0,
        imageUrl: skuForm.imageUrl,
        scriptNotes: skuForm.scriptNotes,
      });

      setNotification({
        type: "success",
        title: "Đã Cập Nhật SKU",
        message: `Đã cập nhật thông tin sản phẩm ${skuForm.productName}.`,
      });
    } else {
      addSku({
        brandId: brand.id,
        brandName: brand.brandName,
        skuCode: skuForm.skuCode,
        productName: skuForm.productName,
        category: skuForm.category,
        originalPrice: parseFloat(skuForm.originalPrice) || 0,
        livePromoPrice: parseFloat(skuForm.livePromoPrice) || 0,
        commissionRate: parseFloat(skuForm.commissionRate) || 0,
        keyUsp: skuForm.keyUsp,
        sampleStock: parseInt(skuForm.sampleStock) || 0,
        imageUrl: skuForm.imageUrl,
        scriptNotes: skuForm.scriptNotes,
      });

      setNotification({
        type: "success",
        title: "Đã Thêm SKU Mới",
        message: `Sản phẩm ${skuForm.productName} đã được đính kèm vào danh mục Brand.`,
      });
    }

    setIsSkuModalOpen(false);
  };

  const handleDeleteSkuConfirm = (sku: BrandSku) => {
    setNotification({
      type: "confirm",
      title: "Xác Nhận Xóa Sản Phẩm SKU",
      message: `Bạn có chắc chắn muốn xóa SKU "${sku.productName}" (${sku.skuCode}) khỏi thương hiệu này?`,
      confirmText: "Xóa SKU",
      cancelText: "Hủy",
      onConfirm: () => {
        deleteSku(sku.id);
        setNotification({
          type: "success",
          title: "Đã Xóa SKU",
          message: `Đã xóa sản phẩm khỏi danh mục thương hiệu.`,
        });
      },
    });
  };

  const zaloNumber = brand.zalo || brand.contactPhone;
  const zaloUrl = `https://zalo.me/${zaloNumber.replace(/\s+/g, "")}`;

  return (
    <div className="space-y-6">
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Back Navigation & Toolbar Header Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/brands")}
          className="gap-2 text-xs font-semibold border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          Quay Lại Danh Sách Brand
        </Button>

        <div className="flex items-center gap-2.5">
          {canEdit && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenEditBrand}
                className="gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 text-xs font-bold shadow-xs h-9"
              >
                <Pencil className="w-4 h-4 text-indigo-600" />
                Chỉnh Sửa Brand
              </Button>

              <Button
                size="sm"
                onClick={handleOpenAddSku}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs h-9"
              >
                <Plus className="w-4 h-4" />
                + Thêm SKU Mới
              </Button>
            </>
          )}

          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Chat Zalo Brand
            <ExternalLink className="w-3 h-3 opacity-80 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Header Profile Banner */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={brand.logoUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80"}
                alt={brand.brandName}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-indigo-500 shadow-xl"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{brand.brandName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white shadow-sm">
                    {brand.industry}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium">{brand.companyName}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" /> {brand.rating || 5.0} / 5.0 Rating
                  </span>
                  <span>•</span>
                  <span>Mã số thuế: <b className="text-white font-mono">{brand.taxCode}</b></span>
                  <span>•</span>
                  <span>Đại diện: <b className="text-white">{brand.contactPerson}</b> ({brand.contactPhone})</span>
                </div>
              </div>
            </div>

            {/* Quick Performance Metrics Badge */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full md:w-auto justify-around md:justify-end">
              <div className="text-center px-3">
                <span className="text-[10px] text-slate-300 uppercase font-semibold block">Danh Mục SKU</span>
                <span className="text-lg font-bold text-emerald-400">{brandSkus.length} SKU</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center px-3">
                <span className="text-[10px] text-slate-300 uppercase font-semibold block">Chiến Dịch Live</span>
                <span className="text-lg font-bold text-indigo-300">{brandCampaigns.length || 2} Chiến Dịch</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center px-3">
                <span className="text-[10px] text-slate-300 uppercase font-semibold block">Trạng Thái Hợp Tác</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
                  {brand.contractStatus === "ACTIVE" ? "Đang Hợp Tác" : "Tiềm Năng"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 1: DETAILED BRAND INFO & AGENCY SCRIPT GUIDELINES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Representative & Contact Info */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Thông Tin Liên Hệ & Pháp Nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Người Đại Diện Trực Tiếp</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{brand.contactPerson}</p>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-800">
                <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>SĐT: <b>{brand.contactPhone}</b></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Email: <b>{brand.contactEmail}</b></span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Địa Chỉ Trụ Sở Công Ty</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{brand.address || "TP. Hồ Chí Minh"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Agency Script Guidelines & Live Rules (BẮT BUỘC THEO YÊU CẦU NGUYÊN BẢN) */}
        <Card className="border-slate-200 dark:border-slate-800 md:col-span-2 bg-indigo-50/30 dark:bg-indigo-950/10">
          <CardHeader className="pb-3 border-b border-indigo-100 dark:border-indigo-900/30">
            <CardTitle className="text-sm font-bold flex items-center justify-between text-indigo-950 dark:text-indigo-200">
              <span className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-600" />
                Ghi Chú & Kịch Bản Agency Lưu Ý (Script Guidelines & Live Rules)
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-600 text-white">
                BẮT BUỘC THỰC HIỆN
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Quy Tắc Phát Sóng & Từ Khóa Cấm Khi Livestream:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {brand.scriptNotes ||
                  "Lưu ý từ Brand: Ưu tiên chốt deal Mua 1 Tặng 1 trong 30 phút đầu ca live. Tuyệt đối KHÔNG dùng các từ khóa bị cấm trên TikTok Live như: 'chữa dứt điểm', 'cam kết 100%', 'điều trị thần kỳ'. Đóng gói sản phẩm phải giơ cận cảnh nhãn hiệu Brand trong 15 giây đầu."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-900 dark:text-emerald-300 space-y-0.5">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Deal Sốc Áp Dụng:
                </span>
                <p>Giảm sâu 30% - 40% + Voucher Freeship Extra độc quyền ca live.</p>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 text-indigo-900 dark:text-indigo-300 space-y-0.5">
                <span className="font-bold flex items-center gap-1">
                  <Megaphone className="w-3.5 h-3.5 text-indigo-600" /> Tone of Voice Yêu Cầu:
                </span>
                <p>Năng lượng cao, chân thực, chuyên nghiệp, phong thái tự nhiên.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: SKU PRODUCT CATALOG TABLE & MANAGEMENT */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              Danh Sách Sản Phẩm / SKU Thuộc Brand ({brandSkus.length})
            </span>
            {canEdit && (
              <Button
                size="sm"
                onClick={handleOpenAddSku}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                + Thêm SKU Mới
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Quản lý giá gốc, giá ưu đãi live, tỷ lệ hoa hồng affiliate và ghi chú kịch bản từng sản phẩm cho Host
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold text-xs whitespace-nowrap">
                <TableHead className="w-12 text-center whitespace-nowrap">STT</TableHead>
                <TableHead className="whitespace-nowrap">Mã SKU & Sản Phẩm</TableHead>
                <TableHead className="whitespace-nowrap">Ngành Hàng</TableHead>
                <TableHead className="text-right whitespace-nowrap">Giá Gốc</TableHead>
                <TableHead className="text-right whitespace-nowrap">Giá Ưu Đãi Live</TableHead>
                <TableHead className="text-center whitespace-nowrap">% Hoa Hồng</TableHead>
                <TableHead className="text-center whitespace-nowrap">Tồn Kho Mẫu</TableHead>
                <TableHead className="whitespace-nowrap">Key USP & Ghi Chú Host</TableHead>
                <TableHead className="text-center w-24 whitespace-nowrap">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandSkus.length > 0 ? (
                brandSkus.map((sku, idx) => (
                  <TableRow key={sku.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs whitespace-nowrap">
                    <TableCell className="text-center font-bold text-slate-400">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={sku.imageUrl || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&auto=format&fit=crop&q=80"}
                          alt={sku.productName}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{sku.productName}</p>
                          <span className="text-[10px] font-mono text-indigo-600 font-semibold">{sku.skuCode}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {sku.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-500 line-through">
                      {formatVND(sku.originalPrice)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 text-sm">
                      {formatVND(sku.livePromoPrice)}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {sku.commissionRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border">
                        {sku.sampleStock} cái
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{sku.keyUsp}</p>
                      {sku.scriptNotes && (
                        <p className="text-[10px] text-indigo-600 font-medium italic truncate">
                          💡 {sku.scriptNotes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {canEdit && (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditSku(sku)}
                            title="Sửa SKU"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSkuConfirm(sku)}
                            title="Xóa SKU"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <Boxes className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold">Chưa có sản phẩm SKU nào thuộc thương hiệu này</p>
                    {canEdit && (
                      <Button size="sm" onClick={handleOpenAddSku} className="bg-indigo-600 text-white font-bold text-xs mt-2">
                        + Thêm SKU đầu tiên
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SECTION 3: CAMPAIGN HISTORY FOR THIS BRAND */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              Lịch Sử Chiến Dịch Booking Của Brand ({brandCampaigns.length || 2})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold text-xs">
                <TableHead className="w-12 text-center">STT</TableHead>
                <TableHead>Tên Chiến Dịch</TableHead>
                <TableHead className="text-right">Ngân Sách</TableHead>
                <TableHead className="text-right">Target GMV</TableHead>
                <TableHead className="text-center">Thời Gian Chạy</TableHead>
                <TableHead className="text-center">Số Ca Live</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandCampaigns.map((cam, idx) => (
                <TableRow key={cam.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs">
                  <TableCell className="text-center font-bold text-slate-400">{idx + 1}</TableCell>
                  <TableCell>
                    <Link href={`/campaigns/${cam.id}`} className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 hover:underline">
                      {cam.campaignName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-700 dark:text-slate-300">{formatVND(cam.budget)}</TableCell>
                  <TableCell className="text-right font-bold text-indigo-600">{formatVND(cam.targetGmv)}</TableCell>
                  <TableCell className="text-center font-medium text-slate-600">{cam.startDate} ~ {cam.endDate}</TableCell>
                  <TableCell className="text-center font-bold">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {cam.shiftsCount || 4} Ca
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* EDIT BRAND MODAL DIALOG */}
      {isEditBrandOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Chỉnh Sửa Hồ Sơ Brand: {brand.brandName}
              </h3>
              <button onClick={() => setIsEditBrandOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên Thương Hiệu</label>
                  <Input
                    required
                    value={brandForm.brandName}
                    onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên Pháp Nhân Công Ty</label>
                  <Input
                    value={brandForm.companyName}
                    onChange={(e) => setBrandForm({ ...brandForm, companyName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngành Hàng</label>
                  <select
                    value={brandForm.industry}
                    onChange={(e) => setBrandForm({ ...brandForm, industry: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-medium"
                  >
                    {PREDEFINED_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã Số Thuế (MST)</label>
                  <Input
                    value={brandForm.taxCode}
                    onChange={(e) => setBrandForm({ ...brandForm, taxCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trạng Thái Hợp Tác</label>
                  <select
                    value={brandForm.contractStatus}
                    onChange={(e) => setBrandForm({ ...brandForm, contractStatus: e.target.value as any })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-medium"
                  >
                    <option value="ACTIVE">Đang hợp tác</option>
                    <option value="PROSPECT">Tiềm năng</option>
                    <option value="PAUSED">Tạm dừng</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Người Đại Diện Liên Hệ</label>
                  <Input
                    required
                    value={brandForm.contactPerson}
                    onChange={(e) => setBrandForm({ ...brandForm, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Điện Thoại</label>
                  <Input
                    value={brandForm.contactPhone}
                    onChange={(e) => setBrandForm({ ...brandForm, contactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Liên Hệ</label>
                  <Input
                    value={brandForm.contactEmail}
                    onChange={(e) => setBrandForm({ ...brandForm, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Zalo Liên Hệ</label>
                  <Input
                    value={brandForm.zalo}
                    onChange={(e) => setBrandForm({ ...brandForm, zalo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đường Dẫn Logo Brand (URL)</label>
                  <Input
                    value={brandForm.logoUrl}
                    onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi Chú & Kịch Bản Agency Lưu Ý (Script Guidelines)</label>
                <textarea
                  rows={4}
                  value={brandForm.scriptNotes}
                  onChange={(e) => setBrandForm({ ...brandForm, scriptNotes: e.target.value })}
                  className="w-full p-2 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditBrandOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Cập Nhật Brand</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT SKU POPUP MODAL DIALOG */}
      {isSkuModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                {editingSku ? `Chỉnh Sửa SKU: ${editingSku.productName}` : `Thêm SKU Mới Cho Brand: ${brand.brandName}`}
              </h3>
              <button onClick={() => setIsSkuModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveSku} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã Sản Phẩm / SKU Code</label>
                  <Input
                    required
                    placeholder="AG-SERUM-30"
                    value={skuForm.skuCode}
                    onChange={(e) => setSkuForm({ ...skuForm, skuCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên Sản Phẩm SKU</label>
                  <Input
                    required
                    placeholder="Serum Dưỡng Sáng Skin Glow 30ml"
                    value={skuForm.productName}
                    onChange={(e) => setSkuForm({ ...skuForm, productName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giá Niêm Yết (VNĐ)</label>
                  <Input
                    type="number"
                    placeholder="450000"
                    value={skuForm.originalPrice}
                    onChange={(e) => setSkuForm({ ...skuForm, originalPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">GiáƯu Đãi Live (VNĐ)</label>
                  <Input
                    type="number"
                    placeholder="299000"
                    value={skuForm.livePromoPrice}
                    onChange={(e) => setSkuForm({ ...skuForm, livePromoPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">% Hoa Hồng Affiliate</label>
                  <Input
                    type="number"
                    placeholder="18"
                    value={skuForm.commissionRate}
                    onChange={(e) => setSkuForm({ ...skuForm, commissionRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Lượng Tồn Mẫu (Stock)</label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={skuForm.sampleStock}
                    onChange={(e) => setSkuForm({ ...skuForm, sampleStock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ảnh Sản Phẩm (Image URL)</label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={skuForm.imageUrl}
                    onChange={(e) => setSkuForm({ ...skuForm, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Key Selling Points (USP Sản Phẩm)</label>
                <Input
                  placeholder="Cấp ẩm 72h, kiềm dầu 8 tiếng, lành tính cho da nhạy cảm"
                  value={skuForm.keyUsp}
                  onChange={(e) => setSkuForm({ ...skuForm, keyUsp: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi Chú Kịch Bản Cho Host (Script Note SKU)</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đưa chai sản phẩm cận cảnh góc quay trong 15s đầu. Tặng kèm quà mini."
                  value={skuForm.scriptNotes}
                  onChange={(e) => setSkuForm({ ...skuForm, scriptNotes: e.target.value })}
                  className="w-full p-2 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsSkuModalOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {editingSku ? "Cập Nhật SKU" : "Tạo SKU Mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
