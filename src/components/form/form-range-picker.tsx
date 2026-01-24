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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Control, FieldValues, Path } from "react-hook-form"

interface FormRangePickerProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

/**
 * Component FormRangePicker - Phiên bản Tiếng Việt
 */
export function FormRangePicker<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Chọn khoảng ngày",
  disabled,
  className,
  required,
}: FormRangePickerProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          {label && (
            <FormLabel className="text-sm font-semibold text-agri-800">
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full h-10 justify-start text-left font-normal border-agri-200 focus:ring-agri-500",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-agri-600" />
                  {field.value?.from ? (
                    field.value.to ? (
                      <>
                        {format(field.value.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                        {format(field.value.to, "dd/MM/yyyy", { locale: vi })}
                      </>
                    ) : (
                      format(field.value.from, "dd/MM/yyyy", { locale: vi })
                    )
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={field.value?.from}
                selected={field.value}
                onSelect={field.onChange}
                numberOfMonths={2}
                locale={vi} // Chuyển sang Tiếng Việt
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
