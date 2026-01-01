"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [formData, setFormData] = useState<any>({
    item_name: "",
    category_id: "",
    total_cost: 0,
    expense_date: dayjs().format("YYYY-MM-DD"),
    notes: "",
  })

  // Lấy danh sách loại chi phí từ Database
  const { data: categoryData, isLoading: isLoadingCategories } = useCostItemCategories({ limit: 100 })
  const categories = categoryData?.data || []

  useEffect(() => {
    if (initialData) {
      setFormData({
        item_name: initialData.item_name,
        category_id: initialData.category_id || "", // Giả định backend sẽ được cập nhật
        total_cost: initialData.total_cost,
        expense_date: dayjs(initialData.purchase_date || initialData.expense_date).format("YYYY-MM-DD"),
        notes: initialData.notes || "",
      })
    } else {
      setFormData({
        item_name: "",
        category_id: "",
        total_cost: 0,
        expense_date: dayjs().format("YYYY-MM-DD"),
        notes: "",
      })
    }
  }, [initialData, isOpen])

  const createMutation = useCreateCostItem()
  const updateMutation = useUpdateCostItem()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const dto = {
        ...formData,
        rice_crop_id: riceCropId,
        total_cost: Number(formData.total_cost),
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
      }

      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, dto })
        toast({ title: "Thành công", description: "Cập nhật chi phí thành công" })
      } else {
        await createMutation.mutateAsync(dto)
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
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="item_name">Tên chi phí</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="VD: Phân Urê, Thuốc trừ sâu..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Loại chi phí</Label>
              <Select
                value={formData.category_id?.toString()}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={isLoadingCategories ? "Đang tải..." : "Chọn loại"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-muted-foreground text-center">
                      Chưa có loại chi phí trong DB
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_cost">Tổng tiền (VNĐ)</Label>
              <Input
                id="total_cost"
                type="number"
                value={formData.total_cost}
                onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_date">Ngày chi</Label>
            <Input
              id="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

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
      </DialogContent>
    </Dialog>
  )
}
