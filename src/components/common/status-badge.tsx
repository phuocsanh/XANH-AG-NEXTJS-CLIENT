import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

interface StatusBadgeProps {
  status: string
  label?: string
  color?: StatusType
  className?: string
}

export function StatusBadge({ status, label, color = "default", className }: StatusBadgeProps) {
  const variantMap: Record<StatusType, "default" | "secondary" | "destructive" | "outline"> = {
    default: "default",
    secondary: "secondary",
    destructive: "destructive",
    outline: "outline",
    success: "default", // Custom style needed for success
    warning: "secondary", // Custom style needed for warning
  }

  const customStyles = {
    success: "bg-green-500 hover:bg-green-600 border-transparent text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 border-transparent text-white",
  }

  const variant = variantMap[color] || "default"
  const customClass = (color === "success" || color === "warning") ? customStyles[color] : ""

  return (
    <Badge variant={variant} className={cn(customClass, className)}>
      {label || status}
    </Badge>
  )
}
