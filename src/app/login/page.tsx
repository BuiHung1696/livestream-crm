"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCrmStore } from "@/lib/store";
import {
  Lock,
  Mail,
  Tv,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useCrmStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Vui lòng nhập Email tài khoản.");
      return;
    }

    const success = loginUser(email, password);
    if (success) {
      router.push("/");
    } else {
      setErrorMsg("Tài khoản hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 mb-2">
            <Tv className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            LiveAgency CRM System
          </h1>
          <p className="text-xs text-slate-400">
            Hệ thống Quản lý Host Livestream, KOC, KOL & Booking Chiến Dịch
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              Đăng Nhập Hệ Thống
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Nhập email và mật khẩu tài khoản được cấp quyền bởi Admin
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Email Tài Khoản</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  required
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nhanvien@liveagency.vn"
                  className="pl-9 bg-slate-950/60 border-slate-800 text-white text-xs h-10 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Mật Khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 bg-slate-950/60 border-slate-800 text-white text-xs h-10 focus:border-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-lg shadow-indigo-600/30 transition-all mt-2"
            >
              Đăng Nhập Ngay
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-500">
          © 2026 LiveAgency CRM System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
