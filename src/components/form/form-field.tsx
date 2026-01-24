"use client"

import * as React from "react"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

interface FormFieldWrapperProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  className?: string
  required?: boolean
  description?: string
  rules?: any
}

export function FormFieldWrapper<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  disabled,
  className,
  required,
  description,
  rules,
}: FormFieldWrapperProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={cn("space-y-1.5", className)}>
          {label && (
            <FormLabel className="text-sm font-semibold text-agri-800">
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className="h-10 border-agri-200 focus-visible:ring-agri-500 focus-visible:border-agri-500 transition-all"
              {...field}
            />
          </FormControl>
          {description && (
            <p className="text-[12px] text-muted-foreground mt-1">{description}</p>
          )}
          <FormMessage className="text-[12px]" />
        </FormItem>
      )}
    />
  )
}
