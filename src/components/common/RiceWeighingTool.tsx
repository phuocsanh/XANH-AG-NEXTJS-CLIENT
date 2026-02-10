"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Mic, MicOff, X, RotateCcw, ChevronLeft, Save, Database, History, Info, Scale, ArrowRight, Trash2, RotateCw, Keyboard, ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores"
import { useRiceCrops } from "@/hooks/use-rice-crops"
import { localFarmingService } from "@/lib/local-farming-service"
import { RiceCrop, WeighingRecord } from "@/models/rice-farming"
import dayjs from "dayjs"
import httpClient from "@/lib/http"
import { toast } from "@/hooks/use-toast"

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
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [step, setStep] = useState<"select-crop" | "weighing" | "history">("select-crop")
  const [selectedCropId, setSelectedCropId] = useState<number | string | null>(null)
  const [customCropName, setCustomCropName] = useState("")
  const [pricePerUnit, setPricePerUnit] = useState<number>(0)
  const [localCrops, setLocalCrops] = useState<any[]>([])
  const [history, setHistory] = useState<WeighingRecord[]>([])
  
  const { isLogin } = useAppStore()
  const { data: onlineCropsData } = useRiceCrops({ limit: 100 }, isOpen && isLogin)
  const onlineCrops = onlineCropsData?.data || []

  const recognitionRef = useRef<any>(null)
  const activeIndexRef = useRef(0)
  const weightsRef = useRef<string[]>(new Array(MAX_CELLS).fill(""))
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fetch local crops and history
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const c = await localFarmingService.getAllRiceCrops()
        setLocalCrops(c)
        const h = await localFarmingService.getAllWeighingRecords()
        setHistory(h)
      }
      loadData()
    }
  }, [isOpen])

  // Đồng bộ Refs để tránh stale closures
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
      const isEditing = (currentWeights[currentIndex] || "") !== ""
      
      updateWeight(currentIndex, numbers)
      
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

  const handleComplete = async () => {
    const total = weights.reduce((sum, w) => sum + (w ? parseFloat(w) / 10 : 0), 0)
    const revenue = total * pricePerUnit

    if (total === 0) {
      toast({ title: "Thông báo", description: "Vui lòng nhập sản lượng cân lúa." })
      return
    }

    const weighingData: any = {
      rice_crop_id: selectedCropId && typeof selectedCropId === 'number' ? selectedCropId : undefined,
      crop_name: selectedCropId 
        ? (isLogin ? onlineCrops : localCrops).find(c => c.id === selectedCropId)?.field_name || "Vụ tự do" 
        : (customCropName.trim() || "Vụ tự do"),
      is_guest: !isLogin,
      weighing_date: dayjs().toISOString(),
      total_weight: total,
      price_per_unit: pricePerUnit,
      total_revenue: revenue,
      weights_data: weights.filter(w => w !== ""),
    }

    try {
      await localFarmingService.createWeighingRecord(weighingData)
      onSave(total)
      toast({ title: "Thành công 🎉", description: "Đã lưu bản ghi cân lúa." })
      
      // Reset after success
      setWeights(new Array(MAX_CELLS).fill(""))
      setStep("history") // Chuyển sang xem lịch sử
    } catch (error) {
      console.error("Error saving weighing record:", error)
      toast({ title: "Lỗi", description: "Không thể lưu bản ghi.", variant: "destructive" })
    }
  }

  const handleSyncToCrop = async (record: WeighingRecord) => {
    if (!record.rice_crop_id) return

    const harvestData = {
      rice_crop_id: record.rice_crop_id,
      harvest_date: dayjs(record.weighing_date).format("YYYY-MM-DD"),
      yield_amount: record.total_weight,
      selling_price_per_unit: record.price_per_unit || 0,
      total_revenue: record.total_revenue || 0,
      quality_grade: "Loại 1",
      payment_status: "pending"
    }

    try {
      if (isLogin) {
        await httpClient.post('harvest-records', harvestData)
      } else {
        await localFarmingService.createHarvestRecord(harvestData)
      }
      toast({ title: "Thành công", description: "Đã đồng bộ sản lượng vào ruộng lúa." })
    } catch (error) {
      console.error("Sync failed:", error)
      toast({ title: "Lỗi", description: "Không thể đồng bộ dữ liệu.", variant: "destructive" })
    }
  }

  const deleteHistoryRecord = async (id: number) => {
    if (!id) return
    await localFarmingService.deleteWeighingRecord(id)
    setHistory(prev => prev.filter(r => r.id !== id))
    toast({ title: "Đã xóa", description: "Đã xóa bản ghi lịch sử." })
  }

  const renderTable = (tableIdx: number) => {
    const startIdx = tableIdx * CELLS_PER_TABLE
    const tableCells = weights.slice(startIdx, startIdx + CELLS_PER_TABLE)
    const parsedCells = tableCells.map(w => w ? parseFloat(w) / 10 : 0)
    const tableTotal = parsedCells.reduce((a, b) => a + b, 0)
    const colTotals = [0, 1, 2, 3, 4].map(col => {
      return [0, 1, 2, 3, 4].reduce((sum, row) => sum + (parsedCells[row * COLUMNS + col] || 0), 0)
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
        
        {/* Header */}
        <div className="bg-[#0b5394] text-white p-3 flex justify-between items-center shadow-xl z-20">
           <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => {
              if (step === "weighing") setStep("select-crop")
              else if (step === "history") setStep("select-crop")
              else onClose()
            }} className="text-white hover:bg-white/10 rounded-full">
              {step !== "select-crop" ? <ChevronLeft className="h-6 w-6" /> : <X className="h-6 w-6" />}
            </Button>
            <div className="ml-2 font-black italic text-lg tracking-tight uppercase">CÂN LÚA</div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setStep("history")
                localFarmingService.getAllWeighingRecords().then(setHistory)
              }}
              className={cn("text-white rounded-full h-10 px-4", step === "history" ? "bg-white/20" : "hover:bg-white/10")}
            >
              <History className="h-5 w-5 mr-2" />
              <span className="text-sm font-bold">Lịch sử</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
           
           {/* Step 1: CHỌN RUỘNG LÚA */}
           {step === "select-crop" && (
             <div className="p-6 md:p-10 flex flex-col h-full overflow-y-auto">
                <div className="text-center mb-8">
                   <div className="w-20 h-20 bg-blue-100 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                      <Scale className="w-10 h-10 text-blue-600" />
                   </div>
                   <h2 className="text-3xl font-black text-blue-900 mb-2">BẮT ĐẦU CÂN LÚA</h2>
                   <p className="text-blue-600 font-medium italic">Chọn ruộng lúa của bạn để tự động lưu sản lượng.</p>
                </div>

                <div className="space-y-6 max-w-md mx-auto w-full">
                   <div className="space-y-4">
                      <label className="text-sm font-black text-blue-900 uppercase tracking-widest pl-2">Chọn ruộng lúa (không bắt buộc)</label>
                      <div className="grid grid-cols-1 gap-3">
                         <Button 
                            variant="outline"
                            onClick={() => setSelectedCropId(null)}
                            className={cn(
                              "h-16 justify-between rounded-2xl border-2 text-lg font-bold transition-all",
                              selectedCropId === null ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-100"
                            )}
                         >
                            <div className="flex items-center">
                               <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mr-3", selectedCropId === null ? "bg-white/20" : "bg-slate-100")}>
                                  <Info className="w-5 h-5" />
                               </div>
                              Tạo Phiếu Cân
                            </div>
                            {selectedCropId === null && <div className="w-6 h-6 bg-white rounded-full" />}
                         </Button>

                         {selectedCropId === null && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                               <Input 
                                 placeholder="Nhập tên ruộng (vd: Ruộng nhà, Kinh A...)"
                                 value={customCropName}
                                 onChange={(e) => setCustomCropName(e.target.value)}
                                 className="h-14 rounded-2xl border-2 border-blue-100 bg-white px-6 text-lg font-bold text-blue-900 placeholder:text-blue-200 focus:border-blue-500 focus:ring-0 shadow-inner"
                               />
                            </div>
                         )}

                         {/* List Crops */}
                         {(isLogin ? onlineCrops : localCrops).slice(0, 5).map(crop => (
                            <Button
                              key={crop.id}
                              variant="outline"
                              onClick={() => {
                                 setSelectedCropId(crop.id)
                                 setCustomCropName("")
                              }}
                              className={cn(
                                "h-16 justify-between rounded-2xl border-2 text-lg font-bold transition-all",
                                selectedCropId === crop.id ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-700 border-slate-100"
                              )}
                            >
                               <div className="flex items-center">
                                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mr-3", selectedCropId === crop.id ? "bg-white/20" : "bg-blue-50")}>
                                     <Database className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                     <div className="leading-tight">{crop.field_name}</div>
                                     <div className={cn("text-[10px] uppercase opacity-70", selectedCropId === crop.id ? "text-white" : "text-slate-400")}>{crop.season_name}</div>
                                  </div>
                               </div>
                            </Button>
                         ))}
                      </div>
                   </div>

                   <div className="pt-8">
                      <Button 
                        onClick={() => setStep("weighing")}
                        className="w-full h-16 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white text-xl font-black shadow-2xl shadow-blue-200 group active:scale-95 transition-all"
                      >
                         TIẾP TỤC
                         <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </Button>
                   </div>
                </div>
             </div>
           )}

           {/* Step 2: CÂN LÚA */}
           {step === "weighing" && (
             <>
                <div className="bg-white/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-blue-100">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                         <Scale className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <div className="text-blue-900 font-black leading-none uppercase tracking-tighter">
                            {selectedCropId 
                              ? (isLogin ? onlineCrops : localCrops).find(c => c.id === selectedCropId)?.field_name 
                              : (customCropName.trim() || "Vụ tự do")}
                         </div>
                         <div className="text-[10px] text-blue-500 font-bold uppercase mt-1">Đang thực hiện cân lúa</div>
                      </div>
                   </div>
                   <div className="bg-blue-900 text-white px-6 py-2 rounded-2xl shadow-inner">
                      <div className="text-2xl font-black tracking-tighter leading-none">
                         {weights.reduce((s, w) => s + (w ? parseFloat(w) / 10 : 0), 0).toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
                      </div>
                      <div className="text-[9px] uppercase font-black text-blue-300 text-right">Tổng kg</div>
                   </div>
                </div>

                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 no-scrollbar pb-40">
                   {[...Array(MAX_TABLES)].map((_, i) => renderTable(i))}
                </div>

                {/* Floating Controls */}
                {!showKeyboard && (
                  <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center pointer-events-none z-50">
                    <div className="bg-white/95 backdrop-blur-xl p-3 px-6 rounded-full shadow-2xl flex items-center gap-3 border border-blue-100 pointer-events-auto">
                        <Button 
                          variant="outline" 
                          className={cn(
                            "h-12 w-12 rounded-full border-2 transition-all active:scale-90",
                            showKeyboard ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"
                          )}
                          onClick={() => setShowKeyboard(!showKeyboard)}
                        >
                          <Keyboard className="h-6 w-6" />
                        </Button>

                        <div className="w-px h-8 bg-slate-200 mx-1" />

                        <Button 
                          variant="outline" 
                          className="h-12 w-12 rounded-full border-2 border-slate-200 text-slate-600 active:scale-90"
                          onClick={() => {
                            setWeights(prev => {
                              const n = [...prev]
                              n[activeIndex] = (n[activeIndex] || "").slice(0, -1)
                              weightsRef.current = n
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
                          className="h-14 px-8 rounded-full bg-blue-900 text-white font-black hover:bg-blue-950 shadow-lg active:scale-95 flex items-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          HOÀN TẤT
                        </Button>
                    </div>
                </div>
              )}

                {showKeyboard && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 z-40 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] h-[320px]">
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                          <Button 
                            key={n} 
                            variant="secondary"
                            className="h-16 text-2xl font-black bg-slate-50 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 rounded-2xl text-slate-800"
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
                        <Button variant="outline" className="h-16 text-sm font-black rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center gap-1 active:bg-slate-50" onClick={() => setShowKeyboard(false)}>
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                          ẨN PHÍM
                        </Button>
                        <Button variant="secondary" className="h-16 text-2xl font-black bg-slate-50 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 rounded-2xl text-slate-800" onClick={() => {
                           const currentVal = weightsRef.current[activeIndex] || ""
                           if (currentVal.length < 4) {
                              const newVal = currentVal + "0"
                              updateWeight(activeIndex, newVal)
                              if (newVal.length >= 3) {
                                 const updatedWeights = [...weightsRef.current]
                                 updatedWeights[activeIndex] = newVal
                                 setActiveIndex(prev => (updatedWeights.findIndex(w => w === "") !== -1 ? updatedWeights.findIndex(w => w === "") : prev + 1))
                              }
                           }
                        }}>0</Button>
                        <Button variant="outline" className="h-16 text-2xl font-black rounded-2xl bg-slate-100" onClick={() => {
                           setWeights(prev => {
                              const n = [...prev]
                              n[activeIndex] = (n[activeIndex] || "").slice(0, -1)
                              weightsRef.current = n
                              return n
                            })
                        }}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-delete"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><line x1="18" x2="12" y1="9" y2="15"/><line x1="12" x2="18" y1="9" y2="15"/></svg>
                        </Button>
                    </div>
                  </div>
                )}
             </>
           )}

           {/* Step 3: LỊCH SỬ CÂN LÚA */}
           {step === "history" && (
             <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-30 text-slate-400">
                     <History className="w-16 h-16 mb-4" />
                     <div className="font-bold text-xl uppercase">Chưa có lịch sử cân</div>
                  </div>
                ) : (
                  history.map(record => (
                    <div key={record.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 group relative">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{dayjs(record.weighing_date).format("DD/MM/YYYY - HH:mm")}</div>
                             <h4 className="text-xl font-black text-blue-900">{record.crop_name}</h4>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                            onClick={() => record.id && deleteHistoryRecord(record.id)}
                          >
                             <Trash2 className="w-5 h-5" />
                          </Button>
                       </div>

                       <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                             <div className="text-[10px] font-black text-blue-400 uppercase mb-1">Tổng sản lượng</div>
                             <div className="text-2xl font-black text-blue-700 leading-none">{record.total_weight.toLocaleString()} <span className="text-sm">kg</span></div>
                          </div>
                          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                             <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">Xấp xỉ tiền</div>
                             <div className="text-2xl font-black text-emerald-700 leading-none">{record.total_revenue?.toLocaleString()} <span className="text-sm">đ</span></div>
                          </div>
                       </div>

                       <div className="flex gap-2">
                          <Button 
                            className="flex-1 h-12 rounded-xl bg-slate-800 text-white font-bold text-sm tracking-tight"
                            onClick={() => {
                               // Logic để xem lại chi tiết bảng (Nếu cần)
                               toast({ title: "Thông báo", description: "Tính năng đang hoàn thiện." })
                            }}
                          >
                             CHI TIẾT BẢNG
                          </Button>
                          {record.rice_crop_id && (
                             <Button 
                                className="flex-1 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm tracking-tight shadow-lg shadow-orange-100"
                                onClick={() => handleSyncToCrop(record)}
                             >
                                <RotateCw className="w-5 h-5 mr-2" />
                                ĐỒNG BỘ
                             </Button>
                          )}
                       </div>
                    </div>
                  ))
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
