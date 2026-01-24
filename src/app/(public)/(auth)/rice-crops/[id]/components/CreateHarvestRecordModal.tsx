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
import { 
  useCreateHarvestRecord, 
  useUpdateHarvestRecord 
} from "@/hooks/use-harvest-record"
import { useToast } from "@/hooks/use-toast"
import { convertCurrency } from "@/lib/utils"
import { CreateHarvestRecordBody, CreateHarvestRecordBodyType } from "@/schemaValidations/rice-farming.schema"
import { FormDatePicker, FormNumberInput, FormComboBox, FormTextarea, FormFieldWrapper } from "@/components/form"
import type { HarvestRecord } from "@/models/rice-farming"

interface CreateHarvestRecordModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: HarvestRecord | null
  riceCropId: number
}

export default function CreateHarvestRecordModal({
  isOpen,
  onClose,
  initialData,
  riceCropId,
}: CreateHarvestRecordModalProps) {
  const { toast } = useToast()
  
  const form = useForm<CreateHarvestRecordBodyType>({
    resolver: zodResolver(CreateHarvestRecordBody),
    defaultValues: {
      rice_crop_id: riceCropId,
      harvest_date: dayjs().format("YYYY-MM-DD"),
      yield_unit: "tan",
      quality_grade: "",
      buyer: "",
      notes: "",
      total_revenue: 0
    },
  })

  const yieldAmount = form.watch("yield_amount")
  const price = form.watch("selling_price_per_unit")
  const unit = form.watch("yield_unit")

  useEffect(() => {
    const amount = Number(yieldAmount) || 0
    const uprice = Number(price) || 0
    const quantityInKg = unit === 'tan' ? amount * 1000 : amount
    form.setValue("total_revenue", quantityInKg * uprice)
  }, [yieldAmount, price, unit, form])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          rice_crop_id: riceCropId,
          harvest_date: dayjs(initialData.harvest_date).format("YYYY-MM-DD"),
          yield_amount: initialData.yield_amount,
          yield_unit: initialData.yield_unit || "kg",
          moisture_content: initialData.moisture_content,
          quality_grade: initialData.quality_grade || "",
          selling_price_per_unit: initialData.selling_price_per_unit,
          total_revenue: initialData.total_revenue,
          buyer: initialData.buyer || "",
          notes: initialData.notes || "",
        })
      } else {
        form.reset({
          rice_crop_id: riceCropId,
          harvest_date: dayjs().format("YYYY-MM-DD"),
          yield_amount: 0,
          yield_unit: "tan",
          moisture_content: undefined,
          quality_grade: "",
          selling_price_per_unit: 0,
          total_revenue: 0,
          buyer: "",
          notes: "",
        })
      }
    }
  }, [initialData, isOpen, riceCropId, form])

  const createMutation = useCreateHarvestRecord()
  const updateMutation = useUpdateHarvestRecord()

  const onSubmit = async (values: CreateHarvestRecordBodyType) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, dto: values as any })
        toast({ title: "Thành công", description: "Cập nhật bản ghi thu hoạch thành công" })
      } else {
        await createMutation.mutateAsync(values as any)
        toast({ title: "Thành công", description: "Thêm bản ghi thu hoạch thành công" })
      }
      onClose()
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa đợt thu hoạch" : "Thêm đợt thu hoạch mới"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormDatePicker
                control={form.control}
                name="harvest_date"
                label="Ngày thu hoạch"
                required
              />
              <FormNumberInput
                control={form.control}
                name="moisture_content"
                label="Độ ẩm (%)"
                placeholder="VD: 14.5"
                decimalScale={1}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2 items-start">
                <FormNumberInput
                  control={form.control}
                  name="yield_amount"
                  label="Sản lượng"
                  className="flex-1"
                  placeholder="0"
                  decimalScale={3}
                  required
                />
                <FormComboBox
                  control={form.control}
                  name="yield_unit"
                  label="Đơn vị"
                  className="w-24"
                  options={[
                    { value: "tan", label: "Tấn" },
                    { value: "kg", label: "kg" }
                  ]}
                  required
                />
              </div>
              <FormNumberInput
                control={form.control}
                name="selling_price_per_unit"
                label="Giá bán (đ/kg)"
                placeholder="0"
                suffix=" ₫"
                decimalScale={0}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-agri-800">Thành tiền (Dự kiến)</label>
              <div className="bg-agri-50 border border-agri-100 p-3 rounded-lg text-xl font-bold text-agri-700 text-center">
                {convertCurrency(form.watch("total_revenue"))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper
                control={form.control}
                name="quality_grade"
                label="Chất lượng lúa"
                placeholder="VD: OM18, Loại 1..."
              />
              <FormFieldWrapper
                control={form.control}
                name="buyer"
                label="Người mua"
                placeholder="Tên thương lái..."
              />
            </div>

            <FormTextarea
              control={form.control}
              name="notes"
              label="Ghi chú"
              placeholder="Nhập ghi chú thu hoạch..."
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-agri-600 hover:bg-agri-700">
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {initialData ? "Cập nhật" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
