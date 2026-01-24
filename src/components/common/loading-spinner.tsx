"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  tip?: string
  spinning?: boolean
  children?: React.ReactNode
  overlay?: boolean
  className?: string
  glass?: boolean
}

/**
 * Component LoadingSpinner Cao Cấp
 * Hỗ trợ các hiệu ứng đẹp mắt, mờ nền (glassmorphism) và các kích thước khác nhau.
 * Clone & Cải tiến từ bản Admin để phù hợp với người dùng cuối.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  tip,
  spinning = true,
  children,
  overlay = false,
  className,
  glass = true,
}) => {
  const sizeMap = {
    sm: "h-4 w-4 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  }

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        {/* Vòng xoay chính */}
        <Loader2 className={cn("animate-spin text-agri-600", sizeMap[size])} />
        
        {/* Hiệu ứng xung nhịp phía sau (chỉ hiện khi size lớn) */}
        {(size === "lg" || size === "xl") && (
          <div className={cn(
            "absolute inset-0 animate-ping rounded-full bg-agri-200 opacity-25",
            size === "lg" ? "h-12 w-12" : "h-16 w-16"
          )} />
        )}
      </div>
      
      {tip && (
        <p className="font-medium text-agri-700 animate-pulse transition-all duration-300">
          {tip}
        </p>
      )}
    </div>
  )

  if (children) {
    return (
      <div className={cn("relative", className)}>
        {children}
        {spinning && (
          <div
            className={cn(
              "absolute inset-0 z-50 flex items-center justify-center rounded-inherit animate-in fade-in duration-300",
              glass ? "bg-white/60 backdrop-blur-[2px]" : "bg-white/80"
            )}
          >
            {spinnerContent}
          </div>
        )}
      </div>
    )
  }

  if (overlay) {
    return (
      <>
        {spinning && (
          <div
            className={cn(
              "fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-500",
              glass ? "bg-black/20 backdrop-blur-md" : "bg-white/90"
            )}
          >
            <div className="rounded-2xl bg-white p-8 shadow-2xl border border-agri-100 flex flex-col items-center zoom-in-95 animate-in duration-300">
              {spinnerContent}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={cn("flex items-center justify-center p-6", className)}>
      {spinning && spinnerContent}
    </div>
  )
}

export default LoadingSpinner
