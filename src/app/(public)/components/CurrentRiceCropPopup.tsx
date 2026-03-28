'use client'

import React, { useState, useEffect } from 'react'
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
  TrendingDown,
  DollarSign, 
  AreaChart, 
  Calendar, 
  ArrowRight,
  Info,
  Activity,
  Zap,
  FlaskConical,
  Layers,
  HandCoins
} from 'lucide-react'
import Link from 'next/link'
import { convertCurrency, calculateDaysDiff } from '@/lib/utils'
import { getGrowthStageText, type ProfitReport } from '@/models/rice-farming'
import dayjs from 'dayjs'
import { convertSolar2Lunar } from '@/lib/lunar-calendar'
import { useAppStore } from '@/stores'
import { localFarmingService } from '@/lib/local-farming-service'

interface CurrentRiceCropPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Popup hiển thị thông tin nhanh về ruộng lúa hiện tại của người dùng
 * Hỗ trợ cả người dùng đã đăng nhập (DB) và khách (Offline)
 */
export default function CurrentRiceCropPopup({ isOpen, onOpenChange }: CurrentRiceCropPopupProps) {
  const { isLogin } = useAppStore()
  
  // State cho dữ liệu local (nếu không login)
  const [localCrop, setLocalCrop] = useState<any>(null)
  const [localReport, setLocalReport] = useState<Partial<ProfitReport> | null>(null)
  const [isLocalLoading, setIsLocalLoading] = useState(false)

  // Memoize filters cho API (nếu có login)
  const riceCropFilters = React.useMemo(() => ({ limit: 1 }), [])

  // Hook lấy dữ liệu từ Server (chỉ chạy khi isLogin)
  const { data: cropsData, isLoading: isLoadingCrops } = useRiceCrops(riceCropFilters, isOpen && isLogin)
  const serverCrop = cropsData?.data?.[0]
  const { data: serverReport, isLoading: isLoadingReport } = useProfitReport(serverCrop?.id || 0)

  // Xử lý lấy dữ liệu Local cho khách
  useEffect(() => {
    if (isOpen && !isLogin) {
      const fetchLocalData = async () => {
        setIsLocalLoading(true)
        try {
          const crops = await localFarmingService.getAllRiceCrops()
          if (crops && crops.length > 0) {
            // Lấy ruộng mới nhất
            const latest = crops[crops.length - 1]
            if (!latest) return

            setLocalCrop(latest)
            
            // Tính toán chi phí local
            const costs = await localFarmingService.getCostsByCropId(latest.id)
            
            let total_cultivation_cost = 0
            let total_input_cost = 0
            
            costs.forEach((item: any) => {
              const amount = Number(item.total_cost) || 0
              // Phân loại: 0: Seed, 1: Fertilizer, 2: Pesticide (Vật tư)
              // 3: Labor, 4: Machinery, 5: Irrigation, 6: Other (Canh tác)
              if (item.category_id <= 2) {
                total_input_cost += amount
              } else {
                total_cultivation_cost += amount
              }
            })
            
            const total_cost = total_cultivation_cost + total_input_cost
            const amount_of_land = latest.amount_of_land || (latest.field_area / 1000) || 1
            
            setLocalReport({
              total_cost,
              cost_per_cong: total_cost / amount_of_land,
              total_cultivation_cost,
              cultivation_cost_per_cong: total_cultivation_cost / amount_of_land,
              total_input_cost,
              input_cost_per_cong: total_input_cost / amount_of_land,
              amount_of_land
            })
          } else {
            setLocalCrop(null)
            setLocalReport(null)
          }
        } catch (error) {
          console.error("Lỗi lấy dữ liệu local:", error)
        } finally {
          setIsLocalLoading(false)
        }
      }
      fetchLocalData()
    }
  }, [isOpen, isLogin])

  // Dữ liệu cuối cùng để hiển thị
  const currentCrop = isLogin ? serverCrop : localCrop
  const profitReport = isLogin ? serverReport : localReport
  const isLoading = isLogin 
    ? (isLoadingCrops || (!!currentCrop && isLoadingReport))
    : isLocalLoading

  // Tính diện tích & ngày
  const effectiveAmountOfLand = currentCrop?.amount_of_land || (currentCrop?.field_area ? currentCrop.field_area / 1000 : 1)
  const daysSinceSowing = calculateDaysDiff(currentCrop?.sowing_date)

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12" />
          
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">Ruộng lúa hiện tại</DialogTitle>
              {!isLogin && (
                <span className="bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase ml-auto">Offline</span>
              )}
            </div>
            {currentCrop && (
              <p className="text-emerald-100 text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mùa vụ: {currentCrop.season_name || currentCrop.season?.name || 'Chưa xác định'}
              </p>
            )}
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-none">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
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
              <p className="text-gray-500 font-medium">Bạn chưa có dữ liệu ruộng lúa nào {!isLogin ? 'trên thiết bị này.' : ''}</p>
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
              {/* Lấy diện tích đất (amountOfLand) - mặc định 1 nếu không có */}
              {(() => {
                const amountOfLand = currentCrop.amount_of_land || (currentCrop.field_area / 1000) || 1;
                const hasHarvest = (profitReport?.total_revenue ?? 0) > 0;
                return (
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

              {/* Thống kê chi phí - 10 THẺ (2 cột x 5 hàng) */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Doanh thu & Lợi nhuận */}
                <div className="bg-emerald-50 rounded-[1.5rem] p-4 border border-emerald-100 flex flex-col justify-between min-h-[100px]">
                  <div className="flex items-center gap-2 mb-1 text-emerald-700">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Tổng thu hoạch</span>
                  </div>
                  <p className="text-emerald-950 font-black text-xl truncate">
                    {profitReport?.total_revenue !== undefined ? convertCurrency(profitReport.total_revenue) : '---'}
                  </p>
                </div>

                <div className={`${hasHarvest ? ((profitReport?.net_profit ?? 0) >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100') : 'bg-gray-50 border-gray-100'} rounded-[1.5rem] p-4 border flex flex-col justify-between min-h-[100px]`}>
                  <div className={`flex items-center gap-2 mb-1 ${hasHarvest ? ((profitReport?.net_profit ?? 0) >= 0 ? 'text-blue-700' : 'text-red-700') : 'text-gray-400'}`}>
                    <HandCoins className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Lợi nhuận</span>
                  </div>
                  <p className={`${hasHarvest ? ((profitReport?.net_profit ?? 0) >= 0 ? 'text-blue-950' : 'text-red-950') : 'text-gray-400'} font-black text-xl truncate`}>
                    {hasHarvest ? (profitReport?.net_profit !== undefined ? convertCurrency(profitReport.net_profit) : '---') : convertCurrency(0)}
                  </p>
                </div>

                {/* 2. Diện tích & Lợi nhuận trên công */}
                <div className="bg-slate-50 rounded-[1.5rem] p-4 border border-slate-100 flex flex-col justify-between min-h-[100px]">
                  <div className="flex items-center gap-2 mb-1 text-slate-700">
                    <Sprout className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Diện tích</span>
                  </div>
                  <p className="text-slate-950 font-black text-xl truncate">
                    {amountOfLand} <span className="text-xs opacity-50 uppercase">Công</span>
                  </p>
                </div>

                <div className={`${hasHarvest ? ((profitReport?.net_profit ?? 0) >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-100') : 'bg-gray-50 border-gray-100'} rounded-[1.5rem] p-4 border flex flex-col justify-between min-h-[100px]`}>
                  <div>
                    <div className={`flex items-center gap-2 mb-0.5 ${hasHarvest ? ((profitReport?.net_profit ?? 0) >= 0 ? 'text-indigo-700' : 'text-orange-700') : 'text-gray-400'}`}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Lợi nhuận / Công</span>
                    </div>
                    <p className={`text-[8px] font-bold mb-1 uppercase leading-tight opacity-60 ${hasHarvest ? ((profitReport?.net_profit ?? 0) >= 0 ? 'text-indigo-600' : 'text-orange-600') : 'text-gray-400'}`}>
                       (Bao gồm canh tác + vật tư)
                    </p>
                  </div>
                  <p className={`${hasHarvest ? ((profitReport?.net_profit ?? 0) >= 0 ? 'text-indigo-950' : 'text-orange-950') : 'text-gray-400'} font-black text-xl truncate`}>
                    {hasHarvest && amountOfLand > 0 ? (profitReport?.net_profit !== undefined ? convertCurrency(profitReport.net_profit / amountOfLand) : '---') : convertCurrency(0)}
                  </p>
                </div>

                {/* 3. Tổng chi phí & Mỗi công */}
                <div className="bg-rose-50 rounded-[1.5rem] p-4 border border-rose-100 flex flex-col justify-between min-h-[100px]">
                  <div className="flex items-center gap-2 mb-0.5 text-rose-700">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Tổng chi phí</span>
                  </div>
                  <p className="text-[8px] font-bold text-rose-600/40 mb-1 uppercase leading-tight italic">
                    (gồm cày, cắt, làm cỏ, phân, thuốc, giống)
                  </p>
                  <p className="text-rose-950 font-black text-xl truncate">
                    {profitReport?.total_cost !== undefined ? convertCurrency(profitReport.total_cost) : '---'}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-[1.5rem] p-4 border border-amber-100 flex flex-col justify-between min-h-[100px]">
                  <div className="flex items-center gap-2 mb-0.5 text-amber-700">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Tổng chi / Công</span>
                  </div>
                  <p className="text-[8px] font-bold text-amber-600/40 mb-1 uppercase leading-tight italic">
                    (gồm cày, cắt, làm cỏ, phân, thuốc, giống)
                  </p>
                  <p className="text-amber-950 font-black text-xl truncate">
                    {profitReport?.cost_per_cong !== undefined ? convertCurrency(profitReport.cost_per_cong) : '---'}
                  </p>
                </div>

                {/* 4. Tổng canh tác & Mỗi công */}
                <div className="bg-emerald-50 rounded-[1.5rem] p-4 border border-emerald-100 flex flex-col justify-between min-h-[100px]">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-emerald-700">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Tổng Canh tác</span>
                    </div>
                    <p className="text-[8px] text-emerald-600 font-bold mb-1 leading-tight uppercase">(cày, cắt, xịt...)</p>
                  </div>
                  <p className="text-emerald-950 font-black text-xl truncate">
                    {profitReport?.total_cultivation_cost !== undefined ? convertCurrency(profitReport.total_cultivation_cost) : '---'}
                  </p>
                </div>

                <div className="bg-sky-50 rounded-[1.5rem] p-4 border border-sky-100 flex flex-col justify-between min-h-[100px]">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-sky-700">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Canh tác / công</span>
                    </div>
                    <p className="text-[8px] text-sky-600 font-bold mb-1 leading-tight uppercase">(cày, cắt, xịt...)</p>
                  </div>
                  <p className="text-sky-950 font-black text-xl truncate">
                    {profitReport?.cultivation_cost_per_cong !== undefined ? convertCurrency(profitReport.cultivation_cost_per_cong) : '---'}
                  </p>
                </div>

                {/* 5. Tổng vật tư & Mỗi công */}
                <div className="bg-purple-50 rounded-[1.5rem] p-4 border border-purple-100 flex flex-col justify-between min-h-[100px]">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-purple-700">
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Tổng Vật tư</span>
                    </div>
                    <p className="text-[8px] text-purple-600 font-bold mb-1 leading-tight uppercase">(Phân, Thuốc, Giống)</p>
                  </div>
                  <p className="text-purple-950 font-black text-xl truncate">
                    {profitReport?.total_input_cost !== undefined ? convertCurrency(profitReport.total_input_cost) : '---'}
                  </p>
                </div>

                <div className="bg-fuchsia-50 rounded-[1.5rem] p-4 border border-fuchsia-100 flex flex-col justify-between min-h-[100px]">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-fuchsia-700">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Vật tư / công</span>
                    </div>
                    <p className="text-[8px] text-fuchsia-600 font-bold mb-1 leading-tight uppercase">(Phân, Thuốc, Giống)</p>
                  </div>
                  <p className="text-fuchsia-950 font-black text-xl truncate">
                    {profitReport?.input_cost_per_cong !== undefined ? convertCurrency(profitReport.input_cost_per_cong) : '---'}
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
                );
              })()}
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
              <Link href={isLogin ? `/rice-crops/${currentCrop.id}` : `/guest-farming/rice-crops/${currentCrop.id}`} className="flex-1">
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
