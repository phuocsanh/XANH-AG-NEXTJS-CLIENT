/**
 * Service để lấy dữ liệu thời tiết từ Open-Meteo API (Miễn phí, không cần key)
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

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    rain: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
}

interface OpenMeteoDailyResponse {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
}

class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';

  private getWeatherDescription(code: number): string {
    const codes: Record<number, string> = {
      0: 'Trời quang đãng',
      1: 'Trời trong',
      2: 'Có mây',
      3: 'Nhiều mây',
      45: 'Sương mù',
      48: 'Sương muối',
      51: 'Mưa phùn nhẹ',
      53: 'Mưa phùn vừa',
      55: 'Mưa phùn dày',
      61: 'Mưa nhẹ',
      63: 'Mưa vừa',
      65: 'Mưa to',
      71: 'Tuyết rơi nhẹ',
      73: 'Tuyết rơi vừa',
      75: 'Tuyết rơi dày',
      77: 'Tuyết hạt',
      80: 'Mưa rào nhẹ',
      81: 'Mưa rào vừa',
      82: 'Mưa rào to',
      95: 'Dông nhẹ hoặc vừa',
      96: 'Dông kèm mưa đá nhẹ',
      99: 'Dông kèm mưa đá to'
    };
    return codes[code] || 'Không xác định';
  }

  async getForecast7Days(lat: number = 21.0285, lon: number = 105.8542): Promise<WeatherData[]> {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,rain,weather_code,wind_speed_10m',
        timezone: 'auto',
        forecast_days: '7'
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      if (!response.ok) throw new Error(`Weather API error: ${response.status}`);

      const data: OpenMeteoResponse = await response.json();
      return data.hourly.time.map((time, index) => ({
        dt: new Date(time).getTime() / 1000,
        main: {
          temp: data.hourly.temperature_2m[index] ?? 0,
          humidity: data.hourly.relative_humidity_2m[index] ?? 0
        },
        weather: [{
          description: this.getWeatherDescription(data.hourly.weather_code[index] ?? 0),
          icon: ''
        }],
        weatherCode: data.hourly.weather_code[index] ?? 0,
        pop: (data.hourly.precipitation_probability[index] ?? 0) / 100,
        rain: { '1h': data.hourly.rain[index] ?? 0 },
        wind: { speed: data.hourly.wind_speed_10m[index] ?? 0 }
      }));
    } catch (error) {
      console.error('Error fetching 7-day weather:', error);
      throw error;
    }
  }

  async getDailyForecast7Days(lat: number = 21.0285, lon: number = 105.8542): Promise<DailyWeatherData[]> {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code',
        timezone: 'auto',
        forecast_days: '7'
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      if (!response.ok) throw new Error(`Daily weather API error: ${response.status}`);

      const data: OpenMeteoDailyResponse = await response.json();
      return data.daily.time.map((date, index) => ({
        date: date,
        tempMin: Math.round(data.daily.temperature_2m_min[index] ?? 0),
        tempMax: Math.round(data.daily.temperature_2m_max[index] ?? 0),
        precipitationProbabilityMax: Math.round(data.daily.precipitation_probability_max[index] ?? 0),
        precipitationSum: parseFloat((data.daily.precipitation_sum[index] ?? 0).toFixed(1)),
        weatherCode: data.daily.weather_code[index] ?? 0,
        weatherDescription: this.getWeatherDescription(data.daily.weather_code[index] ?? 0)
      }));
    } catch (error) {
      console.error('Error fetching daily weather:', error);
      throw error;
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
        
        // Cấp 1: Thôn, Ấp, Xóm, Kênh, Đường (Rural detail)
        if (addr.road) parts.push(addr.road);
        if (addr.hamlet) parts.push(addr.hamlet);
        if (addr.neighbourhood) parts.push(addr.neighbourhood);
        if (addr.village) parts.push(addr.village);
        
        // Cấp 2: Phường/Xã/Thị trấn (Commune level)
        if (addr.suburb) parts.push(addr.suburb);
        else if (addr.town) parts.push(addr.town);
        
        // Cấp 3: Quận/Huyện (District level)
        if (addr.city_district) parts.push(addr.city_district);
        else if (addr.county) parts.push(addr.county);
        
        // Cấp 4: Tỉnh/Thành phố (Province level)
        if (addr.city) parts.push(addr.city);
        else if (addr.state) parts.push(addr.state);
        
        // Remove duplicates if any (e.g. city == state)
        const uniqueParts = Array.from(new Set(parts));
        return uniqueParts.length > 0 ? uniqueParts.join(', ') : 'Vị trí đã chọn';
      }
      return 'Vị trí đã chọn';
    } catch (error) {
      return 'Vị trí đã chọn';
    }
  }
}

export const weatherService = new WeatherService();
