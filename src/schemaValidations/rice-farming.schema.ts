import z from "zod"

export const CreateCostItemBody = z.object({
  rice_crop_id: z.number().int().positive(),
  category_id: z.coerce.number().optional(), // Coerce để xử lý string từ Select
  item_name: z.string().min(1, "Vui lòng nhập tên chi phí"),
  total_cost: z.number().min(0, "Chi phí không được âm"),
  expense_date: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
    message: "Ngày không hợp lệ",
  }),
  notes: z.string().optional(),
})

export type CreateCostItemBodyType = z.TypeOf<typeof CreateCostItemBody>
