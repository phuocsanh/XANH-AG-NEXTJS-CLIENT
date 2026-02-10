"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  CreateHarvestRecordBody, 
  CreateHarvestRecordBodyType 
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
import { CalendarIcon, Wheat, Banknote } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn, convertCurrency } from "@/lib/utils"
import { vi } from "date-fns/locale"

interface GuestHarvestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateHarvestRecordBodyType) => void
  initialData?: any
  riceCropId: number
}

const UNIT_OPTIONS = [
  { value: "kg", label: "Kilogam (kg)" },
  { value: "tan", label: "Tấn" },
]

export default function GuestHarvestModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  riceCropId
}: GuestHarvestModalProps) {
  const form = useForm<CreateHarvestRecordBodyType>({
    resolver: zodResolver(CreateHarvestRecordBody),
    defaultValues: {
      rice_crop_id: riceCropId,
      harvest_date: new Date().toISOString(),
      yield_amount: 0,
      yield_unit: "tan",
      selling_price_per_unit: 0,
      total_revenue: 0,
      moisture_content: 0,
      quality_grade: "",
      buyer: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        rice_crop_id: riceCropId,
        harvest_date: initialData.harvest_date || new Date().toISOString(),
        yield_amount: Number(initialData.yield_amount) || 0,
        yield_unit: initialData.yield_unit || "tan",
        selling_price_per_unit: Number(initialData.selling_price_per_unit) || 0,
        total_revenue: Number(initialData.total_revenue) || 0,
        moisture_content: Number(initialData.moisture_content) || 0,
        quality_grade: initialData.quality_grade || "",
        buyer: initialData.buyer || "",
        notes: initialData.notes || "",
      })
    } else {
      form.reset({
        rice_crop_id: riceCropId,
        harvest_date: new Date().toISOString(),
        yield_amount: 0,
        yield_unit: "tan",
        selling_price_per_unit: 0,
        total_revenue: 0,
        moisture_content: 0,
        quality_grade: "",
        buyer: "",
        notes: "",
      })
    }
  }, [initialData, isOpen, riceCropId, form])

  // Tự động tính tổng doanh thu
  const watchedYield = form.watch("yield_amount")
  const watchedPrice = form.watch("selling_price_per_unit")
  const watchedUnit = form.watch("yield_unit")

  useEffect(() => {
    const isTan = watchedUnit === "tan"
    const quantityInKg = isTan ? (Number(watchedYield) || 0) * 1000 : (Number(watchedYield) || 0)
    const revenue = quantityInKg * (Number(watchedPrice) || 0)
    form.setValue("total_revenue", revenue)
  }, [watchedYield, watchedPrice, watchedUnit, form])

  const handleSubmit = (data: CreateHarvestRecordBodyType) => {
    onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 bg-amber-600 text-white relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
          <DialogTitle className="text-2xl font-black relative z-10 flex items-center gap-3">
             <Wheat className="w-8 h-8" />
             {initialData ? "Cập nhật thu hoạch" : "Ghi nhận thu hoạch"}
          </DialogTitle>
          <p className="text-amber-100 text-xs font-medium relative z-10">Ghi lại thành quả lao động của một vụ mùa vất vả</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="harvest_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ngày thu hoạch</FormLabel>
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

              <FormField
                control={form.control}
                name="buyer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest">Thương lái mua</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên thương lái / Cò lúa..." {...field} className="rounded-2xl border-gray-100 h-12" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormNumberInput
                  control={form.control}
                  name="yield_amount"
                  label="Sản lượng"
                  placeholder="0"
                  className="rounded-2xl h-12 font-bold"
                  decimalScale={3}
                />

                <FormComboBox
                  control={form.control}
                  name="yield_unit"
                  label="Đơn vị"
                  options={UNIT_OPTIONS}
                  required
                />

                <FormNumberInput
                  control={form.control}
                  name="moisture_content"
                  label="Độ ẩm (%)"
                  placeholder="0"
                  className="rounded-2xl h-12 font-bold"
                  decimalScale={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
                <FormNumberInput
                  control={form.control}
                  name="selling_price_per_unit"
                  label="Giá bán (đ/kg)"
                  placeholder="0"
                  className="font-bold text-amber-600 transition-all"
                  decimalScale={0}
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-agri-800 uppercase tracking-tight">Tổng doanh thu</label>
                  <div className="h-10 bg-amber-50/50 rounded-md flex items-center px-3 font-black text-amber-700 border border-amber-100 shadow-inner overflow-hidden whitespace-nowrap text-sm">
                     {convertCurrency(form.watch("total_revenue") || 0)}
                  </div>
                </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest">Ghi chú thu hoạch</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ghi chú thêm về chất lượng lúa, trừ tạp chất..." 
                      className="rounded-2xl border-gray-100 min-h-[80px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl text-gray-400 font-bold">Hủy</Button>
              <Button type="submit" className="rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-100 px-8 font-black flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                {initialData ? "Lưu thay đổi" : "Lưu kết quả"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
