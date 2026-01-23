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
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[96vh] p-0 flex flex-col gap-0 border shadow-2xl overflow-hidden translate-x-[-50%] translate-y-[-50%]">
        {/* Header cố định */}
        <div className="p-4 sm:p-6 pb-2 sm:pb-3 border-b bg-card w-full">
          <DialogHeader className="pr-10 w-full overflow-hidden">
            <DialogTitle className="text-left w-full">
              <div className="text-base sm:text-xl font-bold break-all leading-tight mb-2 w-full max-w-full overflow-hidden">
                Chi tiết hóa đơn {data.code}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {data.source === 'external' ? (
                  <Badge variant="outline" className="gap-1 font-normal bg-background text-[10px] py-0">
                    <FileText className="h-3 w-3" /> Tự nhập
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-600 border-blue-100 font-normal text-[10px] py-0">
                    <ShoppingCart className="h-3 w-3" /> Hệ thống
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 bg-muted/20 p-3 sm:p-4 rounded-xl border w-full">
            <div className="space-y-3 min-w-0">
              <div className="flex items-start gap-3 text-sm">
                <Store className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <span className="block font-medium text-muted-foreground text-[10px] uppercase mb-0.5">Nhà cung cấp</span>
                  <span className="text-foreground font-semibold break-words block text-sm">{data.supplier}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <span className="block font-medium text-muted-foreground text-[10px] uppercase mb-0.5">Ngày mua</span>
                  <span className="text-foreground font-semibold block text-sm">{dayjs(data.date).format("DD/MM/YYYY HH:mm")}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 min-w-0">
              <div className="flex items-start gap-3 text-sm">
                <CreditCard className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <span className="block font-medium text-muted-foreground text-[10px] uppercase mb-0.5">Trạng thái & Thanh toán</span>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant={getStatusVariant(data.status)} className="px-1.5 py-0 h-4.5 text-[9px] font-bold">
                      {getStatusText(data.status)}
                    </Badge>
                    <span className="text-foreground font-bold text-sm">{getPaymentMethodText(data.payment_method)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="space-y-3 w-full">
            <h3 className="font-semibold text-base px-1">Danh sách sản phẩm</h3>
            <div className="w-full overflow-x-auto border rounded-lg bg-card shadow-inner">
              <Table className="min-w-[400px] sm:min-w-full">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[30px] px-1 text-center text-[10px] uppercase font-bold">#</TableHead>
                    <TableHead className="px-2">Sản phẩm</TableHead>
                    <TableHead className="px-1 text-center">SL</TableHead>
                    <TableHead className="px-2 text-right">Giá</TableHead>
                    <TableHead className="px-2 text-right">Tổng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items && data.items.length > 0 ? (
                    data.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="px-1 text-center text-muted-foreground text-[10px]">{index + 1}</TableCell>
                        <TableCell className="px-2 py-2">
                          <div className="font-medium text-[13px] leading-tight break-words max-w-[150px] sm:max-w-none">
                            {data.source === 'system' 
                              ? (item.product?.trade_name || item.product?.name || 'Sản phẩm hệ thống') 
                              : (item.product_name || 'Sản phẩm')}
                          </div>
                          {data.source === 'system' && item.product?.name && item.product?.name !== item.product?.trade_name && (
                            <div className="text-[10px] text-muted-foreground italic leading-tight mt-0.5 break-words">
                              {item.product.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-1 text-center text-xs whitespace-nowrap">
                          {item.quantity} {item.unit || item.product?.unit_name || ''}
                        </TableCell>
                        <TableCell className="px-2 text-right text-xs whitespace-nowrap font-mono">
                          {convertCurrency(Number(item.unit_price || item.price || 0))}
                        </TableCell>
                        <TableCell className="px-2 text-right font-bold text-xs whitespace-nowrap font-mono">
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
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-2/3 md:w-1/2 space-y-1.5 border-t pt-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Tổng cộng:</span>
                <span className="font-semibold">{convertCurrency(data.total_amount)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Đã thanh toán:</span>
                <span className="font-semibold text-green-600">{convertCurrency(data.paid_amount)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base border-t mt-1.5 pt-1.5">
                <span className="font-bold">Còn nợ:</span>
                <span className="font-bold text-destructive">{convertCurrency(data.remaining_amount)}</span>
              </div>
            </div>
          </div>

          {data.notes && (
            <div className="space-y-1 bg-yellow-50 p-2.5 rounded border border-yellow-200">
              <span className="text-[10px] font-extrabold text-yellow-800 uppercase tracking-tighter">Ghi chú:</span>
              <p className="text-xs text-yellow-700 break-words leading-relaxed">{data.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" onClick={onClose} className="w-full sm:w-auto">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
