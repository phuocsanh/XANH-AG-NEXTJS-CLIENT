"use client"

import React, { useState, useEffect } from "react"
import { 
  Plus, 
  DollarSign, 
  Tag, 
  Trash2, 
  PieChart, 
  TrendingDown,
  Activity,
  Zap,
  FlaskConical,
  Layers,
  Edit2, 
  Wheat,
  TrendingUp,
  HandCoins,
  Sprout
} from "lucide-react"
import dayjs from "dayjs"
import { localFarmingService } from "@/lib/local-farming-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type CostItem } from "@/models/rice-farming"
import { convertCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import GuestCostItemModal from "./GuestCostItemModal"
import GuestHarvestModal from "./GuestHarvestModal"
import { CreateCostItemBodyType, CreateHarvestRecordBodyType } from "@/schemaValidations/rice-farming.schema"

interface GuestCostItemsTabProps {
  riceCropId: number
  defaultTab?: "costs" | "harvest"
  amountOfLand: number
}

const COST_CATEGORIES = [
  { value: "seed", label: "Hạt giống" },
  { value: "fertilizer", label: "Phân bón" },
  { value: "pesticide", label: "Thuốc BVTV" },
  { value: "labor", label: "Nhân công" },
  { value: "machinery", label: "Máy móc / Cày cấy" },
  { value: "irrigation", label: "Tưới tiêu" },
  { value: "other", label: "Chi phí khác" },
]

export default function GuestCostItemsTab({ riceCropId, defaultTab = "costs", amountOfLand }: GuestCostItemsTabProps) {
  const { toast } = useToast()
  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm()
  const [costs, setCosts] = useState<CostItem[]>([])
  const [harvestRecords, setHarvestRecords] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CostItem | null>(null)
  const [editingHarvest, setEditingHarvest] = useState<any | null>(null)

  const fetchData = async () => {
    try {
      const [costData, harvestData] = await Promise.all([
        localFarmingService.getCostsByCropId(riceCropId),
        localFarmingService.getHarvestByCropId(riceCropId)
      ])
      setCosts(costData as any)
      setHarvestRecords(harvestData as any)
    } catch (_error) {
      console.error("Error fetching local data:", _error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [riceCropId])

  const handleSubmitModal = async (data: CreateCostItemBodyType) => {
    try {
      if (editingItem) {
        await localFarmingService.updateCostItem(editingItem.id, data)
        toast({ title: "Thành công", description: "Đã cập nhật chi phí." })
      } else {
        await localFarmingService.createCostItem(data)
        toast({ title: "Thành công", description: "Đã thêm chi phí mới." })
      }
      setIsModalOpen(false)
      fetchData()
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu thông tin.", variant: "destructive" })
    }
  }

  const handleSubmitHarvest = async (data: CreateHarvestRecordBodyType) => {
    try {
      if (editingHarvest) {
        await localFarmingService.updateHarvestRecord(editingHarvest.id, data)
        toast({ title: "Thành công", description: "Đã cập nhật thông tin thu hoạch." })
      } else {
        await localFarmingService.createHarvestRecord(data)
        toast({ title: "Thành công", description: "Đã ghi nhận thu hoạch mới." })
      }
      setIsHarvestModalOpen(false)
      fetchData()
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu thông tin.", variant: "destructive" })
    }
  }

  // Tính toán các chỉ số tài chính
  const totalCost = costs.reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
  const totalRevenue = harvestRecords.reduce((sum, item) => sum + (Number(item.total_revenue) || 0), 0)
  const profit = totalRevenue - totalCost

  // Phân loại chi phí local cho Guest
  let totalCultivationCost = 0
  let totalInputCost = 0
  costs.forEach((item) => {
    const amount = Number(item.total_cost) || 0
    if (item.category_id !== undefined && item.category_id <= 2) {
      totalInputCost += amount
    } else {
      totalCultivationCost += amount
    }
  })

  const costPerCong = amountOfLand > 0 ? totalCost / amountOfLand : 0
  const cultivationCostPerCong = amountOfLand > 0 ? totalCultivationCost / amountOfLand : 0
  const inputCostPerCong = amountOfLand > 0 ? totalInputCost / amountOfLand : 0
  const profitPerCong = amountOfLand > 0 ? profit / amountOfLand : 0

  return (
    <div className="space-y-8">
      {/* Financial Summary Cards - 10 THẺ (2 cột x 5 hàng) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CẶP 1: DOANH THU & LỢI NHUẬN RÒNG */}
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white overflow-hidden relative group">
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-4 opacity-80">
                <TrendingUp className="w-5 h-5" />
                <p className="font-bold uppercase tracking-[0.2em] text-[12px]">Tổng doanh thu</p>
             </div>
             <h2 className="text-5xl font-bold tracking-tighter">
                {convertCurrency(totalRevenue)}
             </h2>
          </CardContent>
        </Card>

        <Card className={`rounded-[2.5rem] border-none shadow-xl text-white overflow-hidden relative group ${totalRevenue > 0 ? (profit >= 0 ? "bg-gradient-to-br from-blue-500 to-blue-700" : "bg-gradient-to-br from-red-500 to-red-700") : "bg-gray-100 border-gray-200 text-gray-400"}`}>
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-4 opacity-80">
                <HandCoins className="w-5 h-5" />
                <p className="font-bold uppercase tracking-[0.2em] text-[12px]">Lợi nhuận</p>
             </div>
             <h2 className="text-5xl font-bold tracking-tighter">
                {convertCurrency(totalRevenue > 0 ? profit : 0)}
             </h2>
          </CardContent>
        </Card>

        {/* CẶP 2: DIỆN TÍCH & LỢI NHUẬN / CÔNG */}
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white border border-slate-100 overflow-hidden relative group">
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                   <Sprout className="w-6 h-6 text-slate-600" />
                </div>
                <p className="font-bold uppercase tracking-[0.2em] text-[12px] text-gray-400">Diện tích đất</p>
             </div>
             <h3 className="text-5xl font-bold text-slate-600 tracking-tighter">
               {amountOfLand} <span className="text-2xl opacity-50 uppercase">Công</span>
             </h3>
          </CardContent>
        </Card>

        <Card className={`rounded-[2.5rem] border-none shadow-xl overflow-hidden relative group ${totalRevenue > 0 ? (profit >= 0 ? "bg-indigo-50 border-indigo-100" : "bg-orange-50 border-orange-100") : "bg-gray-50 border-gray-100"}`}>
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${totalRevenue > 0 ? (profit >= 0 ? "bg-indigo-100" : "bg-orange-100") : "bg-gray-100"}`}>
                   <TrendingUp className={`w-6 h-6 ${totalRevenue > 0 ? (profit >= 0 ? "text-indigo-600" : "text-orange-600") : "text-gray-400"}`} />
                </div>
                <p className={`font-bold uppercase tracking-[0.2em] text-[12px] ${totalRevenue > 0 ? (profit >= 0 ? "text-indigo-700" : "text-orange-700") : "text-gray-400"}`}>Lợi nhuận / Công</p>
             </div>
             <p className={`text-[12px] font-bold mb-6 ml-14 leading-tight uppercase font-black ${totalRevenue > 0 ? (profit >= 0 ? "text-indigo-600/40" : "text-orange-600/40") : "text-gray-400/40"}`}>
                (Bao gồm canh tác + vật tư)
             </p>
             <h3 className={`text-5xl font-bold tracking-tighter ${totalRevenue > 0 ? (profit >= 0 ? "text-indigo-900" : "text-orange-900") : "text-gray-400"}`}>
                {convertCurrency(totalRevenue > 0 ? profitPerCong : 0)}
             </h3>
          </CardContent>
        </Card>

        {/* CẶP 3: TỔNG CHI PHÍ & CHI PHÍ MỖI CÔNG */}
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white overflow-hidden relative group">
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-1 opacity-80">
                <TrendingDown className="w-5 h-5" />
                <p className="font-bold uppercase tracking-[0.2em] text-[12px]">Tổng chi phí</p>
             </div>
             <p className="text-[12px] font-medium text-rose-100 mb-6 ml-8 leading-tight opacity-90 uppercase font-black">(gồm cày, cắt, làm cỏ, phân, thuốc, giống)</p>
             <h2 className="text-5xl font-bold tracking-tighter">
                {convertCurrency(totalCost)}
             </h2>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white border border-rose-100 overflow-hidden relative group">
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                   <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
                <p className="font-bold uppercase tracking-[0.2em] text-[12px] text-gray-400">Chi phí mỗi công</p>
             </div>
             <p className="text-[12px] font-bold text-amber-600/40 mb-6 ml-14 leading-tight uppercase font-black">(gồm cày, cắt, làm cỏ, phân, thuốc, giống)</p>
             <h3 className="text-5xl font-bold text-amber-600 tracking-tighter">
                {convertCurrency(Math.round(costPerCong))}
             </h3>
             <p className="text-[12px] font-bold text-gray-400 mt-2 uppercase tracking-widest">/ CÔNG ĐẤT</p>
          </CardContent>
        </Card>

        {/* CẶP 4: TỔNG CANH TÁC & CANH TÁC MỖI CÔNG */}
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white overflow-hidden relative group">
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 opacity-80">
                <Activity className="w-5 h-5" />
                <p className="font-bold uppercase tracking-[0.2em] text-[12px]">Tổng chi canh tác</p>
             </div>
             <p className="text-[12px] font-medium text-sky-100 mb-6 ml-8 leading-tight opacity-90 uppercase font-black">(cày, cắt, xịt, làm cỏ...)</p>
             <h3 className="text-5xl font-bold tracking-tighter">
                {convertCurrency(totalCultivationCost)}
             </h3>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white border border-sky-100 overflow-hidden relative group">
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                   <Zap className="w-6 h-6 text-sky-600" />
                </div>
                <p className="font-bold uppercase tracking-[0.2em] text-[12px] text-gray-400">Canh tác mỗi công</p>
             </div>
             <p className="text-[12px] font-bold text-sky-600/40 mb-6 ml-14 leading-tight uppercase font-black">(cày, cắt, xịt, làm cỏ...)</p>
             <h3 className="text-5xl font-bold text-sky-600 tracking-tighter">
                {convertCurrency(Math.round(cultivationCostPerCong))}
             </h3>
             <p className="text-[12px] font-bold text-gray-400 mt-2 uppercase tracking-widest">/ CÔNG ĐẤT</p>
          </CardContent>
        </Card>

        {/* CẶP 5: TỔNG VẬT TƯ & VẬT TƯ MỖI CÔNG */}
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative group">
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 opacity-80">
                <FlaskConical className="w-5 h-5" />
                <p className="font-bold uppercase tracking-[0.2em] text-[12px]">Tổng chi vật tư</p>
             </div>
             <p className="text-[12px] font-medium text-purple-100 mb-6 ml-8 leading-tight opacity-90 uppercase font-bold">(Phân, Thuốc, Giống)</p>
             <h3 className="text-5xl font-bold tracking-tighter">
                {convertCurrency(totalInputCost)}
             </h3>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white border border-purple-100 overflow-hidden relative group">
          <CardContent className="p-10 relative z-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                   <Layers className="w-6 h-6 text-purple-600" />
                </div>
                <p className="font-bold uppercase tracking-[0.2em] text-[12px] text-gray-400">Vật tư mỗi công</p>
             </div>
             <p className="text-[12px] font-bold text-purple-600/40 mb-6 ml-14 leading-tight uppercase font-black">(Phân, Thuốc, Giống)</p>
             <h3 className="text-5xl font-bold text-purple-600 tracking-tighter">
                {convertCurrency(Math.round(inputCostPerCong))}
             </h3>
             <p className="text-[12px] font-bold text-gray-400 mt-2 uppercase tracking-widest">/ CÔNG ĐẤT</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="rounded-[2.5rem] border-none shadow-lg bg-white overflow-hidden group hover:shadow-2xl transition-all cursor-pointer h-full border border-gray-50" 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          >
             <CardContent className="p-8 flex items-center justify-between h-full">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-rose-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all text-rose-600">
                      <Plus className="w-7 h-7" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-gray-900 line-clamp-1">Ghi chép chi phí mới</h4>
                      <p className="text-xs text-gray-500 font-medium tracking-tight">Thêm vật tư, nhân công, dịch vụ nông nghiệp...</p>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card 
            className="rounded-[2.5rem] border-none shadow-lg bg-white overflow-hidden group hover:shadow-2xl transition-all cursor-pointer h-full border border-gray-50" 
            onClick={() => {
              setEditingHarvest(null);
              setIsHarvestModalOpen(true);
            }}
          >
             <CardContent className="p-8 flex items-center justify-between h-full">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-amber-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all text-amber-600">
                      <Wheat className="w-7 h-7" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-gray-900 line-clamp-1">Thêm đợt thu hoạch mới</h4>
                      <p className="text-xs text-gray-500 font-medium tracking-tight">Sản lượng thực tế, đơn giá bán, thương lái...</p>
                   </div>
                </div>
             </CardContent>
          </Card>
      </div>

      {/* Chi tiết Chi phí hoặc Thu hoạch */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            {defaultTab === "costs" ? (
              <>
                <PieChart className="w-5 h-5 text-rose-600" />
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Danh sách chi tiết các khoản chi</h4>
              </>
            ) : (
              <>
                <Wheat className="w-5 h-5 text-amber-600" />
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Lịch sử thu hoạch</h4>
              </>
            )}
        </div>

        {defaultTab === "costs" ? (
          costs.length === 0 ? (
            <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-10 h-10 text-gray-300" />
               </div>
               <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Chưa có bản ghi chi phí nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {costs.map((item) => (
                  <div key={`cost-${item.id}`} className="group bg-white p-5 rounded-[2rem] flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-xl hover:border-rose-100 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all text-rose-600">
                           <Tag className="w-5 h-5" />
                        </div>
                        <div>
                           <h5 className="font-bold text-gray-900">{item.item_name}</h5>
                           <p className="text-xs text-gray-400 font-medium">
                              <span className="text-rose-600 font-bold uppercase text-[9px] bg-rose-50 px-2 py-0.5 rounded-full mr-2">
                                {COST_CATEGORIES[item.category_id as any]?.label ||  "Mục khác"}
                              </span>
                              {dayjs(item.expense_date).format("DD/MM/YYYY")}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <p className="font-black text-gray-900 text-lg">{convertCurrency(item.total_cost)}</p>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }} className="h-8 w-8 text-gray-400 hover:text-rose-600"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={async () => {
                            const ok = await confirm({
                              title: "Xóa chi phí",
                              description: "Bạn có chắc chắn muốn xóa bản ghi này?",
                            })
                            if (ok) {
                               await localFarmingService.deleteCostItem(item.id)
                               fetchData()
                            }
                          }} className="h-8 w-8 text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          )
        ) : (
          harvestRecords.length === 0 ? (
            <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wheat className="w-10 h-10 text-gray-300" />
               </div>
               <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Chưa có kết quả thu hoạch</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {harvestRecords.map((item) => (
                  <div key={`harvest-${item.id}`} className="group bg-white p-5 rounded-[2rem] flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-100 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all text-amber-600">
                           <Wheat className="w-5 h-5" />
                        </div>
                        <div>
                           <h5 className="font-bold text-gray-900">Thu hoạch {item.yield_amount} {item.yield_unit === 'tan' ? 'tấn' : item.yield_unit}</h5>
                           <p className="text-xs text-gray-400 font-medium">
                              {dayjs(item.harvest_date).format("DD/MM/YYYY")}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <p className="font-black text-amber-600 text-lg">{convertCurrency(item.total_revenue)}</p>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingHarvest(item);
                            setIsHarvestModalOpen(true);
                          }} className="h-8 w-8 text-gray-400 hover:text-amber-600"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={async () => {
                             const ok = await confirm({
                               title: "Xóa thu hoạch",
                               description: "Bạn có chắc chắn muốn xóa bản ghi này?",
                             })
                             if (ok) {
                                await localFarmingService.deleteHarvestRecord(item.id)
                                fetchData()
                             }
                          }} className="h-8 w-8 text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          )
        )}
      </div>
      
      <ConfirmDialogComponent />

      <GuestCostItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingItem}
        riceCropId={riceCropId}
      />

      <GuestHarvestModal
        isOpen={isHarvestModalOpen}
        onClose={() => setIsHarvestModalOpen(false)}
        onSubmit={handleSubmitHarvest}
        initialData={editingHarvest}
        riceCropId={riceCropId}
      />
    </div>
  )
}
