"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/common/status-badge"
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  Activity,
  Zap,
  FlaskConical,
  Layers,
  HandCoins
} from "lucide-react"
import { useProfitReport } from "@/hooks/use-profit-report"
import { convertCurrency } from "@/lib/utils"

interface ProfitReportTabProps {
  riceCropId: number
  amountOfLand?: number
}

export default function ProfitReportTab({ riceCropId, amountOfLand = 1 }: ProfitReportTabProps) {
  const { data: report, isLoading } = useProfitReport(riceCropId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tính toán báo cáo...</span>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12 text-muted-foreground italic bg-muted/20 rounded-lg">
        Chưa có đủ dữ liệu để tạo báo cáo lợi nhuận. <br />
        Vui lòng nhập đầy đủ thông tin chi phí và thu hoạch.
      </div>
    )
  }

  const {
    total_revenue,
    total_cost,
    net_profit,
    roi,
    total_cultivation_cost,
    cultivation_cost_per_cong,
    total_input_cost,
    input_cost_per_cong,
    cost_per_cong,
    cost_breakdown = [],
  } = report

  const isProfitable = net_profit >= 0
  const effectiveCostPerCong = cost_per_cong || (amountOfLand > 0 ? total_cost / amountOfLand : 0)

  return (
    <div className="space-y-6">
      {/* HÀNG 1: DOANH THU & LỢI NHUẬN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="py-4 px-4 pb-2">
            <CardTitle className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-black text-emerald-900">{convertCurrency(total_revenue)}</div>
          </CardContent>
        </Card>

        <Card className={isProfitable ? "bg-blue-50/50 border-blue-100" : "bg-red-50/50 border-red-100"}>
          <CardHeader className="py-4 px-4 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <HandCoins className="h-4 w-4" /> Lợi nhuận ròng
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-2xl font-black ${isProfitable ? "text-blue-700" : "text-destructive"}`}>
              {convertCurrency(net_profit)}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={isProfitable ? "success" : "destructive"} className="text-[10px] px-2 py-0.5 rounded-full font-bold">
                ROI: {roi.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HÀNG 2: 6 CỘT CHI PHÍ CHI TIẾT */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Tổng chi phí */}
        <Card className="border-rose-100 bg-rose-50/30 shadow-sm">
          <CardHeader className="py-3 px-4 pb-1">
            <CardTitle className="text-[10px] font-bold text-rose-700 uppercase flex items-center gap-1.5 tracking-tight">
              <TrendingDown className="h-3.5 w-3.5" /> Tổng chi phí
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-black text-rose-900">{convertCurrency(total_cost)}</div>
          </CardContent>
        </Card>

        {/* 2. Chi phí mỗi công */}
        <Card className="border-amber-100 bg-amber-50/30 shadow-sm">
          <CardHeader className="py-3 px-4 pb-1">
            <CardTitle className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1.5 tracking-tight">
              <DollarSign className="h-3.5 w-3.5" /> Chi phí / Công
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-black text-amber-900">{convertCurrency(effectiveCostPerCong)}</div>
          </CardContent>
        </Card>

        {/* 3. Tổng chi phí canh tác */}
        <Card className="border-sky-100 bg-sky-50/30 shadow-sm">
          <CardHeader className="py-3 px-4 pb-1">
            <CardTitle className="text-[10px] font-bold text-sky-700 uppercase flex items-center gap-1.5 tracking-tight">
              <Activity className="h-3.5 w-3.5" /> Tổng CP Canh tác
            </CardTitle>
            <p className="text-[9px] text-sky-600/70 font-bold ml-5 mt-0.5">(cày, cắt, xịt, làm cỏ...)</p>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-black text-sky-900">{convertCurrency(total_cultivation_cost || 0)}</div>
          </CardContent>
        </Card>

        {/* 4. Chi phí canh tác mỗi công */}
        <Card className="border-indigo-100 bg-indigo-50/30 shadow-sm">
          <CardHeader className="py-3 px-4 pb-1">
            <CardTitle className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1.5 tracking-tight">
              <Zap className="h-3.5 w-3.5" /> Canh tác / Công
            </CardTitle>
            <p className="text-[9px] text-indigo-600/70 font-bold ml-5 mt-0.5">(cày, cắt, xịt, làm cỏ...)</p>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-black text-indigo-900">{convertCurrency(cultivation_cost_per_cong || 0)}</div>
          </CardContent>
        </Card>

        {/* 5. Tổng chi phí phân, thuốc, giống */}
        <Card className="border-purple-100 bg-purple-50/30 shadow-sm">
          <CardHeader className="py-3 px-4 pb-1">
            <CardTitle className="text-[10px] font-bold text-purple-700 uppercase flex items-center gap-1.5 tracking-tight">
              <FlaskConical className="h-3.5 w-3.5" /> Tổng CP Vật tư
            </CardTitle>
            <p className="text-[9px] text-purple-600/70 font-bold ml-5 mt-0.5">(Phân, Thuốc, Giống)</p>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-black text-purple-900">{convertCurrency(total_input_cost || 0)}</div>
          </CardContent>
        </Card>

        {/* 6. Chi phí phân thuốc giống cho mỗi công */}
        <Card className="border-fuchsia-100 bg-fuchsia-50/30 shadow-sm">
          <CardHeader className="py-3 px-4 pb-1">
            <CardTitle className="text-[10px] font-bold text-fuchsia-700 uppercase flex items-center gap-1.5 tracking-tight">
              <Layers className="h-3.5 w-3.5" /> Vật tư / Công
            </CardTitle>
            <p className="text-[9px] text-fuchsia-600/70 font-bold ml-5 mt-0.5">(Phân, Thuốc, Giống)</p>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-black text-fuchsia-900">{convertCurrency(input_cost_per_cong || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-4 w-4" /> Chi tiết cơ cấu chi phí
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-2 md:pl-6 h-10 text-[10px] md:text-xs">Hạng mục</TableHead>
                <TableHead className="text-right px-1 md:px-2 whitespace-nowrap h-10 text-[10px] md:text-xs">Số tiền</TableHead>
                <TableHead className="w-[30%] md:w-[40%] text-center h-10 text-[10px] md:text-xs">Tỷ trọng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cost_breakdown.length > 0 ? (
                cost_breakdown.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/10 transition-colors border-b last:border-0">
                    <TableCell className="pl-2 md:pl-6 py-4">
                      <StatusBadge 
                        status={item.category} 
                        unstyled
                        className="text-xs md:text-sm tracking-tight font-bold opacity-80"
                      />
                    </TableCell>
                    <TableCell className="text-right px-1 md:px-2 whitespace-nowrap font-bold text-[13px] md:text-base text-agri-700">
                      {convertCurrency(item.amount)}
                    </TableCell>
                    <TableCell className="pr-2 md:pr-6 w-[35%] md:w-[40%]">
                      <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                        <Progress value={item.percentage} className="h-2 md:h-2.5 w-full md:flex-1" />
                        <span className="text-xs md:text-sm font-bold w-12 text-center md:text-right text-gray-600">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground italic">
                    Chưa có hạng mục chi phí nào được ghi nhận
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
