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
import { Loader2 } from "lucide-react"
import dayjs from "dayjs"
import { useUpdateRiceCrop } from "@/hooks/use-rice-crops"
import { 
  type RiceCrop,
  GrowthStage,
  CropStatus,
  UpdateRiceCropDto,
} from "@/models/rice-farming"
import { useToast } from "@/hooks/use-toast"
import { UpdateRiceCropBody, UpdateRiceCropBodyType } from "@/schemaValidations/rice-farming.schema"
import { FormDatePicker, FormComboBox, FormFieldWrapper, FormNumberInput } from "@/components/form"
import { convertSolar2Lunar } from "@/lib/lunar-calendar"

interface EditRiceCropModalProps {
  isOpen: boolean
  onClose: () => void
  riceCrop: RiceCrop
}

export default function EditRiceCropModal({
  isOpen,
  onClose,
  riceCrop,
}: EditRiceCropModalProps) {
  const { toast } = useToast()
  const updateMutation = useUpdateRiceCrop()

  const form = useForm<UpdateRiceCropBodyType>({
    resolver: zodResolver(UpdateRiceCropBody),
    defaultValues: {
      field_name: riceCrop.field_name,
      customer_name: riceCrop.customer_name || "",
      season_name: riceCrop.season_name || "",
      amount_of_land: riceCrop.amount_of_land || 0,
      field_area: riceCrop.field_area,
      rice_variety: riceCrop.rice_variety,
      seed_source: riceCrop.seed_source || "",
      location: riceCrop.location || "",
      growth_stage: riceCrop.growth_stage,
      status: riceCrop.status,
      sowing_date: riceCrop.sowing_date || undefined,
      sowing_lunar_date: riceCrop.sowing_lunar_date || "",
      transplanting_date: riceCrop.transplanting_date || undefined,
      transplanting_lunar_date: riceCrop.transplanting_lunar_date || "",
      expected_harvest_date: riceCrop.expected_harvest_date || undefined,
      expected_harvest_lunar_date: riceCrop.expected_harvest_lunar_date || "",
      actual_harvest_date: riceCrop.actual_harvest_date || undefined,
      area_per_com: (riceCrop.field_area && riceCrop.amount_of_land) ? (Math.round(riceCrop.field_area / riceCrop.amount_of_land) === 1296 ? 1296 : 1000) : 1000,
    },
  })


  // Theo dõi sự thay đổi để tự tính toán
  const watchedSowingDate = form.watch("sowing_date")
  const watchedTransplantingDate = form.watch("transplanting_date")
  const watchedAmountOfLand = form.watch("amount_of_land")
  const watchedAreaPerCom = form.watch("area_per_com")
  const watchedExpectedHarvestDate = form.watch("expected_harvest_date")

  // Tự tính ngày âm khi ngày dương thay đổi (Ngày cấy)
  useEffect(() => {
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

  // Tự tính ngày âm khi ngày dương thay đổi (Ngày gieo)
  useEffect(() => {
    if (watchedSowingDate) {
      const solarDate = dayjs(watchedSowingDate)
      if (solarDate.isValid()) {
        const [lDay, lMonth] = convertSolar2Lunar(solarDate.date(), solarDate.month() + 1, solarDate.year())
        form.setValue("sowing_lunar_date", `${lDay}/${lMonth} (Âm lịch)`)
      }
    }
  }, [watchedSowingDate, form])

  // Tự tính ngày âm khi ngày dương thay đổi (Dự kiến thu hoạch)
  useEffect(() => {
    if (watchedExpectedHarvestDate) {
      const solarDate = dayjs(watchedExpectedHarvestDate)
      if (solarDate.isValid()) {
        const [lDay, lMonth] = convertSolar2Lunar(solarDate.date(), solarDate.month() + 1, solarDate.year())
        form.setValue("expected_harvest_lunar_date", `${lDay}/${lMonth} (Âm lịch)`)
      }
    }
  }, [watchedExpectedHarvestDate, form])

  // Tự tính diện tích tổng
  useEffect(() => {
    const totalArea = Number(watchedAmountOfLand || 0) * Number(watchedAreaPerCom || 0)
    form.setValue("field_area", totalArea)
  }, [watchedAmountOfLand, watchedAreaPerCom, form])

  useEffect(() => {
    if (isOpen) {
      form.reset({
        field_name: riceCrop.field_name,
        customer_name: riceCrop.customer_name || "",
        season_name: riceCrop.season_name || "",
        amount_of_land: riceCrop.amount_of_land || 0,
        field_area: riceCrop.field_area,
        rice_variety: riceCrop.rice_variety,
        seed_source: riceCrop.seed_source || "",
        location: riceCrop.location || "",
        growth_stage: riceCrop.growth_stage,
        status: riceCrop.status,
        sowing_date: riceCrop.sowing_date || undefined,
        sowing_lunar_date: riceCrop.sowing_lunar_date || "",
        transplanting_date: riceCrop.transplanting_date || undefined,
        transplanting_lunar_date: riceCrop.transplanting_lunar_date || "",
        expected_harvest_date: riceCrop.expected_harvest_date || undefined,
        expected_harvest_lunar_date: riceCrop.expected_harvest_lunar_date || "",
        actual_harvest_date: riceCrop.actual_harvest_date || undefined,
        area_per_com: (riceCrop.field_area && riceCrop.amount_of_land) ? (Math.round(riceCrop.field_area / riceCrop.amount_of_land) === 1296 ? 1296 : 1000) : 1000,
      })
    }
  }, [isOpen, riceCrop, form])

  const onSubmit = async (values: UpdateRiceCropBodyType) => {
    try {
      const dto: UpdateRiceCropDto = {
        ...values,
        growth_stage: values.growth_stage as GrowthStage,
        status: values.status as CropStatus,
        sowing_date: values.sowing_date ? dayjs(values.sowing_date).format("YYYY-MM-DD") : undefined,
        transplanting_date: values.transplanting_date ? dayjs(values.transplanting_date).format("YYYY-MM-DD") : undefined,
        expected_harvest_date: values.expected_harvest_date ? dayjs(values.expected_harvest_date).format("YYYY-MM-DD") : undefined,
        actual_harvest_date: values.actual_harvest_date ? dayjs(values.actual_harvest_date).format("YYYY-MM-DD") : undefined,
      }

      await updateMutation.mutateAsync({ id: riceCrop.id, dto })
      toast({ title: "Thành công", description: "Đã cập nhật thông tin ruộng lúa" })
      onClose()
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi cập nhật", variant: "destructive" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-agri-900">Chỉnh sửa thông tin Ruộng lúa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper
                control={form.control}
                name="field_name"
                label="Tên ruộng"
                placeholder="Nhập tên ruộng"
                required
              />
              <FormFieldWrapper
                control={form.control}
                name="location"
                label="Vị trí"
                placeholder="Nhập vị trí ruộng"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper
                control={form.control}
                name="customer_name"
                label="Người làm ruộng"
                placeholder="Nhập tên người làm ruộng"
              />
              <FormFieldWrapper
                control={form.control}
                name="season_name"
                label="Mùa vụ"
                placeholder="Ví dụ: Đông Xuân 2024"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormNumberInput
                control={form.control}
                name="field_area"
                label="Tổng diện tích (m²)"
                placeholder="Tự động tính..."
                required
                disabled
              />
              <FormFieldWrapper
                control={form.control}
                name="rice_variety"
                label="Giống lúa"
                placeholder="Ví dụ: Đài Thơm 8"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper
                control={form.control}
                name="seed_source"
                label="Nguồn giống"
                placeholder="Nhập nguồn giống"
              />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-agri-50">
              <FormDatePicker
                control={form.control}
                name="sowing_date"
                label="Ngày gieo"
              />
              <FormFieldWrapper
                control={form.control}
                name="sowing_lunar_date"
                label="Ngày gieo âm lịch"
                placeholder="Tự động tính..."
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormDatePicker
                control={form.control}
                name="expected_harvest_date"
                label="Ngày thu hoạch dự kiến"
              />
              <FormFieldWrapper
                control={form.control}
                name="expected_harvest_lunar_date"
                label="Ngày thu hoạch dự kiến âm lịch"
                placeholder="Tự động tính..."
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormDatePicker
                control={form.control}
                name="actual_harvest_date"
                label="Ngày thu hoạch thực tế"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-agri-100 flex flex-row items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="px-6 rounded-lg h-10">
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-agri-600 hover:bg-agri-700 px-8 rounded-lg shadow-md font-bold h-10 transition-all active:scale-95">
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cập nhật thông tin
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
