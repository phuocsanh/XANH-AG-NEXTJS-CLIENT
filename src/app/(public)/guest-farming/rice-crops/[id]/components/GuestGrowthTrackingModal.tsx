"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  CreateGrowthTrackingBody, 
  CreateGrowthTrackingBodyType 
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
import { FormNumberInput } from "@/components/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Sprout } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { vi } from "date-fns/locale"

interface GuestGrowthTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateGrowthTrackingBodyType) => void
  initialData?: any
  riceCropId: number
}

const GROWTH_STAGES = [
  { value: "seedling", label: "Giai đoạn mạ" },
  { value: "tillering", label: "Đẻ nhánh" },
  { value: "panicle", label: "Làm đòng" },
  { value: "heading", label: "Trổ bông" },
  { value: "grain_filling", label: "Vô gạo" },
  { value: "ripening", label: "Chín" },
  { value: "harvested", label: "Đã thu hoạch" },
]

export default function GuestGrowthTrackingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  riceCropId
}: GuestGrowthTrackingModalProps) {
  const form = useForm<CreateGrowthTrackingBodyType>({
    resolver: zodResolver(CreateGrowthTrackingBody),
    defaultValues: {
      rice_crop_id: riceCropId,
      tracking_date: new Date().toISOString(),
      growth_stage: "seedling",
      plant_height: 0,
      leaf_color: "",
      pest_disease_detected: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        rice_crop_id: riceCropId,
        tracking_date: initialData.tracking_date || new Date().toISOString(),
        growth_stage: initialData.growth_stage || "seedling",
        plant_height: initialData.plant_height || 0,
        leaf_color: initialData.leaf_color || "",
        pest_disease_detected: initialData.pest_disease_detected || "",
        notes: initialData.notes || "",
      })
    } else {
      form.reset({
        rice_crop_id: riceCropId,
        tracking_date: new Date().toISOString(),
        growth_stage: "seedling",
        plant_height: 0,
        leaf_color: "",
        pest_disease_detected: "",
        notes: "",
      })
    }
  }, [initialData, isOpen, riceCropId, form])

  const handleSubmit = (data: CreateGrowthTrackingBodyType) => {
    onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 bg-blue-600 text-white relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
          <DialogTitle className="text-2xl font-black relative z-10 flex items-center gap-3">
             <Sprout className="w-8 h-8" />
             {initialData ? "Cập nhật nhật ký" : "Ghi chép sinh trưởng"}
          </DialogTitle>
          <p className="text-blue-100 text-xs font-medium relative z-10">Ghi lại các chỉ số quan trọng để theo dõi sức khỏe cây lúa</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tracking_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ngày kiểm tra</FormLabel>
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
                name="growth_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Giai đoạn</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl border-gray-100 h-12 focus:ring-blue-600/10">
                          <SelectValue placeholder="Chọn giai đoạn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        {GROWTH_STAGES.map(stage => (
                          <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormNumberInput
                  control={form.control}
                  name="plant_height"
                  label="Chiều cao lúa (cm)"
                  placeholder="0"
                  className="rounded-2xl h-12"
                />

              <FormField
                control={form.control}
                name="leaf_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest">Màu sắc lá</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Xanh mướt, hơi vàng..." {...field} className="rounded-2xl border-gray-100 focus:border-blue-600 focus:ring-blue-600/10 h-12" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pest_disease_detected"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest">Sâu bệnh phát hiện</FormLabel>
                  <FormControl>
                    <Input placeholder="Ghi tên sâu bệnh nếu có..." {...field} className="rounded-2xl border-gray-100 focus:border-red-600 focus:ring-red-600/10 h-12" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest">Nhận xét chi tiết</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ghi chú thêm về tình trạng phát triển..." 
                      className="rounded-2xl border-gray-100 focus:border-blue-600 focus:ring-blue-600/10 min-h-[80px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl text-gray-400 font-bold">Hủy</Button>
              <Button type="submit" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 px-8 font-black">
                {initialData ? "Lưu cập nhật" : "Lưu nhật ký"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
