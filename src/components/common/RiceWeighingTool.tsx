"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
  Mic, MicOff, Trash2, Check, X, 
  RotateCcw, ChevronRight, ChevronLeft,
  Volume2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface RiceWeighingToolProps {
  isOpen: boolean
  onClose: () => void
  onSave: (totalWeight: number) => void
  initialData?: number[]
}

const COLUMNS = 5
const MAX_CELLS = 50 // Một bảng khoảng 10 hàng

export default function RiceWeighingTool({
  isOpen,
  onClose,
  onSave,
  initialData = []
}: RiceWeighingToolProps) {
  const { toast } = useToast()
  const [weights, setWeights] = useState<string[]>(new Array(MAX_CELLS).fill(""))
  const [activeIndex, setActiveIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  
  // Tính toán số liệu
  const parsedWeights = weights.map(w => w ? parseFloat(w) / 10 : 0)
  const totalWeight = parsedWeights.reduce((a, b) => a + b, 0)
  const totalBags = weights.filter(w => w !== "").length

  // Khởi tạo speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = "vi-VN"

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1][0].transcript
        handleVoiceInput(lastResult)
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      
      recognitionRef.current = recognition
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleVoiceInput = (text: string) => {
    // Trích xuất số từ văn bản (ví dụ "bốn chín năm" -> "495")
    const numbers = text.replace(/[^0-9]/g, "")
    // Chỉ lấy 3 hoặc 4 chữ số (để tránh lấy năm 2024...)
    if (numbers && numbers.length >= 2 && numbers.length <= 4) {
      updateWeight(activeIndex, numbers)
      // Tự động nhảy sang ô tiếp theo
      if (activeIndex < MAX_CELLS - 1) {
        setActiveIndex(prev => prev + 1)
      }
    }
  }

  const updateWeight = (index: number, val: string) => {
    const newWeights = [...weights]
    newWeights[index] = val
    setWeights(newWeights)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const clearAll = () => {
    if (confirm("Xóa toàn bộ số cân đã nhập?")) {
      setWeights(new Array(MAX_CELLS).fill(""))
      setActiveIndex(0)
    }
  }

  const handleComplete = () => {
    onSave(totalWeight)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-end md:justify-center p-0 md:p-4">
      <div className="w-full max-w-2xl bg-slate-50 md:rounded-3xl shadow-2xl flex flex-col h-[90vh] md:h-auto max-h-[90vh] relative overflow-hidden">
        
        {/* Header Thông số */}
        <div className="bg-agri-700 text-white p-4 flex justify-between items-center shadow-lg">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
            <X className="h-6 w-6" />
          </Button>
          <div className="text-center">
            <div className="text-2xl font-black tracking-tighter">
              {totalWeight.toLocaleString("vi-VN", { minimumFractionDigits: 1 })} kg
            </div>
            <div className="text-[10px] uppercase font-bold opacity-80">
              Tổng trọng lượng / {totalBags} bao
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={clearAll} className="text-white hover:bg-red-500 rounded-full">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Bảng cân lúa style Grid */}
        <div className="flex-1 overflow-y-auto p-3 bg-[#e8f5e9]">
          <div className="bg-agri-600 text-white grid grid-cols-5 text-center text-xs font-black py-2 rounded-t-xl mb-1 shadow-sm">
            <div>C1</div>
            <div>C2</div>
            <div>C3</div>
            <div>C4</div>
            <div>C5</div>
          </div>

          <div className="grid grid-cols-5 gap-1.5 pb-20">
            {weights.map((w, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative aspect-[4/3] flex items-center justify-center rounded-lg border-2 text-xl font-black transition-all",
                  activeIndex === idx ? "bg-white border-yellow-400 shadow-lg scale-105 z-10" : "bg-white border-agri-100 text-slate-700",
                  w === "" && "border-dashed opacity-50"
                )}
              >
                {w || ""}
                {activeIndex === idx && (
                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bảng điều khiển (Control Panel) */}
        <div className="bg-white border-t border-slate-200 p-4 space-y-4">
          
          {/* Hàng tổng các cột (giống hình minh họa) */}
          <div className="grid grid-cols-5 gap-1 text-center mb-2">
            {[0, 1, 2, 3, 4].map(col => {
              const colSum = parsedWeights
                .filter((_, i) => i % COLUMNS === col)
                .reduce((a, b) => a + b, 0)
              return (
                <div key={col} className="bg-yellow-400 rounded py-1 text-[10px] font-black text-agri-900 border border-yellow-500 shadow-sm">
                  {colSum > 0 ? colSum.toFixed(1) : "0.0"}
                </div>
              )
            })}
          </div>

          {/* Bàn phím số & Nút Voice */}
          <div className="flex items-center gap-4">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="col-span-1 h-12 rounded-xl text-lg font-bold" 
                onClick={() => {
                  const currentWait = weights[activeIndex] || ""
                  updateWeight(activeIndex, currentWait.slice(0, -1))
                }}
              >
                Xóa
              </Button>
              <div className="col-span-2 flex gap-2">
                 <Button 
                    className={cn(
                      "flex-1 h-12 rounded-full font-black text-lg gap-2 shadow-lg transition-all",
                      isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-agri-600 hover:bg-agri-700"
                    )}
                    onClick={toggleListening}
                  >
                    {isListening ? <MicOff /> : <Mic />}
                    {isListening ? "ĐANG THU..." : "NÓI ĐỂ NHẬP"}
                  </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleComplete}
              className="bg-agri-800 hover:bg-black text-white px-8 h-12 rounded-xl font-black shadow-lg"
            >
              HOÀN TẤT
            </Button>
          </div>

          {/* Nút số ảo cho Mobile nhanh */}
          <div className="grid grid-cols-10 gap-1 pb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
              <Button 
                key={n} 
                variant="secondary" 
                size="sm" 
                className="h-10 text-lg font-black p-0 rounded-lg hover:bg-agri-100"
                onClick={() => {
                  const currentWait = weights[activeIndex] || ""
                  if (currentWait.length < 4) {
                    updateWeight(activeIndex, currentWait + n)
                  }
                }}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        {/* Micro overlay khi đang nghe */}
        {isListening && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
             <div className="relative">
                <div className="absolute inset-0 bg-agri-500 rounded-full animate-ping scale-[2]" />
                <div className="bg-white p-6 rounded-full shadow-2xl relative z-10 border-4 border-agri-100">
                  <Mic className="h-12 w-12 text-agri-600" />
                </div>
                <div className="mt-8 text-white font-black text-xl text-center bg-black/40 px-4 py-1 rounded-full backdrop-blur-md">
                   Vui lòng đọc số cân
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
