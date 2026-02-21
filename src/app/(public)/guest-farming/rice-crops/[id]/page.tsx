"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { localFarmingService } from "@/lib/local-farming-service"
import {
  getGrowthStageText,
  getCropStatusText,
  getGrowthStageColor,
  getCropStatusColor,
  type RiceCrop,
} from "@/models/rice-farming"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit, Calendar, Sprout, Info } from "lucide-react"
import dayjs from "dayjs"

// Tab components
import GuestFarmingSchedulesTab from "./components/GuestFarmingSchedulesTab"
import GuestGrowthTrackingTab from "./components/GuestGrowthTrackingTab"
import GuestCostItemsTab from "./components/GuestCostItemsTab"
import EditGuestRiceCropModal from "../../components/EditGuestRiceCropModal"

export default function GuestRiceCropDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id ? parseInt(params.id as string, 10) : null
  
  const [riceCrop, setRiceCrop] = useState<RiceCrop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchDetail = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const data = await localFarmingService.getRiceCropById(id)
      if (data) {
         setRiceCrop(data as any)
      }
    } catch (error) {
      console.error("Error fetching local crop detail:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 space-y-8">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] lg:col-span-1" />
          <Skeleton className="h-[400px] lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (!riceCrop) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h2 className="text-2xl font-bold">Không tìm thấy thông tin ruộng lúa</h2>
        <Button onClick={() => router.push("/guest-farming")} className="mt-4 border-agri-600">
           Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-7xl">
      {/* Premium Navigation Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/guest-farming")}
            className="rounded-2xl bg-white shadow-sm border border-gray-100 hover:bg-agri-50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-4xl font-black text-gray-900">{riceCrop.field_name}</h1>
              
            </div>
            <div className="flex items-center gap-2 text-gray-500 font-medium">
               <Calendar className="w-4 h-4" />
               <span>{riceCrop.season?.name || "Vụ Đông Xuân 2024"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => setIsEditModalOpen(true)}
            className="rounded-2xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm px-6"
          >
            <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-gradient-to-b from-white to-gray-50">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Tiến độ sinh trưởng</p>
                   <Badge variant={getGrowthStageColor(riceCrop.growth_stage)} className="px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider">
                      {getGrowthStageText(riceCrop.growth_stage)}
                   </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <Sprout className="w-6 h-6 text-agri-600 mb-3" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Diện tích</p>
                    <p className="text-xl font-black text-gray-900">
                      {riceCrop.amount_of_land} <span className="text-sm font-medium">công</span>
                    </p>
                    <p className="text-[10px] font-medium text-gray-500 italic">
                      (~ {Number(riceCrop.field_area).toLocaleString("vi-VN")} m²)
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <Info className="w-6 h-6 text-blue-600 mb-3" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Giống lúa</p>
                    <p className="text-xl font-black text-gray-900">{riceCrop.rice_variety}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-gray-500 font-medium">Ngày gieo sạ</span>
                    <div className="text-right">
                       <p className="font-bold text-gray-900">{dayjs(riceCrop.sowing_date).format("DD/MM/YYYY")}</p>
                       {riceCrop.sowing_lunar_date && (
                         <p className="text-[10px] text-agri-600 font-bold">{riceCrop.sowing_lunar_date}</p>
                       )}
                    </div>
                  </div>
                  {riceCrop.transplanting_date && (
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500 font-medium">Ngày cấy</span>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{dayjs(riceCrop.transplanting_date).format("DD/MM/YYYY")}</p>
                        {riceCrop.transplanting_lunar_date && (
                          <p className="text-[10px] text-agri-600 font-bold">{riceCrop.transplanting_lunar_date}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-gray-500 font-medium">Dự kiến thu hoạch</span>
                    <div className="text-right">
                       <p className="font-bold text-gray-900">{dayjs(riceCrop.expected_harvest_date).format("DD/MM/YYYY")}</p>
                       {riceCrop.expected_harvest_lunar_date && (
                         <p className="text-[10px] text-agri-600 font-bold">{riceCrop.expected_harvest_lunar_date}</p>
                       )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Trạng thái</span>
                    <Badge variant={getCropStatusColor(riceCrop.status)} className="font-bold">
                       {getCropStatusText(riceCrop.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="rounded-[2rem] border-none bg-agri-600 text-white shadow-lg overflow-hidden relative">
             <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-8 translate-x-8" />
             <CardContent className="p-8 relative z-10">
                <h4 className="font-black text-lg mb-2">Mẹo canh tác 💡</h4>
                <p className="text-agri-50 text-sm leading-relaxed">
                   Giai đoạn <b>{getGrowthStageText(riceCrop.growth_stage)}</b> rất quan trọng để đảm bảo năng suất. Đừng quên ghi chép lịch bón phân và xịt thuốc đầy đủ nhé!
                </p>
             </CardContent>
          </Card>
        </div>

        {/* Right Content: Tabs */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="info" className="w-full">
            <div className="mb-8 overflow-x-auto scrollbar-none">
              <TabsList className="bg-gray-100/50 p-1.5 rounded-[1.8rem] w-full md:w-auto h-auto min-w-max">
                <TabsTrigger value="info" className="rounded-full px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-xs">
                   THÔNG TIN CHUNG
                </TabsTrigger>
                <TabsTrigger value="schedule" className="rounded-full px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-xs uppercase">
                   Lịch canh tác
                </TabsTrigger>
                <TabsTrigger value="tracking" className="rounded-full px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-xs uppercase">
                   Theo dõi sinh trưởng
                </TabsTrigger>
                <TabsTrigger value="costs" className="rounded-full px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-xs uppercase">
                   Chi phí
                </TabsTrigger>
                <TabsTrigger value="harvest" className="rounded-full px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-xs uppercase">
                   Thu hoạch
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="info" className="mt-0 focus-visible:outline-none">
               <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 bg-agri-50 rounded-xl flex items-center justify-center">
                        <Info className="h-5 w-5 text-agri-600" />
                     </div>
                     <h3 className="text-xl font-black text-gray-900">Chi tiết vụ mùa</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vị trí cánh đồng</p>
                        <p className="text-gray-800 font-medium">{riceCrop.location || "Chưa cập nhật vị trí"}</p>
                     </div>
                    
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Diện tích canh tác</p>
                        <p className="text-gray-800 font-medium">
                           {riceCrop.amount_of_land} công (~ {Number(riceCrop.field_area).toLocaleString("vi-VN")} m²)
                        </p>
                     </div>
                    
                  </div>
               </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0 focus-visible:outline-none">
               <GuestFarmingSchedulesTab riceCropId={id!} />
            </TabsContent>

            <TabsContent value="tracking" className="mt-0 focus-visible:outline-none">
               <GuestGrowthTrackingTab riceCropId={id!} />
            </TabsContent>

             <TabsContent value="costs" className="mt-0 focus-visible:outline-none">
                <GuestCostItemsTab riceCropId={id!} defaultTab="costs" amountOfLand={riceCrop.amount_of_land} />
             </TabsContent>

             <TabsContent value="harvest" className="mt-0 focus-visible:outline-none">
                <GuestCostItemsTab riceCropId={id!} defaultTab="harvest" amountOfLand={riceCrop.amount_of_land} />
             </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditGuestRiceCropModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchDetail}
        riceCrop={riceCrop}
      />
    </div>
  )
}
