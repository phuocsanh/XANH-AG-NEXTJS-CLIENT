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
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart
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
    cost_breakdown = [],
  } = report

  const isProfitable = net_profit >= 0
  const costPerLand = amountOfLand > 0 ? total_cost / amountOfLand : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" /> Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{convertCurrency(total_revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" /> Tổng chi phí
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{convertCurrency(total_cost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" /> Chi phí / Công
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-orange-600">{convertCurrency(costPerLand)}</div>
          </CardContent>
        </Card>
        <Card className={isProfitable ? "bg-green-50/50 dark:bg-green-950/20" : "bg-red-50/50 dark:bg-red-950/20"}>
          <CardHeader className="py-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Lợi nhuận ròng
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-xl font-bold ${isProfitable ? "text-success" : "text-destructive"}`}>
              {convertCurrency(net_profit)}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={isProfitable ? "success" : "destructive"} className="text-[9px] px-1 py-0">
                ROI: {roi.toFixed(1)}%
              </Badge>
            </div>
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
              <TableRow>
                <TableHead className="pl-6">Hạng mục</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="w-[40%] text-center">Tỷ trọng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cost_breakdown.length > 0 ? (
                cost_breakdown.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="pl-6 font-medium">{item.category}</TableCell>
                    <TableCell className="text-right">{convertCurrency(item.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 px-4">
                        <Progress value={item.percentage} className="h-2 flex-1" />
                        <span className="text-xs font-mono w-10 text-right">{item.percentage.toFixed(1)}%</span>
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
