"use client"

import * as React from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import dayjs from "dayjs"

interface DatePickerProps {
  value?: string | Date
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

/**
 * Component DatePicker - Phiên bản Tiếng Việt
 * Đã sửa lỗi không chọn được ngày bằng cách sử dụng Date object chuẩn 
 * và xử lý sự kiện onSelect chính xác hơn.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Chuyển đổi value sang Date object một cách an toàn
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    const d = dayjs(value)
    return d.isValid() ? d.toDate() : undefined
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    if (onChange) {
      // Luôn trả về định dạng YYYY-MM-DD để đồng bộ với backend/schema
      const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : ""
      onChange(formattedDate)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10 border-agri-200 focus:ring-agri-500",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          type="button" // Đảm bảo không submit form khi nhấn
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-agri-600" />
          {dateValue ? (
            format(dateValue, "dd/MM/yyyy", { locale: vi })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-white shadow-xl z-[100]" 
        align="start"
        onFocusOutside={(e) => e.preventDefault()} // Ngăn chặn xung đột focus với Dialog
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          disabled={(date) =>
            (minDate ? date < minDate : false) ||
            (maxDate ? date > maxDate : false)
          }
          initialFocus
          locale={vi}
        />
      </PopoverContent>
    </Popover>
  )
}
