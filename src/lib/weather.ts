/**
 * Service để lấy dữ liệu thời tiết từ Tomorrow.io API (v4)
 * Hỗ trợ các tính năng: Lịch sử ngắn hạn (từ 00:00), Dự báo 6 ngày, và các tham số nông nghiệp.
 */

export interface WeatherData {
  dt: number;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  weatherCode: number;
  pop: number; // Probability of precipitation (0-1)
  rain?: {
    '1h': number;
  };
  wind: {
    speed: number;
  };
}

export interface DailyWeatherData {
  date: string; // Format: YYYY-MM-DD
  tempMin: number;
  tempMax: number;
  precipitationProbabilityMax: number;
  precipitationSum: number;
  weatherCode: number;
  weatherDescription: string;
}

// Interface cho response từ Tomorrow.io v4
interface TomorrowResponse {
  data?: {
    timelines: Array<{
      timestep: string;
      intervals: Array<{
        startTime: string;
        values: any;
      }>;
    }>;
  };
  timelines?: {
    hourly?: Array<{
      time: string;
      values: any;
    }>;
    daily?: Array<{
      time: string;
      values: any;
    }>;
  };
}

import { getAllRemoteValues } from "./firebase";

class WeatherService {
  private readonly tomorrowForecastUrl = 'https://api.tomorrow.io/v4/weather/forecast';
  private readonly tomorrowTimelinesUrl = 'https://api.tomorrow.io/v4/timelines';
  private tomorrowApiKeys: string[] = [];
  private keysLoaded = false;

