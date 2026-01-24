"use client"

import { Control, FieldPath, FieldValues } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { NumberInput, NumberInputProps } from "@/components/ui/number-input"
import { cn } from "@/lib/utils"

interface FormNumberInputProps<T extends FieldValues> extends Omit<NumberInputProps, "value" | "defaultValue" | "onValueChange"> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
  rules?: any
}

export function FormNumberInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  required,
  rules,
  ...props
}: FormNumberInputProps<T>) {
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
            <NumberInput
              {...props}
              className="h-10 border-agri-200 focus-visible:ring-agri-500 focus-visible:border-agri-500 transition-all"
              value={field.value}
              onValueChange={(values: any) => {
                field.onChange(values.floatValue ?? null)
              }}
              onBlur={field.onBlur}
              name={field.name}
            />
          </FormControl>
          {description && <p className="text-[12px] text-muted-foreground mt-1">{description}</p>}
          <FormMessage className="text-[12px]" />
        </FormItem>
      )}
    />
  )
}
