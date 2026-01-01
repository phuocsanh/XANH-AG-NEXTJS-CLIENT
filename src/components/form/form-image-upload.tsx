"use client"

import * as React from "react"
import { useFormContext, Controller, Control, FieldValues, Path } from "react-hook-form"
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useUploadImageMutation } from "@/hooks/use-upload"
import { cn } from "@/lib/utils"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface FormImageUploadProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  maxCount?: number
  multiple?: boolean
  className?: string
  disabled?: boolean
}

export function FormImageUpload<T extends FieldValues>({
  control,
  name,
  label,
  maxCount = 5,
  multiple = true,
  className,
  disabled
}: FormImageUploadProps<T>) {
  const [isUploading, setIsUploading] = React.useState(false)
  const uploadMutation = useUploadImageMutation()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    onChange: (value: any) => void,
    currentValue: string[]
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (currentValue && currentValue.length + files.length > maxCount) {
      toast({
        variant: "destructive",
        title: "Lỗi upload",
        description: `Chỉ được tải tối đa ${maxCount} ảnh`,
      })
      return
    }

    setIsUploading(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Upload logic here
        // Assuming response structure { url: string } based on hook
        const res = await uploadMutation.mutateAsync({ file })
        if (res?.url) {
          newUrls.push(res.url)
        }
      }
      
      const updatedValue = [...(currentValue || []), ...newUrls]
      onChange(updatedValue)
      toast({
        title: "Thành công",
        description: `Đã tải lên ${newUrls.length} ảnh`,
      })
    } catch (error) {
       console.error(error)
       toast({
        variant: "destructive",
        title: "Thất bại",
        description: "Có lỗi xảy ra khi tải ảnh",
      })
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  const handleRemove = (
    indexToRemove: number,
    onChange: (value: any) => void,
    currentValue: string[]
  ) => {
    const updatedValue = currentValue.filter((_, index) => index !== indexToRemove)
    onChange(updatedValue)
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as string[]) || []

        return (
          <FormItem className={className}>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <div className="space-y-4">
                {/* Upload Area */}
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
                    isUploading && "opacity-50 pointer-events-none",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !disabled && inputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    multiple={multiple}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, field.onChange, value)}
                    disabled={disabled || isUploading}
                  />
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  )}
                  <p className="mt-2 text-sm text-muted-foreground font-medium">
                    {isUploading ? "Đang tải lên..." : "Nhấn để chọn ảnh"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hỗ trợ JPG, PNG (Tối đa {maxCount} ảnh)
                  </p>
                </div>

                {/* Image List */}
                {value.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {value.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-md overflow-hidden border bg-background">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={url} 
                          alt={`Uploaded ${index}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemove(index, field.onChange, value)}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
