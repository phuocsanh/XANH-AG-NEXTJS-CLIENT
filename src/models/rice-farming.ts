/**
 * TypeScript types cho hệ thống quản lý ruộng lúa
 */

// ==================== ENUMS ====================

/** Giai đoạn sinh trưởng của lúa */
export type GrowthStage =
  | "seedling" // Giai đoạn mạ
  | "tillering" // Giai đoạn đẻ nhánh
  | "panicle" // Giai đoạn làm đòng
  | "heading" // Giai đoạn trỗ bông
  | "grain_filling" // Giai đoạn vô gạo
  | "ripening" // Giai đoạn chín
  | "harvested" // Đã thu hoạch

/** Trạng thái Ruộng lúa */
export type CropStatus =
  | "active" // Đang canh tác
  | "harvested" // Đã thu hoạch
  | "failed" // Thất bại

// ==================== INTERFACES ====================

/** Vùng trồng/Lô đất */
export interface AreaOfEachPlotOfLand {
  id: number
  name?: string
  code?: string
  acreage?: number
}

/** Mùa vụ */
export interface Season {
  id: number
  name: string
  year: number
  start_date?: string
  end_date?: string
}

/** Khách hàng */
export interface Customer {
  id: number
  name: string
  phone?: string
  email?: string
}

/** Ruộng lúa */
export interface RiceCrop {
  id: number
  customer_id: number
  season_id: number
  field_name: string
  amount_of_land: number
  field_area: number
  area_of_each_plot_of_land_id?: number
  location?: string
  rice_variety: string
  seed_source?: string
  sowing_date?: string
  transplanting_date?: string
  expected_harvest_date?: string
  actual_harvest_date?: string
  growth_stage: GrowthStage
  status: CropStatus
  yield_amount?: number
  quality_grade?: string
  notes?: string
  created_at: string
  updated_at: string
  customer?: Customer
  season?: Season
  areaOfEachPlotOfLand?: AreaOfEachPlotOfLand
}

// ==================== DTOs ====================

/** DTO tạo Ruộng lúa */
export interface CreateRiceCropDto {
  customer_id: number
  season_id: number
  field_name: string
  amount_of_land: number
  field_area: number
  area_of_each_plot_of_land_id?: number
  location?: string
  rice_variety: string
  seed_source?: string
  sowing_date?: string
  transplanting_date?: string
  expected_harvest_date?: string
  notes?: string
}

/** DTO cập nhật Ruộng lúa */
export interface UpdateRiceCropDto {
  field_name?: string
  amount_of_land?: number
  field_area?: number
  area_of_each_plot_of_land_id?: number
  location?: string
  rice_variety?: string
  expected_harvest_date?: string
  yield_amount?: number
  quality_grade?: string
  notes?: string
}

// ==================== FILTER PARAMS ====================

/** Tham số lọc Ruộng lúa */
export interface RiceCropFilters {
  customer_id?: number
  season_id?: number
  status?: CropStatus
  growth_stage?: GrowthStage
  field_name?: string
  rice_variety?: string
  page?: number
  limit?: number
}

/** Response từ API search */
export interface RiceCropsResponse {
  data: RiceCrop[]
  total: number
  page: number
  limit: number
}

// ==================== HELPER FUNCTIONS ====================

/** Lấy tên hiển thị giai đoạn sinh trưởng */
export const getGrowthStageText = (stage: GrowthStage): string => {
  const map: Record<GrowthStage, string> = {
    seedling: "Giai đoạn mạ",
    tillering: "Đẻ nhánh",
    panicle: "Làm đòng",
    heading: "Trổ bông",
    grain_filling: "Vô gạo",
    ripening: "Chín",
    harvested: "Đã thu hoạch",
  }
  return map[stage] || "Không xác định"
}

/** Lấy tên hiển thị trạng thái vụ lúa */
export const getCropStatusText = (status: CropStatus): string => {
  const map: Record<CropStatus, string> = {
    active: "Đang canh tác",
    harvested: "Đã thu hoạch",
    failed: "Thất bại",
  }
  return map[status] || "Không xác định"
}

/** Lấy màu sắc cho giai đoạn sinh trưởng */
export const getGrowthStageColor = (
  stage: GrowthStage
): "default" | "secondary" | "destructive" | "outline" => {
  const map: Record<GrowthStage, "default" | "secondary" | "destructive" | "outline"> = {
    seedling: "default",
    tillering: "secondary",
    panicle: "default",
    heading: "secondary",
    grain_filling: "default",
    ripening: "secondary",
    harvested: "outline",
  }
  return map[stage] || "default"
}

/** Lấy màu sắc cho trạng thái */
export const getCropStatusColor = (
  status: CropStatus
): "default" | "secondary" | "destructive" | "outline" => {
  const map: Record<CropStatus, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    harvested: "secondary",
    failed: "destructive",
  }
  return map[status] || "default"
}
