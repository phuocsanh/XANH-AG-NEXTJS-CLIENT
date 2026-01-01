"use client"

import * as React from "react"
import { useFormContext, Controller, Control, FieldValues, Path } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  type?: "text" | "email" | "password" | "select" | "textarea" | "number"
  placeholder?: string
  options?: { label: string; value: string | number }[]
  disabled?: boolean
  className?: string
  rows?: number
}

/**
 * FormField component - Generic form field wrapper cho react-hook-form
 * Hỗ trợ nhiều loại input: text, email, password, select, textarea, number
 */
export function FormFieldWrapper<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  options = [],
  disabled,
  className,
  rows = 4,
}: FormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === "textarea" ? (
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                {...field}
              />
            ) : type === "select" ? (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
