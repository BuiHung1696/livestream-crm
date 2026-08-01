"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import { Brand } from "@/types";
import { formatVND, formatNumber } from "@/lib/utils";
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  Boxes,
  X,
  Eye,
  Pencil,
  Trash2,
  Star,
  FileSpreadsheet,
  Download,
  PhoneCall,
  ExternalLink,
  ShieldAlert,
  Tag,
  CheckCircle2,
  FileText,
} from "lucide-react";

export const PREDEFINED_INDUSTRIES = [
  "Mỹ phẩm & Skincare",
  "Gia dụng thông minh",
  "Thời trang & Phụ kiện",
  "Thực phẩm & FMCG",
  "Công nghệ & Mẹ bé",
  "Sức khỏe & Thực phẩm chức năng",
];

export default function BrandsPage() {
  const router = useRouter();
  const { brands, skus, campaigns, addBrand, updateBrand, deleteBrand, currentUser } = useCrmStore();
  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "COORDINATOR";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [notification, setNotification] = useState<CustomNotification | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [formData, setFormData] = useState({
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

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch =
      brand.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.taxCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = selectedIndustry === "ALL" || brand.industry === selectedIndustry;
    const matchesStatus = selectedStatus === "ALL" || brand.contractStatus === selectedStatus;

    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingBrand(null);
    setFormData({
      brandName: "",
      companyName: "",
      taxCode: "031" + Math.floor(1000000 + Math.random() * 9000000),
      industry: "Mỹ phẩm & Skincare",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      zalo: "",
      address: "TP. Hồ Chí Minh",
      logoUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80",
      contractStatus: "ACTIVE",
      rating: "5.0",
      scriptNotes: "Lưu ý livestream: Ưu tiên chốt deal Mua 1 Tặng 1 trong 30 phút đầu. Không dùng từ khóa bị cấm 'chữa dứt điểm'.",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
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
    setIsAddModalOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName || !formData.contactPerson) return;

    if (editingBrand) {
      updateBrand(editingBrand.id, {
        brandName: formData.brandName,
        companyName: formData.companyName || `Công ty ${formData.brandName}`,
        taxCode: formData.taxCode,
        industry: formData.industry,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        zalo: formData.zalo || formData.contactPhone,
        address: formData.address,
        logoUrl: formData.logoUrl,
        contractStatus: formData.contractStatus,
        rating: parseFloat(formData.rating) || 5.0,
        scriptNotes: formData.scriptNotes,
      });

      setNotification({
        type: "success",
        title: "Đã Cập Nhật Thương Hiệu",
        message: `Đã lưu thay đổi cho hồ sơ thương hiệu ${formData.brandName}.`,
      });
    } else {
      addBrand({
        brandName: formData.brandName,
        companyName: formData.companyName || `Công ty ${formData.brandName}`,
        taxCode: formData.taxCode,
        industry: formData.industry,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone || "0909123456",
        contactEmail: formData.contactEmail || "contact@brand.vn",
        zalo: formData.zalo || formData.contactPhone,
        address: formData.address,
        logoUrl: formData.logoUrl,
        contractStatus: formData.contractStatus,
        rating: parseFloat(formData.rating) || 5.0,
        scriptNotes: formData.scriptNotes,
      });

      setNotification({
        type: "success",
        title: "Đã Thêm Thương Hiệu Mới",
        message: `Thương hiệu ${formData.brandName} đã được tạo thành công trên hệ thống.`,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteBrandConfirm = (brand: Brand) => {
    setNotification({
      type: "confirm",
      title: "Xác Nhận Xóa Thương Hiệu",
      message: `Bạn có chắc chắn muốn xóa thương hiệu "${brand.brandName}"? Tất cả SKU liên quan cũng sẽ bị xóa.`,
      confirmText: "Xóa Thương Hiệu",
      cancelText: "Hủy",
      onConfirm: () => {
        deleteBrand(brand.id);
        setNotification({
          type: "success",
          title: "Đã Xóa Thương Hiệu",
          message: `Đã xóa thương hiệu ${brand.brandName} khỏi hệ thống.`,
        });
      },
    });
  };

  const handleDownloadSampleCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,BrandName,CompanyName,TaxCode,Industry,ContactPerson,ContactPhone,ContactEmail\n" +
      "Aura Glow Cosmetics,Công Ty TNHH Mỹ Phẩm Aura Glow,0316789012,Mỹ phẩm & Skincare,Chị Thảo,0909123456,thao@auraglow.vn\n" +
      "HomeTech Vietnam,Công Ty CP Thiết Bị HomeTech,0109876543,Gia dụng thông minh,Anh Đức,0988776655,duc@hometech.vn";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "brand_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    let csv = "ID,BrandName,CompanyName,TaxCode,Industry,ContactPerson,ContactPhone,ContactEmail,Status\n";
    filteredBrands.forEach((b) => {
      csv += `"${b.id}","${b.brandName}","${b.companyName}","${b.taxCode}","${b.industry}","${b.contactPerson}","${b.contactPhone}","${b.contactEmail}","${b.contractStatus}"\n`;
    });
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brands_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

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

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            Xuất Excel CSV
          </Button>
        </div>

        {canEdit && (
          <Button
            size="sm"
            onClick={handleOpenAddModal}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            + Thêm Brand Mới
          </Button>
        )}
      </div>

      {/* Filter and Search Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm tên Thương hiệu, Người liên hệ, MST..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">Tất cả Ngành Hàng</option>
                {PREDEFINED_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">Tất cả Trạng Thái</option>
                <option value="ACTIVE">Đang hợp tác</option>
                <option value="PROSPECT">Tiềm năng</option>
                <option value="PAUSED">Tạm dừng</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BRANDS DATA TABLE (ALIGNED WITH TALENTS TABLE DESIGN) */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Danh Sách Thương Hiệu Đối Tác (Brand Management) ({filteredBrands.length})
            </span>
            <span className="text-xs text-slate-500 font-normal">Click vào tên Brand để xem trang chi tiết & quản lý SKU</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold text-xs whitespace-nowrap">
                <TableHead className="w-12 text-center whitespace-nowrap">STT</TableHead>
                <TableHead className="whitespace-nowrap">Thương Hiệu & Công Ty</TableHead>
                <TableHead className="whitespace-nowrap">Ngành Hàng</TableHead>
                <TableHead className="whitespace-nowrap">Người Liên Hệ</TableHead>
                <TableHead className="text-center whitespace-nowrap">Số SKU</TableHead>
                <TableHead className="text-center whitespace-nowrap">Đánh Giá</TableHead>
                <TableHead className="text-center whitespace-nowrap">Trạng Thái</TableHead>
                <TableHead className="text-center w-28 whitespace-nowrap">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand, idx) => {
                const brandSkusCount = skus.filter((s) => s.brandId === brand.id).length || brand.skusCount || 0;
                const brandCampaignsCount = campaigns.filter((c) => c.brandId === brand.id).length || 2;
                const zaloUrl = `https://zalo.me/${(brand.zalo || brand.contactPhone).replace(/\s+/g, "")}`;

                return (
                  <TableRow
                    key={brand.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs whitespace-nowrap"
                  >
                    <TableCell className="text-center font-bold text-slate-400 whitespace-nowrap">
                      {idx + 1}
                    </TableCell>

                    {/* Click on Brand Name -> Navigates to dedicated page /brands/[id] */}
                    <TableCell className="whitespace-nowrap">
                      <Link
                        href={`/brands/${brand.id}`}
                        className="flex items-center gap-3 group/brand text-left"
                      >
                        <img
                          src={brand.logoUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80"}
                          alt={brand.brandName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover/brand:border-indigo-600 transition-colors"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight group-hover/brand:text-indigo-600 group-hover/brand:underline transition-colors">
                            {brand.brandName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">{brand.companyName}</p>
                          <span className="text-[10px] text-slate-400 font-mono">MST: {brand.taxCode}</span>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {brand.industry}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{brand.contactPerson}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-indigo-500" />
                            {brand.contactPhone}
                          </span>
                          <a
                            href={zaloUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            Zalo <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200">
                        {brandSkusCount} SKU
                      </span>
                    </TableCell>

                    <TableCell className="text-center font-bold text-amber-500">
                      <span className="flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {brand.rating || 5.0}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          brand.contractStatus === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : brand.contractStatus === "PROSPECT"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {brand.contractStatus === "ACTIVE"
                          ? "Đang Hợp Tác"
                          : brand.contractStatus === "PROSPECT"
                          ? "Tiềm Năng"
                          : "Tạm Dừng"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/brands/${brand.id}`)}
                          title="Xem thông tin chi tiết & SKU"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(brand)}
                              title="Chỉnh sửa thông tin Brand"
                              className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBrandConfirm(brand)}
                              title="Xóa Brand"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD / EDIT BRAND POPUP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                {editingBrand ? `Chỉnh Sửa Thương Hiệu: ${editingBrand.brandName}` : "Thêm Hồ Sơ Thương Hiệu Mới"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên Thương Hiệu (Brand Name)</label>
                  <Input
                    required
                    placeholder="Aura Glow Cosmetics"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên Pháp Nhân Công Ty</label>
                  <Input
                    placeholder="Công ty TNHH Mỹ Phẩm Aura Glow"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngành Hàng</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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
                    placeholder="0316789012"
                    value={formData.taxCode}
                    onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trạng Thái Hợp Tác</label>
                  <select
                    value={formData.contractStatus}
                    onChange={(e) => setFormData({ ...formData, contractStatus: e.target.value as any })}
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
                    placeholder="Chị Thảo (Brand Manager)"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Điện Thoại</label>
                  <Input
                    placeholder="0909123456"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Liên Hệ</label>
                  <Input
                    placeholder="thao@auraglow.vn"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Zalo / Telegram Liên Hệ</label>
                  <Input
                    placeholder="0909123456"
                    value={formData.zalo}
                    onChange={(e) => setFormData({ ...formData, zalo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đường Dẫn Logo Brand (Logo URL)</label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi Chú & Kịch Bản Agency Lưu Ý (Script Guidelines)</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú quan trọng về từ khóa cấm, ưu đãi Mua 1 Tặng 1, quy tắc hình ảnh thương hiệu khi live..."
                  value={formData.scriptNotes}
                  onChange={(e) => setFormData({ ...formData, scriptNotes: e.target.value })}
                  className="w-full p-2 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  {editingBrand ? "Cập Nhật Brand" : "Tạo Brand Mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
