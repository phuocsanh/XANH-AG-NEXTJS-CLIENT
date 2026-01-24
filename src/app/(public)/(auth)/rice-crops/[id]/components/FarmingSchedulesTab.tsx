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
import { Plus, Edit, Trash2, CheckCircle2, Loader2 } from "lucide-react"
import dayjs from "dayjs"
import {
  useFarmingSchedules,
  useCreateFarmingSchedule,
  useUpdateFarmingSchedule,
  useDeleteFarmingSchedule,
  useCompleteFarmingSchedule,
} from "@/hooks/use-farming-schedule"
import { 
  type FarmingSchedule
} from "@/models/rice-farming"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import { CreateFarmingScheduleBody, CreateFarmingScheduleBodyType } from "@/schemaValidations/rice-farming.schema"
import { FormDatePicker, FormComboBox, FormTextarea, FormFieldWrapper } from "@/components/form"
import { StatusBadge } from "@/components/common/status-badge"

interface FarmingSchedulesTabProps {
  riceCropId: number
}

export default function FarmingSchedulesTab({ riceCropId }: FarmingSchedulesTabProps) {
  const { toast } = useToast()
  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FarmingSchedule | null>(null)
  
  const form = useForm<CreateFarmingScheduleBodyType>({
    resolver: zodResolver(CreateFarmingScheduleBody),
    defaultValues: {
      rice_crop_id: riceCropId,
      activity_name: "",
      scheduled_date: dayjs().format("YYYY-MM-DD"),
      status: "pending",
      instructions: "",
    },
  })

  const { data: schedules, isLoading } = useFarmingSchedules({ rice_crop_id: riceCropId })
  
  const createMutation = useCreateFarmingSchedule()
  const updateMutation = useUpdateFarmingSchedule()
  const deleteMutation = useDeleteFarmingSchedule()
  const completeMutation = useCompleteFarmingSchedule()

  useEffect(() => {
    if (isModalOpen) {
      if (editingItem) {
        form.reset({
          rice_crop_id: riceCropId,
          activity_name: editingItem.activity_name,
          scheduled_date: dayjs(editingItem.scheduled_date).format("YYYY-MM-DD"),
          status: editingItem.status,
          instructions: editingItem.instructions || "",
          completed_date: editingItem.completed_date ? dayjs(editingItem.completed_date).format("YYYY-MM-DD") : undefined,
        })
      } else {
        form.reset({
          rice_crop_id: riceCropId,
          activity_name: "",
          scheduled_date: dayjs().format("YYYY-MM-DD"),
          status: "pending",
          instructions: "",
        })
      }
    }
  }, [editingItem, isModalOpen, riceCropId, form])

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: FarmingSchedule) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      description: "Bạn có chắc chắn muốn xóa lịch canh tác này không? Hành động này không thể hoàn tác.",
      variant: "destructive",
      confirmText: "Xóa ngay",
      cancelText: "Hủy"
    })

    if (!isConfirmed) return

    try {
      await deleteMutation.mutateAsync({ id, cropId: riceCropId })
      toast({ title: "Thành công", description: "Xóa lịch canh tác thành công" })
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi xóa lịch canh tác", variant: "destructive" })
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await completeMutation.mutateAsync(id)
      toast({ title: "Thành công", description: "Đã đánh dấu hoàn thành" })
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
    }
  }

  const onSubmit = async (values: CreateFarmingScheduleBodyType) => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, dto: values as any })
        toast({ title: "Thành công", description: "Cập nhật lịch canh tác thành công" })
      } else {
        await createMutation.mutateAsync(values as any)
        toast({ title: "Thành công", description: "Thêm lịch canh tác thành công" })
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
          Thêm công việc
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-agri-50/50">
            <TableRow>
              <TableHead className="min-w-[120px] font-bold text-agri-900">Ngày dự kiến</TableHead>
              <TableHead className="min-w-[180px] font-bold text-agri-900">Công việc</TableHead>
              <TableHead className="min-w-[130px] font-bold text-agri-900">Trạng thái</TableHead>
              <TableHead className="min-w-[130px] font-bold text-agri-900 text-center">Hoàn thành</TableHead>
              <TableHead className="text-right min-w-[140px] font-bold text-agri-900 pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-agri-500" />
                    Đang tải lịch trình...
                  </div>
                </TableCell>
              </TableRow>
            ) : schedules && schedules.length > 0 ? (
              schedules.map((item) => (
                <TableRow key={item.id} className="hover:bg-agri-50/30 transition-colors">
                  <TableCell className="font-medium text-gray-700">{dayjs(item.scheduled_date).format("DD/MM/YYYY")}</TableCell>
                  <TableCell className="font-bold text-agri-800">{item.activity_name}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    {item.completed_date ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 italic">
                        {dayjs(item.completed_date).format("DD/MM/YYYY")}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-1">
                      {item.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleComplete(item.id)}
                          title="Đánh dấu hoàn thành"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
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
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                  Chưa có lịch canh tác nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Sửa lịch canh tác" : "Thêm công việc mới"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormFieldWrapper
                control={form.control}
                name="activity_name"
                label="Tên công việc"
                placeholder="VD: Bón phân đợt 1"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormDatePicker
                  control={form.control}
                  name="scheduled_date"
                  label="Ngày dự kiến"
                  required
                />
                <FormComboBox
                  control={form.control}
                  name="status"
                  label="Trạng thái"
                  options={[
                    { value: "pending", label: "Chờ thực hiện" },
                    { value: "completed", label: "Đã hoàn thành" },
                    { value: "cancelled", label: "Đã hủy" },
                    { value: "overdue", label: "Quá hạn" }
                  ]}
                  required
                />
              </div>

              {form.watch("status") === "completed" && (
                <FormDatePicker
                  control={form.control}
                  name="completed_date"
                  label="Ngày hoàn thành thực tế"
                />
              )}

              <FormTextarea
                control={form.control}
                name="instructions"
                label="Mô tả chi tiết"
                placeholder="Nhập ghi chú hoặc hướng dẫn..."
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
                  {editingItem ? "Cập nhật" : "Lưu công việc"}
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
