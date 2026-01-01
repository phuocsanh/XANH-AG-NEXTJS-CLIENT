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

/** Loại chi phí canh tác (từ database) */
export interface CostItemCategory {
  id: number
  name: string
  code?: string
  description?: string
  status?: string
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

/** Loại chi phí */
export type CostCategory =
  | "seed" // Giống
  | "fertilizer" // Phân bón
  | "pesticide" // Thuốc BVTV
  | "labor" // Nhân công
  | "machinery" // Máy móc
  | "irrigation" // Tưới tiêu
  | "other" // Khác

/** Loại hoạt động canh tác */
export type ActivityType =
  | "spraying" // Phun thuốc
  | "fertilizing" // Bón phân
  | "irrigation" // Tưới nước
  | "weeding" // Làm cỏ
  | "pest_control" // Diệt sâu bệnh
  | "observation" // Quan sát
  | "other" // Khác

/** Trạng thái lịch */
export type ScheduleStatus =
  | "pending" // Chưa thực hiện
  | "completed" // Đã hoàn thành
  | "cancelled" // Đã hủy
  | "overdue" // Quá hạn

/** Trạng thái thanh toán */
export type PaymentStatus =
  | "pending" // Chưa thanh toán
  | "partial" // Thanh toán một phần
  | "paid" // Đã thanh toán

/** Lịch canh tác */
export interface FarmingSchedule {
  id: number
  rice_crop_id: number
  activity_type: ActivityType
  activity_name: string
  scheduled_date: string
  scheduled_time?: string
  product_ids?: number[]
  estimated_quantity?: number
  estimated_cost?: number
  instructions?: string
  weather_dependent: boolean
  status: ScheduleStatus
  reminder_enabled: boolean
  reminder_time?: string
  completed_date?: string
  completed_by?: string
  created_at: string
  updated_at: string
}

/** DTO tạo lịch canh tác */
export interface CreateFarmingScheduleDto {
  rice_crop_id: number
  activity_type?: ActivityType
  activity_name: string
  scheduled_date: string
  actual_date?: string
  status?: ScheduleStatus
  instructions?: string
  completed_date?: string
}

/** Tham số lọc lịch canh tác */
export interface FarmingScheduleFilters {
  rice_crop_id?: number
  status?: ScheduleStatus
  activity_type?: ActivityType
}

/** Chi phí */
export interface CostItem {
  id: number
  rice_crop_id: number
  category?: CostCategory
  category_id?: number
  category_item?: CostItemCategory
  item_name: string
  quantity?: number
  unit?: string
  unit_price: number
  total_cost: number
  purchase_date?: string
  expense_date?: string
  invoice_id?: number
  notes?: string
  created_at: string
  updated_at: string
}

/** Theo dõi sinh trưởng */
export interface GrowthTracking {
  id: number
  rice_crop_id: number
  tracking_date: string
  growth_stage: GrowthStage
  plant_height?: number
  leaf_color?: string
  pest_disease_detected?: string
  notes?: string
  photo_urls?: string[]
  created_at: string
  updated_at: string
}

/** Bản ghi thu hoạch */
export interface HarvestRecord {
  id: number
  rice_crop_id: number
  harvest_date: string
  yield_amount: number
  yield_unit?: string
  moisture_content?: number
  quality_grade: string
  selling_price_per_unit: number
  total_revenue: number
  buyer?: string
  payment_status: PaymentStatus
  payment_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

/** Hóa đơn mua hàng từ bên ngoài (nông dân tự nhập) */
export interface ExternalPurchase {
  id: number
  rice_crop_id: number
  customer_id: number
  purchase_date: string
  supplier_name: string
  total_amount: number
  notes?: string
  paid_amount: number
  payment_status: string
  created_by: number
  created_at: string
  updated_at: string
  items: ExternalPurchaseItem[]
}

export interface ExternalPurchaseItem {
  id: number
  external_purchase_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
}

/** Hóa đơn đã merge (system + external) */
export interface MergedPurchase {
  id: number | string
  code: string
  date: string
  supplier: string
  total_amount: number
  paid_amount: number
  remaining_amount: number
  status: string
  payment_method: string
  source: "system" | "external"
  items: any[]
  notes?: string
  created_by?: number
}

/** Báo cáo lợi nhuận */
export interface ProfitReport {
  total_revenue: number
  total_cost: number
  net_profit: number
  roi: number
  cost_breakdown: {
    category: string
    amount: number
    percentage: number
  }[]
}
export interface CreateCostItemDto {
  rice_crop_id: number
  category?: CostCategory
  category_id?: number
  item_name: string
  quantity?: number
  unit?: string
  unit_price: number
  total_cost: number
  purchase_date?: string
  expense_date?: string
  invoice_id?: number
  notes?: string
}

/** DTO tạo theo dõi sinh trưởng */
export interface CreateGrowthTrackingDto {
  rice_crop_id: number
  tracking_date: string
  growth_stage: GrowthStage
  plant_height?: number
  leaf_color?: string
  pest_disease_detected?: string
  notes?: string
  photo_urls?: string[]
}

/** DTO tạo bản ghi thu hoạch */
export interface CreateHarvestRecordDto {
  rice_crop_id: number
  harvest_date: string
  yield_amount: number
  yield_unit?: string
  moisture_content?: number
  quality_grade: string
  selling_price_per_unit: number
  total_revenue: number
  buyer?: string
  payment_status: PaymentStatus
  payment_date?: string
  notes?: string
}

/** DTO tạo hóa đơn mua ngoài */
export interface CreateExternalPurchaseDto {
  rice_crop_id: number
  purchase_date: string
  supplier_name: string
  total_amount: number
  notes?: string
  paid_amount?: number
  payment_status?: string
  items: CreateExternalPurchaseItemDto[]
}

export interface CreateExternalPurchaseItemDto {
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
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

/** Lấy tên hiển thị trạng thái lịch */
export const getScheduleStatusText = (status: ScheduleStatus): string => {
  const map: Record<ScheduleStatus, string> = {
    pending: "Chờ thực hiện",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy",
    overdue: "Quá hạn",
  }
  return map[status] || "Không xác định"
}

/** Lấy màu sắc cho giai đoạn sinh trưởng */
export const getGrowthStageColor = (
  stage: GrowthStage
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
  const map: Record<GrowthStage, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    seedling: "default",
    tillering: "secondary",
    panicle: "default",
    heading: "secondary",
    grain_filling: "default",
    ripening: "warning",
    harvested: "success",
  }
  return map[stage] || "default"
}

/** Lấy màu sắc cho trạng thái */
export const getCropStatusColor = (
  status: CropStatus
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
  const map: Record<CropStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    active: "warning",
    harvested: "success",
    failed: "destructive",
  }
  return map[status] || "default"
}

/** Lấy màu sắc cho trạng thái lịch */
export const getScheduleStatusColor = (
  status: ScheduleStatus
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
  const map: Record<ScheduleStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    pending: "warning",
    completed: "success",
    cancelled: "secondary",
    overdue: "destructive",
  }
  return map[status] || "default"
}

