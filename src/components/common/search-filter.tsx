"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RotateCcw, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SearchFilterProps {
  onSearch?: (value: string) => void
  onReset?: () => void
  searchPlaceholder?: string
  isLoading?: boolean
  className?: string
  children?: React.ReactNode // Cho phép thêm các bộ lọc phụ (Select, DatePicker...)
}

/**
 * Component SearchFilter - Phiên bản NextJS
 * Tập trung vào tính cơ động: Tìm kiếm nhanh trên Mobile & Mở rộng trên Desktop.
 * Clone & Tối ưu từ SearchFilter của bản Admin.
 */
export function SearchFilter({
  onSearch,
  onReset,
  searchPlaceholder = "Tìm kiếm...",
  isLoading = false,
  className,
  children,
}: SearchFilterProps) {
  const [searchValue, setSearchValue] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchValue)
  }

  const handleReset = () => {
    setSearchValue("")
    onReset?.()
  }

  return (
    <div className={cn("flex flex-col md:flex-row gap-3 items-center w-full", className)}>
      {/* 1. Ô TÌM KIẾM CHÍNH */}
      <form onSubmit={handleSearch} className="relative w-full md:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 h-11 md:h-10 border-agri-100 bg-white focus-visible:ring-agri-500 shadow-sm"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="hidden" // Nút ẩn để kích hoạt submit form
        >
          Tìm
        </Button>
      </form>

      {/* 2. NHÓM BỘ LỌC PHỤ & RESET */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* Nếu có children (các bộ lọc như Select, Date...), hiển thị thêm nút Filter trên Mobile */}
        {children && (
          <div className="hidden md:flex items-center gap-2 flex-1 md:flex-none">
            {children}
          </div>
        )}
        
        {children && (
          <div className="md:hidden flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-11 border-agri-200 text-agri-700 gap-2">
                  <Filter className="h-4 w-4" />
                  Bộ lọc
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] p-4 space-y-4" align="end">
                <h3 className="font-bold text-sm text-agri-900 border-b pb-2 mb-2">Tùy chọn bộ lọc</h3>
                <div className="space-y-4">
                  {children}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleReset}
          className="h-11 w-11 md:h-10 md:w-10 text-muted-foreground hover:text-agri-600 hover:bg-agri-50 rounded-lg"
          title="Đặt lại"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
