import z from "zod"

export const CreateCostItemBody = z.object({
  rice_crop_id: z.number().int().positive(),
  category_id: z.coerce.number().optional(),
  item_name: z.string().min(1, "Vui lòng nhập tên chi phí"),
  total_cost: z.number().min(0, "Chi phí không được âm"),
  expense_date: z.string().min(1, "Vui lòng chọn ngày chi"),
  notes: z.string().optional(),
})

export type CreateCostItemBodyType = z.TypeOf<typeof CreateCostItemBody>

// Schema cho Thu hoạch
export const CreateHarvestRecordBody = z.object({
  rice_crop_id: z.number(),
  harvest_date: z.string().min(1, "Vui lòng chọn ngày thu hoạch"),
  yield_amount: z.number().min(0, "Sản lượng không được âm"),
  yield_unit: z.string().default("tan"),
  moisture_content: z.number().optional(),
  quality_grade: z.string().optional(),
  selling_price_per_unit: z.number().min(0, "Giá bán không được âm"),
  total_revenue: z.number().default(0),
  buyer: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateHarvestRecordBodyType = z.TypeOf<typeof CreateHarvestRecordBody>

// Schema cho Lịch canh tác
export const CreateFarmingScheduleBody = z.object({
  rice_crop_id: z.number(),
  activity_name: z.string().min(1, "Vui lòng nhập tên công việc"),
  scheduled_date: z.string().min(1, "Vui lòng chọn ngày dự kiến"),
  status: z.string().default("pending"),
  instructions: z.string().optional(),
  completed_date: z.string().optional(),
})

export type CreateFarmingScheduleBodyType = z.TypeOf<typeof CreateFarmingScheduleBody>

// Schema cho Theo dõi sinh trưởng
export const CreateGrowthTrackingBody = z.object({
  rice_crop_id: z.number(),
  tracking_date: z.string().min(1, "Vui lòng chọn ngày kiểm tra"),
  growth_stage: z.string().min(1, "Vui lòng chọn giai đoạn"),
  plant_height: z.number().optional(),
  leaf_color: z.string().optional(),
  pest_disease_detected: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateGrowthTrackingBodyType = z.TypeOf<typeof CreateGrowthTrackingBody>


// Schema cho Ruộng lúa
export const CreateRiceCropBody = z.object({
  field_name: z.string().min(1, "Vui lòng nhập tên ruộng"),
  customer_name: z.string().optional(),
  season_name: z.string().optional(),
  location: z.string().optional(),
  amount_of_land: z.number().min(0, "Số công đất không được âm"),
  area_per_com: z.number().optional(),
  field_area: z.number().min(0, "Diện tích không được âm"),
  rice_variety: z.string().min(1, "Vui lòng nhập giống lúa"),
  sowing_date: z.string().min(1, "Vui lòng chọn ngày gieo"),
  sowing_lunar_date: z.string().optional(),
  transplanting_date: z.string().optional(),
  transplanting_lunar_date: z.string().optional(),
  expected_harvest_date: z.string().optional(),
  expected_harvest_lunar_date: z.string().optional(),
  status: z.string().default("active"),
  growth_stage: z.string().default("seedling"),
})

export type CreateRiceCropBodyType = z.TypeOf<typeof CreateRiceCropBody>

export const UpdateRiceCropBody = z.object({
  field_name: z.string().min(1, "Vui lòng nhập tên ruộng").optional(),
  customer_name: z.string().optional(),
  season_name: z.string().optional(),
  season_id: z.number().int().optional(),
  amount_of_land: z.number().min(0, "Số công đất không được âm").optional(),
  area_per_com: z.number().optional(),
  field_area: z.number().min(0, "Diện tích không được âm"),
  rice_variety: z.string().min(1, "Vui lòng nhập giống lúa"),
  seed_source: z.string().optional(),
  location: z.string().optional(),
  growth_stage: z.string().min(1, "Vui lòng chọn giai đoạn"),
  status: z.string().min(1, "Vui lòng chọn trạng thái"),
  sowing_date: z.string().optional(),
  sowing_lunar_date: z.string().optional(),
  transplanting_date: z.string().optional(),
  transplanting_lunar_date: z.string().optional(),
  expected_harvest_date: z.string().optional(),
  expected_harvest_lunar_date: z.string().optional(),
  actual_harvest_date: z.string().optional(),
})

export type UpdateRiceCropBodyType = z.TypeOf<typeof UpdateRiceCropBody>
