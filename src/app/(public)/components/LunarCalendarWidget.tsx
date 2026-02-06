'use client'

import { useState } from 'react'
import { convertSolar2Lunar } from '@/lib/lunar-calendar'
import { Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react'

export default function LunarCalendarWidget() {
  const [currentDate] = useState(new Date())
  const [viewDate, setViewDate] = useState(new Date())

  const getLunarData = (date: Date) => {
    const [d, m, y, leap] = convertSolar2Lunar(date.getDate(), date.getMonth() + 1, date.getFullYear())
    return { day: d, month: m, year: y, leap }
  }

  const lunar = getLunarData(viewDate)
  
  const getVietnameseDate = (date: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
    return `${days[date.getDay()]}, ngày ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
  }

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden h-full flex flex-col border border-agri-100">
      {/* Header - Today Detail */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white text-center">
        <h3 className="text-white/80 font-bold uppercase text-xs tracking-widest mb-4 flex items-center justify-center gap-2">
          <Sun className="w-4 h-4" />
          Lịch Vạn Niên
          <Moon className="w-4 h-4" />
        </h3>
        
        <div className="mb-2">
          <p className="text-sm font-medium opacity-90">{getVietnameseDate(viewDate)}</p>
          <p className="text-6xl font-black my-2">{viewDate.getDate()}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 inline-block">
          <p className="text-sm font-bold">
            Âm lịch: Ngày {lunar.day} tháng {lunar.month} năm {lunar.year}
            {lunar.leap ? ' (Nhuận)' : ''}
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <span className="font-bold text-gray-700 uppercase tracking-wider">
            Tháng {viewDate.getMonth() + 1} / {viewDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, i) => (
            <span key={day} className={`text-[11px] font-bold uppercase ${i === 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 flex-grow">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 md:h-12" />
          ))}
          {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
            const date = i + 1
            const isToday = date === currentDate.getDate() && 
                           viewDate.getMonth() === currentDate.getMonth() && 
                           viewDate.getFullYear() === currentDate.getFullYear()
            const isSelected = date === viewDate.getDate()
            
            const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), date)
            const cellLunar = getLunarData(cellDate)

            return (
              <button
                key={date}
                onClick={() => setViewDate(cellDate)}
                className={`group relative h-10 md:h-12 flex flex-col items-center justify-center rounded-xl transition-all ${
                  isSelected ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-orange-50'
                } ${isToday && !isSelected ? 'ring-2 ring-red-200 bg-red-50' : ''}`}
              >
                <span className="text-sm font-bold leading-none">{date}</span>
                <span className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400 font-medium'}`}>
                  {cellLunar.day}
                </span>
                {isToday && (
                  <div className="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer Quote */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 italic text-center leading-relaxed">
          &quot;Thời điểm tốt nhất để trồng cây là 20 năm trước. <br/> Thời điểm tốt thứ hai là ngay bây giờ.&quot;
        </p>
      </div>
    </div>
  )
}
