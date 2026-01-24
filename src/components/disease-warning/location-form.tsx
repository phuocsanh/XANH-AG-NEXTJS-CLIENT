"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MapPin, Target, Save, Loader2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { 
  DiseaseLocation, 
  UpdateDiseaseLocationDto 
} from "@/models/disease-warning"
import LocationMap from "@/app/(public)/components/LocationMap"
import { Location as MapLocation } from "@/constants/locations"
import { weatherService } from "@/lib/weather"

const formSchema = z.object({
  name: z.string().min(3, "Tên vị trí phải có ít nhất 3 ký tự"),
  lat: z.number(),
  lon: z.number(),
})

interface LocationFormProps {
  location?: DiseaseLocation
  onSubmit: (values: UpdateDiseaseLocationDto) => void
  loading?: boolean
}

export const LocationForm: React.FC<LocationFormProps> = ({
  location,
  onSubmit,
  loading = false,
}) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: location?.name || "",
      lat: location?.lat || 20.4167,
      lon: location?.lon || 106.3667,
    },
  })

  // Cập nhật form khi location prop thay đổi
  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name,
        lat: location.lat,
        lon: location.lon,
      })
    }
  }, [location, form])

  const onFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Lỗi",
        description: "Trình duyệt không hỗ trợ định vị",
        variant: "destructive",
      })
      return
    }

    setIsDetecting(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const detailedName = await weatherService.getPlaceName(latitude, longitude)
          form.setValue("name", detailedName || "Vị trí hiện tại")
          form.setValue("lat", latitude)
          form.setValue("lon", longitude)
          
          toast({
            title: "Thành công",
            description: `Đã xác định: ${detailedName}`,
          })
        } catch {
          form.setValue("lat", latitude)
          form.setValue("lon", longitude)
          toast({
            title: "Cảnh báo",
            description: "Đã lấy được tọa độ nhưng không thể xác định tên địa điểm",
          })
        } finally {
          setIsDetecting(false)
        }
      },
      () => {
        setIsDetecting(false)
        toast({
          title: "Lỗi",
          description: "Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập.",
          variant: "destructive",
        })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleMapSelect = (mapLoc: MapLocation) => {
    form.setValue("name", mapLoc.name)
    form.setValue("lat", mapLoc.latitude)
    form.setValue("lon", mapLoc.longitude)
    setIsMapModalOpen(false)
    toast({
      title: "Đã chọn",
      description: `Vị trí: ${mapLoc.name}`,
    })
  }

  const currentValues = form.getValues()
  const mapSelectedLocation = {
    latitude: currentValues.lat,
    longitude: currentValues.lon,
    name: currentValues.name || "Vị trí đang chọn",
  }

  return (
    <>
      <Card className="mb-6 overflow-hidden border-emerald-100 shadow-sm">
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full text-start">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                           <MapPin className="h-3 w-3" /> Vị trí ruộng lúa
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                             <Input 
                                placeholder="Nhập địa chỉ hoặc tên ruộng..." 
                                {...field} 
                                className="pr-10 h-10 border-emerald-100 focus-visible:ring-emerald-500"
                             />
                             {loading && (
                               <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                 <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                               </div>
                             )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  {/* Hidden fields */}
                  <FormField control={form.control} name="lat" render={() => <FormItem className="hidden"><FormControl><Input type="hidden" /></FormControl></FormItem>} />
                  <FormField control={form.control} name="lon" render={() => <FormItem className="hidden"><FormControl><Input type="hidden" /></FormControl></FormItem>} />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-10 w-10 border-emerald-200 text-emerald-700"
                    onClick={detectLocation}
                    disabled={isDetecting || loading}
                    title="Lấy vị trí hiện tại"
                  >
                    {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-10 w-10 border-emerald-200 text-emerald-700"
                    onClick={() => setIsMapModalOpen(true)}
                    disabled={loading}
                    title="Chọn trên bản đồ"
                  >
                    <Globe className="h-4 w-4" />
                  </Button>

                  <Button
                    type="submit"
                    className="flex-1 md:w-24 bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95 flex items-center gap-2 h-10"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-1 sm:p-6 rounded-3xl">
          <DialogHeader className="px-4 pt-4 sm:pt-0">
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              Chọn vị trí ruộng lúa trên bản đồ
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-[400px] mt-4 relative rounded-2xl overflow-hidden border border-emerald-100">
            <LocationMap
              selectedLocation={mapSelectedLocation}
              onLocationSelect={handleMapSelect}
              height="100%"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
