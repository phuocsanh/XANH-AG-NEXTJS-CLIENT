"use client"

import * as React from "react"
import { format } from "date-fns"
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

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const dateValue = value ? new Date(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10 border-agri-200 focus:ring-agri-500",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-agri-600" />
          {value ? (
            format(dateValue!, "dd/MM/yyyy")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(date) => {
            if (onChange) {
              onChange(date ? dayjs(date).format("YYYY-MM-DD") : "")
            }
          }}
          disabled={(date) =>
            (minDate ? date < minDate : false) ||
            (maxDate ? date > maxDate : false)
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
