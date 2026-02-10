"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Trash2 } from "lucide-react"
import dayjs from "dayjs"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  useCreateExternalPurchase, 
  useUpdateExternalPurchase 
} from "@/hooks/use-external-purchase"
import { useToast } from "@/hooks/use-toast"
import { convertCurrency } from "@/lib/utils"
import type { MergedPurchase, CreateExternalPurchaseDto } from "@/models/rice-farming"

interface CreateExternalPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: MergedPurchase | null
  riceCropId: number
}

export default function CreateExternalPurchaseModal({
  isOpen,
  onClose,
  initialData,
  riceCropId,
}: CreateExternalPurchaseModalProps) {
  const { toast } = useToast()
  
  interface PurchaseItem {
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    notes?: string
  }

  const [formData, setFormData] = useState<{
    supplier_name: string
    purchase_date: string
    payment_status: string
    paid_amount: number
    notes: string
    items: PurchaseItem[]
  }>({
    supplier_name: "",
    purchase_date: dayjs().format("YYYY-MM-DD"),
    payment_status: "paid",
    paid_amount: 0,
    notes: "",
    items: [{ product_name: "", quantity: 1, unit_price: 0, total_price: 0 }]
  })

  useEffect(() => {
    if (initialData && initialData.source === 'external') {
      setFormData({
        supplier_name: initialData.supplier,
        purchase_date: dayjs(initialData.date).format("YYYY-MM-DD"),
        payment_status: initialData.status,
        paid_amount: initialData.paid_amount,
        notes: initialData.notes || "",
        items: (initialData as any).items || [{ product_name: "", quantity: 1, unit_price: 0, total_price: 0 }]
      })
    } else {
      setFormData({
        supplier_name: "",
        purchase_date: dayjs().format("YYYY-MM-DD"),
        payment_status: "paid",
        paid_amount: 0,
        notes: "",
        items: [{ product_name: "", quantity: 1, unit_price: 0, total_price: 0 }]
      })
    }
  }, [initialData, isOpen])

  const createMutation = useCreateExternalPurchase()
  const updateMutation = useUpdateExternalPurchase()

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_name: "", quantity: 1, unit_price: 0, total_price: 0 }]
    })
  }

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return
    const newItems = formData.items.filter((_: PurchaseItem, i: number) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]
    const currentItem = newItems[index]
    if (!currentItem) return
    
    if (field === "product_name") {
      newItems[index] = { ...currentItem, product_name: String(value) } as PurchaseItem
    } else if (field === "quantity") {
      const quantity = Number(value)
      newItems[index] = { 
        ...currentItem, 
        quantity,
        total_price: quantity * currentItem.unit_price 
      } as PurchaseItem
    } else if (field === "unit_price") {
      const unit_price = Number(value)
      newItems[index] = { 
        ...currentItem, 
        unit_price,
        total_price: currentItem.quantity * unit_price 
      } as PurchaseItem
    }
    
    setFormData({ ...formData, items: newItems })
  }

  const totalAmount = formData.items.reduce((sum: number, item: PurchaseItem) => sum + (Number(item.total_price) || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const dto: CreateExternalPurchaseDto = {
        rice_crop_id: riceCropId,
        purchase_date: formData.purchase_date,
        supplier_name: formData.supplier_name,
        total_amount: totalAmount,
        paid_amount: formData.payment_status === 'paid' ? totalAmount : Number(formData.paid_amount),
        payment_status: formData.payment_status,
        notes: formData.notes,
        items: formData.items.map((item: PurchaseItem) => ({
          product_name: item.product_name,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
          notes: item.notes
        }))
      }

      if (initialData && typeof initialData.id === 'string' && initialData.id.startsWith('ext-')) {
        const numericId = parseInt(initialData.id.replace('ext-', ''))
        await updateMutation.mutateAsync({ id: numericId, dto })
        toast({ title: "Thành công", description: "Cập nhật hóa đơn thành công" })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: "Thành công", description: "Lưu hóa đơn thành công" })
      }

      onClose()
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa hóa đơn" : "Tự nhập hóa đơn mua hàng"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-sm font-semibold text-agri-800">Nhà cung cấp / Cửa hàng <span className="text-red-500">*</span></Label>
              <Input
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                placeholder="VD: Cửa hàng BVTV Kim Anh"
                className="h-10 border-agri-200 focus-visible:ring-agri-500"
                required
              />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-sm font-semibold text-agri-800">Ngày mua <span className="text-red-500">*</span></Label>
              <DatePicker
                value={formData.purchase_date}
                onChange={(date) => setFormData({ ...formData, purchase_date: date })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-agri-800">Thanh toán</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger className="h-10 border-agri-200 focus:ring-agri-500">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Đã thanh toán hết</SelectItem>
                  <SelectItem value="partial">Thanh toán một phần</SelectItem>
                  <SelectItem value="pending">Chưa thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.payment_status === 'partial' && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-agri-800">Số tiền đã trả <span className="text-red-500">*</span></Label>
                <NumberInput
                  value={formData.paid_amount}
                  onValueChange={(values) => setFormData({ ...formData, paid_amount: values.floatValue || 0 })}
                  className="h-10 border-agri-200 focus:ring-agri-500"
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-agri-100 pb-2">
              <Label className="text-base font-bold text-agri-900">Danh sách sản phẩm</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-agri-700 border-agri-200 hover:bg-agri-50 hover:text-agri-800 transition-colors">
                <Plus className="h-4 w-4 mr-1" /> Thêm dòng
              </Button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item: PurchaseItem, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end bg-agri-50/30 p-3 rounded-lg border border-agri-100/50">
                  <div className="col-span-5 space-y-1.5">
                    <Label className="text-[11px] font-bold text-agri-700 uppercase tracking-wider">Tên sản phẩm</Label>
                    <Input
                      placeholder="Sản phẩm"
                      value={item.product_name}
                      onChange={(e) => updateItem(index, "product_name", e.target.value)}
                      className="h-9 bg-white border-agri-200"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[11px] font-bold text-agri-700 uppercase tracking-wider">SL</Label>
                    <NumberInput
                      placeholder="SL"
                      value={item.quantity}
                      onValueChange={(values) => updateItem(index, "quantity", values.floatValue || 0)}
                      className="h-9 bg-white border-agri-200"
                      required
                    />
                  </div>
                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-[11px] font-bold text-agri-700 uppercase tracking-wider">Đơn giá</Label>
                    <NumberInput
                      placeholder="Đơn giá"
                      value={item.unit_price}
                      onValueChange={(values) => updateItem(index, "unit_price", values.floatValue || 0)}
                      className="h-9 bg-white border-agri-200"
                      required
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:bg-red-50"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center font-bold px-4 py-3 bg-agri-600 text-white rounded-xl shadow-inner">
            <span className="text-sm">TỔNG CỘNG:</span>
            <span className="text-lg">{convertCurrency(totalAmount)}</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-agri-800">Ghi chú</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Ghi chú về lô hàng hoặc thanh toán..."
              className="resize-none border-agri-200 focus:ring-agri-500"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-agri-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-agri-600 hover:bg-agri-700 shadow-md">
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {initialData ? "Cập nhật" : "Lưu hóa đơn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
