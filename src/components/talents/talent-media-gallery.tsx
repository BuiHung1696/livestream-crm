"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TalentMedia, PlatformType } from "@/types";
import { useCrmStore } from "@/lib/store";
import { formatVND, compressImageFile } from "@/lib/utils";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  Play,
  Maximize2,
  X,
  TrendingUp,
  Calendar,
  Trash2,
  Upload,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface TalentMediaGalleryProps {
  talentId: string;
  mediaList?: TalentMedia[];
}

export function TalentMediaGallery({ talentId, mediaList = [] }: TalentMediaGalleryProps) {
  const { addTalentMedia, deleteTalentMedia, currentUser } = useCrmStore();
  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "COORDINATOR";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageSliderRef = useRef<HTMLDivElement>(null);
  const videoSliderRef = useRef<HTMLDivElement>(null);

  // Active Lightbox Modal (Selected Media for Viewing)
  const [selectedMedia, setSelectedMedia] = useState<TalentMedia | null>(null);

  // Selected file info state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>("");
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    type: "IMAGE_GMV" as "IMAGE_GMV" | "VIDEO_LIVE",
    title: "",
    gmvAmount: "50000000",
    sessionDate: new Date().toISOString().slice(0, 10),
    platform: "TIKTOK_LIVE" as PlatformType,
  });

  const imagesList = mediaList.filter((m) => m.type === "IMAGE_GMV");
  const videosList = mediaList.filter((m) => m.type === "VIDEO_LIVE");

  const scrollSlider = (ref: React.RefObject<HTMLDivElement | null>, offset: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const generateVideoThumbnailAndDataUrl = (file: File): Promise<{ videoUrl: string; thumbnailUrl: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = dataUrl;
        video.muted = true;
        video.playsInline = true;

        let resolved = false;

        const captureFrame = () => {
          if (resolved) return;
          resolved = true;
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 360;
            canvas.height = 640;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const thumbDataUrl = canvas.toDataURL("image/jpeg", 0.85);
              resolve({ videoUrl: dataUrl, thumbnailUrl: thumbDataUrl });
            } else {
              resolve({ videoUrl: dataUrl, thumbnailUrl: dataUrl });
            }
          } catch {
            resolve({ videoUrl: dataUrl, thumbnailUrl: dataUrl });
          }
        };

        video.onloadeddata = () => {
          video.currentTime = Math.min(1.0, (video.duration || 2) / 2);
        };

        video.onseeked = captureFrame;

        setTimeout(() => {
          if (!resolved) {
            captureFrame();
          }
        }, 1500);

        video.onerror = () => {
          if (!resolved) {
            resolved = true;
            resolve({ videoUrl: dataUrl, thumbnailUrl: dataUrl });
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessingFile(true);

    // Auto fill title from filename if title is empty
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    if (!uploadForm.title) {
      setUploadForm((prev) => ({ ...prev, title: fileNameWithoutExt }));
    }

    try {
      if (file.type.startsWith("image/")) {
        const compressedUrl = await compressImageFile(file, 800, 0.75);
        setFilePreviewUrl(compressedUrl);
        setGeneratedThumbnailUrl(compressedUrl);
      } else if (file.type.startsWith("video/")) {
        const { videoUrl, thumbnailUrl } = await generateVideoThumbnailAndDataUrl(file);
        setFilePreviewUrl(videoUrl);
        setGeneratedThumbnailUrl(thumbnailUrl);
      }
    } catch (err) {
      console.error("Error processing file:", err);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePreviewUrl) return;

    addTalentMedia(talentId, {
      type: uploadForm.type,
      title: uploadForm.title || (selectedFile?.name ?? "Media mới"),
      url: filePreviewUrl,
      thumbnailUrl: generatedThumbnailUrl || filePreviewUrl,
      gmvAmount: uploadForm.gmvAmount ? parseFloat(uploadForm.gmvAmount) : undefined,
      sessionDate: uploadForm.sessionDate,
      platform: uploadForm.platform,
    });

    setIsUploadOpen(false);
    setSelectedFile(null);
    setFilePreviewUrl("");
    setGeneratedThumbnailUrl("");
    setUploadForm({
      type: "IMAGE_GMV",
      title: "",
      gmvAmount: "50000000",
      sessionDate: new Date().toISOString().slice(0, 10),
      platform: "TIKTOK_LIVE",
    });
  };

  const handleDelete = (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTalentMedia(talentId, mediaId);
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      {canEdit && (
        <div className="flex justify-end pb-4">
          <Button
            size="sm"
            onClick={() => {
              setSelectedFile(null);
              setFilePreviewUrl("");
              setIsUploadOpen(true);
            }}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Upload Media
          </Button>
        </div>
      )}

      <CardContent className="p-0 space-y-6">
        {/* 2-COLUMN SPLIT LAYOUT WITH 9:16 VERTICAL SLIDE CAROUSEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COLUMN 1: Ảnh GMV (Dạng Dọc 9:16 Slide) */}
          <div className="space-y-4 min-w-0">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  Ảnh GMV ({imagesList.length})
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Bằng Chứng Doanh Số
                </span>
              </div>

              {/* Slide Navigation Buttons */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollSlider(imageSliderRef, -220)}
                    title="Slide trước"
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollSlider(imageSliderRef, 220)}
                    title="Slide tiếp"
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {imagesList.length > 0 ? (
              <div
                ref={imageSliderRef}
                className="flex items-center gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2 pt-1"
              >
                {imagesList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="group relative aspect-[9/16] w-48 sm:w-52 shrink-0 snap-start rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {/* Vertical Image 9:16 */}
                    <img
                      src={item.url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />

                    {/* Platform Badge Top Left */}
                    <div className="relative z-10 p-3 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white shadow-md">
                        {item.platform || "GMV PROOF"}
                      </span>

                      {canEdit && (
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          title="Xóa ảnh này"
                          className="w-6 h-6 rounded-full bg-slate-900/80 text-slate-300 hover:text-red-400 hover:bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Center Maximize Icon */}
                    <div className="relative z-10 inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity my-auto">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Bottom Card Title & GMV */}
                    <div className="relative z-10 p-3 space-y-1.5 text-white">
                      <h4 className="font-bold text-xs line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                        {item.title}
                      </h4>
                      <div className="space-y-0.5 text-[10px] text-slate-300 border-t border-white/20 pt-1.5">
                        <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          GMV: {formatVND(item.gmvAmount || 0)}
                        </span>
                        {item.sessionDate && (
                          <span className="text-slate-300 flex items-center gap-1 text-[9px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {item.sessionDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2 border border-dashed rounded-xl bg-slate-50/50">
                <ImageIcon className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="font-semibold">Chưa có ảnh chứng minh GMV nào</p>
              </div>
            )}
          </div>

          {/* COLUMN 2: Video Live (Dạng Dọc 9:16 Slide) */}
          <div className="space-y-4 min-w-0">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <VideoIcon className="w-4 h-4 text-red-600" />
                  Video Live ({videosList.length})
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  Clip Recording Thực Tế
                </span>
              </div>

              {/* Slide Navigation Buttons */}
              {videosList.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollSlider(videoSliderRef, -220)}
                    title="Slide trước"
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollSlider(videoSliderRef, 220)}
                    title="Slide tiếp"
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {videosList.length > 0 ? (
              <div
                ref={videoSliderRef}
                className="flex items-center gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2 pt-1"
              >
                {videosList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="group relative aspect-[9/16] w-48 sm:w-52 shrink-0 snap-start rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {/* Vertical Cover Image 9:16 */}
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />

                    {/* Platform Badge Top Left */}
                    <div className="relative z-10 p-3 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white shadow-md">
                        {item.platform || "VIDEO LIVE"}
                      </span>

                      {canEdit && (
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          title="Xóa video này"
                          className="w-6 h-6 rounded-full bg-slate-900/80 text-slate-300 hover:text-red-400 hover:bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Center Play Button Overlay */}
                    <div className="relative z-10 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity my-auto">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 ml-0.5 fill-white" />
                      </div>
                    </div>

                    {/* Bottom Card Title */}
                    <div className="relative z-10 p-3 space-y-1 text-white">
                      <h4 className="font-bold text-xs line-clamp-2 leading-tight group-hover:text-red-300 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-white/20 pt-1.5">
                        <span className="text-slate-300 font-medium text-[9px]">Click xem video clip</span>
                        {item.sessionDate && (
                          <span className="text-slate-300 flex items-center gap-1 text-[9px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {item.sessionDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2 border border-dashed rounded-xl bg-slate-50/50">
                <VideoIcon className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="font-semibold">Chưa có video clip phiên live nào</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* LIGHTBOX / MEDIA VIEWER MODAL */}
      {selectedMedia && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] !mt-0 !top-0 !left-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-extrabold ${
                    selectedMedia.type === "IMAGE_GMV" ? "bg-indigo-600 text-white" : "bg-red-600 text-white"
                  }`}
                >
                  {selectedMedia.type === "IMAGE_GMV" ? "ẢNH GMV 9:16" : "VIDEO LIVE 9:16"}
                </span>
                <h3 className="font-bold text-sm text-white truncate max-w-md">{selectedMedia.title}</h3>
              </div>

              <button
                onClick={() => setSelectedMedia(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body: Vertical 9:16 Video Player or Image */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[420px] p-2">
              {selectedMedia.type === "VIDEO_LIVE" ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <video
                    key={selectedMedia.id}
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="max-h-[70vh] aspect-[9/16] object-contain rounded-xl shadow-2xl bg-black"
                  >
                    Trình duyệt của bạn không hỗ trợ phát trực tiếp video này.
                  </video>
                </div>
              ) : (
                <img src={selectedMedia.url} alt={selectedMedia.title} className="max-h-[70vh] aspect-[9/16] object-contain rounded-xl shadow-2xl" />
              )}
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
              <div className="flex items-center gap-4">
                {selectedMedia.gmvAmount && (
                  <span className="font-bold text-sm text-emerald-400">
                    Doanh Số GMV Thực Tế: {formatVND(selectedMedia.gmvAmount)}
                  </span>
                )}
                {selectedMedia.platform && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-semibold text-slate-300">
                    Nền tảng: {selectedMedia.platform}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {selectedMedia.sessionDate && (
                  <span className="text-slate-400 font-medium">Phiên Live Ngày: {selectedMedia.sessionDate}</span>
                )}

                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Mở Xem Video Tab Mới <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MEDIA MODAL FORM (WITH FILE INPUT FROM COMPUTER) */}
      {isUploadOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] !mt-0 !top-0 !left-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                Upload Tệp Từ Máy Tính (Dạng Dọc 9:16)
              </h3>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setSelectedFile(null);
                  setFilePreviewUrl("");
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Loại Media Upload</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadForm({ ...uploadForm, type: "IMAGE_GMV" });
                    }}
                    className={`p-2.5 rounded-lg border font-bold text-center transition-all ${
                      uploadForm.type === "IMAGE_GMV"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    📸 Ảnh GMV 9:16
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadForm({ ...uploadForm, type: "VIDEO_LIVE" });
                    }}
                    className={`p-2.5 rounded-lg border font-bold text-center transition-all ${
                      uploadForm.type === "VIDEO_LIVE"
                        ? "bg-red-50 border-red-500 text-red-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    🎥 Video Live 9:16
                  </button>
                </div>
              </div>

              {/* HIDDEN COMPUTER FILE INPUT */}
              <input
                ref={fileInputRef}
                type="file"
                accept={uploadForm.type === "IMAGE_GMV" ? "image/*" : "video/*"}
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* COMPUTER FILE UPLOAD DROPZONE */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tệp Từ Máy Tính</label>

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 rounded-xl p-6 text-center cursor-pointer transition-all space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-800 text-xs">Bấm để chọn Tệp từ Máy Tính</p>
                    <p className="text-[11px] text-slate-500">
                      {uploadForm.type === "IMAGE_GMV" ? "Hỗ trợ định dạng: .PNG, .JPG, .WEBP" : "Hỗ trợ định dạng: .MP4, .WEBM, .MOV"}
                    </p>
                  </div>
                ) : (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 flex items-center justify-center relative">
                        {generatedThumbnailUrl ? (
                          <img src={generatedThumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <VideoIcon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-emerald-900 text-xs truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {isProcessingFile ? "Đang tạo thumbnail..." : "Đã tạo Thumbnail 9:16"}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreviewUrl("");
                        setGeneratedThumbnailUrl("");
                      }}
                      className="h-8 text-xs text-red-600 hover:bg-red-100"
                    >
                      Đổi Tệp
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Tệp Media</label>
                <Input
                  required
                  placeholder={
                    uploadForm.type === "IMAGE_GMV"
                      ? "Ví dụ: Báo cáo GMV Mega Sale 8.8"
                      : "Ví dụ: Clip Chốt Deal Serum Skin Glow"
                  }
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doanh Số GMV (VNĐ)</label>
                  <Input
                    type="number"
                    placeholder="68500000"
                    value={uploadForm.gmvAmount}
                    onChange={(e) => setUploadForm({ ...uploadForm, gmvAmount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày Phiên Live</label>
                  <Input
                    type="date"
                    value={uploadForm.sessionDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, sessionDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nền Tảng Livestream</label>
                <select
                  value={uploadForm.platform}
                  onChange={(e) => setUploadForm({ ...uploadForm, platform: e.target.value as PlatformType })}
                  className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-medium"
                >
                  <option value="TIKTOK_LIVE">TikTok Live</option>
                  <option value="SHOPEE_LIVE">Shopee Live</option>
                  <option value="FACEBOOK_LIVE">Facebook Live</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setSelectedFile(null);
                    setFilePreviewUrl("");
                    setGeneratedThumbnailUrl("");
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={!filePreviewUrl || isProcessingFile}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50"
                >
                  {isProcessingFile ? "Đang xử lý..." : "Xác Nhận Upload"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
