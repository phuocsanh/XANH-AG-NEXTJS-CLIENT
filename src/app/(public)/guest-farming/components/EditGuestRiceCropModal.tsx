"use client"

import React, { useEffect } from "react"
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
import { Loader2, Edit } from "lucide-react"
import dayjs from "dayjs"
import { localFarmingService } from "@/lib/local-farming-service"
import { useToast } from "@/hooks/use-toast"
import { UpdateRiceCropBody, UpdateRiceCropBodyType } from "@/schemaValidations/rice-farming.schema"
import { FormNumberInput, FormFieldWrapper, FormDatePicker, FormComboBox } from "@/components/form"
import { convertSolar2Lunar } from "@/lib/lunar-calendar"
import { RiceCrop } from "@/models/rice-farming"

interface EditGuestRiceCropModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  riceCrop: RiceCrop
}

export default function EditGuestRiceCropModal({
  isOpen,
  onClose,
  onSuccess,
  riceCrop,
}: EditGuestRiceCropModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<UpdateRiceCropBodyType>({
    resolver: zodResolver(UpdateRiceCropBody),
    defaultValues: {
      field_name: riceCrop.field_name,
      customer_name: riceCrop.customer_name || "",
      season_name: riceCrop.season_name || "",
      location: riceCrop.location || "",
      amount_of_land: riceCrop.amount_of_land || 0,
      field_area: riceCrop.field_area || 0,
      rice_variety: riceCrop.rice_variety,
      sowing_date: riceCrop.sowing_date || dayjs().format("YYYY-MM-DD"),
      sowing_lunar_date: riceCrop.sowing_lunar_date || "",
      transplanting_date: riceCrop.transplanting_date || "",
      transplanting_lunar_date: riceCrop.transplanting_lunar_date || "",
      expected_harvest_date: riceCrop.expected_harvest_date || dayjs().add(100, "day").format("YYYY-MM-DD"),
      expected_harvest_lunar_date: riceCrop.expected_harvest_lunar_date || "",
      status: riceCrop.status || "active",
      growth_stage: riceCrop.growth_stage || "seedling",
      seed_source: riceCrop.seed_source || "",
      actual_harvest_date: riceCrop.actual_harvest_date || "",
      area_per_com: (riceCrop.field_area && riceCrop.amount_of_land) ? (Math.round(riceCrop.field_area / riceCrop.amount_of_land) === 1296 ? 1296 : 1000) : 1000,
    },
  })

  // Cập nhật giá trị khi riceCrop thay đổi (ví dụ khi đóng/mở lại)
  useEffect(() => {
    if (isOpen) {
      form.reset({
        field_name: riceCrop.field_name,
        customer_name: riceCrop.customer_name || "",
        season_name: riceCrop.season_name || "",
        location: riceCrop.location || "",
        amount_of_land: riceCrop.amount_of_land || 0,
        field_area: riceCrop.field_area || 0,
        rice_variety: riceCrop.rice_variety,
        sowing_date: riceCrop.sowing_date || dayjs().format("YYYY-MM-DD"),
        sowing_lunar_date: riceCrop.sowing_lunar_date || "",
        transplanting_date: riceCrop.transplanting_date || "",
        transplanting_lunar_date: riceCrop.transplanting_lunar_date || "",
        expected_harvest_date: riceCrop.expected_harvest_date || dayjs().add(100, "day").format("YYYY-MM-DD"),
        expected_harvest_lunar_date: riceCrop.expected_harvest_lunar_date || "",
        status: riceCrop.status || "active",
        growth_stage: riceCrop.growth_stage || "seedling",
        seed_source: riceCrop.seed_source || "",
        actual_harvest_date: riceCrop.actual_harvest_date || "",
        area_per_com: (riceCrop.field_area && riceCrop.amount_of_land) ? (Math.round(riceCrop.field_area / riceCrop.amount_of_land) === 1296 ? 1296 : 1000) : 1000,
      })
    }
  }, [isOpen, riceCrop, form])


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

  const onSubmit = async (values: UpdateRiceCropBodyType) => {
    setIsSubmitting(true)
    try {
      await localFarmingService.updateRiceCrop(riceCrop.id!, values)
      
      toast({ 
        title: "Thành công 🎉", 
        description: "Đã cập nhật thông tin ruộng lúa." 
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error updating local crop:", error)
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
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-white" />
               </div>
               <DialogTitle className="text-2xl font-black">Chỉnh sửa vụ mùa</DialogTitle>
            </div>
            <p className="text-blue-100 text-sm font-medium">
              Cập nhật thông tin chi tiết cho ruộng lúa của bạn.
            </p>
          </DialogHeader>
        </div>
        
        <div className="p-8 bg-white max-h-[70vh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormFieldWrapper
                  control={form.control}
                  name="field_name"
                  label="Tên ruộng lúa"
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
                 <FormComboBox
                    control={form.control}
                    name="growth_stage"
                    label="Giai đoạn sinh trưởng"
                    options={[
                      { value: "seedling", label: "Giai đoạn mạ" },
                      { value: "tillering", label: "Đẻ nhánh" },
                      { value: "panicle", label: "Làm đòng" },
                      { value: "heading", label: "Trổ bông" },
                      { value: "grain_filling", label: "Vô gạo" },
                      { value: "ripening", label: "Chín" },
                      { value: "harvested", label: "Đã thu hoạch" }
                    ]}
                    required
                 />
                 <FormComboBox
                    control={form.control}
                    name="status"
                    label="Trạng thái"
                    options={[
                      { value: "active", label: "Đang canh tác" },
                      { value: "harvested", label: "Đã thu hoạch xong" },
                      { value: "failed", label: "Thất thu/Hủy vụ" }
                    ]}
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
                  label="Âm lịch"
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
                  label="Âm lịch"
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
                  label="Âm lịch"
                  placeholder="Tự động tính..."
                  disabled
                />
              </div>

              <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  className="rounded-xl font-bold text-gray-500 hover:bg-gray-100 h-10 md:h-12"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 h-10 md:h-12 shadow-lg shadow-blue-100"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
