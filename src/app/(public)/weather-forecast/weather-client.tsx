'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { weatherService, WeatherData, DailyWeatherData } from '@/lib/weather'
import { VIETNAM_LOCATIONS } from '@/constants/locations'
import { 
  MapPin, 
  Navigation, 
  Search, 
  RefreshCw, 
  Droplets, 
  Wind, 
  Thermometer,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import dynamic from 'next/dynamic'

// Import Map component dynamically to avoid SSR issues
const LocationMap = dynamic(() => import('../components/LocationMap'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-agri-50 animate-pulse rounded-3xl flex items-center justify-center font-bold text-agri-300">Đang tải bản đồ...</div>
})

const DEFAULT_COORD = {
  latitude: 10.5216,
  longitude: 105.1258
}

/**
 * Weather Forecast Page
 * Trang dự báo thời tiết chi tiết 6 ngày
 */
export default function WeatherForecastPage() {
  const [dailyForecast, setDailyForecast] = useState<DailyWeatherData[]>([])
  const [hourlyForecast, setHourlyForecast] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [locationName, setLocationName] = useState('Đang xác định vị trí...')
  const [coords, setCoords] = useState(DEFAULT_COORD)
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [geoError, setGeoError] = useState<string | null>(null)

  // Drag to scroll logic
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle mouse events for dragging on desktop (non-touch)
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeftPos(scrollRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Speed multiplier
    scrollRef.current.scrollLeft = scrollLeftPos - walk
  }

  const fetchWeather = async (lat: number, lon: number, name?: string) => {
    setLoading(true)
    try {
      const [daily, hourly] = await Promise.all([
        weatherService.getDailyForecast7Days(lat, lon),
        weatherService.getForecast7Days(lat, lon)
      ])
      setDailyForecast(daily)
      setHourlyForecast(hourly)
      
      // Luôn cố gắng lấy tên chi tiết nếu tên hiện tại quá ngắn hoặc generic
      if (!name || name === 'An Giang' || name === 'Vị trí hiện tại') {
        const detectedName = await weatherService.getPlaceName(lat, lon)
        if (detectedName) {
          setLocationName(detectedName)
        } else if (!name) {
          setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`)
        }
      } else {
        setLocationName(name)
      }
      setCoords({ latitude: lat, longitude: lon })
    } catch (error) {
      console.error('Failed to fetch weather:', error)
    } finally {
      setLoading(false)
      // Lưu vào localStorage sau khi fetch thành công
      localStorage.setItem('weather_coords', JSON.stringify({ latitude: lat, longitude: lon }))
      localStorage.setItem('weather_coords_time', Date.now().toString())
      if (name) localStorage.setItem('weather_location_name', name)
    }
  }

  const detectLocation = (isSilent = false) => {
    if (!isSilent) setGeoError(null)
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Trình duyện không hỗ trợ định vị.')
      fetchWeather(DEFAULT_COORD.latitude, DEFAULT_COORD.longitude, 'An Giang')
      return
    }

    // Kiểm tra Secure Origin (HTTPS)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setGeoError('Định vị GPS yêu cầu kết nối bảo mật (HTTPS). Vui lòng chọn vị trí thủ công trên bản đồ.')
      fetchWeather(DEFAULT_COORD.latitude, DEFAULT_COORD.longitude, 'An Giang')
      return
    }

    setLoading(true)
    let hasGotPosition = false
    let watchId: number | null = null

    const handleSuccess = async (position: GeolocationPosition) => {
      if (hasGotPosition) return
      hasGotPosition = true
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      
      const lat = position.coords.latitude
      const lon = position.coords.longitude
      console.log('GPS Detected:', lat, lon)
      const name = await weatherService.getPlaceName(lat, lon)
      fetchWeather(lat, lon, name)
    }

    const handleError = (error: GeolocationPositionError) => {
      if (hasGotPosition) return
      console.warn('Geolocation error:', error)
      
      // Nếu là chế độ im lặng (lần đầu vào trang), đừng làm phiền người dùng bằng thông báo lỗi
      // trừ khi là lỗi từ chối quyền truy cập
      if (isSilent && error.code !== 1) {
        fetchWeather(DEFAULT_COORD.latitude, DEFAULT_COORD.longitude, 'An Giang')
        setLoading(false)
        return
      }

      let msg = 'Không thể lấy vị trí.'
      if (error.code === 1) msg = 'Quyền truy cập vị trí bị từ chối hoặc yêu cầu HTTPS.'
      if (error.code === 2) msg = 'Thiết bị không thể xác định vị trí. Vui lòng kiểm tra cài đặt GPS hoặc chọn trên bản đồ.'
      if (error.code === 3) msg = 'Quá thời gian lấy vị trí. Hệ thống sẽ dùng vị trí mặc định.'
      
      setGeoError(msg)
      fetchWeather(DEFAULT_COORD.latitude, DEFAULT_COORD.longitude, 'An Giang')
    }

    // Ưu tiên thử cấu hình low accuracy trước vì nó ổn định và nhanh hơn nhiều
    navigator.geolocation.getCurrentPosition(handleSuccess, (error) => {
      // Nếu lỗi code 2 (UNAVAILABLE) hoặc code 3 (TIMEOUT), thử dùng watchPosition như bản Admin
      if (error.code === 2 || error.code === 3) {
        console.log('Low accuracy failed, trying watchPosition fallback...')
        watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 phút
        })

        // Tự động hủy watch sau 15s nếu không có kết quả
        setTimeout(() => {
          if (!hasGotPosition && watchId !== null) {
            navigator.geolocation.clearWatch(watchId)
            handleError({ code: 3, message: 'Timeout' } as GeolocationPositionError)
          }
        }, 15000)
      } else {
        handleError(error)
      }
    }, {
      enableHighAccuracy: false, // Dùng Wi-Fi/IP cho nhanh và ổn định
      timeout: 5000,
      maximumAge: 300000 // 5 phút
    })
  }

  useEffect(() => {
    // Kiểm tra xem đã có vị trí lưu trong localStorage chưa
    const savedCoords = localStorage.getItem('weather_coords')
    const savedName = localStorage.getItem('weather_location_name')

    if (savedCoords) {
      try {
        const parsedCoords = JSON.parse(savedCoords)
        setCoords(parsedCoords)
        if (savedName) setLocationName(savedName)
        
        // Load thời tiết từ vị trí cũ ngay lập tức
        fetchWeather(parsedCoords.latitude, parsedCoords.longitude, savedName || undefined)
        
        // KHÔNG gọi detectLocation(true) nữa để tránh hiện Prompt của trình duyệt
        // Người dùng muốn cập nhật vị trí mới thì nhấn nút "Vị trí hiện tại" thủ công
        return 
      } catch (e) {
        console.error('Failed to parse saved coords', e)
      }
    }

    // Chỉ tự động xin quyền nếu CHƯA TỪNG có vị trí nào được lưu (Lần đầu vào app)
    detectLocation(true)
  }, [])

  const filteredLocations = useMemo(() => {
    return VIETNAM_LOCATIONS.filter(loc => 
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.region.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])


  // Hàm helper để lấy style dựa trên khả năng mưa (Cảnh báo: Xanh -> Vàng -> Cam -> Đỏ)
  const getPopStyle = (popPercentage: number) => {
    if (popPercentage === 0) return "bg-blue-50 text-blue-500 border-blue-100";
    if (popPercentage <= 24) return "bg-yellow-50 text-yellow-600 border-yellow-200 font-bold";
    if (popPercentage <= 49) return "bg-yellow-200 text-yellow-800 border-yellow-400 font-bold";
    if (popPercentage <= 74) return "bg-orange-100 text-orange-600 border-orange-300 font-bold";
    return "bg-red-100 text-red-600 border-red-300 font-bold";
  };

  const selectedDay = dailyForecast[activeTab] || dailyForecast[0]
  const hourlyForSelectedDay = hourlyForecast.filter(h => {
    if (!selectedDay) return false
    const dayDate = new Date(selectedDay.date).toDateString()
    const hourlyDate = new Date(h.dt * 1000).toDateString()
    return dayDate === hourlyDate
  })

  // Tính toán tóm tắt thực tế từ dữ liệu giờ để đảm bảo nhất quán (đặc biệt là cho ngày hôm nay khi có dữ liệu lịch sử)
  const displaySummary = useMemo(() => {
    if (!selectedDay || hourlyForSelectedDay.length === 0) return selectedDay;

    const temps = hourlyForSelectedDay.map(h => h.main.temp);
    const rainSum = hourlyForSelectedDay.reduce((sum, h) => sum + (h.rain?.['1h'] || 0), 0);
    
    // Tìm giờ có xác suất mưa cao nhất
    let maxPopHour = null;
    if (hourlyForSelectedDay.length > 0) {
      const maxPopItem = hourlyForSelectedDay.reduce((prev, current) => (prev.pop > current.pop) ? prev : current);
      maxPopHour = new Date(maxPopItem.dt * 1000).getHours();
    }

    return {
      ...selectedDay,
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      precipitationSum: parseFloat(rainSum.toFixed(1)),
      precipitationProbabilityMax: Math.round(Math.max(...hourlyForSelectedDay.map(h => h.pop)) * 100),
      peakPrecipitationHour: maxPopHour
    };
  }, [selectedDay, hourlyForSelectedDay]);
  
  // Tự động cuộn thẻ được chọn vào giữa màn hình
  useEffect(() => {
    if (scrollRef.current) {
      const activeButton = scrollRef.current.children[activeTab] as HTMLElement;
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-agri-50/50 pb-10 sm:pb-20 overflow-x-hidden w-full relative">
      {/* Header Banner - Agriculture Theme */}
      <div className="bg-gradient-to-br from-agri-600 via-agri-700 to-agri-800 pt-10 sm:pt-12 pb-10 sm:pb-14 px-3 sm:px-4 overflow-hidden relative w-full">
        <div className="max-w-7xl mx-auto w-full">
          <Link href="/" className="inline-flex items-center gap-2 text-agri-100 hover:text-white mb-4 transition-colors font-bold text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Về trang chủ</span>
          </Link>

          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-lg font-black text-red-400 uppercase tracking-tight">
              ⚠️ Dự báo thời tiết mang tính chất tham khảo không thể chính xác hoàn toàn!
            </p>
          </div>

          {/* Detailed Location Card */}
          <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-white relative w-full overflow-hidden">
            <div className="flex flex-col gap-4 sm:gap-6 w-full">
              {/* Address Header */}
              <div className="flex items-start gap-3 sm:gap-6 w-full">
                <div className="bg-blue-50 p-2 sm:p-4 rounded-xl sm:rounded-3xl border border-blue-100 shadow-inner flex-shrink-0">
                  <MapPin className="w-6 h-6 sm:w-10 sm:h-10 text-blue-600 sm:animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[11px] font-black text-blue-500 uppercase tracking-widest sm:tracking-[0.3em] mb-1">Vị trí hiện tại</p>
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight break-words">
                    {locationName} | Dự báo 6 Ngày
                  </h1>
                  {/* <span className="inline-block mt-2 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    GPS: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                  </span> */}

                  {geoError && (
                    <div className="mt-3 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 text-amber-700 w-full overflow-hidden">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <p className="text-[10px] sm:text-xs font-bold leading-relaxed break-words">
                        {geoError}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-100 w-full">
                <button 
                  onClick={() => detectLocation(false)} 
                  className={`flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md group ${geoError && geoError.includes('HTTPS') ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  disabled={!!geoError && geoError.includes('HTTPS')}
                >
                  <Navigation className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover:animate-pulse" />
                  Vị trí hiện tại
                </button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  {/* <DialogTrigger asChild>
                    <button 
                      className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-agri-600 text-white rounded-lg sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider hover:bg-agri-700 transition-all active:scale-95 shadow-md"
                    >
                      <Search className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                      Tìm xã
                    </button>
                  </DialogTrigger> */}
                  <DialogContent className="w-[95vw] sm:max-w-[850px] max-h-[90vh] flex flex-col p-4 sm:p-8 overflow-hidden bg-white border-none shadow-2xl rounded-[1.5rem] sm:rounded-[3rem]">
                      <DialogHeader className="mb-4 sm:mb-6">
                        <DialogTitle className="text-xl sm:text-3xl font-black text-agri-800 flex items-center gap-2 sm:gap-3">
                          <MapPin className="text-agri-600 w-5 h-5 sm:w-8 sm:h-8" />
                          Chọn vị trí canh tác
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="grid md:grid-cols-5 gap-4 sm:gap-8 flex-grow overflow-hidden w-full">
                        <div className="md:col-span-3 h-[300px] md:h-full w-full overflow-hidden rounded-2xl">
                          <LocationMap 
                            selectedLocation={{
                              latitude: coords.latitude,
                              longitude: coords.longitude,
                              name: locationName
                            }}
                            onLocationSelect={(loc) => {
                              fetchWeather(loc.latitude, loc.longitude, loc.name)
                              setIsDialogOpen(false)
                            }}
                          />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-4 overflow-hidden w-full">
                          <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-400" />
                            <Input 
                              placeholder="Tìm tỉnh thành..." 
                              className="pl-10 h-10 sm:h-14 rounded-xl sm:rounded-2xl border-agri-100 bg-agri-50/50 font-bold text-sm w-full"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>

                          <div className="flex-grow overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-agri-200 w-full">
                            {filteredLocations.map((loc) => (
                              <button
                                key={loc.id}
                                onClick={() => {
                                  fetchWeather(loc.latitude, loc.longitude, loc.name)
                                  setIsDialogOpen(false)
                                }}
                                className="w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-agri-600 transition-all flex items-center justify-between group bg-white border border-gray-100 hover:border-agri-600 shadow-sm"
                              >
                                <div className="min-w-0 pr-2">
                                  <p className="font-black text-sm sm:text-base text-gray-800 group-hover:text-white transition-colors truncate">{loc.name}</p>
                                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest group-hover:text-agri-100 transition-colors mt-0.5">{loc.region}</p>
                                </div>
                                <div className="flex-shrink-0 p-1.5 bg-agri-50 rounded-lg group-hover:bg-agri-500 transition-colors">
                                  <ArrowLeft className="w-3 h-3 text-agri-600 group-hover:text-white rotate-180" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                  </DialogContent>
                </Dialog>

                <button 
                  onClick={() => detectLocation(false)} 
                  className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white text-gray-600 rounded-lg sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider hover:bg-gray-50 transition-all active:scale-95 border border-gray-200 shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Làm mới</span>
                  <span className="sm:hidden">Mới</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[100vw] overflow-x-hidden px-3 sm:px-4 md:px-6 -mt-4 sm:-mt-10 xl:-mt-16 relative z-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid xl:grid-cols-4 gap-6 sm:gap-8 w-full">
            {/* 1. Day Selector Tabs - First on Mobile, Sidebar-right on Desktop */}
            <div className="xl:col-span-3 xl:col-start-2 order-1 xl:order-1 w-full overflow-hidden">
              <div 
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`flex flex-nowrap mt-3 gap-3 sm:gap-4 overflow-x-auto pb-10 pt-4 scrollbar-hide touch-pan-x mx-4 px-3 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab scroll-smooth snap-x snap-mandatory scroll-pl-3'}`}
              >
                {dailyForecast.map((day, i) => (
                  <button
                    key={day.date}
                    onClick={() => setActiveTab(i)}
                    className={`flex-shrink-0 snap-start min-w-[110px] sm:min-w-[140px] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] transition-all duration-300 transform ${i === 0 ? 'ml-1' : ''} ${
                      activeTab === i 
                      ? 'bg-agri-600 text-white shadow-xl scale-[1.03] sm:scale-105 ring-2 sm:ring-4 ring-agri-100' 
                      : 'bg-white text-gray-500 hover:bg-agri-50 border-2 border-agri-200/80 hover:border-agri-300 hover:scale-[1.02] shadow-sm'
                    }`}
                  >
                    <p className={`text-[11px] sm:text-xs font-black uppercase mb-1 sm:mb-3 tracking-widest ${activeTab === i ? 'text-agri-200' : 'text-gray-400'}`}>
                      {new Date(day.date).toLocaleDateString('vi', { weekday: 'long' }).toUpperCase()}
                    </p>
                    <div className="flex flex-col items-center">
                      <p className="text-2xl sm:text-4xl font-black tabular-nums">{new Date(day.date).getDate()}<span className="text-sm sm:text-xl opacity-50 ml-0.5">/{new Date(day.date).getMonth() + 1}</span></p>
                      <p className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5 ${activeTab === i ? 'text-agri-200' : 'text-gray-400'}`}>Ngày/Tháng</p>
                    </div>
                    <div className="my-4 sm:my-6 flex flex-col items-center justify-center min-h-[60px] sm:min-h-[80px]">
                      <Droplets className={`w-6 h-6 sm:w-10 sm:h-10 mb-1 ${activeTab === i ? 'text-white' : 'text-blue-500'}`} />
                      <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${activeTab === i ? 'text-agri-200' : 'text-gray-400'}`}>Khả năng mưa</p>
                      <p className={`text-xl sm:text-3xl font-black tabular-nums ${activeTab === i ? 'text-white' : 'text-blue-700'}`}>{day.precipitationProbabilityMax}%</p>
                    </div>
                    <p className={`text-sm sm:text-lg font-black ${activeTab === i ? 'text-white' : 'text-gray-800'}`}>{day.tempMax}°<span className="opacity-40 font-bold mx-1">/</span>{day.tempMin}°</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Detailed Stats Column - Second on Mobile, Sidebar-left on Desktop */}
            <div className="xl:col-span-1 xl:col-start-1 order-2 xl:order-1 w-full overflow-hidden">
              <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl border border-agri-100 flex flex-col gap-5 sm:gap-8 xl:sticky top-24 w-full">
                <div className="border-b border-gray-100 pb-3 sm:pb-4">
                  <h3 className="font-black text-gray-800 text-base sm:text-xl tracking-tight">Chi tiết theo ngày</h3>
                  <p className="text-xs sm:text-sm font-bold text-agri-600 mt-1 uppercase tracking-wider">
                    {selectedDay ? new Date(selectedDay.date).toLocaleDateString('vi', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                  </p>
                </div>
                
                <div className="flex flex-col gap-4 sm:gap-6 w-full">
                  <div className="flex items-center gap-3 sm:gap-5 w-full">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-xl sm:rounded-2xl text-blue-600 shadow-sm flex-shrink-0"><Droplets className="w-5 h-5 sm:w-7 sm:h-7" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] sm:text-xs text-gray-400 font-black uppercase tracking-widest truncate">Khả năng mưa</p>
                      <div className="flex items-baseline gap-2">
                        <p className={`text-lg sm:text-2xl font-black px-2 py-0.5 rounded-lg ${getPopStyle(displaySummary?.precipitationProbabilityMax ?? 0)}`}>
                          {displaySummary?.precipitationProbabilityMax ?? 0}%
                        </p>
                        {(displaySummary as any)?.peakPrecipitationHour !== null && (displaySummary as any)?.precipitationProbabilityMax > 0 && (
                          <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${getPopStyle(displaySummary?.precipitationProbabilityMax ?? 0)}`}>
                            Lúc { (displaySummary as any).peakPrecipitationHour }h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 w-full">
                    <div className="p-3 sm:p-4 bg-cyan-50 rounded-xl sm:rounded-2xl text-cyan-600 shadow-sm flex-shrink-0"><Wind className="w-5 h-5 sm:w-7 sm:h-7" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] sm:text-xs text-gray-400 font-black uppercase tracking-widest truncate">Lượng mưa</p>
                      <p className="text-lg sm:text-2xl font-black text-gray-800">{displaySummary?.precipitationSum ?? 0} mm</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 w-full">
                    <div className="p-3 sm:p-4 bg-orange-50 rounded-xl sm:rounded-2xl text-orange-600 shadow-sm flex-shrink-0"><Thermometer className="w-5 h-5 sm:w-7 sm:h-7" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] sm:text-xs text-gray-400 font-black uppercase tracking-widest truncate">Khoảng nhiệt độ</p>
                      <p className="text-lg sm:text-2xl font-black text-gray-800">{displaySummary?.tempMin ?? 0}° - {displaySummary?.tempMax ?? 0}°</p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 p-4 sm:p-6 bg-gradient-to-br from-agri-50 to-white rounded-2xl sm:rounded-3xl border border-agri-100 italic text-[11px] sm:text-sm text-agri-800 leading-relaxed font-medium shadow-inner w-full overflow-hidden">
                  <p className="break-words whitespace-normal w-full">
                    💡 Lời khuyên nông vụ: {(displaySummary?.precipitationProbabilityMax ?? 0) > 50 
                      ? 'Khả năng mưa cao, bà con nên kiểm tra hệ thống thoát nước ruộng và tạm hoãn phun thuốc nông dược.' 
                      : 'Thời tiết thuận lợi, bà con có thể tiến hành bón phân hoặc phun thuốc theo kế hoạch.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Hourly Details List - Third on Mobile, Main area on Desktop */}
            <div className="xl:col-span-3 xl:col-start-2 order-3 xl:order-2 space-y-6 sm:space-y-8 w-full overflow-hidden">
              <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-10 shadow-xl sm:shadow-2xl border border-agri-100 relative overflow-hidden w-full">
                 {loading && dailyForecast.length > 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-agri-600 animate-spin" />
                      <p className="text-[9px] sm:text-[10px] font-black text-agri-600 uppercase tracking-widest">Đang cập nhật...</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-3 w-full">
                  <h3 className="text-xl sm:text-3xl font-black text-gray-800 tracking-tight">Chi tiết theo giờ</h3>
                  <div className="px-4 py-1.5 sm:px-6 sm:py-2.5 bg-gray-100 text-gray-600 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-black border border-gray-200 shadow-sm w-fit">
                    📅 {selectedDay ? new Date(selectedDay.date).toLocaleDateString('vi', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 w-full">
                  {hourlyForSelectedDay.map((hour) => {
                    // Kiểm tra xem có phải giờ hiện tại không (so sánh hour)
                    const now = new Date()
                    const hourDate = new Date(hour.dt * 1000)
                    const isCurrentHour = now.getHours() === hourDate.getHours() && 
                                         now.getDate() === hourDate.getDate()
                    
                    return (
                      <div 
                        key={hour.dt} 
                        className={`flex items-center justify-between p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all group shadow-sm hover:shadow-lg w-full overflow-hidden ${
                          isCurrentHour 
                            ? 'bg-agri-50 border-agri-400 ring-2 ring-agri-200' 
                            : 'bg-white border-gray-300 hover:border-agri-300'
                        }`}
                      >
                        <div className="flex items-center gap-4 sm:gap-10 min-w-0 flex-1">
                          {/* Time with label */}
                          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[60px] flex-shrink-0">
                            <p className={`text-[9px] sm:text-[11px] font-black uppercase tracking-widest mb-1 transition-colors ${
                              isCurrentHour ? 'text-agri-700' : 'text-gray-600 group-hover:text-agri-600'
                            }`}>
                              {isCurrentHour ? 'Hiện tại' : 'Giờ'}
                            </p>
                            <span className={`text-lg sm:text-2xl font-black tabular-nums leading-none ${
                              isCurrentHour ? 'text-agri-900' : 'text-gray-800 group-hover:text-agri-900'
                            }`}>
                              {new Date(hour.dt * 1000).toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Info and Stats */}
                          <div className="flex flex-col gap-2 sm:gap-3 min-w-0 flex-1">
                            <p className={`text-base sm:text-xl font-black leading-none truncate ${
                              isCurrentHour ? 'text-agri-900' : 'text-gray-900 group-hover:text-agri-800'
                            }`}>
                              {hour.weather[0]?.description ?? 'N/A'}
                            </p>
                            
                            {/* Khả năng mưa */}
                            <div className={`flex items-center gap-1.5 sm:gap-2 w-fit px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border transition-colors ${getPopStyle(Math.round((hour.pop ?? 0) * 100))}`}>
                              <Droplets className={`w-3.5 h-3.5 sm:w-5 sm:h-5 flex-shrink-0 ${Math.round((hour.pop ?? 0) * 100) > 49 ? 'text-white' : ''}`} />
                              <span className="text-[10px] sm:text-[13px] font-black uppercase tracking-tight truncate">Mưa: {Math.round((hour.pop ?? 0) * 100)}%</span>
                            </div>

                            {/* Secondary Stats */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[9px] sm:text-[12px] text-gray-700 font-black uppercase tracking-tight w-full">
                              <span className="flex items-center gap-1.5 shrink-0">
                                <Wind className="w-4 h-4 text-cyan-600" /> 
                                <span>{hour.wind?.speed ?? 0}m/s</span>
                              </span>
                              <span className="flex items-center gap-1.5 shrink-0">
                                <Thermometer className="w-4 h-4 text-orange-600" /> 
                                <span>{hour.main?.humidity ?? 0}% Ẩm</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Temperature */}
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className={`text-3xl sm:text-5xl font-black tabular-nums leading-none ${
                            isCurrentHour ? 'text-agri-700' : 'text-agri-900'
                          }`}>
                            {Math.round(hour.main?.temp ?? 0)}°
                          </p>
                          <p className="text-[9px] sm:text-[11px] font-black text-gray-600 uppercase tracking-widest mt-1">Nhiệt độ</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  )
}
