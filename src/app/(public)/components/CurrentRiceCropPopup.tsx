'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRiceCrops } from '@/hooks/use-rice-crops'
import { useProfitReport } from '@/hooks/use-profit-report'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Sprout, 
  TrendingUp, 
  DollarSign, 
  AreaChart, 
  Calendar, 
  ArrowRight,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { convertCurrency, calculateDaysDiff } from '@/lib/utils'
import { getGrowthStageText } from '@/models/rice-farming'
import dayjs from 'dayjs'
import { convertSolar2Lunar } from '@/lib/lunar-calendar'

interface CurrentRiceCropPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Popup hiển thị thông tin nhanh về ruộng lúa hiện tại của người dùng
 * Dành cho người dùng đã đăng nhập và có ruộng lúa ở mùa vụ gần nhất
 */
export default function CurrentRiceCropPopup({ isOpen, onOpenChange }: CurrentRiceCropPopupProps) {
  // Memoize filters để tránh loop khi truyền object literal vào hook
  const riceCropFilters = React.useMemo(() => ({ limit: 1 }), [])

  // Lấy ruộng lúa mới nhất (active ưu tiên)
  const { data: cropsData, isLoading: isLoadingCrops } = useRiceCrops(riceCropFilters, isOpen)

  const currentCrop = cropsData?.data?.[0]
  
  // Lấy báo cáo lợi nhuận (chi phí) cho ruộng lúa này
  const { data: profitReport, isLoading: isLoadingReport } = useProfitReport(currentCrop?.id || 0)

  const isLoading = isLoadingCrops || (!!currentCrop && isLoadingReport)

  // Tính số công đất hiệu dụng (ưu tiên amount_of_land, fallback tính từ m2)
  const effectiveAmountOfLand = currentCrop?.amount_of_land || (currentCrop?.field_area ? currentCrop.field_area / 1000 : 1)

  // Tính chi phí mỗi công
  const costPerArea = currentCrop && profitReport 
    ? profitReport.total_cost / effectiveAmountOfLand
    : 0

  // Tính ngày sau xạ
  const daysSinceSowing = calculateDaysDiff(currentCrop?.sowing_date)

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12" />
          
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">Ruộng lúa hiện tại</DialogTitle>
            </div>
            {currentCrop && (
              <p className="text-emerald-100 text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mùa vụ: {currentCrop.season_name || currentCrop.season?.name || 'Chưa xác định'}
              </p>
            )}
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : !currentCrop ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Bạn chưa có dữ liệu ruộng lúa nào.</p>
              <Button 
                variant="outline" 
                className="rounded-full px-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
            </div>
          ) : (
            <>
              {/* Thông tin chính */}
              <div className="bg-emerald-50 rounded-[1.5rem] p-5 border border-emerald-100 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sprout className="w-24 h-24 text-emerald-900" />
                </div>
                
                <h4 className="text-emerald-900 font-black text-lg mb-1">{currentCrop.field_name}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {getGrowthStageText(currentCrop.growth_stage)}
                  </span>
                  {daysSinceSowing !== null && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 uppercase tracking-wider">
                       {daysSinceSowing} ngày tuổi
                    </span>
                  )}
                  <span className="px-3 py-1 bg-white text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                    Giống lúa: {currentCrop.rice_variety}
                  </span>
                </div>
              </div>

              {/* Thống kê chi phí */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-[1.5rem] p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2 text-blue-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Tổng chi phí</span>
                  </div>
                  <p className="text-blue-900 font-black text-lg">
                    {profitReport ? convertCurrency(profitReport.total_cost) : '---'}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-[1.5rem] p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2 text-amber-700">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Mỗi công</span>
                  </div>
                  <p className="text-amber-900 font-black text-lg">
                    {costPerArea > 0 ? convertCurrency(costPerArea) : '---'}
                  </p>
                </div>
              </div>

              {/* Diện tích & Ngày gieo */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-gray-400">
                      <AreaChart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Diện tích canh tác</p>
                      <p className="text-gray-900 font-black">
                        {Number(effectiveAmountOfLand).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} công
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-gray-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ngày gieo (Sạ/Cấy)</p>
                      <div className="flex flex-col">
                        <p className="text-gray-900 font-black">
                          {currentCrop.sowing_date ? dayjs(currentCrop.sowing_date).format('DD/MM/YYYY') : '---'}
                        </p>
                        {currentCrop.sowing_date && (
                          <p className="text-[13px] text-emerald-600 font-bold mt-0.5">
                            {(() => {
                              const d = dayjs(currentCrop.sowing_date)
                              const [lDay, lMonth, lYear] = convertSolar2Lunar(d.date(), d.month() + 1, d.year())
                              return `${lDay}/${lMonth}/${lYear}`
                            })()} (Âm lịch)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="p-6 pt-0">
          {currentCrop && (
            <div className="w-full flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-full border-gray-200 text-gray-600 font-bold"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
              <Link href={`/rice-crops/${currentCrop.id}`} className="flex-1">
                <Button className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                  Xem chi tiết <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
