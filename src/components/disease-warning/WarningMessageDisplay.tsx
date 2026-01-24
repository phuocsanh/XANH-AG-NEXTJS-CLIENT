"use client"

import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle } from "lucide-react"

interface WarningMessageDisplayProps {
  message: string
  peakDays?: string | null
}

export const WarningMessageDisplay: React.FC<WarningMessageDisplayProps> = ({ message, peakDays }) => {
  const sections = (message || "").split("\n\n")
  
  // Header section (Emoji + Risk Level)
  const header = sections[0] || ""
  // Location section
  const location = sections[1] || ""
  // Summary section
  const summary = sections[2] || ""
  
  // Detail Analysis section
  const detailedAnalysisSection = sections.find(s => s.includes("PHÂN TÍCH CHI TIẾT:"))
  const detailedAnalysisContent = detailedAnalysisSection
    ?.replace("🔍 PHÂN TÍCH CHI TIẾT:\n", "")
    ?.replace("PHÂN TÍCH CHI TIẾT:\n", "")

  // Recommendation section
  const recommendationSection = sections.find(s => s.includes("KHUYẾN NGHỊ:"))
  const recommendationContent = recommendationSection
    ?.replace("💊 KHUYẾN NGHỊ:\n", "")
    ?.replace("KHUYẾN NGHỊ:\n", "")

  return (
    <div className="space-y-4">
      {/* Header & Location */}
      <div>
        <h3 className="text-xl font-bold tracking-tight mb-1">{header}</h3>
        <p className="text-sm text-muted-foreground">{location}</p>
      </div>

      <Separator />

      {/* Summary */}
      <p className="text-sm leading-relaxed">{summary}</p>

      {/* Peak Days */}
      {peakDays && (
        <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-900 dark:text-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle className="text-sm font-bold">⚠️ Thời Gian Nguy Cơ Cao</AlertTitle>
          <AlertDescription className="text-xs">
            Cần đặc biệt chú ý trong khoảng: <span className="font-bold underline">{peakDays}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Detail Analysis */}
      {detailedAnalysisContent && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <span className="bg-primary/10 p-1 rounded">🔍</span> PHÂN TÍCH CHI TIẾT
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {detailedAnalysisContent}
          </p>
        </div>
      )}

      {detailedAnalysisContent && recommendationContent && <Separator />}

      {/* Recommendations */}
      {recommendationContent && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded">💊</span> KHUYẾN NGHỊ
          </h4>
          <p className="text-sm leading-relaxed font-medium text-emerald-700 dark:text-emerald-300">
            {recommendationContent}
          </p>
        </div>
      )}
    </div>
  )
}