  /**
   * Đảm bảo các API Key đã được tải từ Remote Config
   */
  private async ensureKeysLoaded() {
    if (this.keysLoaded && this.tomorrowApiKeys.length > 0) return;

    try {
      // Lấy danh sách TOÀN BỘ Key từ Remote Config (bắt đầu bằng TOMORROW_API_KEY_)
      const keys = await getAllRemoteValues('TOMORROW_API_KEY_');
      this.tomorrowApiKeys = keys;
      this.keysLoaded = true;

      if (this.tomorrowApiKeys.length > 0) {
        console.log(`✅ [WeatherService] Đã tải ${this.tomorrowApiKeys.length} Tomorrow.io Keys từ Remote Config`);
      } else {
        // Fallback về .env nếu Remote Config trống
        this.tomorrowApiKeys = (process.env.NEXT_PUBLIC_TOMORROW_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
      }
    } catch (error) {
      console.error('❌ [WeatherService] Lỗi khi tải API Keys từ Remote Config:', error);
      // Fallback về .env
      this.tomorrowApiKeys = (process.env.NEXT_PUBLIC_TOMORROW_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
    }
  }

  /**
   * Thực hiện gọi API với cơ chế xoay vòng Key khi gặp lỗi 429 (Rate Limit)
   */
  private async fetchWithRotation(baseUrl: string, queryParams: Record<string, string>): Promise<Response> {
    await this.ensureKeysLoaded();

    if (this.tomorrowApiKeys.length === 0) {
      throw new Error('Không tìm thấy Tomorrow.io API Key trong cấu hình');
    }

    let lastResponse: Response | null = null;

    for (let i = 0; i < this.tomorrowApiKeys.length; i++) {
      const key = this.tomorrowApiKeys[i];
      if (!key) continue;

      const params = new URLSearchParams(queryParams);
      params.set('apikey', key);
      const url = `${baseUrl}?${params.toString()}`;

      try {
        const response = await fetch(url);
        
        // Nếu dính giới hạn lượt gọi (429), thử Key tiếp theo
        if (response.status === 429) {
          console.warn(`⚠️ Tomorrow.io API Key thứ ${i + 1} hết hạn mức (429). Đang chuyển sang Key tiếp theo...`);
          lastResponse = response;
          continue;
        }

        // Nếu key không hợp lệ (400, 401, 403), thử Key tiếp theo
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          console.warn(`⚠️ Tomorrow.io API Key thứ ${i + 1} không hợp lệ (${response.status}). Đang chuyển sang Key tiếp theo...`);
          lastResponse = response;
          continue;
        }

        return response;
      } catch (error) {
        console.error(`❌ Lỗi khi gọi Tomorrow.io với Key thứ ${i + 1}:`, error);
        throw error;
      }
    }

    return lastResponse!;
  }

  /**
   * Map mã thời tiết sang mô tả tiếng Việt (Tomorrow.io Codes)
   */
  private getWeatherDescription(code: number): string {
    const codes: Record<number, string> = {
      0: 'Trời quang đãng',
      1000: 'Trời quang',
      1100: 'Ít mây',
      1101: 'Có mây rải rác',
      1102: 'Nhiều mây',
      1001: 'Mây u ám',
      2000: 'Sương mù nhẹ',
      2100: 'Sương mù',
      4000: 'Mưa phùn nhẹ',
      4001: 'Mưa nhỏ',
      4200: 'Mưa vừa',
      4201: 'Mưa to',
      5000: 'Tuyết rơi nhẹ',
      5001: 'Tuyết rơi vừa',
      5100: 'Tuyết rơi dày',
      6000: 'Mưa đá nhẹ',
      6001: 'Mưa đá to',
      7000: 'Mưa băng',
      8000: 'Dông sét',
    };
    return codes[code] || 'Không xác định';
  }

  /**
   * Lấy dự báo thời tiết hourly cho 6 ngày (Hôm nay + 5 ngày tới)
   */
  async getForecast7Days(lat: number = 21.0285, lon: number = 105.8542): Promise<WeatherData[]> {
    // Đảm bảo API Keys đã được load từ Remote Config
    await this.ensureKeysLoaded();
    
    if (this.tomorrowApiKeys.length === 0) {
      console.warn('API Key Tomorrow.io trống hoặc không hợp lệ');
      return [];
    }

    try {
      // Ưu tiên dùng Timelines API để lấy được cả dữ liệu quá khứ trong ngày (từ 00:00)
      const now = new Date();
      // Update: startTime lấy từ thời điểm hiện tại để tiết kiệm quota 120h cho các ngày sau
      const startTime = now.toISOString();
      
      const queryParams = {
        location: `${lat},${lon}`,
        units: 'metric',
        timesteps: '1h',
        startTime: startTime,
        timezone: 'Asia/Ho_Chi_Minh',
        fields: ['temperature', 'humidity', 'precipitationProbability', 'precipitationIntensity', 'weatherCode', 'windSpeed'].join(',')
      };

      const response = await this.fetchWithRotation(this.tomorrowTimelinesUrl, queryParams);
      if (!response.ok) throw new Error(`Tomorrow.io Timelines error: ${response.status}`);
      
      const result: TomorrowResponse = await response.json();
      
      const timelines = result.data?.timelines || [];
      const timeline = timelines.find(t => t.timestep === '1h');
      
      if (!timeline) return [];

      return timeline.intervals.map(item => ({
        dt: new Date(item.startTime).getTime() / 1000,
        main: {
          temp: item.values.temperature,
          humidity: item.values.humidity
        },
        weather: [{
          description: this.getWeatherDescription(item.values.weatherCode),
          icon: ''
        }],
        weatherCode: item.values.weatherCode,
        pop: (item.values.precipitationProbability || 0) / 100,
        rain: {
          '1h': item.values.precipitationIntensity || 0
        },
        wind: {
          speed: item.values.windSpeed || 0
        }
      }));
    } catch (error) {
      console.error('Error fetching 6-day weather from Tomorrow.io:', error);
      return [];
    }
  }

  /**
   * Lấy dự báo tóm tắt theo ngày (6 ngày: Hôm nay + 5 ngày tới)
   */
  async getDailyForecast7Days(lat: number = 21.0285, lon: number = 105.8542): Promise<DailyWeatherData[]> {
    // Đảm bảo API Keys đã được load từ Remote Config
    await this.ensureKeysLoaded();
    
    if (this.tomorrowApiKeys.length === 0) {
      return [];
    }

    try {
      const now = new Date();
      // Lấy YYYY-MM-DD của ngày hôm nay để filter
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      // startTime nên là 'now' để tránh việc API trả về dữ liệu ngày hôm trước do lệch múi giờ
      const startTime = now.toISOString();

      const queryParams = {
        location: `${lat},${lon}`,
        units: 'metric',
        timesteps: '1d',
        startTime: startTime,
        timezone: 'Asia/Ho_Chi_Minh',
        fields: ['temperatureMin', 'temperatureMax', 'temperatureAvg', 'precipitationProbabilityMax', 'precipitationProbabilityAvg', 'precipitationIntensityAvg', 'weatherCodeMax', 'weatherCode'].join(',')
      };

      const response = await this.fetchWithRotation(this.tomorrowTimelinesUrl, queryParams);
      if (!response.ok) throw new Error(`Tomorrow.io Daily error: ${response.status}`);
      
      const data: TomorrowResponse = await response.json();
      
      // Hỗ trợ cả hai cấu trúc response của Tomorrow.io v4
      const timelines = data.data?.timelines || [];
      const timeline = timelines.find(t => t.timestep === '1d');
      
      if (!timeline) return [];

      return timeline.intervals
        .map(item => {
          const v = item.values;
          // precipitationAccumulationSum không có trong 1d, tính toán dựa trên intensity
          const rainSum = v.precipitationAccumulationSum ?? ((v.precipitationIntensityAvg || 0) * 24);
          
          const d = new Date(item.startTime || '');
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          
          return {
            date: dateStr,
            tempMin: Math.round(v.temperatureMin ?? v.temperatureAvg ?? 0),
            tempMax: Math.round(v.temperatureMax ?? v.temperatureAvg ?? 0),
            precipitationProbabilityMax: Math.round(v.precipitationProbabilityMax ?? v.precipitationProbabilityAvg ?? 0),
            precipitationSum: parseFloat((rainSum || 0).toFixed(1)),
            weatherCode: v.weatherCodeMax ?? v.weatherCode ?? 0,
            weatherDescription: this.getWeatherDescription(v.weatherCodeMax ?? v.weatherCode ?? 0)
          };
        })
        .filter(item => item.date >= todayStr); // Chỉ lấy từ ngày hôm nay trở đi
    } catch (error) {
      console.error('Error fetching daily weather from Tomorrow.io:', error);
      return [];
    }
  }

  async getPlaceName(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=vi`
      );
      const data = await response.json();
      if (data.address) {
        const addr = data.address;
        const parts = [];
        if (addr.road) parts.push(addr.road);
        if (addr.hamlet) parts.push(addr.hamlet);
        if (addr.neighbourhood) parts.push(addr.neighbourhood);
        if (addr.village) parts.push(addr.village);
        if (addr.suburb) parts.push(addr.suburb);
        else if (addr.town) parts.push(addr.town);
        if (addr.city_district) parts.push(addr.city_district);
        else if (addr.county) parts.push(addr.county);
        if (addr.city) parts.push(addr.city);
        else if (addr.state) parts.push(addr.state);
        
        const uniqueParts = Array.from(new Set(parts));
        return uniqueParts.length > 0 ? uniqueParts.join(', ') : 'Vị trí đã chọn';
      }
      return 'Vị trí đã chọn';
    } catch {
      return 'Vị trí đã chọn';
    }
  }
}

export const weatherService = new WeatherService();
