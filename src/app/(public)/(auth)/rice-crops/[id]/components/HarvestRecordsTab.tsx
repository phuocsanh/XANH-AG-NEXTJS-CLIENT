"use client"

import React, { useState } from "react"
import { Plus, TrendingUp, Scale } from "lucide-react"
import dayjs from "dayjs"
import { 
  useHarvestRecords, 
  useDeleteHarvestRecord 
} from "@/hooks/use-harvest-record"
import { convertCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import CreateHarvestRecordModal from "@/app/(public)/(auth)/rice-crops/[id]/components/CreateHarvestRecordModal"
import { ResponsiveDataTable, DataColumn } from "@/components/common/responsive-data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HarvestRecord } from "@/models/rice-farming"

interface HarvestRecordsTabProps {
  riceCropId: number
}

export default function HarvestRecordsTab({ riceCropId }: HarvestRecordsTabProps) {
  const { toast } = useToast()
  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<HarvestRecord | null>(null)

  const { data: records, isLoading } = useHarvestRecords(riceCropId)
  const deleteMutation = useDeleteHarvestRecord()

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: HarvestRecord) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (item: HarvestRecord) => {
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      description: "Bạn có chắc chắn muốn xóa bản ghi thu hoạch này không? Hành động này không thể hoàn tác.",
      variant: "destructive",
      confirmText: "Xóa ngay",
      cancelText: "Hủy"
    })

    if (!isConfirmed) return

    try {
      await deleteMutation.mutateAsync({ id: item.id, cropId: riceCropId })
      toast({ title: "Thành công", description: "Đã xóa bản ghi thu hoạch" })
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi xóa", variant: "destructive" })
    }
  }

  const totalYieldInKg = (records || []).reduce((sum, item) => {
    const isKg = !item.yield_unit || item.yield_unit === 'kg'
    const amountInKg = isKg ? Number(item.yield_amount) : Number(item.yield_amount) * 1000
    return sum + amountInKg
  }, 0)

  const totalRevenue = (records || []).reduce((sum, item) => sum + Number(item.total_revenue || 0), 0)

  const columns: DataColumn<HarvestRecord>[] = [
    {
      title: "Ngày thu hoạch",
      key: "harvest_date",
      render: (val) => dayjs(val).format("DD/MM/YYYY"),
      priority: "high",
    },
    {
      title: "Sản lượng",
      key: "yield_amount",
      render: (_, record) => (
        <span className="font-bold">
          {record.yield_amount.toLocaleString("vi-VN")} {record.yield_unit === 'tan' ? 'Tấn' : 'kg'}
        </span>
      ),
      priority: "high",
    },
    {
      title: "Chất lượng / Độ ẩm",
      key: "quality",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-sm">{record.quality_grade || "-"}</span>
          {record.moisture_content && (
            <span className="text-[10px] text-muted-foreground uppercase">Độ ẩm: {record.moisture_content}%</span>
          )}
        </div>
      ),
      priority: "medium",
    },
    {
      title: "Giá bán",
      key: "selling_price_per_unit",
      render: (val) => `${val.toLocaleString("vi-VN")} đ/kg`,
      priority: "medium",
      className: "text-right",
    },
    {
      title: "Thành tiền",
      key: "total_revenue",
      render: (val) => (
        <span className="font-bold text-emerald-600">{convertCurrency(val)}</span>
      ),
      priority: "high",
      className: "text-right",
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Tổng sản lượng</p>
            </div>
            <div className="text-3xl font-black text-blue-700">
              {totalYieldInKg < 1000 
                ? `${totalYieldInKg.toLocaleString("vi-VN")} kg` 
                : `${(totalYieldInKg / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} Tấn`}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-sm">
          <CardContent className="pt-6 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Tổng doanh thu</p>
              </div>
              <div className="text-3xl font-black text-emerald-700">{convertCurrency(totalRevenue)}</div>
            </div>
            <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Ghi nhận mới
            </Button>
          </CardContent>
        </Card>
      </div>

      <ResponsiveDataTable
        columns={columns}
        data={records || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyText="Chưa có bản ghi thu hoạch nào được ghi nhận."
      />

      <CreateHarvestRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        riceCropId={riceCropId}
      />

      <ConfirmDialogComponent />
    </div>
  )
}
