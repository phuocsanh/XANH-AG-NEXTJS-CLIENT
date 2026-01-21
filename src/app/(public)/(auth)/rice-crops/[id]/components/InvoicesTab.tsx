"use client"

/**
 * Component hiển thị danh sách hóa đơn mua hàng (từ hệ thống và tự nhập)
 * Liên quan đến vụ mùa lúa của nông dân
 */

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
  Edit, 
  Trash2, 
  Loader2, 
  ShoppingCart, 
  FileText,
  Eye
} from "lucide-react"
import dayjs from "dayjs"
import { 
  useMergedPurchases, 
  useDeleteExternalPurchase 
} from "@/hooks/use-external-purchase"
import { convertCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import CreateExternalPurchaseModal from "@/app/(public)/(auth)/rice-crops/[id]/components/CreateExternalPurchaseModal"
import InvoiceDetailModal from "@/app/(public)/(auth)/rice-crops/[id]/components/InvoiceDetailModal"
import type { MergedPurchase } from "@/models/rice-farming"

interface InvoicesTabProps {
  riceCropId: number
}

// Component chính hiển thị tab hóa đơn
export default function InvoicesTab({ riceCropId }: InvoicesTabProps) {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MergedPurchase | null>(null)
  const [viewingItem, setViewingItem] = useState<MergedPurchase | null>(null)

  const { data: purchases, isLoading } = useMergedPurchases(riceCropId)
  const deleteMutation = useDeleteExternalPurchase()



  // Xử lý khi nhấn nút sửa hóa đơn
  const handleEdit = (item: MergedPurchase) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  // Xử lý khi nhấn nút xem chi tiết hóa đơn
  const handleView = (item: MergedPurchase) => {
    setViewingItem(item)
    setIsDetailOpen(true)
  }

  // Xử lý xóa hóa đơn (chỉ áp dụng cho hóa đơn tự nhập)
  const handleDelete = async (id: number | string) => {
    if (typeof id === 'string' && id.startsWith('ext-')) {
      if (!confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return

      const numericId = parseInt(id.replace('ext-', ''))
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
              <TableHead>Nhà cung cấp</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead className="text-center">Sản phẩm</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-right">Đã trả</TableHead>
              <TableHead className="text-right">Còn nợ</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
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
                      <span className="font-medium">{item.supplier}</span>
                      <span className="text-xs text-muted-foreground">{item.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.date ? dayjs(item.date).format("DD/MM/YYYY") : "-"}</TableCell>
                  <TableCell className="text-center font-medium text-blue-600 bg-blue-50/30">
                    {item.items?.length || 0} SP
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {convertCurrency(item.total_amount)}
                  </TableCell>
                  <TableCell className="text-right text-success font-medium">
                    {convertCurrency(item.paid_amount)}
                  </TableCell>
                  <TableCell className="text-right text-destructive font-bold">
                    {convertCurrency(item.remaining_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getPaymentStatusVariant(item.status)}>
                      {getPaymentStatusText(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(item)}
                        title="Xem chi tiết"
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {item.source === 'external' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            title="Chỉnh sửa"
                            className="hover:bg-sky-100 hover:text-sky-600"
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground italic">
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
      
      <InvoiceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={viewingItem}
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
