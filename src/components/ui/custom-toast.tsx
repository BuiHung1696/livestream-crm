"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "./button";

export interface CustomNotification {
  type: "success" | "warning" | "error" | "info" | "confirm";
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface CustomToastModalProps {
  notification: CustomNotification | null;
  onClose: () => void;
}

export function CustomToastModal({ notification, onClose }: CustomToastModalProps) {
  if (!notification) return null;

  const isSuccess = notification.type === "success";
  const isConfirm = notification.type === "confirm";
  const isWarning = notification.type === "warning" || notification.type === "error";

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] !mt-0 !top-0 !left-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {isSuccess && (
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {isWarning && (
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          {(isConfirm || notification.type === "info") && (
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
              <Info className="w-5 h-5" />
            </div>
          )}

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {notification.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {notification.message}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          {isConfirm ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs font-semibold"
              >
                {notification.cancelText || "Hủy Thao Tác"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (notification.onConfirm) notification.onConfirm();
                  onClose();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                {notification.confirmText || "Xác Nhận"}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5"
            >
              Đóng
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
