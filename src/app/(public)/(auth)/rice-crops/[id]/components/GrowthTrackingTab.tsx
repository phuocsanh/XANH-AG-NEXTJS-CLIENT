"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import dayjs from "dayjs"
import {
  useGrowthTrackings,
  useCreateGrowthTracking,
  useUpdateGrowthTracking,
  useDeleteGrowthTracking,
} from "@/hooks/use-growth-tracking"
import { 
  type GrowthTracking
} from "@/models/rice-farming"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import { CreateGrowthTrackingBody, CreateGrowthTrackingBodyType } from "@/schemaValidations/rice-farming.schema"
import { FormDatePicker, FormComboBox, FormTextarea, FormFieldWrapper, FormNumberInput } from "@/components/form"
import { StatusBadge } from "@/components/common/status-badge"

interface GrowthTrackingTabProps {
  riceCropId: number
}

export default function GrowthTrackingTab({ riceCropId }: GrowthTrackingTabProps) {
  const { toast } = useToast()
  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GrowthTracking | null>(null)
  
  const form = useForm<CreateGrowthTrackingBodyType>({
    resolver: zodResolver(CreateGrowthTrackingBody),
    defaultValues: {
      rice_crop_id: riceCropId,
      tracking_date: dayjs().format("YYYY-MM-DD"),
      growth_stage: "seedling",
      plant_height: 0,
      leaf_color: "",
      pest_disease_detected: "",
      notes: "",
    },
  })

  const { data: trackings, isLoading } = useGrowthTrackings(riceCropId)
  
  const createMutation = useCreateGrowthTracking()
  const updateMutation = useUpdateGrowthTracking()
  const deleteMutation = useDeleteGrowthTracking()

  useEffect(() => {
    if (isModalOpen) {
      if (editingItem) {
        form.reset({
          rice_crop_id: riceCropId,
          tracking_date: dayjs(editingItem.tracking_date).format("YYYY-MM-DD"),
          growth_stage: editingItem.growth_stage,
          plant_height: editingItem.plant_height || 0,
          leaf_color: editingItem.leaf_color || "",
          pest_disease_detected: editingItem.pest_disease_detected || "",
          notes: editingItem.notes || "",
        })
      } else {
        form.reset({
          rice_crop_id: riceCropId,
          tracking_date: dayjs().format("YYYY-MM-DD"),
          growth_stage: "seedling",
          plant_height: 0,
          leaf_color: "",
          pest_disease_detected: "",
          notes: "",
        })
      }
    }
  }, [editingItem, isModalOpen, riceCropId, form])

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: GrowthTracking) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      description: "Bạn có chắc chắn muốn xóa bản ghi theo dõi sinh trưởng này? Hành động này không thể hoàn tác.",
      variant: "destructive",
      confirmText: "Xóa ngay",
      cancelText: "Hủy"
    })

    if (!isConfirmed) return

    try {
      await deleteMutation.mutateAsync({ id, cropId: riceCropId })
      toast({ title: "Thành công", description: "Xóa bản ghi thành công" })
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi xóa bản ghi", variant: "destructive" })
    }
  }

  const onSubmit = async (values: CreateGrowthTrackingBodyType) => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, dto: values as any })
        toast({ title: "Thành công", description: "Cập nhật bản ghi thành công" })
      } else {
        await createMutation.mutateAsync(values as any)
        toast({ title: "Thành công", description: "Thêm bản ghi thành công" })
      }
      setIsModalOpen(false)
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi lưu dữ liệu", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="bg-agri-600 hover:bg-agri-700 shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Thêm bản ghi
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-agri-50/50">
            <TableRow>
              <TableHead className="min-w-[120px] font-bold text-agri-900">Ngày kiểm tra</TableHead>
              <TableHead className="min-w-[130px] font-bold text-agri-900">Giai đoạn</TableHead>
              <TableHead className="min-w-[130px] font-bold text-agri-900">Chiều cao (cm)</TableHead>
              <TableHead className="min-w-[100px] font-bold text-agri-900">Màu lá</TableHead>
              <TableHead className="min-w-[150px] font-bold text-agri-900">Sâu bệnh</TableHead>
              <TableHead className="text-right min-w-[120px] font-bold text-agri-900 pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-agri-500" />
                    Đang tải nhật ký...
                  </div>
                </TableCell>
              </TableRow>
            ) : trackings && trackings.length > 0 ? (
              trackings.map((item) => (
                <TableRow key={item.id} className="hover:bg-agri-50/30 transition-colors">
                  <TableCell className="font-medium text-gray-700">{dayjs(item.tracking_date).format("DD/MM/YYYY")}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.growth_stage} />
                  </TableCell>
                  <TableCell className="font-semibold text-agri-700">{item.plant_height ? `${item.plant_height} cm` : "-"}</TableCell>
                  <TableCell>{item.leaf_color || "-"}</TableCell>
                  <TableCell>
                    <span className={item.pest_disease_detected && item.pest_disease_detected !== "Không có" ? "text-destructive font-bold" : "text-emerald-600 font-medium"}>
                      {item.pest_disease_detected || "Sạch bệnh"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                        onClick={() => handleEdit(item)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormDatePicker
                  control={form.control}
                  name="tracking_date"
                  label="Ngày kiểm tra"
                  required
                />
                <FormComboBox
                  control={form.control}
                  name="growth_stage"
                  label="Giai đoạn"
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
                <FormNumberInput
                  control={form.control}
                  name="plant_height"
                  label="Chiều cao cây (cm)"
                  placeholder="0"
                />
                <FormFieldWrapper
                  control={form.control}
                  name="leaf_color"
                  label="Màu sắc lá"
                  placeholder="VD: Xanh đậm, Vàng..."
                />
              </div>

              <FormFieldWrapper
                control={form.control}
                name="pest_disease_detected"
                label="Tình trạng sâu bệnh"
                placeholder="Mô tả sâu bệnh nếu có"
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Ghi chú/Đánh giá chung"
                placeholder="Nhập ghi chú thêm..."
                rows={3}
              />

              <DialogFooter className="pt-4 border-t border-agri-50">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-agri-600 hover:bg-agri-700 shadow-md">
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingItem ? "Cập nhật" : "Lưu bản ghi"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialogComponent />
    </div>
  )
}
