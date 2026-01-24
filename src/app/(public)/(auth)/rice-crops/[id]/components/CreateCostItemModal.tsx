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
import { useCreateCostItem, useUpdateCostItem } from "@/hooks/use-cost-item"
import { useCostItemCategories } from "@/hooks/use-cost-item-category"
import { useToast } from "@/hooks/use-toast"
import { CreateCostItemBody, CreateCostItemBodyType } from "@/schemaValidations/rice-farming.schema"
import { FormNumberInput, FormComboBox, FormDatePicker, FormFieldWrapper, FormTextarea } from "@/components/form"
import type { CostItem } from "@/models/rice-farming"

interface CreateCostItemModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: CostItem | null
  riceCropId: number
}

export default function CreateCostItemModal({
  isOpen,
  onClose,
  initialData,
  riceCropId,
}: CreateCostItemModalProps) {
  const { toast } = useToast()
  
  const form = useForm<CreateCostItemBodyType>({
    resolver: zodResolver(CreateCostItemBody),
    defaultValues: {
      rice_crop_id: riceCropId,
      item_name: "",
      total_cost: 0,
      expense_date: dayjs().format("YYYY-MM-DD"),
      notes: "",
    },
  })

  const { data: categoryData, isLoading: isLoadingCategories } = useCostItemCategories({ limit: 100 })
  const categories = categoryData?.data || []

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          rice_crop_id: riceCropId,
          item_name: initialData.item_name,
          category_id: initialData.category_id,
          total_cost: initialData.total_cost,
          expense_date: dayjs(initialData.purchase_date || initialData.expense_date).format("YYYY-MM-DD"),
          notes: initialData.notes || "",
        })
      } else {
        form.reset({
          rice_crop_id: riceCropId,
          item_name: "",
          category_id: undefined,
          total_cost: 0,
          expense_date: dayjs().format("YYYY-MM-DD"),
          notes: "",
        })
      }
    }
  }, [initialData, isOpen, riceCropId, form])

  const createMutation = useCreateCostItem()
  const updateMutation = useUpdateCostItem()

  const onSubmit = async (values: CreateCostItemBodyType) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ 
          id: initialData.id, 
          dto: { ...values, unit_price: values.total_cost } as any
        })
        toast({ title: "Thành công", description: "Cập nhật chi phí thành công" })
      } else {
        await createMutation.mutateAsync({ 
          ...values, 
          rice_crop_id: riceCropId,
          unit_price: values.total_cost 
        } as any)
        toast({ title: "Thành công", description: "Thêm chi phí thành công" })
      }
      onClose()
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa chi phí" : "Thêm chi phí mới"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormFieldWrapper
              control={form.control}
              name="item_name"
              label="Tên chi phí"
              placeholder="VD: Phân Urê, Thuốc trừ sâu..."
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormComboBox
                control={form.control}
                name="category_id"
                label="Loại chi phí"
                placeholder="Chọn loại"
                options={categories.map((cat: { id: number; name: string }) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                isLoading={isLoadingCategories}
                modal={true}
              />

              <FormNumberInput
                control={form.control}
                name="total_cost"
                label="Tổng tiền"
                placeholder="0"
                suffix=" ₫"
                decimalScale={0}
                required
              />
            </div>

            <FormDatePicker 
              control={form.control}
              name="expense_date"
              label="Ngày chi"
              required
            />

            <FormTextarea
              control={form.control}
              name="notes"
              label="Ghi chú"
              placeholder="Ghi chú thêm..."
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-agri-600 hover:bg-agri-700">
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {initialData ? "Cập nhật" : "Lưu chi phí"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
