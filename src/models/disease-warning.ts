/**
 * Interface cho dữ liệu chi tiết từng ngày
 */
export interface DailyRiskData {
  date: string; // Định dạng: DD/MM
  dayOfWeek: string; // Thứ trong tuần (T2, T3, ...)
  tempMin: number; // Nhiệt độ thấp nhất (°C)
  tempMax: number; // Nhiệt độ cao nhất (°C)
  tempAvg: number; // Nhiệt độ trung bình (°C)
  humidityAvg: number; // Độ ẩm trung bình (%)
  lwdHours?: number; // Số giờ lá ướt (0-24)
  rainTotal: number; // Tổng lượng mưa (mm)
  rainHours: number; // Số giờ có mưa
  fogHours?: number; // Số giờ có sương mù
  sunHours?: number; // Số giờ nắng
  cloudAvg?: number; // Mây che phủ
  windSpeedMax?: number; // Gió mạnh nhất
  windSpeedAvg?: number; // Gió trung bình
  rain3Days?: number; // Mưa 3 ngày qua
  riskScore: number; // Điểm nguy cơ tổng
  riskLevel: string; // Mức độ nguy cơ
}

/**
 * Entity cảnh báo dịch bệnh
 */
export interface DiseaseWarning {
  id: number;
  generated_at: string; // ISO timestamp
  risk_level: string; // Mức độ nguy cơ
  message: string; // Tin nhắn cảnh báo chi tiết
  peak_days: string | null; // Ngày cao điểm (VD: "30/11 – 02/12")
  daily_data: DailyRiskData[]; // Dữ liệu chi tiết 7 ngày
  updated_at: string; // ISO timestamp
}

/**
 * Entity vị trí ruộng lúa
 */
export interface DiseaseLocation {
  id: number;
  name: string; // Tên vị trí
  lat: number; // Vĩ độ
  lon: number; // Kinh độ
  updated_at: string; // ISO timestamp
}

/**
 * DTO cập nhật vị trí
 */
export interface UpdateDiseaseLocationDto {
  name: string;
  lat: number;
  lon: number;
}
