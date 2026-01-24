"use client"

import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"
import dayjs from "dayjs"
import { WarningMessageDisplay } from "./WarningMessageDisplay"
import { DiseaseWarning } from "@/models/disease-warning"

interface WarningCardProps {
  warning: DiseaseWarning
  title: string
  loading?: boolean
}

const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'RẤT CAO':
      return 'bg-red-500 hover:bg-red-600'
    case 'CAO':
      return 'bg-orange-500 hover:bg-orange-600'
    case 'TRUNG BÌNH':
      return 'bg-yellow-500 hover:bg-yellow-600'
    case 'THẤP':
      return 'bg-green-500 hover:bg-green-600'
    case 'AN TOÀN':
      return 'bg-blue-500 hover:bg-blue-600'
    default:
      return 'bg-gray-400 hover:bg-gray-500'
  }
}

const getRiskBorder = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'RẤT CAO': return 'border-l-red-500'
    case 'CAO': return 'border-l-orange-500'
    case 'TRUNG BÌNH': return 'border-l-yellow-500'
    case 'THẤP': return 'border-l-green-500'
    case 'AN TOÀN': return 'border-l-blue-500'
    default: return 'border-l-gray-400'
  }
}

const RiskIcon = ({ riskLevel }: { riskLevel: string }) => {
  if (riskLevel === 'AN TOÀN') return <CheckCircle className="h-4 w-4" />
  if (riskLevel === 'ĐANG CHỜ CẬP NHẬT') return <Clock className="h-4 w-4" />
  return <AlertTriangle className="h-4 w-4" />
}

export const WarningCard: React.FC<WarningCardProps> = ({ warning, title, loading = false }) => {
  if (loading) {
    return (
      <Card className="animate-pulse h-48 bg-muted/20" />
    )
  }

  return (
    <Card className={`overflow-hidden border-l-4 ${getRiskBorder(warning.risk_level)} shadow-sm mb-6`}>
      <CardHeader className="py-3 px-4 bg-muted/10">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Badge className={`text-[11px] font-bold ${getRiskColor(warning.risk_level)} text-white border-none px-3 py-0.5`}>
              <div className="flex items-center gap-1.5 font-bold uppercase transition-all">
                <RiskIcon riskLevel={warning.risk_level} />
                {title}
              </div>
            </Badge>
            <Badge variant="outline" className="text-[11px] font-bold uppercase py-0.5">
              Mức độ: {warning.risk_level}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-4">
        <WarningMessageDisplay 
          message={warning.message} 
          peakDays={warning.peak_days} 
        />
        
        <Separator className="my-4" />
        
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Cập nhật: {dayjs(warning.updated_at).format('DD/MM/YYYY HH:mm')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
