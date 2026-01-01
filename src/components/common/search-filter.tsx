"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Search, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface FilterField {
  key: string
  label: string
  type: "text" | "select" | "date"
  placeholder?: string
  options?: { label: string; value: string | number }[]
}

interface SearchFilterProps {
  filterFields?: FilterField[]
  onSearch?: (values: any) => void
  onReset?: () => void
  className?: string
  initialValues?: any
}

export function SearchFilter({
  filterFields = [],
  onSearch,
  onReset,
  className,
  initialValues = {},
}: SearchFilterProps) {
  const form = useForm({
    defaultValues: initialValues,
  })

  const onSubmit = (values: any) => {
    onSearch?.(values)
  }

  const handleReset = () => {
    form.reset()
    onReset?.()
  }

  return (
    <div className={cn("bg-card p-4 rounded-lg border shadow-sm", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filterFields.map((field) => (
              <FormField
                key={field.key}
                control={form.control}
                name={field.key}
                render={({ field: formField }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">{field.label}</FormLabel>
                    <FormControl>
                      {field.type === "text" && (
                        <Input placeholder={field.placeholder} {...formField} className="h-8" />
                      )}
                      
                      {field.type === "select" && (
                        <Select onValueChange={formField.onChange} defaultValue={formField.value} value={formField.value}>
                          <FormControl>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt.value} value={String(opt.value)}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {field.type === "date" && (
                         <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-8 justify-start text-left font-normal",
                                  !formField.value && "text-muted-foreground"
                                )}
                              >
                                {formField.value ? format(new Date(formField.value), "dd/MM/yyyy") : <span>{field.placeholder}</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formField.value}
                                onSelect={formField.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Đặt lại
            </Button>
            <Button type="submit" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
