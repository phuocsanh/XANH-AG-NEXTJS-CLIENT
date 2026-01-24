"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FieldValues, Path, Control } from "react-hook-form"

export interface ComboBoxOption {
  value: string | number
  label: string
  disabled?: boolean
  subLabel?: string
  [key: string]: any
}

interface FormComboBoxProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  options?: ComboBoxOption[]
  data?: ComboBoxOption[]
  isLoading?: boolean
  onSearch?: (value: string) => void
  disabled?: boolean
  className?: string
  modal?: boolean
  emptyText?: string
  required?: boolean
  rules?: any
}

/**
 * Component FormComboBox - Cải tiến đồng bộ UI và fix lỗi click trong Dialog
 */
export function FormComboBox<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Chọn một mục...",
  options = [],
  data,
  isLoading,
  onSearch,
  disabled,
  className,
  modal = true,
  emptyText = "Không tìm thấy kết quả.",
  required,
  rules,
}: FormComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const finalOptions = data || options

  React.useEffect(() => {
    if (onSearch) {
      const timer = setTimeout(() => {
        onSearch(searchQuery)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, onSearch])

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
          <Popover open={open} onOpenChange={setOpen} modal={modal}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={disabled}
                  className={cn(
                    "w-full h-10 justify-between font-normal border-agri-200 focus:ring-agri-500 transition-all text-left px-3 bg-white",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {field.value
                      ? finalOptions.find(
                          (option) => String(option.value) === String(field.value)
                        )?.label || field.value
                      : placeholder}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[--radix-popover-trigger-width] p-0 bg-white shadow-xl border-agri-100 overflow-hidden z-[200]"
              align="start"
              // Ngăn chặn sự kiện PointerDown lan tới Dialog làm block selection
              onPointerDownOutside={(e) => {
                 const target = e.target as HTMLElement;
                 // Nếu target đang nằm trong popover hoặc là một phần của UI Radix thì ignore
                 if (target?.closest('[data-radix-popper-content-wrapper]')) {
                    e.preventDefault();
                 }
              }}
              onFocusOutside={(e) => e.preventDefault()}
            >
              <Command shouldFilter={!onSearch}>
                <CommandInput 
                  placeholder="Tìm kiếm..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="h-10 border-none focus:ring-0"
                />
                <CommandList className="max-h-[250px] overflow-y-auto thin-scrollbar">
                  {isLoading ? (
                    <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-agri-500" />
                      <span>Đang tải...</span>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty className="py-6 text-sm text-center text-muted-foreground italic">
                        {emptyText}
                      </CommandEmpty>
                      <CommandGroup>
                        {finalOptions.map((option) => (
                          <CommandItem
                            value={String(option.label)} 
                            key={option.value}
                            disabled={option.disabled}
                            onSelect={() => {
                              field.onChange(option.value)
                              setOpen(false)
                              setSearchQuery("")
                            }}
                            className="py-2.5 px-3 aria-selected:bg-agri-50 aria-selected:text-agri-700 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="flex-1 truncate">{option.label}</span>
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4 text-agri-600",
                                  String(option.value) === String(field.value)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </div>
                            {option.subLabel && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">{option.subLabel}</p>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage className="text-[12px]" />
        </FormItem>
      )}
    />
  )
}
