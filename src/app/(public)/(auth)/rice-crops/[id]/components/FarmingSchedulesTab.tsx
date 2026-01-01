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
  getScheduleStatusText, 
  getScheduleStatusColor,
  type FarmingSchedule,
  type CreateFarmingScheduleDto,
  type ScheduleStatus
} from "@/models/rice-farming"
import { useToast } from "@/hooks/use-toast"

interface FarmingSchedulesTabProps {
  riceCropId: number
}

export default function FarmingSchedulesTab({ riceCropId }: FarmingSchedulesTabProps) {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FarmingSchedule | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateFarmingScheduleDto>>({
    activity_name: "",
    scheduled_date: dayjs().format("YYYY-MM-DD"),
    status: "pending",
    instructions: "",
  })

  // Queries
  const { data: schedules, isLoading } = useFarmingSchedules({ rice_crop_id: riceCropId })
  
  const createMutation = useCreateFarmingSchedule()
  const updateMutation = useUpdateFarmingSchedule()
  const deleteMutation = useDeleteFarmingSchedule()
  const completeMutation = useCompleteFarmingSchedule()

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      activity_name: "",
      scheduled_date: dayjs().format("YYYY-MM-DD"),
      status: "pending",
      instructions: "",
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: FarmingSchedule) => {
    setEditingItem(item)
    setFormData({
      activity_name: item.activity_name,
      scheduled_date: dayjs(item.scheduled_date).format("YYYY-MM-DD"),
      status: item.status,
      instructions: item.instructions || "",
      completed_date: item.completed_date ? dayjs(item.completed_date).format("YYYY-MM-DD") : undefined,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch canh tác này?")) return

    try {
      await deleteMutation.mutateAsync({ id, cropId: riceCropId })
      toast({ title: "Thành công", description: "Xóa lịch canh tác thành công" })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi xóa lịch canh tác", variant: "destructive" })
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await completeMutation.mutateAsync(id)
      toast({ title: "Thành công", description: "Đã đánh dấu hoàn thành" })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.activity_name || !formData.scheduled_date) {
      toast({ title: "Lỗi", description: "Vui lòng nhập đầy đủ thông tin", variant: "destructive" })
      return
    }

    try {
      const dto: CreateFarmingScheduleDto = {
        activity_name: formData.activity_name,
        scheduled_date: formData.scheduled_date,
        status: formData.status as ScheduleStatus,
        instructions: formData.instructions,
        rice_crop_id: riceCropId,
        completed_date: formData.completed_date,
      }

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, dto })
        toast({ title: "Thành công", description: "Cập nhật lịch canh tác thành công" })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: "Thành công", description: "Thêm lịch canh tác thành công" })
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
          Thêm công việc
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày dự kiến</TableHead>
              <TableHead>Công việc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày hoàn thành</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : schedules && schedules.length > 0 ? (
              schedules.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{dayjs(item.scheduled_date).format("DD/MM/YYYY")}</TableCell>
                  <TableCell className="font-medium">{item.activity_name}</TableCell>
                  <TableCell>
                    <Badge variant={getScheduleStatusColor(item.status)}>
                      {getScheduleStatusText(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.completed_date ? dayjs(item.completed_date).format("DD/MM/YYYY") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleComplete(item.id)}
                          title="Đánh dấu hoàn thành"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
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
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
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
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="activity_name">Tên công việc</Label>
              <Input
                id="activity_name"
                value={formData.activity_name}
                onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })}
                placeholder="VD: Bón phân đợt 1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Ngày dự kiến</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ScheduleStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ thực hiện</SelectItem>
                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.status === "completed" && (
              <div className="space-y-2">
                <Label htmlFor="completed_date">Ngày hoàn thành thực tế</Label>
                <Input
                  id="completed_date"
                  type="date"
                  value={formData.completed_date || dayjs().format("YYYY-MM-DD")}
                  onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="instructions">Mô tả chi tiết</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={3}
                placeholder="Nhập ghi chú hoặc hướng dẫn..."
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
