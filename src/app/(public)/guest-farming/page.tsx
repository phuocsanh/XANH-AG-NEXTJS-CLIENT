"use client"

/**
 * Trang quản lý canh tác dành cho khách hàng (Dữ liệu local)
 */

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { localFarmingService } from "@/lib/local-farming-service"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getGrowthStageText,
  getCropStatusText,
  getGrowthStageColor,
  getCropStatusColor,
  type RiceCrop,
} from "@/models/rice-farming"
import { Eye, Smartphone, Plus, SmartphoneIcon, LogIn } from "lucide-react"
import Link from "next/link"
import CreateGuestRiceCropModal from "./components/CreateGuestRiceCropModal"

export default function GuestFarmingPage() {
  const router = useRouter()
  const [crops, setCrops] = useState<RiceCrop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchCrops = async () => {
    setIsLoading(true)
    try {
      const data = await localFarmingService.getAllRiceCrops()
      setCrops(data as any)
    } catch (error) {
      console.error("Error fetching local crops:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCrops()
  }, [])

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Header section with Premium design */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
              CÔNG CỤ <span className="text-agri-600">CANH TÁC</span>
            </h1>
            
          </div>
         
        </div>
        
        <div className="flex flex-wrap gap-3">
         
          <Button 
            className="bg-agri-600 hover:bg-agri-700 text-white shadow-lg shadow-agri-200 px-6"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Vụ mùa mới
          </Button>
        </div>
      </div>

      <CreateGuestRiceCropModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCrops}
      />

      {/* Info Card - Why Guest mode? */}
      <Card className="bg-gradient-to-r from-agri-50 to-blue-50 border-none shadow-sm mb-10 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -translate-y-16 translate-x-16" />
          <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center gap-6">
              
              <div>
                
                  <p className="text-red-600">
                      Toàn bộ thông tin từ lịch bón phân, xịt thuốc đến ghi chép chi phí đều được lưu trữ trực tiếp trên thiết bị. Nếu xóa ứng dụng sẽ mất hết dữ liệu đã lưu. 
                     
                  </p>
              </div>
          </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-gray-100">
                    <TableHead className="py-6 px-6 font-bold text-gray-900 uppercase tracking-widest text-[10px]">Tên ruộng lúa</TableHead>
                    <TableHead className="py-6 px-6 font-bold text-gray-900 uppercase tracking-widest text-[10px]">Mùa vụ</TableHead>
                    <TableHead className="py-6 px-6 font-bold text-gray-900 uppercase tracking-widest text-[10px]">Diện tích</TableHead>
                    <TableHead className="py-6 px-6 font-bold text-gray-900 uppercase tracking-widest text-[10px]">Giống lúa</TableHead>
                    <TableHead className="py-6 px-6 font-bold text-gray-900 uppercase tracking-widest text-[10px]">Giai đoạn</TableHead>
                    <TableHead className="py-6 px-6 font-bold text-gray-900 uppercase tracking-widest text-[10px]">Trạng thái</TableHead>
                    <TableHead className="py-6 px-6 font-bold text-gray-900 uppercase tracking-widest text-[10px] text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 py-10">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-600 mx-auto"></div>
                          <p className="text-gray-500 font-medium">Đang chuẩn bị dữ liệu...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : crops.length > 0 ? (
                    crops.map((crop) => (
                      <TableRow 
                        key={crop.id} 
                        className="group border-gray-50 hover:bg-agri-50/30 transition-all cursor-pointer"
                        onClick={() => router.push(`/guest-farming/rice-crops/${crop.id}`)}
                      >
                        <TableCell className="py-5 px-6 font-bold text-gray-800">
                          {crop.field_name}
                        </TableCell>
                        <TableCell className="py-5 px-6 text-gray-600 font-medium">
                          {crop.season?.name || "Kỳ vụ local"}
                        </TableCell>
                        <TableCell className="py-5 px-6 font-medium text-gray-600">
                           {Number(crop.field_area || 0).toLocaleString("vi-VN")} m²
                        </TableCell>
                        <TableCell className="py-5 px-6">
                           <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                             {crop.rice_variety}
                           </span>
                        </TableCell>
                        <TableCell className="py-5 px-6">
                          <Badge variant={getGrowthStageColor(crop.growth_stage)} className="font-bold">
                            {getGrowthStageText(crop.growth_stage)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-5 px-6">
                          <Badge variant={getCropStatusColor(crop.status)} className="font-bold">
                            {getCropStatusText(crop.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-5 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-white hover:bg-agri-600 hover:text-white shadow-sm border border-gray-100 group-hover:border-agri-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-80 text-center">
                        <div className="py-16 flex flex-col items-center">
                          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                             <Plus className="w-12 h-12 text-gray-300" />
                          </div>
                          <p className="text-2xl font-black text-gray-900 mb-2">
                            Bạn chưa có vụ mùa nào
                          </p>
                          <p className="text-gray-500 max-w-sm mb-8">
                            Hãy bắt đầu ghi chép vụ lúa của bạn ngay hôm nay để theo dõi năng suất hiệu quả hơn.
                          </p>
                          <Button 
                             onClick={() => setIsModalOpen(true)}
                             className="bg-agri-600 hover:bg-agri-700"
                          >
                             <Plus className="w-4 h-4 mr-2" /> Tạo vụ mùa đầu tiên
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
      </Card>
    </div>
  )
}
