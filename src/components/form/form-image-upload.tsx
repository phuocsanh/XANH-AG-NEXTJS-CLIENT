"use client"

import * as React from "react"
import { Control, FieldValues, Path } from "react-hook-form"
import { UploadCloud, X, Loader2 } from "lucide-react"
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
  required?: boolean
  rules?: any
}

export function FormImageUpload<T extends FieldValues>({
  control,
  name,
  label,
  maxCount = 5,
  multiple = true,
  className,
  disabled,
  required,
  rules,
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
        if (!file) continue
        
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
      rules={rules}
      render={({ field }) => {
        const value = (field.value as string[]) || []

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel className="text-sm font-semibold text-agri-800">
                {label} {required && <span className="text-red-500">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className="space-y-4">
                {/* Upload Area */}
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-agri-50 hover:border-agri-300 transition-all group",
                    isUploading && "opacity-50 pointer-events-none",
                    disabled && "opacity-50 cursor-not-allowed",
                    "border-agri-200"
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
                    <Loader2 className="h-10 w-10 animate-spin text-agri-500" />
                  ) : (
                    <UploadCloud className="h-10 w-10 text-agri-400 group-hover:text-agri-600 transition-colors" />
                  )}
                  <p className="mt-2 text-sm text-agri-700 font-medium">
                    {isUploading ? "Đang tải lên..." : "Nhấn để chọn ảnh"}
                  </p>
                  <p className="text-xs text-agri-500">
                    Hỗ trợ JPG, PNG (Tối đa {maxCount} ảnh)
                  </p>
                </div>

                {/* Image List */}
                {value.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {value.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-agri-100 bg-background shadow-sm hover:shadow-md transition-all">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={url} 
                          alt={`Uploaded ${index}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemove(index, field.onChange, value)}
                          className="absolute top-1.5 right-1.5 bg-black/40 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage className="text-[12px]" />
          </FormItem>
        )
      }}
    />
  )
}
