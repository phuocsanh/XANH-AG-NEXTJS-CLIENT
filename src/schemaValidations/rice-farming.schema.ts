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

