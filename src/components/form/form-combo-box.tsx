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
import { ScrollArea } from "@/components/ui/scroll-area"

export interface ComboBoxOption {
  value: string | number
  label: string
  disabled?: boolean
  [key: string]: any
}

interface FormComboBoxProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  options?: ComboBoxOption[]
  data?: ComboBoxOption[] // Async data
  isLoading?: boolean
  onSearch?: (value: string) => void
  disabled?: boolean
  className?: string
  modal?: boolean
  emptyText?: string
}

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
  modal = false,
  emptyText = "Không tìm thấy kết quả.",
}: FormComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const finalOptions = data || options

  // Debounce search
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
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <Popover open={open} onOpenChange={setOpen} modal={modal}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={disabled}
                  className={cn(
                    "w-full justify-between font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? finalOptions.find(
                        (option) => String(option.value) === String(field.value)
                      )?.label || field.value
                    : placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background">
              <Command shouldFilter={!onSearch}> {/* Disable internal filter if using async search */}
                <CommandInput 
                  placeholder={placeholder} 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isLoading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      Đang tải...
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>{emptyText}</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-max-[200px]">
                        {finalOptions.map((option) => (
                          <CommandItem
                            value={String(option.label)} // Use label for command filtering if local
                            key={option.value}
                            onSelect={() => {
                              field.onChange(option.value)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                String(option.value) === String(field.value)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                        </ScrollArea>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
