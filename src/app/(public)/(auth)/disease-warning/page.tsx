"use client"

import React, { useState } from "react"
import { 
  AlertCircle, 
  Info
} from "lucide-react"
import { 
  useDiseaseLocation, 
  useDiseaseWarning
} from "@/hooks/use-disease-warning"
import {
  LocationForm,
  DailyDataTable,
  DiseaseWarningCard
} from "@/components/disease-warning"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export default function DiseaseWarningPage() {
  const [activeTab, setActiveTab] = useState("rice-blast")
  
  // Queries
  const { data: location, isLoading: locationLoading } = useDiseaseLocation()
  
  // Warning queries for each disease
  const riceBlast = useDiseaseWarning("rice-blast")
  const bacterialBlight = useDiseaseWarning("bacterial-blight")
  const sheathBlight = useDiseaseWarning("sheath-blight")
  const grainDiscoloration = useDiseaseWarning("grain-discoloration")
  const stemBorer = useDiseaseWarning("stem-borer")
  const gallMidge = useDiseaseWarning("gall-midge")
  const brownPlantHopper = useDiseaseWarning("brown-plant-hopper")
  
  const tabsListRef = React.useRef<HTMLDivElement>(null)

  // Tự động cuộn tab đang chọn vào giữa (center) để người dùng thấy các tab lân cận
  React.useEffect(() => {
    if (tabsListRef.current) {
      const activeElement = tabsListRef.current.querySelector(
        '[data-state="active"]'
      ) as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [activeTab])

  const isLoading = locationLoading

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl md:text-3xl font-black text-emerald-900 tracking-tight flex items-center gap-3">
             🌾 Cảnh Báo Dịch Bệnh
           </h1>
           <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
             Phân tích rủi ro sâu bệnh hại dựa trên dữ liệu thời tiết, <span className="text-emerald-700 font-bold">"dự báo mang tính chất tham khảo"</span>. Quý bà con nông dân cần quan sát thêm tình hình thực tế từ ruộng lúa và các ruộng xung quanh.
           </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-300">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-xs font-bold uppercase tracking-wider">Hệ thống tự động</AlertTitle>
        <AlertDescription className="text-xs">
          Dữ liệu cập nhật mỗi ngày lúc 6:00 sáng. Toàn bộ phân tích được thực hiện tự động dựa trên vị trí ruộng lúa.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <Card className="border-none shadow-none bg-muted/10">
          <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
             <p className="text-emerald-800 font-bold text-sm uppercase tracking-widest animate-pulse">Đang tải dữ liệu...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Location Form */}
          <LocationForm 
            location={location} 
          />

          {/* Disease Sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative mb-6">
               <TabsList 
                ref={tabsListRef}
                className="w-full justify-start overflow-x-auto h-auto p-1 bg-white border border-emerald-50 rounded-2xl shadow-sm flex-nowrap scrollbar-hide snap-x scroll-smooth"
               >
                 <TabsTrigger value="rice-blast" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight snap-center">🦠 Đạo Ôn</TabsTrigger>
                 <TabsTrigger value="bacterial-blight" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight snap-center">🍃 Cháy Bìa Lá</TabsTrigger>
                 <TabsTrigger value="sheath-blight" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight snap-center">🍂 Khô Vằn</TabsTrigger>
                 <TabsTrigger value="grain-discoloration" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight snap-center">🌾 Lem Lép Hạt</TabsTrigger>
                 <TabsTrigger value="stem-borer" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight snap-center">🐛 Sâu Đục Thân</TabsTrigger>
                 <TabsTrigger value="gall-midge" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight snap-center">🦟 Muỗi Hành</TabsTrigger>
                 <TabsTrigger value="brown-plant-hopper" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight snap-center">🦗 Rầy Nâu</TabsTrigger>
               </TabsList>
            </div>

            {/* TAB CONTENTS */}
            
            {/* Rice Blast */}
            <TabsContent value="rice-blast" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Bệnh Đạo Ôn"
                slug="rice-blast"
                data={riceBlast.data}
                loading={riceBlast.isLoading}
              />
            </TabsContent>

            {/* Bacterial Blight */}
            <TabsContent value="bacterial-blight" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Bệnh Cháy Bìa Lá"
                slug="bacterial-blight"
                data={bacterialBlight.data}
                loading={bacterialBlight.isLoading}
              />
            </TabsContent>

            {/* Sheath Blight */}
            <TabsContent value="sheath-blight" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Bệnh Khô Vằn"
                slug="sheath-blight"
                data={sheathBlight.data}
                loading={sheathBlight.isLoading}
              />
            </TabsContent>

            {/* Grain Discoloration */}
            <TabsContent value="grain-discoloration" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Bệnh Lem Lép Hạt"
                slug="grain-discoloration"
                data={grainDiscoloration.data}
                loading={grainDiscoloration.isLoading}
              />
            </TabsContent>

            {/* Stem Borer */}
            <TabsContent value="stem-borer" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Sâu Đục Thân"
                slug="stem-borer"
                data={stemBorer.data}
                loading={stemBorer.isLoading}
                borderColor="#fa8c16"
              />
            </TabsContent>

            {/* Gall Midge */}
            <TabsContent value="gall-midge" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Muỗi Hành"
                slug="gall-midge"
                data={gallMidge.data}
                loading={gallMidge.isLoading}
                borderColor="#722ed1"
              />
            </TabsContent>

            {/* Brown Plant Hopper */}
            <TabsContent value="brown-plant-hopper" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Rầy Nâu"
                slug="brown-plant-hopper"
                data={brownPlantHopper.data}
                loading={brownPlantHopper.isLoading}
                borderColor="#13c2c2"
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

function DiseaseTabPanel({ 
  diseaseTitle, 
  slug, 
  data, 
  loading, 
  borderColor
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : data ? (
        <>
          <DiseaseWarningCard 
            warning={data} 
            title={diseaseTitle} 
            borderColor={borderColor}
          />
          
          {data.daily_data && data.daily_data.length > 0 && (
            <Card className="rounded-3xl border-emerald-50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/5 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span className="bg-emerald-100 p-1.5 rounded-lg text-lg">📊</span>
                  Dữ liệu chi tiết 7 ngày
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DailyDataTable 
                  data={data.daily_data} 
                  diseaseType={slug} 
                />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800 rounded-2xl">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="font-bold">Chưa có dữ liệu</AlertTitle>
          <AlertDescription>
            Hệ thống đang thu thập dữ liệu. Vui lòng quay lại sau.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
