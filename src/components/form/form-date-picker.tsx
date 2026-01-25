"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Control, FieldValues, Path } from "react-hook-form"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"

interface FormDatePickerProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
  required?: boolean
  rules?: any
}

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  className,
  minDate,
  maxDate,
  required,
  rules,
}: FormDatePickerProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={cn("space-y-1.5", className)}>
          {label && (
            <FormLabel className="text-sm font-semibold text-agri-800">
              {label} {(required || !!rules?.required) && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              minDate={minDate}
              maxDate={maxDate}
            />
          </FormControl>
          <FormMessage className="text-[12px]" />
        </FormItem>
      )}
    />
  )
}
