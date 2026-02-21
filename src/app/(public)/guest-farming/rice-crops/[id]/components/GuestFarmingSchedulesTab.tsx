"use client"

import React, { useState, useEffect } from "react"
import { Plus, Calendar, Clock, Trash2, Edit2 } from "lucide-react"
import dayjs from "dayjs"
import { localFarmingService } from "@/lib/local-farming-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/common/status-badge"
import { type FarmingSchedule } from "@/models/rice-farming"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import GuestFarmingScheduleModal from "./GuestFarmingScheduleModal"
import { CreateFarmingScheduleBodyType } from "@/schemaValidations/rice-farming.schema"
import { cn } from "@/lib/utils"

interface GuestFarmingSchedulesTabProps {
  riceCropId: number
}

export default function GuestFarmingSchedulesTab({ riceCropId }: GuestFarmingSchedulesTabProps) {
  const { toast } = useToast()
  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm()
  const [schedules, setSchedules] = useState<FarmingSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FarmingSchedule | null>(null)

  const fetchSchedules = async () => {
    setIsLoading(true)
    try {
      const data = await localFarmingService.getSchedulesByCropId(riceCropId)
      setSchedules(data as any)
    } catch (_error) {
      console.error("Error fetching local schedules:", _error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [riceCropId])

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      description: "Bạn có chắc chắn muốn xóa công việc này không? Dữ liệu này chỉ được lưu local.",
      variant: "destructive"
    })

    if (isConfirmed) {
      try {
        await localFarmingService.deleteSchedule(id)
        toast({ title: "Thành công", description: "Đã xóa công việc." })
        fetchSchedules()
      } catch {
        toast({ title: "Lỗi", description: "Không thể xóa công việc này.", variant: "destructive" })
      }
    }
  }

  const handleToggleStatus = async (item: FarmingSchedule) => {
    const newStatus = item.status === "completed" ? "pending" : "completed"
    try {
      await localFarmingService.updateSchedule(item.id, { status: newStatus })
      toast({ 
        title: "Cập nhật thành công", 
        description: `Công việc đã được đánh dấu là ${newStatus === "completed" ? "hoàn thành" : "đang chờ"}.` 
      })
      fetchSchedules()
    } catch {
      toast({ title: "Lỗi", description: "Cập nhật không thành công.", variant: "destructive" })
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: FarmingSchedule) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleSubmitModal = async (data: CreateFarmingScheduleBodyType) => {
    try {
      if (editingItem) {
        await localFarmingService.updateSchedule(editingItem.id, data)
        toast({ title: "Thành công", description: "Đã cập nhật công việc." })
      } else {
        await localFarmingService.createSchedule(data)
        toast({ title: "Thành công", description: "Đã thêm công việc mới vào lịch." })
      }
      setIsModalOpen(false)
      fetchSchedules()
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu thông tin.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-agri-50 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-agri-600" />
           </div>
           <div>
              <h3 className="text-xl font-black text-gray-900">Lịch canh tác</h3>
              <p className="text-xs text-gray-500 font-medium tracking-tight">Ghi chép và nhắc nhở công việc đồng áng (Offline)</p>
           </div>
        </div>
        <Button 
          onClick={handleAdd}
          className="bg-agri-600 hover:bg-agri-700 text-white rounded-2xl shadow-lg shadow-agri-100 px-6"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm công việc
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="rounded-3xl border-gray-100 shadow-sm p-6 animate-pulse">
               <div className="h-4 w-32 bg-gray-100 rounded mb-4" />
               <div className="h-8 w-full bg-gray-50 rounded mb-4" />
               <div className="h-4 w-24 bg-gray-50 rounded" />
            </Card>
          ))
        ) : schedules.length > 0 ? (
          schedules.map((item) => (
            <Card key={item.id} className="group rounded-3xl border-none shadow-sm bg-white hover:shadow-xl hover:scale-[1.02] transition-all overflow-hidden border border-gray-50">
               <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="text-[10px] font-black uppercase text-gray-400 border-gray-200">
                       {dayjs(item.scheduled_date).format("DD/MM/YYYY")}
                    </Badge>
                    <StatusBadge status={item.status} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-agri-600 transition-colors">
                    {item.activity_name}
                  </h4>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 italic font-medium min-h-[40px]">
                     {item.instructions || "Không có hướng dẫn thêm"}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                     <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 text-gray-400 hover:text-agri-600 hover:bg-agri-50 rounded-lg"
                        >
                           <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => handleToggleStatus(item)}
                       className={cn(
                         "font-bold text-xs rounded-full px-4",
                         item.status === "completed" 
                          ? "text-gray-400 hover:bg-gray-100" 
                          : "text-agri-600 hover:bg-agri-50"
                       )}
                     >
                        {item.status === "completed" ? "Đã xong ✓" : "Xong ngay →"}
                     </Button>
                  </div>
               </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Clock className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-gray-900 font-bold text-lg mb-1">Chưa có lịch làm việc</p>
             <p className="text-gray-500 text-sm max-w-[250px] mx-auto mb-6">Bạn nên lập kế hoạch bón phân, xịt thuốc để theo dõi sát sao hơn.</p>
             <Button 
               onClick={handleAdd}
               className="bg-white text-agri-600 border border-agri-200 hover:bg-agri-50 rounded-2xl px-6"
              >
                Lập kế hoạch đầu tiên
             </Button>
          </div>
        )}
      </div>
      <ConfirmDialogComponent />
      
      <GuestFarmingScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingItem}
        riceCropId={riceCropId}
      />
    </div>
  )
}
