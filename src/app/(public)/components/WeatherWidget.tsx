'use client'

import { useState, useEffect } from 'react'
import { weatherService, DailyWeatherData } from '@/lib/weather'
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, MapPin, RefreshCw } from 'lucide-react'

const DEFAULT_LOCATION = {
  name: 'An Giang',
  latitude: 10.5216,
  longitude: 105.1258
}

export default function WeatherWidget() {
  const [dailyForecast, setDailyForecast] = useState<DailyWeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [locationName, setLocationName] = useState(DEFAULT_LOCATION.name)

  const fetchWeather = async () => {
    setLoading(true)
    try {
      const daily = await weatherService.getDailyForecast7Days(
        DEFAULT_LOCATION.latitude,
        DEFAULT_LOCATION.longitude
      )
      setDailyForecast(daily)
      
      // Try to get detailed place name
      const name = await weatherService.getPlaceName(
        DEFAULT_LOCATION.latitude,
        DEFAULT_LOCATION.longitude
      )
      if (name) setLocationName(name)
    } catch (error) {
      console.error('Failed to fetch weather:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [])

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-8 h-8 text-yellow-400" />
    if (code >= 2 && code <= 3) return <Cloud className="w-8 h-8 text-blue-400" />
    if (code >= 51 && code <= 65) return <CloudRain className="w-8 h-8 text-blue-600" />
    if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-800" />
    return <Cloud className="w-8 h-8 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-agri-600 animate-spin" />
          <p className="text-gray-500 font-medium">Đang tải thời tiết...</p>
        </div>
      </div>
    )
  }

  const today = dailyForecast[0]

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden h-full flex flex-col border border-agri-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-agri-600 to-agri-700 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-agri-200" />
            <h3 className="font-bold text-lg truncate max-w-[200px]">{locationName}</h3>
          </div>
          <button 
            onClick={fetchWeather}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        {today && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                {getWeatherIcon(today.weatherCode)}
              </div>
              <div>
                <p className="text-4xl font-black">{today.tempMax}°C</p>
                <p className="text-agri-100 text-sm font-medium">{today.weatherDescription}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="p-6 grid grid-cols-2 gap-4 flex-grow bg-agri-50/30">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-agri-100 flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Thermometer className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Thấp/Cao</p>
            <p className="text-sm font-bold text-gray-700">{today?.tempMin}°/{today?.tempMax}°C</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-agri-100 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Khả năng mưa</p>
            <p className="text-sm font-bold text-gray-700">{today?.precipitationProbabilityMax}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-agri-100 flex items-center gap-3">
          <div className="p-2 bg-cyan-50 rounded-lg">
            <Wind className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Lượng mưa</p>
            <p className="text-sm font-bold text-gray-700">{today?.precipitationSum}mm</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-agri-100 flex items-center gap-3">
          <div className="p-2 bg-agri-50 rounded-lg">
            <CloudRain className="w-5 h-5 text-agri-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Mã vùng</p>
            <p className="text-sm font-bold text-gray-700">An Giang</p>
          </div>
        </div>
      </div>

      {/* Weekly Mini Forecast */}
      <div className="p-6 border-t border-agri-100">
        <div className="flex justify-between items-center overflow-x-auto gap-4 scrollbar-hide">
          {dailyForecast.slice(1, 6).map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
              <p className="text-xs text-gray-400 font-bold uppercase">
                {new Date(day.date).toLocaleDateString('vi', { weekday: 'short' })}
              </p>
              <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-agri-50 transition-colors">
                {getWeatherIcon(day.weatherCode)}
              </div>
              <p className="text-sm font-bold text-gray-700">{day.tempMax}°</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
