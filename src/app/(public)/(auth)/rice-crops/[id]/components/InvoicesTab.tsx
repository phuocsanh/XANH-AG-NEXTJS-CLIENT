"use client"

import React, { useState } from "react"
import { 
  ShoppingCart, 
  FileText,
} from "lucide-react"
import dayjs from "dayjs"
import { 
  useMergedPurchases, 
  useDeleteExternalPurchase 
} from "@/hooks/use-external-purchase"
import { convertCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import CreateExternalPurchaseModal from "@/app/(public)/(auth)/rice-crops/[id]/components/CreateExternalPurchaseModal"
import InvoiceDetailModal from "@/app/(public)/(auth)/rice-crops/[id]/components/InvoiceDetailModal"
import { ResponsiveDataTable, DataColumn } from "@/components/common/responsive-data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { MergedPurchase } from "@/models/rice-farming"

interface InvoicesTabProps {
  riceCropId: number
}

export default function InvoicesTab({ riceCropId }: InvoicesTabProps) {
  const { toast } = useToast()
  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MergedPurchase | null>(null)
  const [viewingItem, setViewingItem] = useState<MergedPurchase | null>(null)

  const { data: purchases, isLoading } = useMergedPurchases(riceCropId)
  const deleteMutation = useDeleteExternalPurchase()

  const handleEdit = (item: MergedPurchase) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleView = (item: MergedPurchase) => {
    setViewingItem(item)
    setIsDetailOpen(true)
  }

  const handleDelete = async (item: MergedPurchase) => {
    if (typeof item.id === 'string' && item.id.startsWith('ext-')) {
      const isConfirmed = await confirm({
        title: "Xác nhận xóa",
        description: "Bạn có chắc chắn muốn xóa hóa đơn tự nhập này không? Hành động này không thể hoàn tác.",
        variant: "destructive",
        confirmText: "Xóa ngay",
        cancelText: "Hủy"
      })

      if (!isConfirmed) return

      const numericId = parseInt(item.id.replace('ext-', ''))
      try {
        await deleteMutation.mutateAsync({ id: numericId, riceCropId })
        toast({ title: "Thành công", description: "Đã xóa hóa đơn mua hàng" })
      } catch {
        toast({ title: "Lỗi", description: "Có lỗi xảy ra khi xóa", variant: "destructive" })
      }
    } else {
      toast({ 
        title: "Thông báo", 
        description: "Hóa đơn hệ thống không thể xóa trực tiếp từ đây. Vui lòng liên hệ cửa hàng.",
        variant: "destructive"
      })
    }
  }

  const totalAmount = (purchases || []).reduce((sum, item) => sum + Number(item.total_amount || 0), 0)
  const totalPaid = (purchases || []).reduce((sum, item) => sum + Number(item.paid_amount || 0), 0)
  const totalRemaining = totalAmount - totalPaid

  const columns: DataColumn<MergedPurchase>[] = [
    {
      title: "Nguồn",
      key: "source",
      render: (_, record) => (
        record.source === 'external' ? (
          <Badge variant="outline" className="gap-1 font-normal text-[10px] py-0 h-5 border-agri-200">
            <FileText className="h-2.5 w-2.5" /> Tự nhập
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-600 border-blue-100 font-normal text-[10px] py-0 h-5">
            <ShoppingCart className="h-2.5 w-2.5" /> Hệ thống
          </Badge>
        )
      ),
      priority: "medium",
    },
    {
      title: "Nhà cung cấp",
      key: "supplier",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800">{record.supplier}</span>
          <span className="text-[10px] text-muted-foreground">{record.code}</span>
        </div>
      ),
      priority: "high",
    },
    {
      title: "Ngày",
      key: "date",
      render: (val) => val ? dayjs(val).format("DD/MM/YYYY") : "-",
      priority: "medium",
    },
    {
      title: "Tổng tiền",
      key: "total_amount",
      render: (val) => <span className="font-bold text-gray-900">{convertCurrency(val)}</span>,
      priority: "high",
      className: "text-right",
    },
    {
      title: "Còn nợ",
      key: "remaining_amount",
      render: (val) => (
        <span className={Number(val) > 0 ? "font-bold text-destructive" : "text-emerald-600"}>
          {convertCurrency(val)}
        </span>
      ),
      priority: "high",
      className: "text-right",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (val) => <StatusBadge status={val} />,
      priority: "high",
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="pt-6 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Tổng tiền hàng</p>
            <div className="text-2xl font-black text-gray-800">{convertCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-100 bg-emerald-50/30">
          <CardContent className="pt-6 text-center">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Đã thanh toán</p>
            <div className="text-2xl font-black text-emerald-700">{convertCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-100 bg-red-50/30">
          <CardContent className="pt-6 text-center">
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Còn nợ</p>
            <div className="text-2xl font-black text-red-700">{convertCurrency(totalRemaining)}</div>
          </CardContent>
        </Card>
      </div>

      <ResponsiveDataTable
        columns={columns}
        data={purchases || []}
        isLoading={isLoading}
        onView={handleView}
        onEdit={(item) => item.source === 'external' ? handleEdit(item) : undefined}
        onDelete={(item) => item.source === 'external' ? handleDelete(item) : undefined}
        emptyText="Chưa có hóa đơn nào liên quan đến vụ mùa này."
      />

      <CreateExternalPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        riceCropId={riceCropId}
      />
      
      <InvoiceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={viewingItem}
      />

      <ConfirmDialogComponent />
    </div>
  )
}
