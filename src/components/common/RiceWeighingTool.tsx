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
  const [showKeyboard, setShowKeyboard] = useState(true)
  const recognitionRef = useRef<any>(null)
  const activeIndexRef = useRef(0)
  const weightsRef = useRef<string[]>(new Array(MAX_CELLS).fill(""))
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Đồng bộ Refs để tránh stale closures (Điểm mấu chốt để nhảy ô đúng)
  useEffect(() => {
    activeIndexRef.current = activeIndex
    const activeElement = document.getElementById(`cell-${activeIndex}`)
    if (activeElement && scrollContainerRef.current) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [activeIndex])

  useEffect(() => {
    weightsRef.current = weights
  }, [weights])

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

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  const handleVoiceInput = (text: string) => {
    let numbers = text.replace(/[^0-9]/g, "")
    if (numbers.length === 2) numbers += "0"
    
    if (numbers.length >= 3 && numbers.length <= 4) {
      const currentIndex = activeIndexRef.current
      const currentWeights = weightsRef.current
      const isEditing = currentWeights[currentIndex] !== ""
      
      updateWeight(currentIndex, numbers)
      
      // Nhảy ô thông minh: Nếu sửa thì về ô trống, nếu mới thì sang ô tiếp
      if (isEditing) {
        const updatedWeights = [...currentWeights]
        updatedWeights[currentIndex] = numbers
        const firstEmpty = updatedWeights.findIndex(w => w === "")
        if (firstEmpty !== -1) {
          setActiveIndex(firstEmpty)
        } else {
          setActiveIndex(currentIndex < MAX_CELLS - 1 ? currentIndex + 1 : currentIndex)
        }
      } else {
        if (currentIndex < MAX_CELLS - 1) setActiveIndex(currentIndex + 1)
      }
    }
  }

  const updateWeight = (index: number, val: string) => {
    setWeights(prev => {
      const newWeights = [...prev]
      newWeights[index] = val
      weightsRef.current = newWeights
      return newWeights
    })
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
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
    const parsedCells = tableCells.map(w => w ? parseFloat(w) / 10 : 0)
    const tableTotal = parsedCells.reduce((a, b) => a + b, 0)
    const colTotals = [0, 1, 2, 3, 4].map(col => {
      return [0, 1, 2, 3, 4].reduce((sum, row) => sum + parsedCells[row * COLUMNS + col], 0)
    })

    if (tableTotal === 0 && tableIdx > 0 && weights.slice(0, startIdx).every(w => w === "")) return null

    return (
      <div key={tableIdx} className="mb-6">
        <div className="bg-[#2e7d32] text-white px-4 py-2 flex justify-between items-center rounded-t-xl shadow-md">
          <span className="font-black italic text-lg uppercase tracking-tight">Bảng {tableIdx + 1}</span>
          <span className="font-black text-2xl tracking-tighter">
            {tableTotal.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
          </span>
        </div>

        <div className="bg-white border-x border-slate-200 overflow-hidden">
          <div className="grid grid-cols-5 text-center py-1 border-b bg-slate-50">
            {[1, 2, 3, 4, 5].map(c => (
              <span key={c} className="text-[#2e7d32] font-black text-sm">C{c}</span>
            ))}
          </div>

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

          <div className="grid grid-cols-5 gap-px bg-slate-200 border-b text-center">
            {colTotals.map((tot, idx) => (
              <div key={idx} className="bg-yellow-400 py-2 font-black text-sm text-agri-900 border-x border-yellow-500">
                {tot.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white py-4 text-center border-x border-b border-slate-200 rounded-b-xl shadow-sm">
           <div className="text-[#d32f2f] text-4xl font-black tracking-tighter">
             {tableTotal.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
           </div>
        </div>

        {(tableIdx + 1) % 3 === 0 && (
           <div className="mt-8 mb-12 flex flex-col items-center">
              <div className="bg-[#ff9800] text-white px-8 py-4 rounded-3xl text-center shadow-xl border-4 border-white">
                 <div className="text-xs font-black uppercase tracking-[0.2em] mb-1">Tổng Trang {Math.ceil((tableIdx + 1) / 3)}</div>
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
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#e8f5e9] md:rounded-[40px] shadow-2xl flex flex-col h-screen md:h-[90vh] relative overflow-hidden">
        
        <div className="bg-[#0b5394] text-white p-3 flex justify-between items-center shadow-xl z-20">
           <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
              <X className="h-6 w-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowKeyboard(!showKeyboard)} 
              className={cn("text-white rounded-full transition-all", showKeyboard ? "bg-white/20" : "hover:bg-white/10")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-keyboard"><path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>
            </Button>
          </div>
          <div className="bg-white/10 px-6 py-2 rounded-full text-center">
             <div className="text-xl font-black tracking-tighter leading-none">
                {weights.reduce((s, w) => s + (w ? parseFloat(w) / 10 : 0), 0).toLocaleString("vi-VN", { minimumFractionDigits: 1 })} kg
             </div>
             <div className="text-[10px] uppercase font-bold opacity-70">Tổng sản lượng</div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setWeights(new Array(MAX_CELLS).fill(""))} className="text-white hover:bg-red-500 rounded-full">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 no-scrollbar pb-32">
          {[...Array(MAX_TABLES)].map((_, i) => renderTable(i))}
        </div>

        <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center pointer-events-none">
           <div className="bg-white/90 backdrop-blur-xl p-3 px-6 rounded-full shadow-2xl flex items-center gap-4 border border-white pointer-events-auto">
              <Button 
                variant="outline" 
                className="h-12 w-12 rounded-full border-2 border-slate-200 text-slate-600 active:scale-90"
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
                  "h-16 w-16 rounded-full shadow-lg transition-all active:scale-95 border-4 border-white/50",
                  isListening 
                    ? "!bg-red-600 animate-pulse ring-4 ring-red-600/30 shadow-red-500/50" 
                    : "!bg-[#2e7d32] hover:bg-[#1b5e20] shadow-green-900/20"
                )}
              >
                {isListening ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
              </Button>

              <Button 
                onClick={handleComplete}
                className="h-14 px-8 rounded-full bg-black text-white font-black hover:bg-slate-800 shadow-lg active:scale-95"
              >
                XONG
              </Button>
           </div>
        </div>

        {/* Bàn phím số (To, dễ bấm) */}
        {showKeyboard && (
          <div className="bg-white border-t p-4 z-40 animate-in slide-in-from-bottom-full duration-300">
             <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <Button 
                    key={n} 
                    variant="secondary"
                    className="h-20 text-4xl font-black bg-slate-100 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 rounded-3xl text-agri-900"
                    onClick={() => {
                      const currentVal = weightsRef.current[activeIndex] || ""
                      if (currentVal.length < 4) {
                        const isEditing = currentVal !== ""
                        const newVal = currentVal + n
                        updateWeight(activeIndex, newVal)
                        
                        if (newVal.length >= 3) {
                           const updatedWeights = [...weightsRef.current]
                           updatedWeights[activeIndex] = newVal
                           if (isEditing) {
                              const firstEmpty = updatedWeights.findIndex(w => w === "")
                              if (firstEmpty !== -1) setActiveIndex(firstEmpty)
                              else setActiveIndex(prev => prev + 1)
                           } else {
                              setActiveIndex(prev => prev + 1)
                           }
                        }
                      }
                    }}
                  >
                    {n}
                  </Button>
                ))}
                
                {/* Nút Xóa Hết Ô */}
                <Button 
                  variant="outline"
                  className="h-20 text-2xl font-black rounded-3xl border-2 border-red-100 text-red-500 bg-red-50 active:bg-red-100"
                  onClick={() => updateWeight(activeIndex, "")}
                >
                  Xóa Hết
                </Button>

                <Button 
                  variant="secondary"
                  className="h-20 text-4xl font-black bg-slate-100 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 rounded-3xl text-agri-900"
                  onClick={() => {
                    const currentVal = weightsRef.current[activeIndex] || ""
                    if (currentVal.length < 4) {
                      const isEditing = currentVal !== ""
                      const newVal = currentVal + "0"
                      updateWeight(activeIndex, newVal)
                      if (newVal.length >= 3) {
                         const updatedWeights = [...weightsRef.current]
                         updatedWeights[activeIndex] = newVal
                         if (isEditing) {
                            const firstEmpty = updatedWeights.findIndex(w => w === "")
                            if (firstEmpty !== -1) setActiveIndex(firstEmpty)
                            else setActiveIndex(prev => prev + 1)
                         } else {
                            setActiveIndex(prev => prev + 1)
                         }
                      }
                    }
                  }}
                >
                  0
                </Button>

                {/* Nút Xóa 1 Số Cuối */}
                <Button 
                  variant="outline"
                  className="h-20 text-2xl font-black rounded-3xl border-2 border-slate-200 text-slate-600 bg-slate-50 active:bg-slate-100"
                  onClick={() => {
                    setWeights(prev => {
                      const n = [...prev]
                      n[activeIndex] = n[activeIndex].slice(0, -1)
                      weightsRef.current = n
                      return n
                    })
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-delete"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><line x1="18" x2="12" y1="9" y2="15"/><line x1="12" x2="18" y1="9" y2="15"/></svg>
                </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
