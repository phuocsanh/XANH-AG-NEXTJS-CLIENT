"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DailyDataTableProps {
  data: any[]
  loading?: boolean
  diseaseType?: 'rice-blast' | 'bacterial-blight' | 'stem-borer' | 'gall-midge' | 'brown-plant-hopper' | 'sheath-blight' | 'grain-discoloration'
}

const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'RẤT CAO':
    case 'CỰC KỲ NGUY HIỂM':
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
      return 'bg-gray-500 hover:bg-gray-600'
  }
}

export const DailyDataTable: React.FC<DailyDataTableProps> = ({
  data,
  diseaseType = 'rice-blast'
}) => {
  if (!data || data.length === 0) return null

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">Ngày</TableHead>
              <TableHead className="w-[150px]">Nhiệt độ (°C)</TableHead>
              <TableHead className="w-[100px]">Độ ẩm (%)</TableHead>
              
              {/* Specific Columns */}
              {diseaseType === 'rice-blast' && (
                <>
                  <TableHead className="w-[120px]">Lá ướt (giờ)</TableHead>
                  <TableHead className="w-[120px]">Mưa</TableHead>
                  <TableHead className="w-[100px]">Sương mù</TableHead>
                </>
              )}
              
              {diseaseType === 'bacterial-blight' && (
                <>
                  <TableHead className="w-[120px]">Mưa</TableHead>
                  <TableHead className="w-[120px]">Gió (km/h)</TableHead>
                  <TableHead className="w-[120px]">Mưa 3 ngày</TableHead>
                </>
              )}

              {diseaseType === 'stem-borer' && (
                <TableHead className="w-[100px]">Nắng (giờ)</TableHead>
              )}

              {diseaseType === 'gall-midge' && (
                <TableHead className="w-[120px]">Mây che phủ (%)</TableHead>
              )}

              {diseaseType === 'brown-plant-hopper' && (
                <>
                  <TableHead className="w-[120px]">Gió TB (km/h)</TableHead>
                  <TableHead className="w-[100px]">Mưa (mm)</TableHead>
                </>
              )}

              {diseaseType === 'grain-discoloration' && (
                <>
                  <TableHead className="w-[100px]">Mưa (mm)</TableHead>
                  <TableHead className="w-[120px]">Gió TB (km/h)</TableHead>
                </>
              )}

              <TableHead className="w-[120px]">Điểm nguy cơ</TableHead>
              <TableHead className="w-[120px]">Mức độ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record, index) => (
              <TableRow key={index} className="hover:bg-muted/30">
                <TableCell>
                  <div className="font-medium text-sm">{record.date}</div>
                  <div className="text-[11px] text-muted-foreground">{record.dayOfWeek}</div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    {record.tempMin !== undefined && record.tempMax !== undefined
                      ? `${record.tempMin.toFixed(1)} - ${record.tempMax.toFixed(1)}`
                      : (record.tempAvg !== undefined ? `TB: ${record.tempAvg.toFixed(2)}` : '-')}
                  </div>
                  {record.tempMin !== undefined && record.tempAvg !== undefined && (
                    <div className="text-[11px] text-muted-foreground">
                      TB: {record.tempAvg.toFixed(1)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {record.humidityAvg !== undefined ? `${Math.round(record.humidityAvg)}%` : '-'}
                  </div>
                </TableCell>

                {/* Specific Data Cells */}
                {diseaseType === 'rice-blast' && (
                  <>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`text-sm ${record.lwdHours >= 14 ? 'font-bold text-red-500' : ''}`}>
                              {record.lwdHours} giờ
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Số giờ lá ướt</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{record.rainTotal?.toFixed(1)} mm</div>
                      <div className="text-[11px] text-muted-foreground">{record.rainHours} giờ</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {record.fogHours} giờ
                    </TableCell>
                  </>
                )}

                {diseaseType === 'bacterial-blight' && (
                  <>
                    <TableCell>
                      <div className="text-xs">{record.rainTotal?.toFixed(1)} mm</div>
                      <div className="text-[11px] text-muted-foreground">{record.rainHours} giờ</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">Max: {record.windSpeedMax?.toFixed(1)}</div>
                      <div className="text-[11px] text-muted-foreground">TB: {record.windSpeedAvg?.toFixed(1)}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${record.rain3Days >= 100 ? 'font-bold text-red-500' : ''}`}>
                        {record.rain3Days?.toFixed(1)} mm
                      </span>
                    </TableCell>
                  </>
                )}

                {diseaseType === 'stem-borer' && (
                  <TableCell className="text-sm">{record.sunHours} giờ</TableCell>
                )}

                {diseaseType === 'gall-midge' && (
                  <TableCell className="text-sm">{Math.round(record.cloudAvg)}%</TableCell>
                )}

                {diseaseType === 'brown-plant-hopper' && (
                  <>
                    <TableCell className="text-sm">{record.windSpeedAvg?.toFixed(1)}</TableCell>
                    <TableCell className="text-sm">{record.rainTotal?.toFixed(1)}</TableCell>
                  </>
                )}

                {diseaseType === 'grain-discoloration' && (
                  <>
                    <TableCell className="text-sm">{record.rainTotal?.toFixed(1)}</TableCell>
                    <TableCell className="text-sm">{record.windSpeedAvg?.toFixed(1)}</TableCell>
                  </>
                )}

                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`text-sm ${record.riskScore >= 80 ? 'font-bold text-red-500' : ''}`}>
                          {record.riskScore}/100
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Điểm rủi ro AI</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge className={`text-[10px] px-2 py-0 h-5 text-white border-none ${getRiskColor(record.riskLevel)}`}>
                    {record.riskLevel}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
