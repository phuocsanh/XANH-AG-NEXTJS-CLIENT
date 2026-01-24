"use client"

import React, { useState } from "react"
import { 
  RefreshCw, 
  Zap, 
  AlertCircle, 
  Info
} from "lucide-react"
import { 
  useDiseaseLocation, 
  useUpdateDiseaseLocation, 
  useDiseaseWarning, 
  useRunDiseaseAnalysis 
} from "@/hooks/use-disease-warning"
import {
  LocationForm,
  DailyDataTable,
  DiseaseWarningCard
} from "@/components/disease-warning"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"

export default function DiseaseWarningPage() {
  const [activeTab, setActiveTab] = useState("rice-blast")
  
  // Queries
  const { data: location, isLoading: locationLoading, refetch: refetchLocation } = useDiseaseLocation()
  
  // Warning queries for each disease
  const riceBlast = useDiseaseWarning("rice-blast")
  const bacterialBlight = useDiseaseWarning("bacterial-blight")
  const sheathBlight = useDiseaseWarning("sheath-blight")
  const grainDiscoloration = useDiseaseWarning("grain-discoloration")
  const stemBorer = useDiseaseWarning("stem-borer")
  const gallMidge = useDiseaseWarning("gall-midge")
  const brownPlantHopper = useDiseaseWarning("brown-plant-hopper")
  
  // Mutations
  const updateLocation = useUpdateDiseaseLocation()
  const runRiceBlast = useRunDiseaseAnalysis("rice-blast")
  const runBacterialBlight = useRunDiseaseAnalysis("bacterial-blight")
  const runSheathBlight = useRunDiseaseAnalysis("sheath-blight")
  const runGrainDiscoloration = useRunDiseaseAnalysis("grain-discoloration")
  const runStemBorer = useRunDiseaseAnalysis("stem-borer")
  const runGallMidge = useRunDiseaseAnalysis("gall-midge")
  const runBrownPlantHopper = useRunDiseaseAnalysis("brown-plant-hopper")

  const isAnalyzing = 
    runRiceBlast.isPending || 
    runBacterialBlight.isPending ||
    runSheathBlight.isPending ||
    runGrainDiscoloration.isPending ||
    runStemBorer.isPending ||
    runGallMidge.isPending ||
    runBrownPlantHopper.isPending

  const handleUpdateLocation = async (values: any) => {
    try {
      await updateLocation.mutateAsync(values)
      toast({
        title: "Thành công",
        description: "Đã cập nhật vị trí ruộng lúa",
      })
      handleRunAllAnalyses()
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật vị trí",
        variant: "destructive"
      })
    }
  }

  const handleRunAllAnalyses = () => {
    runRiceBlast.mutate()
    runBacterialBlight.mutate()
    runSheathBlight.mutate()
    runGrainDiscoloration.mutate()
    runStemBorer.mutate()
    runGallMidge.mutate()
    runBrownPlantHopper.mutate()
  }

  const handleRefresh = () => {
    switch (activeTab) {
      case "rice-blast": riceBlast.refetch(); break;
      case "bacterial-blight": bacterialBlight.refetch(); break;
      case "sheath-blight": sheathBlight.refetch(); break;
      case "grain-discoloration": grainDiscoloration.refetch(); break;
      case "stem-borer": stemBorer.refetch(); break;
      case "gall-midge": gallMidge.refetch(); break;
      case "brown-plant-hopper": brownPlantHopper.refetch(); break;
    }
    refetchLocation()
  }

  const isLoading = locationLoading

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl md:text-3xl font-black text-emerald-900 tracking-tight flex items-center gap-3">
             🌾 Cảnh Báo Dịch Bệnh AI
           </h1>
           <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
             Tự động phân tích rủi ro dựa trên dữ liệu thời tiết thực tế
           </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 md:flex-none h-10 border-emerald-100 text-emerald-700 font-bold bg-white shadow-sm"
            onClick={handleRefresh}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading && 'animate-spin'}`} />
            Làm mới
          </Button>
          <Button 
            size="sm" 
            className="flex-1 md:flex-none h-10 bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95 font-bold"
            onClick={handleRunAllAnalyses}
            disabled={isAnalyzing || !location}
          >
            <Zap className={`h-4 w-4 mr-2 ${isAnalyzing && 'animate-pulse text-yellow-300'}`} />
            {isAnalyzing ? "Đang phân tích..." : "Phân tích tất cả"}
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-300">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-xs font-bold uppercase tracking-wider">Hệ thống tự động</AlertTitle>
        <AlertDescription className="text-xs">
          Dữ liệu cập nhật mỗi ngày lúc 6:00 sáng. Lưu ý: Phân tích AI thủ công có thể mất <span className="font-bold underline">5-10 giây</span>.
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
            onSubmit={handleUpdateLocation} 
            loading={updateLocation.isPending} 
          />

          {/* Disease Sections */}
          <Tabs defaultValue="rice-blast" onValueChange={setActiveTab} className="w-full">
            <div className="relative mb-6">
               <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-white border border-emerald-50 rounded-2xl shadow-sm flex-nowrap scrollbar-hide">
                 <TabsTrigger value="rice-blast" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight">🦠 Đạo Ôn</TabsTrigger>
                 <TabsTrigger value="bacterial-blight" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight">🍃 Cháy Bìa Lá</TabsTrigger>
                 <TabsTrigger value="sheath-blight" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight">🍂 Khô Vằn</TabsTrigger>
                 <TabsTrigger value="grain-discoloration" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight">🌾 Lem Lép Hạt</TabsTrigger>
                 <TabsTrigger value="stem-borer" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight">🐛 Sâu Đục Thân</TabsTrigger>
                 <TabsTrigger value="gall-midge" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight">🦟 Muỗi Hành</TabsTrigger>
                 <TabsTrigger value="brown-plant-hopper" className="px-4 py-2.5 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:font-black transition-all shrink-0 font-bold text-xs uppercase tracking-tight">🦗 Rầy Nâu</TabsTrigger>
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
                analyzing={runRiceBlast.isPending}
                onAnalyze={() => runRiceBlast.mutate()}
                location={!!location}
              />
            </TabsContent>

            {/* Bacterial Blight */}
            <TabsContent value="bacterial-blight" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Bệnh Cháy Bìa Lá"
                slug="bacterial-blight"
                data={bacterialBlight.data}
                loading={bacterialBlight.isLoading}
                analyzing={runBacterialBlight.isPending}
                onAnalyze={() => runBacterialBlight.mutate()}
                location={!!location}
              />
            </TabsContent>

            {/* Sheath Blight */}
            <TabsContent value="sheath-blight" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Bệnh Khô Vằn"
                slug="sheath-blight"
                data={sheathBlight.data}
                loading={sheathBlight.isLoading}
                analyzing={runSheathBlight.isPending}
                onAnalyze={() => runSheathBlight.mutate()}
                location={!!location}
              />
            </TabsContent>

            {/* Grain Discoloration */}
            <TabsContent value="grain-discoloration" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Bệnh Lem Lép Hạt"
                slug="grain-discoloration"
                data={grainDiscoloration.data}
                loading={grainDiscoloration.isLoading}
                analyzing={runGrainDiscoloration.isPending}
                onAnalyze={() => runGrainDiscoloration.mutate()}
                location={!!location}
              />
            </TabsContent>

            {/* Stem Borer */}
            <TabsContent value="stem-borer" className="space-y-4 focus-visible:outline-none">
              <DiseaseTabPanel 
                diseaseTitle="Sâu Đục Thân"
                slug="stem-borer"
                data={stemBorer.data}
                loading={stemBorer.isLoading}
                analyzing={runStemBorer.isPending}
                onAnalyze={() => runStemBorer.mutate()}
                location={!!location}
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
                analyzing={runGallMidge.isPending}
                onAnalyze={() => runGallMidge.mutate()}
                location={!!location}
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
                analyzing={runBrownPlantHopper.isPending}
                onAnalyze={() => runBrownPlantHopper.mutate()}
                location={!!location}
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
  analyzing, 
  onAnalyze, 
  location,
  borderColor
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-end pr-1">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold px-4 rounded-xl"
          onClick={onAnalyze}
          disabled={analyzing || !location}
        >
          {analyzing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
          Phân tích {diseaseTitle}
        </Button>
      </div>

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
            loading={analyzing} 
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
                  loading={analyzing} 
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
            Vui lòng nhấn nút "Phân tích {diseaseTitle}" để nhận kết quả từ AI.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
