"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { convertCurrency } from "@/lib/utils"
import dayjs from "dayjs"
import { ShoppingCart, FileText, Calendar, Store, CreditCard } from "lucide-react"
import type { MergedPurchase } from "@/models/rice-farming"

interface InvoiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  data: MergedPurchase | null
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  data,
}: InvoiceDetailModalProps) {
  if (!data) return null

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      paid: "Đã thanh toán",
      partial: "Thanh toán một phần",
      pending: "Chưa thanh toán",
      confirmed: "Đã xác nhận",
    }
    return map[status] || status
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
      paid: "success",
      partial: "warning",
      pending: "destructive",
      confirmed: "secondary",
    }
    return map[status] || "default"
  }

  const getPaymentMethodText = (method: string) => {
    const map: Record<string, string> = {
      cash: "Tiền mặt",
      debt: "Công nợ",
      transfer: "Chuyển khoản",
      card: "Thẻ",
    }
    return map[method?.toLowerCase()] || method || "Tiền mặt"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Chi tiết hóa đơn {data.code}</span>
            {data.source === 'external' ? (
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" /> Tự nhập
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700">
                <ShoppingCart className="h-3 w-3" /> Hệ thống
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg border">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                <span className="font-medium text-foreground">Nhà cung cấp:</span>
                <span className="text-foreground">{data.supplier}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium text-foreground">Ngày mua:</span>
                <span className="text-foreground">{dayjs(data.date).format("DD/MM/YYYY HH:mm")}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium text-foreground">Trạng thái:</span>
                <Badge variant={getStatusVariant(data.status)}>{getStatusText(data.status)}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4" /> {/* Spacer */}
                <span className="font-medium text-foreground">Phương thức:</span>
                <span className="text-foreground font-medium">{getPaymentMethodText(data.payment_method)}</span>
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base px-1">Danh sách sản phẩm</h3>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[50px] text-center">STT</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items && data.items.length > 0 ? (
                    data.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {data.source === 'system' 
                              ? (item.product?.trade_name || item.product?.name || 'Sản phẩm hệ thống') 
                              : (item.product_name || 'Sản phẩm')}
                          </div>
                          {data.source === 'system' && item.product?.name && item.product?.name !== item.product?.trade_name && (
                            <div className="text-[10px] text-muted-foreground italic">
                              {item.product.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity} {item.unit || item.product?.unit_name || ''}
                        </TableCell>
                        <TableCell className="text-right">
                          {convertCurrency(Number(item.unit_price || item.price || 0))}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {convertCurrency(Number(item.total_price || (item.quantity * (item.price || 0))))}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground italic">
                        Không có sản phẩm nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Tổng kết tài chính */}
          <div className="flex justify-end pt-4">
            <div className="w-full sm:w-1/2 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng cộng:</span>
                <span className="font-semibold">{convertCurrency(data.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đã thanh toán:</span>
                <span className="font-semibold text-success">{convertCurrency(data.paid_amount)}</span>
              </div>
              <div className="flex justify-between text-base border-t mt-2 pt-2">
                <span className="font-bold">Còn nợ:</span>
                <span className="font-bold text-destructive">{convertCurrency(data.remaining_amount)}</span>
              </div>
            </div>
          </div>

          {data.notes && (
            <div className="space-y-1 bg-yellow-50 p-3 rounded border border-yellow-200">
              <span className="text-xs font-bold text-yellow-800 uppercase">Ghi chú:</span>
              <p className="text-sm text-yellow-700 whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
