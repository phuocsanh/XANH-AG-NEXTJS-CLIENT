"use client"

import React, { useState } from "react"
import { Plus } from "lucide-react"
import dayjs from "dayjs"
import { useCostItems, useDeleteCostItem } from "@/hooks/use-cost-item"
import { convertCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import CreateCostItemModal from "@/app/(public)/(auth)/rice-crops/[id]/components/CreateCostItemModal"
import { ResponsiveDataTable, DataColumn } from "@/components/common/responsive-data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { CostItem } from "@/models/rice-farming"

interface CostItemsTabProps {
  riceCropId: number
}

export default function CostItemsTab({ riceCropId }: CostItemsTabProps) {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CostItem | null>(null)

  const { data: costItemsData, isLoading } = useCostItems({ rice_crop_id: riceCropId })
  
  const costItems = Array.isArray(costItemsData) 
    ? costItemsData 
    : (costItemsData as unknown as { data?: CostItem[] })?.data || []

  const deleteMutation = useDeleteCostItem()
  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm()

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: CostItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (item: CostItem) => {
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      description: `Bạn có chắc chắn muốn xóa chi phí "${item.item_name}" không?`,
      variant: "destructive",
      confirmText: "Xóa ngay",
      cancelText: "Hủy"
    })

    if (!isConfirmed) return

    try {
      await deleteMutation.mutateAsync({ id: item.id, cropId: riceCropId })
      toast({ title: "Thành công", description: "Đã xóa chi phí canh tác" })
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi xóa", variant: "destructive" })
    }
  }

  const totalCost = (costItems || []).reduce((sum: number, item: CostItem) => sum + Number(item.total_cost || 0), 0)

  const columns: DataColumn<CostItem>[] = [
    {
      title: "Tên chi phí",
      key: "item_name",
      dataIndex: "item_name",
      priority: "high",
      className: "font-bold text-agri-800",
    },
    {
      title: "Loại",
      key: "category",
      render: (_, record) => (
        <StatusBadge status={record.category_item?.name || record.category || "other"} />
      ),
      priority: "medium",
    },
    {
      title: "Tổng tiền",
      key: "total_cost",
      render: (val) => (
        <span className="font-bold text-destructive">{convertCurrency(val)}</span>
      ),
      priority: "high",
      className: "text-right",
    },
    {
      title: "Ngày chi",
      key: "expense_date",
      render: (_, record) => dayjs(record.expense_date || record.purchase_date).format("DD/MM/YYYY"),
      priority: "medium",
    },
    {
      title: "Ghi chú",
      key: "notes",
      dataIndex: "notes",
      priority: "low",
      className: "max-w-[200px] truncate italic text-muted-foreground text-xs",
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Tổng chi phí</p>
            <div className="text-3xl font-black text-red-700">{convertCurrency(totalCost)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-agri-50 to-white border-agri-100 shadow-sm">
          <CardContent className="pt-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-agri-600 uppercase tracking-widest mb-1">Số khoản chi</p>
              <div className="text-3xl font-black text-agri-700">{costItems?.length || 0} mục</div>
            </div>
            <Button onClick={handleAdd} className="bg-agri-600 hover:bg-agri-700 shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Thêm khoản chi
            </Button>
          </CardContent>
        </Card>
      </div>

      <ResponsiveDataTable
        columns={columns}
        data={costItems}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyText="Chưa có chi phí canh tác nào được ghi nhận."
      />

      <CreateCostItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        riceCropId={riceCropId}
      />

      <ConfirmDialogComponent />
    </div>
  )
}
