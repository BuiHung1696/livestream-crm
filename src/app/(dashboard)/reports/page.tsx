"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TalentBadge } from "@/components/talents/talent-badge";
import { useCrmStore } from "@/lib/store";
import { formatVND, formatNumber } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Tv,
  CheckCircle2,
} from "lucide-react";

export default function ReportsPage() {
  const { talents, shifts } = useCrmStore();
  const [timeRange, setTimeRange] = useState("THIS_MONTH");

  // Calculate STRICT REAL DATA from store (0 default if empty)
  const completedShiftsList = shifts.filter((s) => s.actualGmv > 0 || s.shiftStatus === "COMPLETED");

  const totalGmvReal = shifts.reduce((sum, s) => sum + (s.actualGmv || 0), 0);

  // Total Cast Fees paid for completed shifts based on Talent's fixed rate card
  const totalCastPaid = completedShiftsList.reduce((sum, s) => {
    const t = talents.find((item) => item.id === s.talentId);
    return sum + (t?.fixedRatePerShift || 0);
  }, 0);

  // Total Affiliate Commission earned based on Talent's commission rate
  const totalCommission = completedShiftsList.reduce((sum, s) => {
    const t = talents.find((item) => item.id === s.talentId);
    const commRate = t?.affiliateCommission || 10;
    return sum + (s.actualGmv * (commRate / 100));
  }, 0);

  // Net Agency Revenue (15% Agency cut of real GMV)
  const netAgencyRevenue = totalGmvReal > 0 ? Math.round(totalGmvReal * 0.15) : 0;

  // Real Platform GMV Breakdown
  const tiktokGmv = shifts
    .filter((s) => s.platform === "TIKTOK_LIVE")
    .reduce((sum, s) => sum + (s.actualGmv || 0), 0);

  const shopeeGmv = shifts
    .filter((s) => s.platform === "SHOPEE_LIVE")
    .reduce((sum, s) => sum + (s.actualGmv || 0), 0);

  const fbGmv = shifts
    .filter((s) => s.platform === "FACEBOOK_LIVE")
    .reduce((sum, s) => sum + (s.actualGmv || 0), 0);

  const PLATFORM_BREAKDOWN = [
    { name: "TikTok Live", value: tiktokGmv, color: "#4f46e5" },
    { name: "Shopee Live", value: shopeeGmv, color: "#f59e0b" },
    { name: "Facebook Live", value: fbGmv, color: "#10b981" },
  ];

  // Monthly GMV Data built strictly from actual shifts
  const GMV_MONTHLY_DATA = [
    { month: "Tháng 3", gmv: 0, castFee: 0, commission: 0 },
    { month: "Tháng 4", gmv: 0, castFee: 0, commission: 0 },
    { month: "Tháng 5", gmv: 0, castFee: 0, commission: 0 },
    { month: "Tháng 6", gmv: 0, castFee: 0, commission: 0 },
    { month: "Tháng 7", gmv: 0, castFee: 0, commission: 0 },
    { month: "Tháng 8 (Hiện tại)", gmv: totalGmvReal, castFee: totalCastPaid, commission: totalCommission },
  ];

  const handleExportReportCSV = () => {
    let csv = "Talent,Role,CompletedShifts,TotalGMV,CastFee,CommissionEarned\n";
    talents.forEach((t) => {
      const talentShifts = shifts.filter((s) => s.talentId === t.id);
      const doneShifts = talentShifts.filter((s) => s.actualGmv > 0 || s.shiftStatus === "COMPLETED").length;
      const gmv = talentShifts.reduce((sum, s) => sum + (s.actualGmv || 0), 0);
      const comm = gmv * (t.affiliateCommission / 100);
      csv += `"${t.stageName}","${t.talentType}",${doneShifts},${gmv},${t.fixedRatePerShift * doneShifts},${comm}\n`;
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Báo Cáo Doanh Số & Hiệu Quả Livestream (Dữ Liệu Thực Tế)
          </h2>
          <p className="text-xs text-slate-500">
            Tổng hợp 100% từ GMV Nhập Thủ Công thực tế sau các ca live. Mặc định là 0 nếu chưa có dữ liệu ca live.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {["THIS_MONTH", "LAST_MONTH", "THIS_QUARTER", "YEAR_TO_DATE"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {range === "THIS_MONTH"
                  ? "Tháng Này"
                  : range === "LAST_MONTH"
                  ? "Tháng Trước"
                  : range === "THIS_QUARTER"
                  ? "Quý Này"
                  : "Năm 2026"}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReportCSV}
            className="gap-1.5 text-xs font-semibold border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            Xuất Báo Cáo
          </Button>
        </div>
      </div>

      {/* Top Real Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Doanh Số GMV Thực Tế
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatVND(totalGmvReal)}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Từ {completedShiftsList.length} ca live hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Doanh Thu Thu Về Agency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatVND(netAgencyRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Phí quản lý & dịch vụ booking agency
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Phí Cast Đã Chi Trả
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatVND(totalCastPaid)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Chi phí cố định theo ca trực Talent
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Hoa Hồng Affiliate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {formatVND(totalCommission)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Chi trả hoa hồng kết quả bán hàng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue & Expenses Bar Chart */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Biểu Đồ GMV & Chi Phí Theo Tháng</CardTitle>
            <CardDescription>
              So sánh tổng doanh số GMV thực tế, chi phí Cast và Hoa hồng Affiliate
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GMV_MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(val) => `${val / 1000000}M`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatVND(value)} />
                <Legend />
                <Bar dataKey="gmv" name="Tổng GMV" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="castFee" name="Phí Cast Talent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" name="Hoa Hồng Affiliate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Share Pie Chart */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Tỷ Trọng GMV Theo Platform</CardTitle>
            <CardDescription>
              Đóng góp GMV từ các nền tảng TikTok Live, Shopee Live & FB Live
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            {totalGmvReal > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PLATFORM_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PLATFORM_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatVND(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 text-xs text-slate-400 space-y-2">
                <Tv className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold">Chưa có dữ liệu GMV thực tế</p>
                <p className="text-[11px] text-slate-400">Hãy nhập GMV cho các ca live để kích hoạt biểu đồ tỷ trọng nền tảng.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Talent Sales & Commission Detailed Report Table */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Báo Cáo Hiệu Quả Kinh Doanh Chi Tiết Theo Talent ({talents.length})
            </span>
            <span className="text-xs text-slate-500 font-normal">Tính toán 100% từ ca trực thực tế</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold whitespace-nowrap">
                <th className="p-3 text-center w-12 whitespace-nowrap">STT</th>
                <th className="p-3 whitespace-nowrap">Talent / Host</th>
                <th className="p-3 whitespace-nowrap">Loại</th>
                <th className="p-3 text-center whitespace-nowrap">Ca Live Hoàn Thành</th>
                <th className="p-3 text-right whitespace-nowrap">Tổng GMV Bán Được</th>
                <th className="p-3 text-right whitespace-nowrap">Tổng Phí Cast Nhận</th>
                <th className="p-3 text-right whitespace-nowrap">Hoa Hồng % Affiliate</th>
                <th className="p-3 text-right whitespace-nowrap">Tổng Thu Nhập Talent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {talents.map((talent, idx) => {
                const talentShifts = shifts.filter((s) => s.talentId === talent.id);
                const doneShiftsCount = talentShifts.filter((s) => s.actualGmv > 0 || s.shiftStatus === "COMPLETED").length;
                const talentRealGmv = talentShifts.reduce((sum, s) => sum + (s.actualGmv || 0), 0);
                const totalCastEarned = talent.fixedRatePerShift * doneShiftsCount;
                const totalCommEarned = talentRealGmv * (talent.affiliateCommission / 100);
                const totalIncome = totalCastEarned + totalCommEarned;

                return (
                  <tr key={talent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap">
                    <td className="p-3 text-center font-bold text-slate-400 whitespace-nowrap">{idx + 1}</td>
                    <td className="p-3 whitespace-nowrap">
                      <Link href={`/talents/${talent.id}`} className="flex items-center gap-2.5 group">
                        <img
                          src={talent.avatarUrl}
                          alt={talent.stageName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 group-hover:underline">
                            {talent.stageName}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{talent.fullName}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <TalentBadge type={talent.talentType} />
                    </td>
                    <td className="p-3 text-center font-bold whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border text-slate-800 dark:text-slate-200">
                        {doneShiftsCount} ca
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {formatVND(talentRealGmv)}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatVND(totalCastEarned)}
                    </td>
                    <td className="p-3 text-right font-medium text-sky-600 dark:text-sky-400 whitespace-nowrap">
                      {formatVND(totalCommEarned)} ({talent.affiliateCommission}%)
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                      {formatVND(totalIncome)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
