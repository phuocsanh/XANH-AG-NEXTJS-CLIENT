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
} from "@/models/rice-farming"
import { useToast } from "@/hooks/use-toast"
import { UpdateRiceCropBody, UpdateRiceCropBodyType } from "@/schemaValidations/rice-farming.schema"
import { FormDatePicker, FormComboBox, FormFieldWrapper, FormNumberInput } from "@/components/form"

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
      field_area: riceCrop.field_area,
      rice_variety: riceCrop.rice_variety,
      seed_source: riceCrop.seed_source || "",
      location: riceCrop.location || "",
      growth_stage: riceCrop.growth_stage,
      status: riceCrop.status,
      sowing_date: riceCrop.sowing_date || undefined,
      transplanting_date: riceCrop.transplanting_date || undefined,
      expected_harvest_date: riceCrop.expected_harvest_date || undefined,
      actual_harvest_date: riceCrop.actual_harvest_date || undefined,
    },
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        field_area: riceCrop.field_area,
        rice_variety: riceCrop.rice_variety,
        seed_source: riceCrop.seed_source || "",
        location: riceCrop.location || "",
        growth_stage: riceCrop.growth_stage,
        status: riceCrop.status,
        sowing_date: riceCrop.sowing_date || undefined,
        transplanting_date: riceCrop.transplanting_date || undefined,
        expected_harvest_date: riceCrop.expected_harvest_date || undefined,
        actual_harvest_date: riceCrop.actual_harvest_date || undefined,
      })
    }
  }, [isOpen, riceCrop, form])

  const onSubmit = async (values: UpdateRiceCropBodyType) => {
    try {
      const dto = {
        ...values,
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
              <FormNumberInput
                control={form.control}
                name="field_area"
                label="Diện tích (m²)"
                placeholder="VD: 5000"
                required
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
              <FormFieldWrapper
                control={form.control}
                name="location"
                label="Vị trí"
                placeholder="Nhập vị trí ruộng"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-agri-50">
              <FormDatePicker
                control={form.control}
                name="sowing_date"
                label="Ngày gieo"
              />
              <FormDatePicker
                control={form.control}
                name="transplanting_date"
                label="Ngày cấy"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormDatePicker
                control={form.control}
                name="expected_harvest_date"
                label="Ngày thu hoạch dự kiến"
              />
              <FormDatePicker
                control={form.control}
                name="actual_harvest_date"
                label="Ngày thu hoạch thực tế"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-agri-100">
              <Button type="button" variant="outline" onClick={onClose} className="px-6 rounded-lg">
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-agri-600 hover:bg-agri-700 px-8 rounded-lg shadow-md font-bold transition-all active:scale-95">
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
