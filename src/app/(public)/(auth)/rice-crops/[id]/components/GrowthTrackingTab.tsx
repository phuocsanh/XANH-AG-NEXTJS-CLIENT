"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, Loader2, Thermometer } from "lucide-react"
import dayjs from "dayjs"
import {
  useGrowthTrackings,
  useCreateGrowthTracking,
  useUpdateGrowthTracking,
  useDeleteGrowthTracking,
} from "@/hooks/use-growth-tracking"
import { 
  getGrowthStageText, 
  getGrowthStageColor,
  type GrowthTracking,
  type CreateGrowthTrackingDto,
  type GrowthStage
} from "@/models/rice-farming"
import { useToast } from "@/hooks/use-toast"

interface GrowthTrackingTabProps {
  riceCropId: number
}

export default function GrowthTrackingTab({ riceCropId }: GrowthTrackingTabProps) {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GrowthTracking | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateGrowthTrackingDto>>({
    tracking_date: dayjs().format("YYYY-MM-DD"),
    growth_stage: "seedling",
    plant_height: 0,
    leaf_color: "",
    pest_disease_detected: "",
    notes: "",
  })

  // Queries
  const { data: trackings, isLoading } = useGrowthTrackings(riceCropId)
  
  const createMutation = useCreateGrowthTracking()
  const updateMutation = useUpdateGrowthTracking()
  const deleteMutation = useDeleteGrowthTracking()

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      tracking_date: dayjs().format("YYYY-MM-DD"),
      growth_stage: "seedling",
      plant_height: 0,
      leaf_color: "",
      pest_disease_detected: "",
      notes: "",
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: GrowthTracking) => {
    setEditingItem(item)
    setFormData({
      tracking_date: dayjs(item.tracking_date).format("YYYY-MM-DD"),
      growth_stage: item.growth_stage,
      plant_height: item.plant_height,
      leaf_color: item.leaf_color,
      pest_disease_detected: item.pest_disease_detected,
      notes: item.notes,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) return

    try {
      await deleteMutation.mutateAsync({ id, cropId: riceCropId })
      toast({ title: "Thành công", description: "Xóa bản ghi thành công" })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi xóa bản ghi", variant: "destructive" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const dto: CreateGrowthTrackingDto = {
        ...formData,
        rice_crop_id: riceCropId,
        tracking_date: formData.tracking_date!,
        growth_stage: formData.growth_stage as GrowthStage,
      } as CreateGrowthTrackingDto

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, dto })
        toast({ title: "Thành công", description: "Cập nhật bản ghi thành công" })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: "Thành công", description: "Thêm bản ghi thành công" })
      }

      setIsModalOpen(false)
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi lưu dữ liệu", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm bản ghi
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Ngày kiểm tra</TableHead>
              <TableHead className="min-w-[130px]">Giai đoạn</TableHead>
              <TableHead className="min-w-[130px]">Chiều cao (cm)</TableHead>
              <TableHead className="min-w-[100px]">Màu lá</TableHead>
              <TableHead className="min-w-[150px]">Sâu bệnh</TableHead>
              <TableHead className="text-right min-w-[120px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : trackings && trackings.length > 0 ? (
              trackings.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{dayjs(item.tracking_date).format("DD/MM/YYYY")}</TableCell>
                  <TableCell>
                    <Badge variant={getGrowthStageColor(item.growth_stage)}>
                      {getGrowthStageText(item.growth_stage)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.plant_height ? `${item.plant_height} cm` : "-"}</TableCell>
                  <TableCell>{item.leaf_color || "-"}</TableCell>
                  <TableCell>
                    <span className={item.pest_disease_detected && item.pest_disease_detected !== "Không có" ? "text-destructive font-medium" : "text-green-600"}>
                      {item.pest_disease_detected || "Không có"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item.id)}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                  Chưa có bản ghi theo dõi nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Sửa bản ghi sinh trưởng" : "Thêm bản ghi mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tracking_date">Ngày kiểm tra</Label>
                <Input
                  id="tracking_date"
                  type="date"
                  value={formData.tracking_date}
                  onChange={(e) => setFormData({ ...formData, tracking_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="growth_stage">Giai đoạn</Label>
                <Select
                  value={formData.growth_stage}
                  onValueChange={(value) => setFormData({ ...formData, growth_stage: value as GrowthStage })}
                >
                  <SelectTrigger id="growth_stage">
                    <SelectValue placeholder="Chọn giai đoạn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seedling">Giai đoạn mạ</SelectItem>
                    <SelectItem value="tillering">Đẻ nhánh</SelectItem>
                    <SelectItem value="panicle">Làm đòng</SelectItem>
                    <SelectItem value="heading">Trổ bông</SelectItem>
                    <SelectItem value="grain_filling">Vô gạo</SelectItem>
                    <SelectItem value="ripening">Chín</SelectItem>
                    <SelectItem value="harvested">Đã thu hoạch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plant_height">Chiều cao cây (cm)</Label>
                <Input
                  id="plant_height"
                  type="number"
                  value={formData.plant_height}
                  onChange={(e) => setFormData({ ...formData, plant_height: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaf_color">Màu sắc lá</Label>
                <Input
                  id="leaf_color"
                  value={formData.leaf_color}
                  onChange={(e) => setFormData({ ...formData, leaf_color: e.target.value })}
                  placeholder="VD: Xanh đậm, Vàng..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pest_disease_detected">Tình trạng sâu bệnh</Label>
              <Input
                id="pest_disease_detected"
                value={formData.pest_disease_detected}
                onChange={(e) => setFormData({ ...formData, pest_disease_detected: e.target.value })}
                placeholder="Mô tả sâu bệnh nếu có"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú/Đánh giá chung</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Nhập ghi chú thêm..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingItem ? "Cập nhật" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
