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
    <div className="rounded-2xl border border-emerald-100 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-100">
        <Table className="min-w-[800px] w-full">
          <TableHeader>
            <TableRow className="bg-emerald-50/50 hover:bg-emerald-50/50">
              <TableHead className="min-w-[80px] font-bold text-emerald-900">Ngày</TableHead>
              <TableHead className="min-w-[120px] font-bold text-emerald-900 text-center">Nhiệt độ (°C)</TableHead>
              <TableHead className="min-w-[80px] font-bold text-emerald-900 text-center">Độ ẩm (%)</TableHead>
              
              {/* Specific Columns */}
              {diseaseType === 'rice-blast' && (
                <>
                  <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Lá ướt (giờ)</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Mưa</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Sương mù</TableHead>
                </>
              )}
              
              {diseaseType === 'bacterial-blight' && (
                <>
                  <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Mưa</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Gió (km/h)</TableHead>
                  <TableHead className="min-w-[120px] font-bold text-emerald-900 text-center">Mưa 3 ngày</TableHead>
                </>
              )}

              {diseaseType === 'stem-borer' && (
                <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Nắng (giờ)</TableHead>
              )}

              {diseaseType === 'gall-midge' && (
                <TableHead className="min-w-[120px] font-bold text-emerald-900 text-center">Mây che phủ (%)</TableHead>
              )}

              {diseaseType === 'brown-plant-hopper' && (
                <>
                  <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Gió TB</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Mưa (mm)</TableHead>
                </>
              )}

              {diseaseType === 'grain-discoloration' && (
                <>
                  <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Mưa (mm)</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Gió TB</TableHead>
                </>
              )}

              <TableHead className="min-w-[100px] font-bold text-emerald-900 text-center">Điểm rủi ro</TableHead>
              <TableHead className="min-w-[120px] font-bold text-emerald-900 text-center">Mức độ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record, index) => (
              <TableRow key={index} className="hover:bg-emerald-50/30 transition-colors">
                <TableCell className="py-4">
                  <div className="font-black text-sm text-gray-900">{record.date}</div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">{record.dayOfWeek}</div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-xs font-bold text-gray-700">
                    {record.tempMin !== undefined && record.tempMax !== undefined
                      ? `${record.tempMin.toFixed(0)}° - ${record.tempMax.toFixed(0)}°`
                      : (record.tempAvg !== undefined ? `TB: ${record.tempAvg.toFixed(1)}°` : '-')}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-sm font-bold text-gray-700">
                    {record.humidityAvg !== undefined ? `${Math.round(record.humidityAvg)}%` : '-'}
                  </div>
                </TableCell>

                {/* Specific Data Cells */}
                {diseaseType === 'rice-blast' && (
                  <>
                    <TableCell className="text-center">
                      <span className={`text-sm font-bold ${record.lwdHours >= 14 ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded' : 'text-gray-700'}`}>
                        {record.lwdHours} giờ
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs font-bold text-gray-700">{record.rainTotal?.toFixed(1)} mm</div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-gray-700 text-sm">
                      {record.fogHours} giờ
                    </TableCell>
                  </>
                )}

                {diseaseType === 'bacterial-blight' && (
                  <>
                    <TableCell className="text-center font-bold text-gray-700 text-xs">
                      {record.rainTotal?.toFixed(1)} mm
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs font-bold text-gray-700">{record.windSpeedMax?.toFixed(1)}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-sm font-bold ${record.rain3Days >= 100 ? 'text-red-500' : 'text-gray-700'}`}>
                        {record.rain3Days?.toFixed(1)} mm
                      </span>
                    </TableCell>
                  </>
                )}

                {diseaseType === 'stem-borer' && (
                  <TableCell className="text-center font-bold text-gray-700 text-sm">{record.sunHours} giờ</TableCell>
                )}

                {diseaseType === 'gall-midge' && (
                  <TableCell className="text-center font-bold text-gray-700 text-sm">{Math.round(record.cloudAvg)}%</TableCell>
                )}

                {diseaseType === 'brown-plant-hopper' && (
                  <>
                    <TableCell className="text-center font-bold text-gray-700 text-sm">{record.windSpeedAvg?.toFixed(1)}</TableCell>
                    <TableCell className="text-center font-bold text-gray-700 text-sm">{record.rainTotal?.toFixed(1)}</TableCell>
                  </>
                )}

                {diseaseType === 'grain-discoloration' && (
                  <>
                    <TableCell className="text-center font-bold text-gray-700 text-sm">{record.rainTotal?.toFixed(1)} mm</TableCell>
                    <TableCell className="text-center font-bold text-gray-700 text-sm">{record.windSpeedAvg?.toFixed(1)}</TableCell>
                  </>
                )}

                <TableCell className="text-center">
                   <span className={`text-sm font-black ${record.riskScore >= 80 ? 'text-red-600' : 'text-gray-800'}`}>
                     {record.riskScore}
                   </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`text-[10px] px-3 py-1 font-black text-white border-none whitespace-nowrap shadow-sm min-w-[80px] justify-center ${getRiskColor(record.riskLevel)}`}>
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
