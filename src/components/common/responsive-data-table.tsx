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
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"

/**
 * Cấu hình cột linh hoạt tương tự Admin
 */
export interface DataColumn<T> {
  title: string
  key: string
  dataIndex?: keyof T | string
  render?: (value: any, record: T) => React.ReactNode
  className?: string
  priority?: "high" | "medium" | "low" // Xác định độ ưu tiên khi hiển thị trên Mobile
}

interface ResponsiveDataTableProps<T> {
  columns: DataColumn<T>[]
  data: T[]
  isLoading?: boolean
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  onView?: (record: T) => void
  emptyText?: string
  rowKey?: keyof T | ((record: T) => string | number)
  className?: string
}

/**
 * Component Bảng Dữ Liệu Thông Minh - Phiên bản NextJS
 * Tự động chuyển đổi từ Bảng (Desktop) sang Card (Mobile)
 * Clone & Tối ưu từ logic ResponsiveDataTable của Admin
 */
export function ResponsiveDataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  emptyText = "Chưa có dữ liệu nào.",
  rowKey = "id" as keyof T,
  className,
}: ResponsiveDataTableProps<T>) {
  
  const getRowId = (record: T) => {
    if (typeof rowKey === "function") return rowKey(record)
    return record[rowKey]
  }

  const renderValue = (column: DataColumn<T>, record: T) => {
    const value = column.dataIndex ? record[column.dataIndex as keyof T] : undefined
    return column.render ? column.render(value, record) : value || "-"
  }

  // Cột có độ ưu tiên cao sẽ hiện trong Card Mobile
  const highPriorityColumns = columns.filter(col => col.priority !== "low")

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* 1. HIỂN THỊ DẠNG BẢNG (Desktop & Tablet) */}
      <div className="hidden md:block border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-agri-50/50">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={cn("font-bold text-agri-900", col.className)}>
                  {col.title}
                </TableHead>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableHead className="text-right pr-6">Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center">
                  <LoadingSpinner tip="Đang tải dữ liệu..." />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((record) => (
                <TableRow key={getRowId(record)} className="hover:bg-agri-50/30 transition-colors">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {renderValue(col, record)}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-agri-600" onClick={() => onView(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-600" onClick={() => onEdit(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(record)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center text-muted-foreground italic">
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 2. HIỂN THỊ DẠNG CARD (Mobile) */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : data.length > 0 ? (
          data.map((record) => (
            <Card key={getRowId(record)} className="border-agri-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    {highPriorityColumns.map((col, idx) => (
                      <div key={col.key} className={cn(idx === 0 ? "font-bold text-base" : "text-sm text-gray-600")}>
                        {idx !== 0 && <span className="text-xs text-muted-foreground mr-2">{col.title}:</span>}
                        {renderValue(col, record)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Actions Bar trong Card */}
                  <div className="flex flex-col gap-2">
                    {(onEdit || onDelete || onView) && (
                      <div className="flex gap-1">
                         {onView && (
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => onView(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full text-sky-600 border-sky-100 bg-sky-50" onClick={() => onEdit(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full text-destructive border-red-100 bg-red-50" onClick={() => onDelete(record)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-muted-foreground italic">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  )
}
