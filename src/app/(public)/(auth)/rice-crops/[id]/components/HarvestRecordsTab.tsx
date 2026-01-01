"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Wheat,
  TrendingUp,
  Scale
} from "lucide-react"
import dayjs from "dayjs"
import { 
  useHarvestRecords, 
  useDeleteHarvestRecord 
} from "@/hooks/use-harvest-record"
import { convertCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import CreateHarvestRecordModal from "@/app/(public)/(auth)/rice-crops/[id]/components/CreateHarvestRecordModal"
import type { HarvestRecord } from "@/models/rice-farming"

interface HarvestRecordsTabProps {
  riceCropId: number
}

export default function HarvestRecordsTab({ riceCropId }: HarvestRecordsTabProps) {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<HarvestRecord | null>(null)

  const { data: records, isLoading } = useHarvestRecords(riceCropId)
  const deleteMutation = useDeleteHarvestRecord()

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: HarvestRecord) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi thu hoạch này?")) return

    try {
      await deleteMutation.mutateAsync({ id, cropId: riceCropId })
      toast({ title: "Thành công", description: "Đã xóa bản ghi thu hoạch" })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi xóa", variant: "destructive" })
    }
  }

  // Tính tổng sản lượng quy đổi về kg
  const totalYieldInKg = (records || []).reduce((sum, item) => {
    const isKg = !item.yield_unit || item.yield_unit === 'kg'
    const amountInKg = isKg ? Number(item.yield_amount) : Number(item.yield_amount) * 1000
    return sum + amountInKg
  }, 0)

  const totalRevenue = (records || []).reduce((sum, item) => sum + Number(item.total_revenue || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Scale className="h-4 w-4" /> Tổng sản lượng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalYieldInKg < 1000 
                ? `${totalYieldInKg.toLocaleString("vi-VN")} kg` 
                : `${(totalYieldInKg / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} Tấn`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold text-success">{convertCurrency(totalRevenue)}</div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm đợt thu hoạch
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày thu hoạch</TableHead>
              <TableHead>Sản lượng</TableHead>
              <TableHead>Chất lượng / Độ ẩm</TableHead>
              <TableHead className="text-right">Giá bán (đ/kg)</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : records && records.length > 0 ? (
              records.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {dayjs(item.harvest_date).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>
                    {item.yield_amount.toLocaleString("vi-VN")} {item.yield_unit === 'tan' ? 'Tấn' : 'kg'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{item.quality_grade || "-"}</span>
                      {item.moisture_content && (
                        <span className="text-xs text-muted-foreground">Độ ẩm: {item.moisture_content}%</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.selling_price_per_unit.toLocaleString("vi-VN")} đ
                  </TableCell>
                  <TableCell className="text-right font-bold text-success">
                    {convertCurrency(item.total_revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item.id)}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                  Chưa có bản ghi thu hoạch nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateHarvestRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        riceCropId={riceCropId}
      />
    </div>
  )
}
