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
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import dayjs from "dayjs"
import { useCreateCostItem, useUpdateCostItem } from "@/hooks/use-cost-item"
import { useCostItemCategories } from "@/hooks/use-cost-item-category"
import { useToast } from "@/hooks/use-toast"
import { CreateCostItemBody, CreateCostItemBodyType } from "@/schemaValidations/rice-farming.schema"
import { FormNumberInput } from "@/components/form/form-number-input"
import { FormComboBox } from "@/components/form/form-combo-box"
import { FormDatePicker } from "@/components/form/form-date-picker"
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
  
  // React Hook Form
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

  // Lấy danh sách loại chi phí từ Database
  const { data: categoryData, isLoading: isLoadingCategories } = useCostItemCategories({ limit: 100 })
  const categories = categoryData?.data || []

  // Reset form khi mở modal hoặc có data mới
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
          dto: { ...values, unit_price: values.total_cost } 
        })
        toast({ title: "Thành công", description: "Cập nhật chi phí thành công" })
      } else {
        // Đảm bảo rice_crop_id được set và thêm unit_price mặc định
        await createMutation.mutateAsync({ 
          ...values, 
          rice_crop_id: riceCropId,
          unit_price: values.total_cost 
        })
        toast({ title: "Thành công", description: "Thêm chi phí thành công" })
      }
      onClose()
    } catch (error) {
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
            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chi phí <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Phân Urê, Thuốc trừ sâu..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormComboBox
                control={form.control}
                name="category_id"
                label="Loại chi phí"
                placeholder="Chọn loại"
                options={categories.map((cat: any) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                isLoading={isLoadingCategories}
              />

              <FormNumberInput
                control={form.control}
                name="total_cost"
                label="Tổng tiền (VNĐ)"
                placeholder="0"
                suffix=" ₫"
                decimalScale={0}
              />
            </div>

            <FormDatePicker 
              control={form.control}
              name="expense_date"
              label="Ngày chi"
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ghi chú thêm..." 
                      className="resize-none" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
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
