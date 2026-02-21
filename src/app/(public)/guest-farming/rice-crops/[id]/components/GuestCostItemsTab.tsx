"use client"

import React, { useState, useEffect } from "react"
import { Plus, DollarSign, Tag, Trash2, PieChart, TrendingDown } from "lucide-react"
import dayjs from "dayjs"
import { localFarmingService } from "@/lib/local-farming-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type CostItem } from "@/models/rice-farming"
import { cn, convertCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import GuestCostItemModal from "./GuestCostItemModal"
import GuestHarvestModal from "./GuestHarvestModal"
import { CreateCostItemBodyType, CreateHarvestRecordBodyType } from "@/schemaValidations/rice-farming.schema"
import { Edit2, Wheat } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CostItem | null>(null)
  const [editingHarvest, setEditingHarvest] = useState<any | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [costData, harvestData] = await Promise.all([
        localFarmingService.getCostsByCropId(riceCropId),
        localFarmingService.getHarvestByCropId(riceCropId)
      ])
      setCosts(costData as any)
      setHarvestRecords(harvestData as any)
    } catch (_error) {
      console.error("Error fetching local data:", _error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [riceCropId])

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      description: "Bạn có chắc chắn muốn xóa mục chi phí này không? Dữ liệu này chỉ được lưu local.",
      variant: "destructive"
    })

    if (isConfirmed) {
      try {
        await localFarmingService.deleteCostItem(id)
        toast({ title: "Thành công", description: "Đã xóa mục chi phí." })
        fetchData()
      } catch {
        toast({ title: "Lỗi", description: "Không thể xóa chi phí.", variant: "destructive" })
      }
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: CostItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

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

  const handleAddHarvest = () => {
    setEditingHarvest(null)
    setIsHarvestModalOpen(true)
  }

  const handleEditHarvest = (item: any) => {
    setEditingHarvest(item)
    setIsHarvestModalOpen(true)
  }

  const handleDeleteHarvest = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      description: "Bạn có chắc chắn muốn xóa bản ghi thu hoạch này không?",
      variant: "destructive"
    })

    if (isConfirmed) {
      try {
        await localFarmingService.deleteHarvestRecord(id)
        toast({ title: "Thành công", description: "Đã xóa bản ghi thu hoạch." })
        fetchData()
      } catch {
        toast({ title: "Lỗi", description: "Không thể xóa bản ghi.", variant: "destructive" })
      }
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

  const totalCost = costs.reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
  const totalRevenue = harvestRecords.reduce((sum, item) => sum + (Number(item.total_revenue) || 0), 0)
  const profit = totalRevenue - totalCost

  const costPerCong = amountOfLand > 0 ? totalCost / amountOfLand : 0
  const revenuePerCong = amountOfLand > 0 ? totalRevenue / amountOfLand : 0
  const profitPerCong = amountOfLand > 0 ? profit / amountOfLand : 0

  return (
    <div className="space-y-8">
      {/* Financial Summary Cards - Filtered by tab */}
      <div className={cn(
        "grid grid-cols-1 gap-6",
        defaultTab === "costs" ? "md:grid-cols-3" : "md:grid-cols-2"
      )}>
        {defaultTab === "costs" ? (
          <>
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white overflow-hidden relative group md:col-span-2">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:scale-125 transition-transform duration-500" />
              <CardContent className="p-8 relative z-10">
                 <div className="flex items-center gap-3 mb-4 opacity-80">
                    <TrendingDown className="w-4 h-4" />
                    <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Tổng chi phí vụ mùa</p>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                       {convertCurrency(totalCost)}
                    </h2>
                 </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white border border-rose-100 overflow-hidden relative group">
              <CardContent className="p-8 relative z-10 h-full flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                       <DollarSign className="w-5 h-5 text-rose-600" />
                    </div>
                    <p className="font-bold uppercase tracking-[0.2em] text-[10px] text-gray-400">Chi phí mỗi công</p>
                 </div>
                 <h3 className="text-3xl font-bold text-rose-600 tracking-tight">
                    {convertCurrency(Math.round(costPerCong))}
                 </h3>
                 <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">/ CÔNG ĐẤT</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden relative group h-full">
              <CardContent className="p-8 relative z-10 h-full flex flex-col justify-between">
                 <div>
                    <div className="flex items-center gap-3 mb-4 opacity-80">
                       <Wheat className="w-4 h-4" />
                       <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Doanh thu tổng</p>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                       {convertCurrency(totalRevenue)}
                    </h2>
                 </div>
                 <div className="mt-6 flex items-center justify-between">
                    <div className="bg-white/20 px-6 py-4 rounded-[2.5rem] backdrop-blur-md border border-white/30 shadow-inner w-full">
                       <p className="text-[10px] font-bold opacity-90 uppercase mb-1 tracking-[0.2em]">Doanh thu mỗi công</p>
                       <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                          {convertCurrency(Math.round(revenuePerCong))}
                       </p>
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative group h-full">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
              <CardContent className="p-8 relative z-10 h-full flex flex-col justify-between">
                 <div>
                    <div className="flex items-center gap-3 mb-4 opacity-80">
                       <TrendingDown className="w-4 h-4 rotate-180" />
                       <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Lợi nhuận vụ mùa</p>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                       {convertCurrency(profit)}
                    </h2>
                 </div>
                 <div className="mt-6 flex items-center justify-between">
                    <div className="bg-white/20 px-6 py-4 rounded-[2.5rem] backdrop-blur-md border border-white/30 shadow-inner w-full">
                       <p className="text-[10px] font-bold uppercase opacity-90 mb-1 tracking-[0.2em]">Lợi nhuận mỗi công</p>
                       <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                          {convertCurrency(Math.round(profitPerCong))}
                       </p>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Action Button - Filtered by tab */}
      <div className="w-full">
        {defaultTab === "costs" ? (
          <Card 
            className="rounded-[2.5rem] border-none shadow-lg bg-white overflow-hidden group hover:shadow-2xl transition-all cursor-pointer h-full border border-gray-50" 
            onClick={handleAdd}
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
        ) : (
          <Card 
            className="rounded-[2.5rem] border-none shadow-lg bg-white overflow-hidden group hover:shadow-2xl transition-all cursor-pointer h-full border border-gray-50" 
            onClick={handleAddHarvest}
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
        )}
      </div>

      {/* Main Content Based on defaultTab */}
      {defaultTab === "costs" ? (
        <div className="space-y-4 outline-none">
          <div className="flex items-center gap-3 px-2">
             <PieChart className="w-5 h-5 text-rose-600" />
             <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Danh sách chi tiết các khoản chi</h4>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-50 rounded-[2rem] animate-pulse" />) }
            </div>
          ) : costs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {costs.map((item) => (
                  <div key={item.id} className="group bg-white p-5 rounded-[2rem] flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-xl hover:border-rose-100 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all text-rose-600">
                           <Tag className="w-5 h-5" />
                        </div>
                        <div>
                           <h5 className="font-bold text-gray-900">{item.item_name}</h5>
                           <p className="text-xs text-gray-400 font-medium lowercase">
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
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-gray-400 hover:text-rose-600"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-10 h-10 text-gray-300" />
               </div>
               <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Chưa có bản ghi chi phí nào</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 outline-none">
          <div className="flex items-center gap-3 px-2">
             <Wheat className="w-5 h-5 text-amber-600" />
             <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Lịch sử và kết quả thu hoạch</h4>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => <div key={i} className="h-24 bg-gray-50 rounded-[2rem] animate-pulse" />)}
            </div>
          ) : harvestRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {harvestRecords.map((item) => (
                  <div key={item.id} className="group bg-white p-5 rounded-[2rem] flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-100 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all text-amber-600 self-start mt-1">
                           <Wheat className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                           <h5 className="font-bold text-gray-900">Thu hoạch {item.yield_amount} {item.yield_unit === 'tan' ? 'tấn' : item.yield_unit}</h5>
                           <div className="flex flex-col">
                              <p className="text-lg font-black text-amber-600 tracking-tight">
                                 {item.selling_price_per_unit.toLocaleString('vi-VN')}đ<span className="text-[10px] text-gray-400 font-bold uppercase ml-1">/kg</span>
                              </p>
                              <p className="text-[10px] text-gray-400 font-bold">
                                 {dayjs(item.harvest_date).format("DD/MM/YYYY")}
                              </p>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <p className="font-black text-amber-600 text-lg">{convertCurrency(item.total_revenue)}</p>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleEditHarvest(item)} className="h-8 w-8 text-gray-400 hover:text-amber-600"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteHarvest(item.id)} className="h-8 w-8 text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wheat className="w-10 h-10 text-gray-300" />
               </div>
               <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Chưa có kết quả thu hoạch</p>
            </div>
          )}
        </div>
      )}
      
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
