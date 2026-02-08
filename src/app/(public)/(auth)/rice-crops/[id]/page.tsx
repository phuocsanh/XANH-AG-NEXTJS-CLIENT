"use client"

/**
 * Trang chi tiết Ruộng lúa cho nông dân
 */

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { useRiceCrop } from "@/hooks/use-rice-crops"
import {
  getGrowthStageText,
  getCropStatusText,
  getGrowthStageColor,
  getCropStatusColor,
} from "@/models/rice-farming"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit } from "lucide-react"
import dayjs from "dayjs"
import { cn } from "@/lib/utils"

import FarmingSchedulesTab from "./components/FarmingSchedulesTab"
import GrowthTrackingTab from "./components/GrowthTrackingTab"
import CostItemsTab from "./components/CostItemsTab"
import InvoicesTab from "./components/InvoicesTab"
import HarvestRecordsTab from "./components/HarvestRecordsTab"
import ProfitReportTab from "./components/ProfitReportTab"
import EditRiceCropModal from "./components/EditRiceCropModal"

export default function RiceCropDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id ? parseInt(params.id as string, 10) : null
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  
  const { data: riceCrop, isLoading } = useRiceCrop(id)

  const [activeTab, setActiveTab] = React.useState("profit")
  const tabsListRef = React.useRef<HTMLDivElement>(null)

  // Tự động cuộn tab active vào giữa container khi thay đổi
  React.useEffect(() => {
    if (tabsListRef.current) {
      const activeElement = tabsListRef.current.querySelector('[data-state="active"]')
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [activeTab])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>

        {/* Card with Tabs Skeleton */}
        <Card>
          <CardContent className="p-0">
            {/* Tabs Skeleton */}
            <div className="border-b px-4">
              <div className="h-12 flex gap-6">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} className="h-12 w-32" />
                ))}
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="grid grid-cols-2 py-3 border-b">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!riceCrop) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Không tìm thấy thông tin Ruộng lúa</h2>
        <Button onClick={() => router.push("/rice-crops")}>Quay lại danh sách</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 space-y-6 mt-6 pb-10">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{riceCrop.field_name}</h1>
              <Badge variant={getCropStatusColor(riceCrop.status)}>
                {getCropStatusText(riceCrop.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {riceCrop.season?.name} ({riceCrop.season?.year})
            </p>
          </div>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsEditModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Chỉnh sửa thông tin
        </Button>
      </div>

      {/* Main Content with Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-4 overflow-x-auto scroll-smooth no-scrollbar" ref={tabsListRef}>
              <TabsList className="h-12 bg-transparent gap-6 inline-flex whitespace-nowrap">
                 <TabsTrigger 
                   value="profit" 
                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
                >
                  <span className="mr-2">📈</span>
                  Báo cáo chi phí lợi nhuận
                </TabsTrigger>
                 <TabsTrigger 
                   value="invoices" 
                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
                >
                  <span className="mr-2">🧾</span>
                  Hóa đơn mua hàng
                </TabsTrigger>
                <TabsTrigger 
                   value="info" 
                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
                >
                  <span className="mr-2">ℹ️</span>
                  Thông tin chung
                </TabsTrigger>
                <TabsTrigger 
                   value="schedule" 
                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
                >
                  <span className="mr-2">📅</span>
                  Lịch canh tác
                </TabsTrigger>
                <TabsTrigger 
                   value="tracking" 
                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
                >
                  <span className="mr-2">🌱</span>
                  Theo dõi sinh trưởng
                </TabsTrigger>
                <TabsTrigger 
                   value="costs" 
                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
                >
                  <span className="mr-2">💰</span>
                  Chi phí canh tác
                </TabsTrigger>
               
                <TabsTrigger 
                   value="harvest" 
                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
                >
                  <span className="mr-2">🌾</span>
                  Thu hoạch
                </TabsTrigger>
               
              </TabsList>
            </div>

            <TabsContent value="info" className="p-3 sm:p-6">
              <div className="border rounded-xl font-medium overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y divide-x-0 md:divide-x divide-border shadow-sm bg-card text-sm">
                <DetailItem 
                  label="Mùa vụ" 
                  value={riceCrop.season ? `${riceCrop.season.name} (${riceCrop.season.year})` : "-"} 
                />
                <DetailItem label="Khách hàng" value={riceCrop.customer?.name} />
                <DetailItem label="Tên ruộng" value={riceCrop.field_name} />
                <DetailItem 
                  label="Diện tích" 
                  value={
                    riceCrop.field_area 
                      ? `${Number(riceCrop.field_area).toLocaleString("vi-VN")} m² (${Number(riceCrop.amount_of_land).toLocaleString("vi-VN")} công)` 
                      : "-"
                  } 
                />
                <DetailItem label="Giống lúa" value={riceCrop.rice_variety} />
                <DetailItem label="Nguồn giống" value={riceCrop.seed_source} />
                <DetailItem label="Vị trí" value={riceCrop.location} className="md:col-span-2" />
                <DetailItem 
                  label="Giai đoạn" 
                  value={
                    <Badge variant={getGrowthStageColor(riceCrop.growth_stage)}>
                      {getGrowthStageText(riceCrop.growth_stage)}
                    </Badge>
                  } 
                />
                <DetailItem 
                  label="Trạng thái" 
                  value={
                    <Badge variant={getCropStatusColor(riceCrop.status)}>
                      {getCropStatusText(riceCrop.status)}
                    </Badge>
                  } 
                />
                <DetailItem label="Ngày gieo" value={riceCrop.sowing_date ? dayjs(riceCrop.sowing_date).format("DD/MM/YYYY") : "-"} />
                <DetailItem label="Ngày cấy" value={riceCrop.transplanting_date ? dayjs(riceCrop.transplanting_date).format("DD/MM/YYYY") : "-"} />
                <DetailItem label="Ngày thu hoạch dự kiến" value={riceCrop.expected_harvest_date ? dayjs(riceCrop.expected_harvest_date).format("DD/MM/YYYY") : "-"} />
                <DetailItem label="Ngày thu hoạch thực tế" value={riceCrop.actual_harvest_date ? dayjs(riceCrop.actual_harvest_date).format("DD/MM/YYYY") : "-"} />
                {riceCrop.yield_amount && <DetailItem label="Sản lượng" value={`${riceCrop.yield_amount} kg`} />}
                {riceCrop.quality_grade && <DetailItem label="Chất lượng" value={riceCrop.quality_grade} />}
                {riceCrop.notes && <DetailItem label="Ghi chú" value={riceCrop.notes} className="md:col-span-2" />}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="p-3 sm:p-6">
              <FarmingSchedulesTab riceCropId={riceCrop.id} />
            </TabsContent>
            
            <TabsContent value="tracking" className="p-3 sm:p-6">
              <GrowthTrackingTab riceCropId={riceCrop.id} />
            </TabsContent>

            <TabsContent value="costs" className="p-3 sm:p-6">
              <CostItemsTab riceCropId={riceCrop.id} />
            </TabsContent>

            <TabsContent value="invoices" className="p-3 sm:p-6">
              <InvoicesTab riceCropId={riceCrop.id} />
            </TabsContent>

            <TabsContent value="harvest" className="p-3 sm:p-6">
              <HarvestRecordsTab riceCropId={riceCrop.id} />
            </TabsContent>

            <TabsContent value="profit" className="p-3 sm:p-6">
              <ProfitReportTab riceCropId={riceCrop.id} amountOfLand={Number(riceCrop.amount_of_land)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {riceCrop && (
        <EditRiceCropModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          riceCrop={riceCrop}
        />
      )}
    </div>
  )
}

function DetailItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col sm:flex-row min-h-[48px] items-stretch", className)}>
      <div className="w-full sm:w-[160px] md:w-[180px] shrink-0 font-medium text-muted-foreground bg-muted/30 flex items-center px-4 py-3 sm:border-r border-border">
        {label}
      </div>
      <div className="flex-1 px-4 py-3 text-foreground font-semibold flex items-center min-h-[44px]">
        {value || "-"}
      </div>
    </div>
  )
}
