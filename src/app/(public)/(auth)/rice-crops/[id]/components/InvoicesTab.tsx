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
import { useConfirm } from "@/hooks/use-confirm"
import CreateExternalPurchaseModal from "@/app/(public)/(auth)/rice-crops/[id]/components/CreateExternalPurchaseModal"
import InvoiceDetailModal from "@/app/(public)/(auth)/rice-crops/[id]/components/InvoiceDetailModal"
import type { MergedPurchase } from "@/models/rice-farming"

interface InvoicesTabProps {
  riceCropId: number
}

// Component chính hiển thị tab hóa đơn
export default function InvoicesTab({ riceCropId }: InvoicesTabProps) {
  const { toast } = useToast()
  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm()
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
      const isConfirmed = await confirm({
        title: "Xác nhận xóa",
        description: "Bạn có chắc chắn muốn xóa hóa đơn tự nhập này không? Hành động này không thể hoàn tác.",
        variant: "destructive",
        confirmText: "Xóa ngay",
        cancelText: "Hủy"
      })

      if (!isConfirmed) return

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng tiền hàng</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{convertCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đã thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold text-success">{convertCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Còn nợ</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex justify-between items-center gap-1">
            <div className="text-xl sm:text-2xl font-bold text-destructive">{convertCurrency(totalRemaining)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <Table className="min-w-max md:w-full">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-3 py-3 text-xs uppercase font-bold">Nguồn</TableHead>
              <TableHead className="px-3 py-3 text-xs uppercase font-bold text-left">Nhà cung cấp</TableHead>
              <TableHead className="px-3 py-3 text-xs uppercase font-bold text-left">Ngày</TableHead>
              <TableHead className="px-3 py-3 text-xs uppercase font-bold text-center">Sản phẩm</TableHead>
              <TableHead className="px-3 py-3 text-xs uppercase font-bold text-right">Tổng tiền</TableHead>
              <TableHead className="px-3 py-3 text-xs uppercase font-bold text-right">Đã trả</TableHead>
              <TableHead className="px-3 py-3 text-xs uppercase font-bold text-right">Còn nợ</TableHead>
              <TableHead className="px-3 py-3 text-xs uppercase font-bold text-center">Trạng thái</TableHead>
              <TableHead className="px-3 py-3 text-xs uppercase font-bold text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : purchases && purchases.length > 0 ? (
              purchases.map((item) => (
                <TableRow key={item.id.toString()} className="hover:bg-muted/30">
                  <TableCell className="px-3 py-4">
                    {item.source === 'external' ? (
                      <Badge variant="outline" className="gap-1 font-normal text-[10px] py-0 h-5">
                        <FileText className="h-2.5 w-2.5" /> Tự nhập
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-600 border-blue-100 font-normal text-[10px] py-0 h-5">
                        <ShoppingCart className="h-2.5 w-2.5" /> Hệ thống
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-left">
                    <div className="flex flex-col min-w-[120px]">
                      <span className="font-semibold text-sm">{item.supplier}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight tracking-tight mt-0.5">{item.code}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-4 text-left whitespace-nowrap text-sm">
                    {item.date ? dayjs(item.date).format("DD/MM/YYYY") : "-"}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-center">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {item.items?.length || 0} SP
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-4 text-right font-bold text-sm whitespace-nowrap">
                    {convertCurrency(item.total_amount)}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-right text-success font-semibold text-sm whitespace-nowrap">
                    {convertCurrency(item.paid_amount)}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-right text-destructive font-bold text-sm whitespace-nowrap">
                    {convertCurrency(item.remaining_amount)}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-center">
                    <Badge variant={getPaymentStatusVariant(item.status)} className="font-medium text-[10px] py-0.5 whitespace-nowrap">
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

      <ConfirmDialogComponent />
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
