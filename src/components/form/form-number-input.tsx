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
  rules?: any // React Hook Form validation rules
}

export function FormNumberInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  rules,
  ...props
}: FormNumberInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <NumberInput
              {...props}
              value={field.value}
              onValueChange={(values: any) => {
                field.onChange(values.floatValue ?? null)
              }}
              onBlur={field.onBlur}
              name={field.name}
            />
          </FormControl>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
