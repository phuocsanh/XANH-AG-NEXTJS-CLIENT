import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface FieldProps {
  label?: string
  id?: string
  type?: "text" | "email" | "password" | "select" | "textarea" | "number"
  placeholder?: string
  required?: boolean
  value?: string | number
  onChange?: (value: string | number) => void
  onBlur?: () => void
  options?: { label: string; value: string | number }[]
  disabled?: boolean
  className?: string
  rows?: number
  error?: string
}

export function Field({
  label,
  id,
  type = "text",
  placeholder,
  required = false,
  value,
  onChange,
  onBlur,
  options = [],
  disabled = false,
  className,
  rows = 4,
  error,
}: FieldProps) {
  // React Hooks phải được gọi ở top level, không được gọi trong điều kiện
  const generatedId = React.useId()
  const inputId = id || generatedId

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            id={inputId}
            value={value}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={error ? "border-red-500" : ""}
          />
        )
      
      case "select":
        return (
          <Select
            value={String(value)}
            onValueChange={onChange as (value: string) => void}
            disabled={disabled}
          >
            <SelectTrigger id={inputId} className={error ? "border-red-500" : ""}>
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
        )

      default:
        return (
          <Input
            id={inputId}
            type={type}
            value={value}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? "border-red-500" : ""}
          />
        )
    }
  }

  return (
    <div className={cn("grid w-full gap-1.5", className)}>
      {label && (
        <Label htmlFor={inputId} className={error ? "text-red-500" : ""}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {renderInput()}
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  )
}
