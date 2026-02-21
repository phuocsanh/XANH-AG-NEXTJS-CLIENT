"use client"

import React, { useState, useEffect } from "react"
import { Plus, Sprout, Ruler, Droplets, AlertTriangle, Trash2, Camera } from "lucide-react"
import dayjs from "dayjs"
import { localFarmingService } from "@/lib/local-farming-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type GrowthTracking, getGrowthStageText, getGrowthStageColor } from "@/models/rice-farming"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import GuestGrowthTrackingModal from "./GuestGrowthTrackingModal"
import { CreateGrowthTrackingBodyType } from "@/schemaValidations/rice-farming.schema"
import { Edit2 } from "lucide-react"

interface GuestGrowthTrackingTabProps {
  riceCropId: number
}

export default function GuestGrowthTrackingTab({ riceCropId }: GuestGrowthTrackingTabProps) {
  const { toast } = useToast()
  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm()
  const [trackings, setTrackings] = useState<GrowthTracking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GrowthTracking | null>(null)

  const fetchTrackings = async () => {
    setIsLoading(true)
    try {
      const data = await localFarmingService.getTrackingsByCropId(riceCropId)
      setTrackings(data as any)
    } catch (_error) {
      console.error("Error fetching local trackings:", _error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrackings()
  }, [riceCropId])

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      description: "Bạn có chắc chắn muốn xóa bản ghi này không? Dữ liệu này chỉ được lưu local.",
      variant: "destructive"
    })

    if (isConfirmed) {
      try {
        await localFarmingService.deleteTracking(id)
        toast({ title: "Thành công", description: "Đã xóa bản ghi sinh trưởng." })
        fetchTrackings()
      } catch {
        toast({ title: "Lỗi", description: "Không thể xóa bản ghi.", variant: "destructive" })
      }
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: GrowthTracking) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleSubmitModal = async (data: CreateGrowthTrackingBodyType) => {
    try {
      if (editingItem) {
        await localFarmingService.updateTracking(editingItem.id, data)
        toast({ title: "Thành công", description: "Đã cập nhật nhật ký sinh trưởng." })
      } else {
        await localFarmingService.createTracking(data)
        toast({ title: "Thành công", description: "Đã thêm nhật ký mới." })
      }
      setIsModalOpen(false)
      fetchTrackings()
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu thông tin.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-agri-50 rounded-xl flex items-center justify-center">
              <Sprout className="h-5 w-5 text-agri-600" />
           </div>
           <div>
              <h3 className="text-xl font-black text-gray-900">Theo dõi sinh trưởng</h3>
              <p className="text-xs text-gray-500 font-medium tracking-tight">Ghi chép chiều cao, màu lá và tình hình sâu bệnh (Offline)</p>
           </div>
        </div>
        <Button 
          onClick={handleAdd}
          className="bg-agri-600 hover:bg-agri-700 text-white rounded-2xl shadow-lg shadow-agri-100 px-6"
        >
          <Plus className="w-4 h-4 mr-2" /> Ghi chép mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [1, 2].map(i => <SkeletonCard key={i} />)
        ) : trackings.length > 0 ? (
          trackings.map((item) => (
            <Card key={item.id} className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-2xl hover:scale-[1.01] transition-all border border-gray-50">
               <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                       <Badge variant="outline" className="mb-2 text-gray-400 font-black border-gray-100 uppercase tracking-widest text-[9px]">
                          {dayjs(item.tracking_date).format("DD/MM/YYYY")}
                       </Badge>
                       <h4 className="text-xl font-black text-gray-900">
                          {getGrowthStageText(item.growth_stage)}
                       </h4>
                    </div>
                    <Badge variant={getGrowthStageColor(item.growth_stage as any)} className="rounded-full px-3 py-1 font-bold text-[10px] uppercase">
                       {item.growth_stage}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                     <div className="bg-agri-50/50 p-4 rounded-3xl text-center">
                        <Ruler className="w-5 h-5 text-agri-600 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Chiều cao</p>
                        <p className="font-black text-gray-900">{item.plant_height || "-"} <span className="text-[10px] font-medium">cm</span></p>
                     </div>
                     <div className="bg-blue-50/50 p-4 rounded-3xl text-center">
                        <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Màu lá</p>
                        <p className="font-black text-gray-900 text-sm truncate">{item.leaf_color || "-"}</p>
                     </div>
                     <div className="bg-red-50/50 p-4 rounded-3xl text-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Sâu bệnh</p>
                        <p className="font-black text-red-700 text-xs truncate uppercase tracking-tighter">{item.pest_disease_detected || "KHÔNG"}</p>
                     </div>
                  </div>

                  <div className="bg-gray-50/50 p-5 rounded-3xl mb-6 relative">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Ghi chú chi tiết</p>
                     <p className="text-gray-600 text-sm italic font-medium leading-relaxed min-h-[40px]">
                        {item.notes || "Không có ghi chú thêm cho lần kiểm tra này."}
                     </p>
                  </div>

                  <div className="flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity pt-4 border-t border-gray-50">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(item)}
                          className="text-gray-400 font-bold hover:text-agri-600 px-0"
                        >
                          <Edit2 className="w-4 h-4 mr-2" /> Sửa
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 font-bold hover:text-blue-600 px-0"
                        >
                          <Camera className="w-4 h-4 mr-2" /> Ảnh (0)
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl h-9 w-9">
                         <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
               </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Sprout className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-gray-900 font-bold text-lg mb-1">Chưa có nhật ký sinh trưởng</p>
             <p className="text-gray-500 text-sm max-w-[280px] mx-auto mb-6">Ghi lại quá trình lúa lớn lên sẽ giúp bạn chẩn đoán sâu bệnh sớm và dự báo năng suất chính xác.</p>
             <Button 
               onClick={handleAdd}
               className="bg-white text-agri-600 border border-agri-200 hover:bg-agri-50 rounded-2xl px-6"
              >
                Ghi chép đợt đầu
             </Button>
          </div>
        )}
      </div>
      <ConfirmDialogComponent />
      
      <GuestGrowthTrackingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingItem}
        riceCropId={riceCropId}
      />
    </div>
  )
}

function SkeletonCard() {
   return (
      <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 animate-pulse">
         <div className="h-4 w-24 bg-gray-100 rounded mb-4" />
         <div className="h-8 w-48 bg-gray-50 rounded mb-8" />
         <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="h-20 bg-gray-50 rounded-2xl" />
            <div className="h-20 bg-gray-50 rounded-2xl" />
            <div className="h-20 bg-gray-50 rounded-2xl" />
         </div>
         <div className="h-24 bg-gray-50 rounded-2xl" />
      </Card>
   )
}
