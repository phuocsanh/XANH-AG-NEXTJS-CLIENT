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
      // Vì MergedPurchase không chứa chi tiết các item như ExternalPurchase gốc nên có thể cần fetch chi tiết
      // Tuy nhiên trong demo này, chúng ta giả định items được map sơ bộ từ initialData 
      // Hoặc fetch chi tiết external purchase bằng id
      setFormData({
        supplier_name: initialData.supplier,
        purchase_date: dayjs(initialData.date).format("YYYY-MM-DD"),
        payment_status: initialData.status,
        paid_amount: initialData.paid_amount,
        notes: initialData.notes || "",
        items: initialData.items || [{ product_name: "", quantity: 1, unit_price: 0, total_price: 0 }]
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
    if (!currentItem) return // Guard clause để tránh undefined
    
    // Cập nhật field với kiểu dữ liệu đúng
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
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Nhà cung cấp / Cửa hàng</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                placeholder="VD: Cửa hàng BVTV Kim Anh"
                required
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="purchase_date">Ngày mua</Label>
              <DatePicker
                value={formData.purchase_date}
                onChange={(date) => setFormData({ ...formData, purchase_date: date })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_status">Thanh toán</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger id="payment_status">
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
              <div className="space-y-2">
                <Label htmlFor="paid_amount">Số tiền đã trả</Label>
                <Input
                  id="paid_amount"
                  type="number"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: Number(e.target.value) })}
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Danh sách sản phẩm</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Thêm dòng
              </Button>
            </div>
            <div className="space-y-3 border rounded-md p-3 bg-muted/50">
              {formData.items.map((item: PurchaseItem, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-[10px]">Tên SP</Label>
                    <Input
                      placeholder="Sản phẩm"
                      value={item.product_name}
                      onChange={(e) => updateItem(index, "product_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px]">SL</Label>
                    <Input
                      type="number"
                      placeholder="SL"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px]">Đơn giá</Label>
                    <Input
                      type="number"
                      placeholder="Đơn giá"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2 text-right self-center font-medium text-xs">
                    {convertCurrency(item.total_price)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
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

          <div className="flex justify-between items-center font-bold px-2">
            <span>TỔNG CỘNG:</span>
            <span className="text-lg text-primary">{convertCurrency(totalAmount)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Ghi chú về lô hàng hoặc thanh toán..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
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
