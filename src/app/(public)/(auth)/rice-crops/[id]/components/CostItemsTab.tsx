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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import dayjs from "dayjs"
import { useCostItems, useDeleteCostItem } from "@/hooks/use-cost-item"
import { convertCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import CreateCostItemModal from "@/app/(public)/(auth)/rice-crops/[id]/components/CreateCostItemModal"
import type { CostItem } from "@/models/rice-farming"

interface CostItemsTabProps {
  riceCropId: number
}

export default function CostItemsTab({ riceCropId }: CostItemsTabProps) {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CostItem | null>(null)

  const { data: costItemsData, isLoading } = useCostItems({ rice_crop_id: riceCropId })
  
  // Xử lý dữ liệu trả về từ API search (có thể là { data: [], total: ... } hoặc [])
  const costItems = Array.isArray(costItemsData) 
    ? costItemsData 
    : (costItemsData as unknown as { data?: CostItem[] })?.data || []

  const deleteMutation = useDeleteCostItem()

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: CostItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chi phí này?")) return

    try {
      await deleteMutation.mutateAsync({ id, cropId: riceCropId })
      toast({ title: "Thành công", description: "Đã xóa chi phí canh tác" })
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi xóa", variant: "destructive" })
    }
  }

  const totalCost = (costItems || []).reduce((sum: number, item: CostItem) => sum + Number(item.total_cost || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Tổng chi phí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{convertCurrency(totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Số khoản chi</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold">{costItems?.length || 0} mục</div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm chi phí
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Tên chi phí</TableHead>
              <TableHead className="min-w-[120px]">Loại</TableHead>
              <TableHead className="text-right min-w-[120px]">Tổng tiền</TableHead>
              <TableHead className="min-w-[100px]">Ngày chi</TableHead>
              <TableHead className="min-w-[150px]">Ghi chú</TableHead>
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
            ) : costItems && costItems.length > 0 ? (
              costItems.map((item: CostItem) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.category_item?.name || getCategoryLabel(item.category || "")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    {convertCurrency(item.total_cost)}
                  </TableCell>
                  <TableCell>
                    {item.expense_date || item.purchase_date 
                      ? dayjs(item.expense_date || item.purchase_date).format("DD/MM/YYYY") 
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={item.notes}>{item.notes || "-"}</TableCell>
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
                  Chưa có chi phí canh tác nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateCostItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        riceCropId={riceCropId}
      />
    </div>
  )
}

function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    seed: "Giống",
    fertilizer: "Phân bón",
    pesticide: "Thuốc BVTV",
    labor: "Nhân công",
    machinery: "Máy móc",
    irrigation: "Tưới tiêu",
    other: "Khác",
  }
  return map[category] || category
}
