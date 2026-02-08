"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Mic, MicOff, X, RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RiceWeighingToolProps {
  isOpen: boolean
  onClose: () => void
  onSave: (totalWeight: number) => void
}

const COLUMNS = 5
const ROWS_PER_TABLE = 5
const CELLS_PER_TABLE = COLUMNS * ROWS_PER_TABLE
const MAX_TABLES = 12 // Hỗ trợ tối đa 12 bảng (300 bao)
const MAX_CELLS = CELLS_PER_TABLE * MAX_TABLES

export default function RiceWeighingTool({
  isOpen,
  onClose,
  onSave,
}: RiceWeighingToolProps) {
  const [weights, setWeights] = useState<string[]>(new Array(MAX_CELLS).fill(""))
  const [activeIndex, setActiveIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const activeIndexRef = useRef(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeIndexRef.current = activeIndex
    // Tự động cuộn đến ô đang active
    const activeElement = document.getElementById(`cell-${activeIndex}`)
    if (activeElement && scrollContainerRef.current) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [activeIndex])

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = "vi-VN"

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            handleVoiceInput(event.results[i][0].transcript)
          }
        }
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  const handleVoiceInput = (text: string) => {
    let numbers = text.replace(/[^0-9]/g, "")
    // Quy tắc: 2 số tự thêm 0 (50 -> 500)
    if (numbers.length === 2) numbers += "0"
    
    if (numbers.length >= 3 && numbers.length <= 4) {
      const currentIndex = activeIndexRef.current
      updateWeight(currentIndex, numbers)
      if (currentIndex < MAX_CELLS - 1) {
        setActiveIndex(currentIndex + 1)
      }
    }
  }

  const updateWeight = (index: number, val: string) => {
    setWeights(prev => {
      const newWeights = [...prev]
      newWeights[index] = val
      return newWeights
    })
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) recognitionRef.current.stop()
    else {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleComplete = () => {
    const total = weights.reduce((sum, w) => sum + (w ? parseFloat(w) / 10 : 0), 0)
    onSave(total)
    onClose()
  }

  const renderTable = (tableIdx: number) => {
    const startIdx = tableIdx * CELLS_PER_TABLE
    const tableCells = weights.slice(startIdx, startIdx + CELLS_PER_TABLE)
    
    // Tính toán tổng
    const parsedCells = tableCells.map(w => w ? parseFloat(w) / 10 : 0)
    const tableTotal = parsedCells.reduce((a, b) => a + b, 0)
    
    const colTotals = [0, 1, 2, 3, 4].map(col => {
      return [0, 1, 2, 3, 4].reduce((sum, row) => sum + parsedCells[row * COLUMNS + col], 0)
    })

    if (tableTotal === 0 && tableIdx > 0 && weights.slice(0, startIdx).every(w => w === "")) return null

    return (
      <div key={tableIdx} className="mb-6 animate-in fade-in slide-in-from-bottom-4">
        {/* Table Header */}
        <div className="bg-[#2e7d32] text-white px-4 py-2 flex justify-between items-center rounded-t-xl shadow-md">
          <span className="font-black italic text-lg uppercase tracking-tight">Bảng {tableIdx + 1}</span>
          <span className="font-black text-2xl tracking-tighter">
            {tableTotal.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
          </span>
        </div>

        <div className="bg-white border-x border-slate-200 overflow-hidden">
          {/* Column Names */}
          <div className="grid grid-cols-5 text-center py-1 border-b bg-slate-50">
            {[1, 2, 3, 4, 5].map(c => (
              <span key={c} className="text-[#2e7d32] font-black text-sm">C{c}</span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-5 gap-px bg-slate-200 border-b border-slate-200">
            {tableCells.map((w, i) => {
              const globalIdx = startIdx + i
              return (
                <div 
                  key={globalIdx}
                  id={`cell-${globalIdx}`}
                  onClick={() => setActiveIndex(globalIdx)}
                  className={cn(
                    "bg-white aspect-square flex items-center justify-center text-xl font-black transition-all cursor-pointer relative",
                    activeIndex === globalIdx ? "ring-2 ring-inset ring-yellow-400 z-10 bg-yellow-50" : "text-slate-800",
                    w && "bg-slate-50"
                  )}
                >
                  {w || ""}
                  {activeIndex === globalIdx && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full m-1 animate-pulse" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Column Totals (Yellow) */}
          <div className="grid grid-cols-5 gap-px bg-slate-200 border-b">
            {colTotals.map((tot, idx) => (
              <div key={idx} className="bg-yellow-400 py-2 text-center font-black text-sm text-agri-900">
                {tot.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
              </div>
            ))}
          </div>
        </div>

        {/* Big Table Total Footer */}
        <div className="bg-white py-4 text-center border-x border-b border-slate-200 rounded-b-xl shadow-sm">
           <div className="text-[#d32f2f] text-4xl font-black tracking-tighter drop-shadow-sm">
             {tableTotal.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
           </div>
        </div>

        {/* Page Total (Gom 3 bảng) */}
        {(tableIdx + 1) % 3 === 0 && (
           <div className="mt-8 mb-12 flex flex-col items-center">
              <div className="bg-[#ff9800] text-white px-8 py-4 rounded-3xl text-center shadow-xl border-4 border-white">
                 <div className="text-xs font-black uppercase tracking-[0.2em] mb-1">
                    Tổng Trang {Math.ceil((tableIdx + 1) / 3)}
                 </div>
                 <div className="text-[10px] font-bold opacity-90 mb-2">Bảng 1 - {tableIdx + 1}</div>
                 <div className="text-4xl font-black tracking-tighter border-t border-white/30 pt-2">
                    {weights.slice(0, startIdx + CELLS_PER_TABLE)
                      .reduce((s, w) => s + (w ? parseFloat(w) / 10 : 0), 0)
                      .toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
                 </div>
              </div>
           </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-2xl bg-[#e8f5e9] md:rounded-[40px] shadow-2xl flex flex-col h-screen md:h-[90vh] relative overflow-hidden">
        
        {/* Top Floating Bar */}
        <div className="bg-[#0b5394] text-white p-3 flex justify-between items-center shadow-xl z-20">
           <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
            <X className="h-6 w-6" />
          </Button>
          <div className="bg-white/15 px-6 py-1.5 rounded-full flex items-center gap-4">
             <div className="text-center">
                <div className="text-xl font-black leading-none tracking-tighter">
                   {weights.reduce((s, w) => s + (w ? parseFloat(w) / 10 : 0), 0).toLocaleString("vi-VN", { minimumFractionDigits: 1 })} kg
                </div>
                <div className="text-[9px] uppercase font-bold opacity-70">Tổng / {weights.filter(w=>w).length} bao</div>
             </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setWeights(new Array(MAX_CELLS).fill(""))} className="text-white hover:bg-red-500 rounded-full">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Main List */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 no-scrollbar pb-32">
          {[...Array(MAX_TABLES)].map((_, i) => renderTable(i))}
        </div>

        {/* Floating Voice Control */}
        <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center pointer-events-none">
           <div className="bg-white/90 backdrop-blur-xl p-3 rounded-full shadow-2xl flex items-center gap-3 border border-white pointer-events-auto">
              <Button 
                variant="outline" 
                className="h-14 w-14 rounded-full border-2 border-slate-200 text-slate-600 active:scale-90 transition-all"
                onClick={() => {
                  setWeights(prev => {
                    const n = [...prev]
                    n[activeIndex] = n[activeIndex].slice(0, -1)
                    return n
                  })
                }}
              >
                Xóa
              </Button>
              
              <Button 
                onClick={toggleListening}
                className={cn(
                  "h-16 w-16 rounded-full shadow-lg transition-all active:scale-90",
                  isListening ? "bg-red-500 animate-pulse" : "bg-agri-600"
                )}
              >
                {isListening ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
              </Button>

              <Button 
                onClick={handleComplete}
                className="h-14 px-8 rounded-full bg-black text-white font-black hover:bg-slate-800"
              >
                LƯU LẠI
              </Button>
           </div>
        </div>

        {/* Virtual Keyboard (Bottom) */}
        <div className="bg-white border-t p-2 space-y-2 z-10 hidden md:block">
           <div className="flex justify-between gap-1 overflow-x-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                <Button 
                  key={n} 
                  variant="secondary"
                  className="flex-1 h-12 text-xl font-black bg-slate-100 border-b-2 border-slate-300"
                  onClick={() => {
                    if ((weights[activeIndex] || "").length < 4) {
                      updateWeight(activeIndex, (weights[activeIndex] || "") + n)
                      if ((weights[activeIndex] || "").length + 1 >= 3) {
                         // Tự nhảy ô sau khi nhập đủ 3 số
                         setActiveIndex(prev => prev + 1)
                      }
                    }
                  }}
                >
                  {n}
                </Button>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
