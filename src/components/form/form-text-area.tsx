"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Control, FieldValues, Path } from "react-hook-form"

interface FormTextareaProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  rows?: number
  required?: boolean
  rules?: any
}

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  className,
  rows = 3,
  required,
  rules,
}: FormTextareaProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label} {(required || !!rules?.required) && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="resize-none border-agri-200 focus:ring-agri-500"
              rows={rows}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
