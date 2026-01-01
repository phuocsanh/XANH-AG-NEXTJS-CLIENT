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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  ShoppingCart, 
  FileText,
  AlertCircle
} from "lucide-react"
import dayjs from "dayjs"
import { 
  useMergedPurchases, 
  useDeleteExternalPurchase 
} from "@/hooks/use-external-purchase"
import { convertCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import CreateExternalPurchaseModal from "@/app/(public)/(auth)/rice-crops/[id]/components/CreateExternalPurchaseModal"
import type { MergedPurchase } from "@/models/rice-farming"

interface InvoicesTabProps {
  riceCropId: number
}

export default function InvoicesTab({ riceCropId }: InvoicesTabProps) {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MergedPurchase | null>(null)

  const { data: purchases, isLoading } = useMergedPurchases(riceCropId)
  const deleteMutation = useDeleteExternalPurchase()

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: MergedPurchase) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number | string) => {
    if (typeof id === 'string' && id.startsWith('ext-')) {
      if (!confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return

      const numericId = parseInt(id.replace('ext-', ''))
      try {
        await deleteMutation.mutateAsync({ id: numericId, riceCropId })
        toast({ title: "Thành công", description: "Đã xóa hóa đơn mua hàng" })
      } catch (error) {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Tổng tiền hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Đã thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{convertCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Còn nợ</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold text-destructive">{convertCurrency(totalRemaining)}</div>
            {/* <Button size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Tự nhập HĐ
            </Button> */}
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nguồn</TableHead>
              <TableHead>Mã HĐ / Nhà CC</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead className="text-right">Tổng cộng</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
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
            ) : purchases && purchases.length > 0 ? (
              purchases.map((item) => (
                <TableRow key={item.id.toString()}>
                  <TableCell>
                    {item.source === 'external' ? (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" /> Tự nhập
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700">
                        <ShoppingCart className="h-3 w-3" /> Hệ thống
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.code}</span>
                      <span className="text-xs text-muted-foreground">{item.supplier}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.date ? dayjs(item.date).format("DD/MM/YYYY") : "-"}</TableCell>
                  <TableCell className="text-right font-bold">
                    {convertCurrency(item.total_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getPaymentStatusVariant(item.status)}>
                      {getPaymentStatusText(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.source === 'external' && (
                        <>
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
                        </>
                      )}
                      {item.source === 'system' && (
                         <Button
                            variant="ghost"
                            size="icon"
                            title="Chỉ có thể xem chi tiết"
                            disabled
                          >
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                  Chưa có hóa đơn nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateExternalPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        riceCropId={riceCropId}
      />
    </div>
  )
}

function getPaymentStatusText(status: string) {
  const map: Record<string, string> = {
    paid: "Đã thanh toán",
    partial: "Thanh toán một phần",
    pending: "Chưa thanh toán",
    confirmed: "Đã xác nhận",
  }
  return map[status] || status
}

function getPaymentStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    paid: "success",
    partial: "warning",
    pending: "destructive",
    confirmed: "secondary",
  }
  return map[status] || "default"
}
