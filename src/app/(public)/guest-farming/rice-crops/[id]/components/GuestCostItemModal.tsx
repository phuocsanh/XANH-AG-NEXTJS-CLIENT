"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  CreateCostItemBody, 
  CreateCostItemBodyType 
} from "@/schemaValidations/rice-farming.schema"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormNumberInput, FormComboBox } from "@/components/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, DollarSign } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { vi } from "date-fns/locale"

interface GuestCostItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCostItemBodyType) => void
  initialData?: any
  riceCropId: number
}

const COST_CATEGORIES = [
  { value: "seed", label: "Hạt giống" },
  { value: "fertilizer", label: "Phân bón" },
  { value: "pesticide", label: "Thuốc BVTV" },
  { value: "labor", label: "Nhân công" },
  { value: "machinery", label: "Máy móc / Cày cấy" },
  { value: "irrigation", label: "Tưới tiêu" },
  { value: "other", label: "Chi phí khác" },
]

export default function GuestCostItemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  riceCropId
}: GuestCostItemModalProps) {
  const form = useForm<CreateCostItemBodyType>({
    resolver: zodResolver(CreateCostItemBody),
    defaultValues: {
      rice_crop_id: riceCropId,
      item_name: "",
      total_cost: 0,
      expense_date: new Date().toISOString(),
      category_id: 0,
      notes: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        rice_crop_id: riceCropId,
        item_name: initialData.item_name || "",
        total_cost: Number(initialData.total_cost) || 0,
        expense_date: initialData.expense_date || initialData.purchase_date || new Date().toISOString(),
        notes: initialData.notes || "",
        // category_id hack for guest mode: we use it as string/category or similar
        category_id: initialData.category_id || 0,
      })
    } else {
      form.reset({
        rice_crop_id: riceCropId,
        item_name: "",
        total_cost: 0,
        expense_date: new Date().toISOString(),
        category_id: 0,
        notes: "",
      })
    }
  }, [initialData, isOpen, riceCropId, form])

  const handleSubmit = (data: any) => {
    onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 bg-rose-600 text-white relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
          <DialogTitle className="text-2xl font-black relative z-10 flex items-center gap-3">
             <DollarSign className="w-7 h-7" />
             {initialData ? "Cập nhật chi phí" : "Ghi chép chi phí"}
          </DialogTitle>
          <p className="text-rose-100 text-xs font-medium relative z-10">Quản lý tài chính vụ mùa chặt chẽ để tối ưu lợi nhuận</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-6">
            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest">Tên vật tư / hạng mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Phân Urê, Thuốc trừ sâu, Tiền máy cắt..." {...field} className="rounded-2xl border-gray-100 focus:border-rose-600 focus:ring-rose-600/10 h-12" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormNumberInput
                  control={form.control}
                  name="total_cost"
                  label="Số tiền (VNĐ)"
                  placeholder="0"
                  className="rounded-2xl h-12 font-bold"
                  decimalScale={3}
                />

              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ngày chi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal rounded-2xl border-gray-100 h-12",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-none" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormComboBox
              control={form.control}
              name="category_id"
              label="Loại chi phí"
              options={COST_CATEGORIES.map((cat, idx) => ({ value: idx, label: cat.label }))}
              required
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest">Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ghi chú thêm về địa điểm mua, người làm..." 
                      className="rounded-2xl border-gray-100 focus:border-rose-600 focus:ring-rose-600/10 min-h-[80px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl text-gray-400 font-bold">Hủy</Button>
              <Button type="submit" className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-100 px-8 font-black">
                {initialData ? "Lưu thay đổi" : "Lưu chi phí"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
