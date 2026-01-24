import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "default" | "secondary" | "destructive" | "outline" | "primary" | "success" | "warning" | "info"

interface StatusConfig {
  color?: string
  label: string
  className?: string
}

interface StatusBadgeProps {
  status: string
  label?: string
  variant?: StatusType
  className?: string
  customConfig?: Record<string, StatusConfig>
}

/**
 * Component StatusBadge tái sử dụng - Phiên bản NextJS
 * Đồng bộ logic với bản Admin nhưng sử dụng Shadcn UI
 */
export function StatusBadge({ 
  status, 
  label, 
  variant = "default", 
  className,
  customConfig = {}
}: StatusBadgeProps) {
  
  // Cấu hình mặc định cho các trạng thái phổ biến
  const defaultStatusConfig: Record<string, StatusConfig> = {
    // Kết quả
    success: { label: "Thành công", className: "bg-green-500 hover:bg-green-600 text-white border-transparent" },
    error: { label: "Lỗi", className: "bg-red-500 hover:bg-red-600 text-white border-transparent" },
    warning: { label: "Cảnh báo", className: "bg-yellow-500 hover:bg-yellow-600 text-white border-transparent" },
    info: { label: "Thông tin", className: "bg-blue-500 hover:bg-blue-600 text-white border-transparent" },
    
    // Thực thể (RiceCrop, Invoice...)
    active: { label: "Hoạt động", className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" },
    inactive: { label: "Tạm dừng", className: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" },
    pending: { label: "Chờ xử lý", className: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" },
    approved: { label: "Đã duyệt", className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" },
    rejected: { label: "Từ chối", className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" },
    draft: { label: "Bản nháp", className: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" },
    
    // Thanh toán
    paid: { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" },
    partial: { label: "Trả một phần", className: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200" },
    unpaid: { label: "Chưa trả", className: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200" },
  }

  // Ưu tiên: customConfig > defaultStatusConfig
  const config = customConfig[status] || defaultStatusConfig[status] || { label: status }
  
  const displayText = label || config.label
  const finalClassName = cn(
    "font-medium px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider transition-colors",
    config.className,
    className
  )

  // Nếu không có config màu sắc đặc biệt, dùng variant của Shadcn
  const badgeVariant = config.className ? "default" : (variant as any)

  return (
    <Badge variant={badgeVariant} className={finalClassName}>
      {displayText}
    </Badge>
  )
}
