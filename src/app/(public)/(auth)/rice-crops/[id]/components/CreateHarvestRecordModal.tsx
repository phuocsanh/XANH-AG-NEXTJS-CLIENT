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
import { 
  useCreateHarvestRecord, 
  useUpdateHarvestRecord 
} from "@/hooks/use-harvest-record"
import { useToast } from "@/hooks/use-toast"
import { convertCurrency } from "@/lib/utils"
import type { HarvestRecord, CreateHarvestRecordDto } from "@/models/rice-farming"

interface CreateHarvestRecordModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: HarvestRecord | null
  riceCropId: number
}

interface HarvestRecordFormData {
  harvest_date: string
  yield_amount: number | string | undefined
  yield_unit: string
  moisture_content: number | string | undefined
  quality_grade: string
  selling_price_per_unit: number | string | undefined
  total_revenue: number
  buyer: string
  notes: string
}

export default function CreateHarvestRecordModal({
  isOpen,
  onClose,
  initialData,
  riceCropId,
}: CreateHarvestRecordModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<HarvestRecordFormData>({
    harvest_date: dayjs().format("YYYY-MM-DD"),
    yield_amount: undefined,
    yield_unit: "tan",
    moisture_content: undefined,
    quality_grade: "",
    selling_price_per_unit: undefined,
    total_revenue: 0,
    buyer: "",
    notes: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        harvest_date: dayjs(initialData.harvest_date).format("YYYY-MM-DD"),
        yield_amount: initialData.yield_amount,
        yield_unit: initialData.yield_unit || "kg",
        moisture_content: initialData.moisture_content,
        quality_grade: initialData.quality_grade,
        selling_price_per_unit: initialData.selling_price_per_unit,
        total_revenue: initialData.total_revenue,
        buyer: initialData.buyer || "",
        notes: initialData.notes || "",
      })
    } else {
      setFormData({
        harvest_date: dayjs().format("YYYY-MM-DD"),
        yield_amount: undefined,
        yield_unit: "tan",
        moisture_content: undefined,
        quality_grade: "",
        selling_price_per_unit: undefined,
        total_revenue: 0,
        buyer: "",
        notes: "",
      })
    }
  }, [initialData, isOpen])

  // Tự động tính Thành tiền
  useEffect(() => {
    const amount = Number(formData.yield_amount) || 0
    const price = Number(formData.selling_price_per_unit) || 0
    const unit = formData.yield_unit
    
    const quantityInKg = unit === 'tan' ? amount * 1000 : amount
    setFormData(prev => ({ ...prev, total_revenue: quantityInKg * price }))
  }, [formData.yield_amount, formData.selling_price_per_unit, formData.yield_unit])

  const createMutation = useCreateHarvestRecord()
  const updateMutation = useUpdateHarvestRecord()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const dto: CreateHarvestRecordDto = {
        ...formData,
        rice_crop_id: riceCropId,
        yield_amount: Number(formData.yield_amount),
        selling_price_per_unit: Number(formData.selling_price_per_unit),
        total_revenue: Number(formData.total_revenue),
        moisture_content: formData.moisture_content ? Number(formData.moisture_content) : undefined,
        payment_status: "paid" // Mặc định trong Client
      }

      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, dto })
        toast({ title: "Thành công", description: "Cập nhật bản ghi thu hoạch thành công" })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: "Thành công", description: "Thêm bản ghi thu hoạch thành công" })
      }

      onClose()
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa đợt thu hoạch" : "Thêm đợt thu hoạch mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="harvest_date">Ngày thu hoạch</Label>
              <Input
                id="harvest_date"
                type="date"
                value={formData.harvest_date}
                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moisture_content">Độ ẩm (%)</Label>
              <Input
                id="moisture_content"
                type="number"
                step="0.1"
                value={formData.moisture_content}
                onChange={(e) => setFormData({ ...formData, moisture_content: e.target.value })}
                placeholder="VD: 14.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yield_amount">Sản lượng</Label>
              <div className="flex gap-2">
                <Input
                  id="yield_amount"
                  type="number"
                  step="0.001"
                  className="flex-1"
                  value={formData.yield_amount}
                  onChange={(e) => setFormData({ ...formData, yield_amount: e.target.value })}
                  required
                />
                <Select
                  value={formData.yield_unit}
                  onValueChange={(value) => setFormData({ ...formData, yield_unit: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tan">Tấn</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price_per_unit">Giá bán (đ/kg)</Label>
              <Input
                id="selling_price_per_unit"
                type="number"
                value={formData.selling_price_per_unit}
                onChange={(e) => setFormData({ ...formData, selling_price_per_unit: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thành tiền (Dự kiến)</Label>
            <div className="bg-muted p-2 rounded-md text-lg font-bold text-success text-center">
              {convertCurrency(formData.total_revenue)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality_grade">Chất lượng lúa</Label>
              <Input
                id="quality_grade"
                value={formData.quality_grade}
                onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
                placeholder="VD: OM18, Loại 1..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer">Người mua</Label>
              <Input
                id="buyer"
                value={formData.buyer}
                onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                placeholder="Tên thương lái..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
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
