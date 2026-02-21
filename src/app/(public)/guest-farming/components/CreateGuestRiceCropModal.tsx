"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2, Smartphone } from "lucide-react"
import dayjs from "dayjs"
import { localFarmingService } from "@/lib/local-farming-service"
import { useToast } from "@/hooks/use-toast"
import { CreateRiceCropBody, CreateRiceCropBodyType } from "@/schemaValidations/rice-farming.schema"
import { FormNumberInput, FormFieldWrapper, FormDatePicker, FormComboBox } from "@/components/form"
import { convertSolar2Lunar } from "@/lib/lunar-calendar"

interface CreateGuestRiceCropModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateGuestRiceCropModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGuestRiceCropModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<CreateRiceCropBodyType>({
    resolver: zodResolver(CreateRiceCropBody),
    defaultValues: {
      field_name: "",
      customer_name: "",
      season_name: "",
      location: "",
      amount_of_land: 0,
      area_per_com: 1000,
      field_area: 0,
      rice_variety: "",
      sowing_date: dayjs().format("YYYY-MM-DD"),
      sowing_lunar_date: "",
      transplanting_date: "",
      transplanting_lunar_date: "",
      expected_harvest_date: dayjs().add(100, "day").format("YYYY-MM-DD"),
      expected_harvest_lunar_date: "",
      status: "active",
      growth_stage: "seedling",
    },
  })


  // Theo dõi sự thay đổi để tự tính toán
  const watchedSowingDate = form.watch("sowing_date")
  const watchedTransplantingDate = form.watch("transplanting_date")
  const watchedAmountOfLand = form.watch("amount_of_land")
  const watchedAreaPerCom = form.watch("area_per_com")
  const watchedExpectedHarvestDate = form.watch("expected_harvest_date")

  // Tự tính ngày âm cho ngày cấy
  React.useEffect(() => {
    if (watchedTransplantingDate) {
      const solarDate = dayjs(watchedTransplantingDate)
      if (solarDate.isValid()) {
        const [lDay, lMonth] = convertSolar2Lunar(solarDate.date(), solarDate.month() + 1, solarDate.year())
        form.setValue("transplanting_lunar_date", `${lDay}/${lMonth} (Âm lịch)`)
      }
    } else {
      form.setValue("transplanting_lunar_date", "")
    }
  }, [watchedTransplantingDate, form])

  // Tự tính ngày âm cho ngày gieo
  React.useEffect(() => {
    if (watchedSowingDate) {
      const solarDate = dayjs(watchedSowingDate)
      if (solarDate.isValid()) {
        const [lDay, lMonth] = convertSolar2Lunar(solarDate.date(), solarDate.month() + 1, solarDate.year())
        form.setValue("sowing_lunar_date", `${lDay}/${lMonth} (Âm lịch)`)
      }
    }
  }, [watchedSowingDate, form])

  // Tự tính ngày âm cho ngày dự kiến thu hoạch
  React.useEffect(() => {
    if (watchedExpectedHarvestDate) {
      const solarDate = dayjs(watchedExpectedHarvestDate)
      if (solarDate.isValid()) {
        const [lDay, lMonth] = convertSolar2Lunar(solarDate.date(), solarDate.month() + 1, solarDate.year())
        form.setValue("expected_harvest_lunar_date", `${lDay}/${lMonth} (Âm lịch)`)
      }
    }
  }, [watchedExpectedHarvestDate, form])

  // Tự tính diện tích tổng
  React.useEffect(() => {
    const totalArea = Number(watchedAmountOfLand || 0) * Number(watchedAreaPerCom || 0)
    form.setValue("field_area", totalArea)
  }, [watchedAmountOfLand, watchedAreaPerCom, form])

  const onSubmit = async (values: CreateRiceCropBodyType) => {
    setIsSubmitting(true)
    try {
      await localFarmingService.createRiceCrop({
        ...values,
        id: Date.now(),
      })
      
      toast({ 
        title: "Thành công 🎉", 
        description: "Đã tạo ruộng lúa mới lưu trong bộ nhớ máy." 
      })
      onSuccess()
      onClose()
      form.reset()
    } catch (error) {
      console.error("Error creating local crop:", error)
      toast({ 
        title: "Lỗi", 
        description: "Không thể lưu dữ liệu local.", 
        variant: "destructive" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-agri-600 to-agri-800 p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
               </div>
               <DialogTitle className="text-2xl font-black">Vụ mùa mới</DialogTitle>
            </div>
            <p className="text-agri-100 text-sm font-medium">
              Khởi tạo vụ mùa nhanh chóng để bắt đầu theo dõi tiến độ canh tác.
            </p>
          </DialogHeader>
        </div>
        
        <div className="p-8 bg-white max-h-[70vh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                 <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                 <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Dữ liệu thiết bị</p>
                    <p className="text-xs text-blue-600/80 leading-relaxed">
                       Thông tin này sẽ được lưu duy nhất trên trình duyệt của bạn. Nếu xóa cache trình duyệt, dữ liệu sẽ mất.
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormFieldWrapper
                  control={form.control}
                  name="field_name"
                  label="Tên ruộng lúa (Vị trí)"
                  placeholder="VD: Ruộng nhà"
                  required
                />
                <FormFieldWrapper
                  control={form.control}
                  name="location"
                  label="Vị trí địa lý"
                  placeholder="VD: Xã Tân Mỹ, An Giang"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormFieldWrapper
                  control={form.control}
                  name="customer_name"
                  label="Người làm ruộng"
                  placeholder="VD: Nguyễn Văn A"
                />
                <FormFieldWrapper
                  control={form.control}
                  name="season_name"
                  label="Mùa vụ"
                  placeholder="VD: Thu Đông 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormNumberInput
                  control={form.control}
                  name="amount_of_land"
                  label="Số công đất"
                  placeholder="0"
                  required
                  decimalScale={3}
                />
                <FormComboBox
                  control={form.control}
                  name="area_per_com"
                  label="Diện tích mỗi công"
                  options={[
                    { value: 1000, label: "Tầm nhỏ (1000 m²)" },
                    { value: 1296, label: "Tầm lớn (1296 m²)" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormNumberInput
                  control={form.control}
                  name="field_area"
                  label="Tổng diện tích"
                  placeholder="0"
                  suffix=" m²"
                  disabled
                />
                <FormFieldWrapper
                  control={form.control}
                  name="rice_variety"
                  label="Giống lúa"
                  placeholder="VD: Đài Thơm 8, OM18..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormDatePicker 
                  control={form.control}
                  name="sowing_date"
                  label="Ngày gieo"
                  required
                />
                <FormFieldWrapper
                  control={form.control}
                  name="sowing_lunar_date"
                  label="Ngày gieo âm lịch"
                  placeholder="Tự động tính..."
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormDatePicker 
                  control={form.control}
                  name="transplanting_date"
                  label="Ngày cấy"
                />
                <FormFieldWrapper
                  control={form.control}
                  name="transplanting_lunar_date"
                  label="Ngày cấy âm lịch"
                  placeholder="Tự động tính..."
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormDatePicker 
                  control={form.control}
                  name="expected_harvest_date"
                  label="Dự kiến thu hoạch"
                />
                <FormFieldWrapper
                  control={form.control}
                  name="expected_harvest_lunar_date"
                  label="Dự kiến thu hoạch âm lịch"
                  placeholder="Tự động tính..."
                  disabled
                />
              </div>

              <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  className="rounded-xl font-bold text-gray-500 hover:bg-gray-100 h-12"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-agri-600 hover:bg-agri-700 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-agri-100"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Bắt đầu vụ mùa
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
