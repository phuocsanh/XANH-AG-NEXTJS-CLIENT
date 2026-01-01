"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboBoxOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface ComboBoxProps {
  options?: ComboBoxOption[]
  data?: ComboBoxOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
  emptyText?: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

/**
 * ComboBox component - Standalone version (không dùng react-hook-form)
 * Sử dụng Shadcn Command + Popover
 */
export function ComboBox({
  options = [],
  data,
  value,
  onChange,
  placeholder = "Chọn một mục...",
  emptyText = "Không tìm thấy kết quả.",
  isLoading,
  disabled,
  className,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const finalOptions = data || options

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value
            ? finalOptions.find((option) => String(option.value) === String(value))?.label || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">Đang tải...</div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {finalOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={String(option.label)}
                      onSelect={() => {
                        onChange?.(option.value)
                        setOpen(false)
                      }}
                      disabled={option.disabled}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          String(value) === String(option.value)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
