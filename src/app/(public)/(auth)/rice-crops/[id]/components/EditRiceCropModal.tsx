"use client"

/**
 * Modal chỉnh sửa thông tin Ruộng lúa cho Farmer
 */

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
import { 
  useUpdateRiceCrop 
} from "@/hooks/use-rice-crops"
import { 
  GrowthStage, 
  CropStatus, 
  RiceCrop,
  getGrowthStageText,
  getCropStatusText 
} from "@/models/rice-farming"
import { useToast } from "@/hooks/use-toast"
import dayjs from "dayjs"

interface EditRiceCropModalProps {
  isOpen: boolean
  onClose: () => void
  riceCrop: RiceCrop
}

const growthStages: GrowthStage[] = [
  "seedling",
  "tillering",
  "panicle",
  "heading",
  "grain_filling",
  "ripening",
  "harvested"
]

const cropStatuses: CropStatus[] = ["active", "harvested", "failed"]

export default function EditRiceCropModal({
  isOpen,
  onClose,
  riceCrop,
}: EditRiceCropModalProps) {
  const { toast } = useToast()
  const updateMutation = useUpdateRiceCrop()

  const [formData, setFormData] = useState({
    field_area: riceCrop.field_area,
    rice_variety: riceCrop.rice_variety,
    seed_source: riceCrop.seed_source || "",
    location: riceCrop.location || "",
    growth_stage: riceCrop.growth_stage,
    status: riceCrop.status,
    sowing_date: riceCrop.sowing_date || "",
    transplanting_date: riceCrop.transplanting_date || "",
    expected_harvest_date: riceCrop.expected_harvest_date || "",
    actual_harvest_date: riceCrop.actual_harvest_date || "",
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        field_area: riceCrop.field_area,
        rice_variety: riceCrop.rice_variety,
        seed_source: riceCrop.seed_source || "",
        location: riceCrop.location || "",
        growth_stage: riceCrop.growth_stage,
        status: riceCrop.status,
        sowing_date: riceCrop.sowing_date || "",
        transplanting_date: riceCrop.transplanting_date || "",
        expected_harvest_date: riceCrop.expected_harvest_date || "",
        actual_harvest_date: riceCrop.actual_harvest_date || "",
      })
    }
  }, [isOpen, riceCrop])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const dto = {
        field_area: Number(formData.field_area),
        rice_variety: formData.rice_variety,
        seed_source: formData.seed_source || undefined,
        location: formData.location || undefined,
        growth_stage: formData.growth_stage,
        status: formData.status,
        sowing_date: formData.sowing_date ? dayjs(formData.sowing_date).format("YYYY-MM-DD") : undefined,
        transplanting_date: formData.transplanting_date ? dayjs(formData.transplanting_date).format("YYYY-MM-DD") : undefined,
        expected_harvest_date: formData.expected_harvest_date ? dayjs(formData.expected_harvest_date).format("YYYY-MM-DD") : undefined,
        actual_harvest_date: formData.actual_harvest_date ? dayjs(formData.actual_harvest_date).format("YYYY-MM-DD") : undefined,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin Ruộng lúa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field_area">Diện tích (m²) *</Label>
              <Input
                id="field_area"
                type="number"
                value={formData.field_area}
                onChange={(e) => setFormData({ ...formData, field_area: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rice_variety">Giống lúa *</Label>
              <Input
                id="rice_variety"
                value={formData.rice_variety}
                onChange={(e) => setFormData({ ...formData, rice_variety: e.target.value })}
                placeholder="Ví dụ: OM 18"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seed_source">Nguồn giống</Label>
              <Input
                id="seed_source"
                value={formData.seed_source}
                onChange={(e) => setFormData({ ...formData, seed_source: e.target.value })}
                placeholder="Nhập nguồn giống"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Vị trí</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Nhập vị trí"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="growth_stage">Giai đoạn sinh trưởng *</Label>
              <Select
                value={formData.growth_stage}
                onValueChange={(value) => setFormData({ ...formData, growth_stage: value as GrowthStage })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {growthStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {getGrowthStageText(stage)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as CropStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cropStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getCropStatusText(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sowing_date">Ngày gieo</Label>
              <Input
                id="sowing_date"
                type="date"
                value={formData.sowing_date}
                onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transplanting_date">Ngày cấy</Label>
              <Input
                id="transplanting_date"
                type="date"
                value={formData.transplanting_date}
                onChange={(e) => setFormData({ ...formData, transplanting_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_harvest_date">Ngày thu hoạch dự kiến</Label>
              <Input
                id="expected_harvest_date"
                type="date"
                value={formData.expected_harvest_date}
                onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_harvest_date">Ngày thu hoạch thực tế</Label>
              <Input
                id="actual_harvest_date"
                type="date"
                value={formData.actual_harvest_date}
                onChange={(e) => setFormData({ ...formData, actual_harvest_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
