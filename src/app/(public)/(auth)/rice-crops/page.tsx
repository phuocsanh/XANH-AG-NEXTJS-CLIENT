"use client"

/**
 * Trang danh sách Ruộng lúa cho nông dân
 */

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRiceCrops } from "@/hooks/use-rice-crops"
import { useSeasons } from "@/hooks/use-seasons"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  getGrowthStageText,
  getCropStatusText,
  getGrowthStageColor,
  getCropStatusColor,
  type GrowthStage,
  type CropStatus,
} from "@/models/rice-farming"
import { Eye, Search } from "lucide-react"

export default function RiceCropsPage() {
  const router = useRouter()
  // State cho filters
  const [filters, setFilters] = useState<{
    field_name: string
    rice_variety: string
    season_id?: number
    growth_stage?: GrowthStage
    status?: CropStatus
    page: number
    limit: number
  }>({
    field_name: "",
    rice_variety: "",
    season_id: undefined,
    page: 1,
    limit: 10,
  })

  // Gọi API lấy danh sách mùa vụ
  const { data: seasonsData } = useSeasons({ limit: 100 })
  const seasons = seasonsData?.data || []

  // Gọi API lấy danh sách ruộng lúa
  const { data, isLoading } = useRiceCrops(filters)

  // Mặc định chọn mùa vụ mới nhất khi danh sách mùa vụ được tải xong
  useEffect(() => {
    if (seasons.length > 0 && !filters.season_id) {
      // Tìm mùa vụ có ID lớn nhất (giả sử là mới nhất) hoặc sắp xếp theo ngày nếu cần
      const latestSeason = [...seasons].sort((a, b) => b.id - a.id)[0]
      if (latestSeason) {
        setFilters((prev) => ({
          ...prev,
          season_id: latestSeason.id,
        }))
      }
    }
  }, [seasons, filters.season_id])

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : (key === "season_id" ? parseInt(value) : value),
      page: 1, // Reset về trang 1 khi filter thay đổi
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const handleLimitChange = (newLimit: string) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(newLimit),
      page: 1,
    }))
  }

  // Tính toán pagination
  const totalPages = Math.ceil((data?.total || 0) / filters.limit)
  const startItem = (filters.page - 1) * filters.limit + 1
  const endItem = Math.min(filters.page * filters.limit, data?.total || 0)

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🌾 Quản Lý Canh Tác</h1>
        <p className="text-muted-foreground">
          Xem và quản lý các ruộng lúa của bạn
        </p>
      </div>

      {/* Table */}
      <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-green-200">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">
                      <div className="space-y-2">
                        <span className="font-semibold">Tên ruộng</span>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Tìm kiếm..."
                            value={filters.field_name}
                            onChange={(e) =>
                              handleFilterChange("field_name", e.target.value)
                            }
                            className="pl-8 h-9"
                          />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[200px]">
                      <div className="space-y-2">
                        <span className="font-semibold">Mùa vụ</span>
                        <Select
                          value={filters.season_id?.toString() || "all"}
                          onValueChange={(value: string) =>
                            handleFilterChange("season_id", value === "all" ? "all" : value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Chọn mùa vụ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {seasons.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name} ({s.year})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">Số công</TableHead>
                    <TableHead className="min-w-[120px]">Diện tích (m²)</TableHead>
                    <TableHead className="min-w-[180px]">
                      <div className="space-y-2">
                        <span className="font-semibold">Giống lúa</span>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Tìm kiếm..."
                            value={filters.rice_variety}
                            onChange={(e) =>
                              handleFilterChange("rice_variety", e.target.value)
                            }
                            className="pl-8 h-9"
                          />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      <div className="space-y-2">
                        <span className="font-semibold">Giai đoạn</span>
                        <Select
                          value={filters.growth_stage || "all"}
                          onValueChange={(value: string) =>
                            handleFilterChange("growth_stage", value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Tất cả" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="seedling">Giai đoạn mạ</SelectItem>
                            <SelectItem value="tillering">Đẻ nhánh</SelectItem>
                            <SelectItem value="panicle">Làm đòng</SelectItem>
                            <SelectItem value="heading">Trổ bông</SelectItem>
                            <SelectItem value="grain_filling">Vô gạo</SelectItem>
                            <SelectItem value="ripening">Chín</SelectItem>
                            <SelectItem value="harvested">Đã thu hoạch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      <div className="space-y-2">
                        <span className="font-semibold">Trạng thái</span>
                        <Select
                          value={filters.status || "all"}
                          onValueChange={(value: string) => handleFilterChange("status", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Tất cả" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="active">Đang canh tác</SelectItem>
                            <SelectItem value="harvested">Đã thu hoạch</SelectItem>
                            <SelectItem value="failed">Thất bại</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[130px]">Ngày gieo</TableHead>
                    <TableHead className="min-w-[120px] text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 py-10">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : data?.data && data.data.length > 0 ? (
                    data.data.map((crop) => (
                      <TableRow 
                        key={crop.id} 
                        className="whitespace-nowrap cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/rice-crops/${crop.id}`)}
                      >
                        <TableCell className="font-medium whitespace-normal min-w-[200px]">
                          {crop.field_name}
                        </TableCell>
                        <TableCell>
                          {crop.season_name || crop.season?.name || "-"}
                          {crop.season?.year && ` (${crop.season.year})`}
                        </TableCell>
                        <TableCell className="text-center">
                          {crop.amount_of_land || 0}
                        </TableCell>
                        <TableCell className="text-center sm:text-left">
                          {Number(crop.field_area).toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell>{crop.rice_variety}</TableCell>
                        <TableCell>
                          <Badge variant={getGrowthStageColor(crop.growth_stage)}>
                            {getGrowthStageText(crop.growth_stage)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCropStatusColor(crop.status)}>
                            {getCropStatusText(crop.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {crop.sowing_date
                              ? new Date(crop.sowing_date).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "-"}
                            {crop.sowing_lunar_date && (
                              <div className="text-[10px] text-agri-600 font-bold">
                                {crop.sowing_lunar_date}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation() // Ngăn sự kiện click lan ra TableRow
                              router.push(`/rice-crops/${crop.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center">
                        <div className="py-10">
                          <p className="text-lg font-medium mb-2">
                            Không tìm thấy ruộng lúa
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Thử thay đổi bộ lọc hoặc tạo ruộng lúa mới
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - Chỉ hiện khi không đang tải và có data */}
            {!isLoading && data?.data && data.data.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Hiển thị {startItem} - {endItem} trong tổng số{" "}
                    {data.total} ruộng lúa
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4">
                  {/* Items per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Dòng:
                    </span>
                    <Select
                      value={filters.limit.toString()}
                      onValueChange={handleLimitChange}
                    >
                      <SelectTrigger className="w-[70px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                    >
                      Trước
                    </Button>
                    <div className="bg-muted px-3 py-1.5 rounded-md text-sm font-medium">
                      {filters.page} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page >= totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
