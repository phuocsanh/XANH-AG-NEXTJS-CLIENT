"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  CreateFarmingScheduleBody, 
  CreateFarmingScheduleBodyType 
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
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { vi } from "date-fns/locale"

interface GuestFarmingScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateFarmingScheduleBodyType) => void
  initialData?: any
  riceCropId: number
}

export default function GuestFarmingScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  riceCropId
}: GuestFarmingScheduleModalProps) {
  const form = useForm<CreateFarmingScheduleBodyType>({
    resolver: zodResolver(CreateFarmingScheduleBody),
    defaultValues: {
      rice_crop_id: riceCropId,
      activity_name: "",
      scheduled_date: new Date().toISOString(),
      status: "pending",
      instructions: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        rice_crop_id: riceCropId,
        activity_name: initialData.activity_name || "",
        scheduled_date: initialData.scheduled_date || new Date().toISOString(),
        status: initialData.status || "pending",
        instructions: initialData.instructions || "",
      })
    } else {
      form.reset({
        rice_crop_id: riceCropId,
        activity_name: "",
        scheduled_date: new Date().toISOString(),
        status: "pending",
        instructions: "",
      })
    }
  }, [initialData, isOpen, riceCropId, form])

  const handleSubmit = (data: CreateFarmingScheduleBodyType) => {
    onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 bg-agri-600 text-white relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
          <DialogTitle className="text-2xl font-black relative z-10">
            {initialData ? "Cập nhật công việc" : "Thêm công việc mới"}
          </DialogTitle>
          <p className="text-agri-100 text-xs font-medium relative z-10">Lập kế hoạch canh tác hiệu quả cho ruộng lúa của bạn</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-6">
            <FormField
              control={form.control}
              name="activity_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest">Tên công việc</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Bón phân đợt 1, Xịt thuốc đạo ôn..." {...field} className="rounded-2xl border-gray-100 focus:border-agri-600 focus:ring-agri-600/10 h-12" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ngày thực hiện</FormLabel>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl border-gray-100 h-12 focus:ring-agri-600/10">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        <SelectItem value="pending">Chờ thực hiện</SelectItem>
                        <SelectItem value="completed">Đã hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest">Hướng dẫn chi tiết</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ghi chú thêm về liều lượng, loại thuốc, lưu ý..." 
                      className="rounded-2xl border-gray-100 focus:border-agri-600 focus:ring-agri-600/10 min-h-[100px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl text-gray-400 font-bold">Hủy</Button>
              <Button type="submit" className="rounded-2xl bg-agri-600 hover:bg-agri-700 text-white shadow-lg shadow-agri-100 px-8 font-black">
                {initialData ? "Lưu thay đổi" : "Thêm vào lịch"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
