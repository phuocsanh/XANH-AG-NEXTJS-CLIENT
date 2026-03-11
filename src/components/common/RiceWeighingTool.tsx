"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Mic, MicOff, X, ChevronLeft, Save, Database, History, Info, Scale, ArrowRight, Trash2, RotateCw, Calculator, Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores"
import { useRiceCrops } from "@/hooks/use-rice-crops"
import { localFarmingService } from "@/lib/local-farming-service"
import { WeighingRecord } from "@/models/rice-farming"
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
  const [step, setStep] = useState<"select-crop" | "weighing" | "history">("select-crop")
  const [selectedCropId, setSelectedCropId] = useState<number | string | null>(null)
  const [customCropName, setCustomCropName] = useState("")
  const [localCrops, setLocalCrops] = useState<any[]>([])
  const [history, setHistory] = useState<WeighingRecord[]>([])
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)
  
  // New calculation states
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [bagsPerKg, setBagsPerKg] = useState<number>(8) // Trừ bì mặc định 8 bao/kg (ví dụ 8 bao là 1kg)
  const [impurityWeight, setImpurityWeight] = useState<number>(0)
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [isPaidFull, setIsPaidFull] = useState<boolean>(false)
  const [showResultPopup, setShowResultPopup] = useState<boolean>(false)
  const [micPosition, setMicPosition] = useState({ x: 20, y: -20 }) // Bottom-left default
  const [isDragging, setIsDragging] = useState(false)
  const [autoJumpLength, setAutoJumpLength] = useState<number>(3) // Mặc định 3 số nhảy ô
  
  const { isLogin } = useAppStore()
  const { data: onlineCropsData } = useRiceCrops({ limit: 100 }, isOpen && isLogin)
  const onlineCrops = onlineCropsData?.data || []

  const recognitionRef = useRef<any>(null)
  const activeIndexRef = useRef(0)
  const lastProcessedIndexRef = useRef(-1)
  const isListeningRef = useRef(false)
  const silenceTimeoutRef = useRef<any>(null)
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
    
    const scrollToActive = () => {
      const activeElement = document.getElementById(`cell-${activeIndex}`)
      const container = scrollContainerRef.current
      
      if (activeElement && container) {
        // Luôn cuộn đến ô đang nhập để đảm bảo không bị che khuất bởi bàn phím hệ thống
        const viewportHeight = container.clientHeight
        const elementOffsetTop = activeElement.offsetTop
        const targetScroll = elementOffsetTop - (viewportHeight * 0.25)
        
        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "auto" // Dùng auto để nhảy tức thì, tránh bị giật khi user đang gõ nhanh
        })
      }
    }

    // Đợi 50ms để đảm bảo các bảng mới (nếu có) đã render xong
    const timer = setTimeout(scrollToActive, 50)
    return () => clearTimeout(timer)
  }, [activeIndex])

  useEffect(() => {
    weightsRef.current = weights
  }, [weights])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
          recognitionRef.current.abort()
        } catch {}
      }
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
    }
  }, [])

  const getNextIndex = (currentIndex: number) => {
    const tableIdx = Math.floor(currentIndex / 25) // Mỗi bảng 25 ô
    const tableStart = tableIdx * 25
    const relative = currentIndex - tableStart
    
    const row = Math.floor(relative / 5) // 5 hàng
    const col = relative % 5 // 5 cột
    
    // Nguyên tắc: Hết một cột mới sang cột tiếp theo
    // Nhảy xuống dòng tiếp theo nếu chưa hết cột
    if (row < 4) {
      return tableStart + (row + 1) * 5 + col
    }
    
    // Nếu là dòng cuối (Row 4), nhảy lên đầu của cột tiếp theo (Row 0, Col + 1)
    if (col < 4) {
      return tableStart + 0 * 5 + (col + 1)
    }
    
    // Nếu hết bảng, nhảy xuống dòng 0 cột 0 của bảng tiếp theo
    return tableStart + 25
  }

  const handleVoiceInput = (text: string) => {
    if (!text) return
    
    // Chuyển một số chữ thành số cơ bản (tiếng Việt)
    const normalized = text.toLowerCase()
      .replace(/không/g, "0")
      .replace(/một/g, "1")
      .replace(/hai/g, "2")
      .replace(/ba/g, "3")
      .replace(/bốn/g, "4")
      .replace(/năm/g, "5")
      .replace(/sáu/g, "6")
      .replace(/bảy/g, "7")
      .replace(/tám/g, "8")
      .replace(/chín/g, "9")
      .replace(/lẻ|linh|ninh/g, "0")
      .replace(/chục|mươi/g, "0")

    let numbers = normalized.replace(/[^0-9]/g, "")
    // Nếu chỉ có 2 số (ví dụ 88 hoặc 50), tự hiểu là 88.0 hoặc 50.0kg (điền 880, 500)
    if (numbers.length === 2 && !normalized.includes("mười")) {
      numbers += "0"
    }
    
    // Giảm điều kiện xuống >= 1 để nhạy hơn
    if (numbers.length >= 1 && numbers.length <= 4) {
      const currentIndex = activeIndexRef.current
      updateWeight(currentIndex, numbers)
      
      if (currentIndex < MAX_CELLS - 1) {
        setActiveIndex(getNextIndex(currentIndex))
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

  const toggleListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast({
        title: "Không hỗ trợ",
        description: "Trình duyệt này không hỗ trợ Speech API.",
        variant: "destructive"
      })
      return
    }
    
    if (isListeningRef.current) {
      try {
        recognitionRef.current.stop()
        recognitionRef.current.abort()
      } catch {}
      isListeningRef.current = false
      setIsListening(false)
    } else {
      lastProcessedIndexRef.current = -1
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      
      // Mẹo quan trọng cho iOS PWA: 
      // Không được 'await' getUserMedia vì nó sẽ làm mất 'User Gesture' (mất hiệu lực cú chạm tay)
      // Thay vào đó, gọi nó chạy song song để hệ thống mở Micro
      if (isIOS) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            stream.getTracks().forEach(track => track.stop())
          })
          .catch(err => console.error("Mic priming failed:", err))
      }

      // Khởi tạo SpeechRecognition ngay lập tức để giữ User Gesture
      const recognition = new SpeechRecognition()
      recognition.continuous = false // iOS PWA bắt buộc phải false
      recognition.interimResults = true
      recognition.lang = "vi-VN"
      
      const stopMic = () => {
        try {
          recognition.abort()
        } catch {}
        isListeningRef.current = false
        setIsListening(false)
      }

      recognition.onstart = () => {
        isListeningRef.current = true
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
        const lastIndex = event.results.length - 1
        if (lastIndex < 0) return
        const result = event.results[lastIndex]
        const transcript = result[0].transcript

        if (result.isFinal) {
          if (lastIndex > lastProcessedIndexRef.current) {
            handleVoiceInput(transcript)
            lastProcessedIndexRef.current = lastIndex
            stopMic()
          }
        } else {
          silenceTimeoutRef.current = setTimeout(() => {
            if (lastIndex > lastProcessedIndexRef.current && isListeningRef.current) {
              handleVoiceInput(transcript)
              lastProcessedIndexRef.current = lastIndex
              stopMic()
            }
          }, 450)
        }
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        isListeningRef.current = false
        // 'aborted' trên iOS Chrome thường xảy ra khi mic tự dừng hoặc bị ép dừng, không nên báo lỗi
        if (event.error === 'no-speech' || event.error === 'aborted') return 
        
        const errorMessages: Record<string, string> = {
          'not-allowed': 'Bạn hãy cấp quyền Micro cho Chrome trong Cài đặt iPhone nhé!',
          'network': 'Lỗi mạng, hãy kiểm tra kết nối để dùng giọng nói.',
        }
        
        if (errorMessages[event.error]) {
          toast({
            title: "Lỗi Micro",
            description: errorMessages[event.error],
            variant: "destructive"
          })
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        isListeningRef.current = false
      }

      recognitionRef.current = recognition
      
      try {
        recognition.start()
        setIsListening(true)
        isListeningRef.current = true
      } catch (e) {
        console.error("Speech start failure:", e)
        try {
          recognition.abort()
          setTimeout(() => recognition.start(), 200)
        } catch {}
      }
    }
  }

  const handleComplete = async () => {
    const totalGross = weights.reduce((sum, w) => sum + (w ? parseFloat(w) / 10 : 0), 0)
    const bagCount = weights.filter(w => w !== "").length
    const totalTare = bagsPerKg > 0 ? bagCount / bagsPerKg : 0
    const netWeight = Math.max(0, totalGross - totalTare - impurityWeight)
    const revenue = netWeight * unitPrice

    if (totalGross === 0) {
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
      total_weight: totalGross,
      tare_weight: totalTare,
      impurity_weight: impurityWeight,
      net_weight: netWeight,
      price_per_unit: unitPrice,
      total_revenue: revenue,
      deposit_amount: depositAmount,
      paid_amount: paidAmount,
      is_paid_full: isPaidFull,
      weights_data: weights.filter(w => w !== ""),
    }

    try {
      if (editingRecordId) {
        await localFarmingService.updateWeighingRecord(editingRecordId, weighingData)
        toast({ title: "Đã cập nhật 🎉", description: "Đã lưu thay đổi vào bản ghi." })
      } else {
        await localFarmingService.createWeighingRecord(weighingData)
        toast({ title: "Thành công 🎉", description: "Đã lưu bản ghi cân lúa mới." })
      }
      
      onSave(netWeight)
      
      // Reset after success
      setWeights(new Array(MAX_CELLS).fill(""))
      setEditingRecordId(null)
      setUnitPrice(0)
      setDepositAmount(0)
      setPaidAmount(0)
      setImpurityWeight(0)
      setIsPaidFull(false)
      const h = await localFarmingService.getAllWeighingRecords()
      setHistory(h)
      setStep("history") // Chuyển sang xem lịch sử
    } catch (error) {
      console.error("Error saving weighing record:", error)
      toast({ title: "Lỗi", description: "Không thể lưu bản ghi.", variant: "destructive" })
    }
  }

  const handleViewDetail = (record: WeighingRecord) => {
    const newWeights = new Array(MAX_CELLS).fill("")
    record.weights_data.forEach((w, i) => {
      if (i < MAX_CELLS) newWeights[i] = w
    })
    setWeights(newWeights)
    setCustomCropName(record.crop_name || "")
    setSelectedCropId(record.rice_crop_id || null)
    setEditingRecordId(record.id || null)
    
    // Khôi phục các giá trị tính toán
    setUnitPrice(record.price_per_unit || 0)
    setBagsPerKg(record.tare_weight && record.tare_weight > 0 ? (record.weights_data.length / record.tare_weight) : 8)
    setImpurityWeight(record.impurity_weight || 0)
    setDepositAmount(record.deposit_amount || 0)
    setPaidAmount(record.paid_amount || 0)
    setIsPaidFull(record.is_paid_full || false)

    setStep("weighing")
    setActiveIndex(0)
    toast({ title: "Đã tải dữ liệu", description: `Đang xem lại: ${record.crop_name}` })
  }

  const renderResultContent = () => {
    const totalGross = weights.reduce((sum, w) => sum + (w ? parseFloat(w) / 10 : 0), 0)
    const bagCount = weights.filter(w => w !== "").length
    const totalTare = bagsPerKg > 0 ? bagCount / bagsPerKg : 0
    const netWeight = Math.max(0, totalGross - totalTare - impurityWeight)
    const totalRevenue = netWeight * unitPrice
    const remainBalance = totalRevenue - depositAmount - paidAmount

    return (
      <div className="bg-white border-2 border-[#d32f2f] rounded-b-2xl shadow-xl overflow-hidden divide-y divide-gray-100">
         {/* Cài đặt chế độ nhảy ô */}
         <div className="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-100">
            <div className="text-sm font-black text-slate-600 uppercase">Chế độ nhảy ô</div>
            <div className="flex bg-slate-200 p-1 rounded-xl">
               {[3, 4].map(num => (
                 <button
                   key={num}
                   onClick={() => setAutoJumpLength(num)}
                   className={cn(
                     "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                     autoJumpLength === num 
                       ? "bg-white text-blue-600 shadow-sm scale-105" 
                       : "text-slate-500 hover:text-slate-700"
                   )}
                 >
                   {num} SỐ
                 </button>
               ))}
            </div>
         </div>

         {/* Tên Nông Dân */}
         <div className="p-4 grid grid-cols-5 gap-3 items-center">
            <div className="col-span-2 text-sm font-black text-slate-500 uppercase">Tên nông dân</div>
            <div className="col-span-3 text-right text-lg font-black text-blue-900 truncate">
              {selectedCropId 
                ? (isLogin ? onlineCrops : localCrops).find(c => c.id === selectedCropId)?.field_name 
                : (customCropName || "Chưa nhập")}
            </div>
         </div>

         {/* Tổng Khối Lượng Chưa Trừ Bì */}
         <div className="p-4 bg-yellow-50 grid grid-cols-5 gap-3 items-center house-shadow-inner">
            <div className="col-span-3">
               <div className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#2e7d32]" /> Tổng khối lượng
               </div>
               <div className="text-[10px] text-red-500 font-bold italic">(*) Khối lượng CHƯA trừ bì</div>
            </div>
            <div className="col-span-2 text-right">
               <span className="text-2xl font-black text-slate-900">
                  {totalGross.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
               </span>
               <span className="ml-1 text-sm font-black text-red-500 uppercase">KG</span>
            </div>
         </div>

         {/* Số Lần Cân / Bao */}
         <div className="p-4 grid grid-cols-5 gap-3 items-center">
            <div className="col-span-3">
               <div className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" /> Số lần cân (Bao)
                </div>
             </div>
             <div className="col-span-2 text-right">
                <span className="text-2xl font-black text-slate-900">{bagCount}</span>
                <span className="ml-1 text-sm font-bold text-slate-400">Bao</span>
             </div>
          </div>

          {/* Trừ Bì */}
          <div className="p-4 grid grid-cols-5 gap-3 items-center bg-blue-50/30">
             <div className="col-span-2">
                <div className="text-sm font-black text-slate-800 uppercase">Trừ bì (Bao/Kg)</div>
                <div className="text-[10px] text-blue-600 font-bold italic">(*) {bagCount} bao / {bagsPerKg} bao/kg = {totalTare.toLocaleString("vi-VN", { minimumFractionDigits: 1 })} kg</div>
             </div>
             <div className="col-span-3 flex items-center gap-2 justify-end">
                <Input 
                  type="number" 
                  step="1"
                  className="w-full max-w-[120px] h-12 text-center text-xl font-black text-green-700 bg-white border-blue-200 focus:border-[#d32f2f] focus:ring-0 shadow-sm"
                  value={bagsPerKg}
                  onChange={(e) => setBagsPerKg(parseFloat(e.target.value) || 0)}
                />
                <span className="text-sm font-black text-slate-400">BAO/KG</span>
             </div>
          </div>

          {/* Trừ Tạp Chất */}
          <div className="p-4 grid grid-cols-5 gap-3 items-center bg-red-50/30">
             <div className="col-span-2">
                <div className="text-sm font-black text-slate-800 uppercase">Trừ tạp chất (-)</div>
             </div>
             <div className="col-span-3 flex items-center gap-2 justify-end">
                <Input 
                  type="number"
                  className="w-full max-w-[120px] h-12 text-center text-xl font-black text-red-700 bg-white border-blue-200 focus:border-[#d32f2f] focus:ring-0 shadow-sm"
                  value={impurityWeight}
                  onChange={(e) => setImpurityWeight(parseFloat(e.target.value) || 0)}
                />
                <span className="text-sm font-black text-slate-400">KG</span>
             </div>
          </div>

          {/* Khối Lượng Còn Lại (Sau Trừ Bì) */}
          <div className="p-4 bg-yellow-400 grid grid-cols-5 gap-3 items-center shadow-inner">
             <div className="col-span-3">
                <div className="text-sm font-black text-agri-950 uppercase flex items-center gap-2">
                   <Scale className="w-4 h-4" /> Khối lượng còn lại
                </div>
                <div className="text-[10px] text-[#2e7d32] font-black italic">(*) Khối lượng ĐÃ trừ bì</div>
             </div>
             <div className="col-span-2 text-right">
                <span className="text-2xl font-black text-agri-950">
                   {netWeight.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
                </span>
                <span className="ml-1 text-sm font-black text-agri-950 uppercase">KG</span>
             </div>
          </div>

          {/* Đơn Giá Lúa */}
          <div className="p-4 grid grid-cols-5 gap-3 items-center bg-green-50/20">
             <div className="col-span-2 text-sm font-black text-slate-800 uppercase">Đơn giá</div>
             <div className="col-span-3 flex items-center gap-2 justify-end">
                <Input 
                  type="number"
                  className="w-full max-w-[150px] h-12 text-center text-xl font-black text-slate-900 bg-white border-blue-200 focus:border-[#d32f2f] focus:ring-0 shadow-sm"
                  placeholder="đ/kg"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                />
                <span className="text-sm font-black text-red-500">vnđ</span>
             </div>
          </div>

          {/* Thành Tiền */}
          <div className="p-4 bg-yellow-100 grid grid-cols-5 gap-3 items-center shadow-inner">
             <div className="col-span-2">
                <div className="text-sm font-black text-slate-800 uppercase">Thành tiền</div>
                <div className="text-[9px] text-slate-400 font-bold italic">(*) KL x Đơn giá</div>
             </div>
             <div className="col-span-3 text-right">
                <span className="text-2xl font-black text-agri-900">
                   {totalRevenue.toLocaleString("vi-VN")}
                </span>
                <span className="ml-1 text-sm font-black text-red-500 italic">vnđ</span>
             </div>
          </div>

          {/* Tiền Đặt Cọc */}
          <div className="p-4 grid grid-cols-5 gap-3 items-center">
             <div className="col-span-2 text-sm font-black text-slate-800 uppercase">Tiền cọc (-)</div>
             <div className="col-span-3 flex justify-end gap-2 items-center">
                <Input 
                  type="number"
                  className="w-full max-w-[150px] h-12 text-center text-xl font-bold bg-white border-slate-200"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                />
                <span className="text-sm font-black text-slate-400">vnđ</span>
             </div>
          </div>

          {/* Tiền Đã Trả Lúa */}
          <div className="p-4 grid grid-cols-5 gap-3 items-center">
             <div className="col-span-2 text-sm font-black text-slate-800 uppercase">Đã trả (-)</div>
             <div className="col-span-3 flex justify-end gap-2 items-center">
                <Input 
                  type="number"
                  className="w-full max-w-[150px] h-12 text-center text-xl font-bold bg-white border-slate-200"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                />
                <span className="text-sm font-black text-slate-400">vnđ</span>
             </div>
          </div>

          {/* Tiền Còn Lại Sau Cùng */}
          <div className="p-6 bg-slate-900 grid grid-cols-5 gap-3 items-center rounded-b-xl shadow-inner">
             <div className="col-span-2">
                <div className="text-sm font-black text-white uppercase tracking-tighter text-lg">TIỀN CÒN</div>
             </div>
             <div className="col-span-3 text-right">
                <span className="text-3xl font-black text-yellow-400">
                   {remainBalance.toLocaleString("vi-VN")}
                </span>
                <span className="ml-1 text-xs font-black text-blue-100 uppercase italic">VNĐ</span>
             </div>
          </div>

          {/* Trạng Thái Thanh Toán Toàn Bộ */}
          <div className="p-5 flex justify-between items-center bg-white">
             <div className="text-lg font-black text-[#2e7d32] uppercase">Đã trả đủ tiền</div>
             <button 
               onClick={() => setIsPaidFull(!isPaidFull)}
               className={cn(
                 "w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner",
                 isPaidFull ? "bg-[#2e7d32]" : "bg-slate-300"
               )}
             >
                <div className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md",
                  isPaidFull ? "left-7" : "left-1"
                )} />
             </button>
          </div>
       </div>
    )
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

          <div className="grid grid-cols-5 gap-2 p-2 bg-white">
            {tableCells.map((w, i) => {
              const globalIdx = startIdx + i
              return (
                <div 
                  key={globalIdx}
                  id={`cell-${globalIdx}`}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center relative rounded-xl border-2 shadow-sm", // Bỏ transition-all để tránh giật caret
                    // Màu sắc dựa trên trạng thái nhập liệu và logic điểm tựa thị giác
                    !w ? "border-slate-100 bg-slate-50/50" : (
                      // Tạo điểm tựa: Mỗi cột có 1 ô viền xám (vị trí hàng = (cột + số bảng) mod 5)
                      (Math.floor((globalIdx % 25) / 5) === (globalIdx % 5 + tableIdx) % 5)
                        ? "border-slate-300 bg-white" 
                        : "border-amber-400 bg-white" 
                    ),
                    // Highlight ô đang active - Bỏ scale-105 để caret không bị nhảy
                    activeIndex === globalIdx && "border-blue-600 ring-4 ring-blue-100 z-10 bg-blue-100/30"
                  )}
                >
                  <input
                    id={`input-cell-${globalIdx}`}
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={w || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      // Cho phép nhập tối đa 4 chữ số, không giới hạn giá trị kg
                      if (val.length <= 4) {
                        updateWeight(globalIdx, val)
                        // Tự động nhảy ô nếu nhập đủ số (3 hoặc 4 tùy cài đặt)
                        if (val.length === autoJumpLength) {
                          const nextIdx = getNextIndex(globalIdx)
                          setActiveIndex(nextIdx)
                          // Tăng timeout một chút để ổn định hơn
                          setTimeout(() => {
                            const nextInput = document.getElementById(`input-cell-${nextIdx}`) as HTMLInputElement
                            if (nextInput) nextInput.focus({ preventScroll: true })
                          }, 30)
                        }
                      }
                    }}
                    onFocus={(e) => {
                      setActiveIndex(globalIdx)
                      e.target.select() // Tự động bôi đen để thay thế khi nhập mới
                    }}
                    className={cn(
                      "w-full h-full bg-transparent text-center text-xl font-black focus:outline-none p-0 leading-none", // Thêm p-0 và leading-none để caret ở giữa
                      w ? (
                         (Math.floor((globalIdx % 25) / 5) === (globalIdx % 5 + tableIdx) % 5) ? "text-slate-400" : "text-slate-900"
                      ) : "text-slate-300"
                    )}
                  />
                  {activeIndex === globalIdx && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
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
            {step === "weighing" ? (
              <div className="ml-2 flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                    <Scale className="w-6 h-6 text-white" />
                 </div>
                 <div className="flex flex-col justify-center">
                    <div className="font-black italic text-sm leading-none uppercase tracking-tighter truncate max-w-[150px]">
                      {selectedCropId 
                        ? (isLogin ? onlineCrops : localCrops).find(c => c.id === selectedCropId)?.field_name 
                        : (customCropName.trim() || "Vụ tự do")}
                    </div>
                    <div className="text-[9px] text-blue-100 font-black uppercase mt-1 tracking-tight">ĐANG THỰC HIỆN CÂN LÚA</div>
                 </div>
              </div>
            ) : (
              <div className="ml-2 font-black italic text-lg tracking-tight uppercase">CÂN LÚA</div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {step === "weighing" && (
              <Button 
                variant="ghost" 
                onClick={handleComplete}
                className="text-white hover:bg-white/10 rounded-full h-10 px-3 flex items-center gap-1"
              >
                <Save className="h-5 w-5" />
                <span className="text-sm font-bold">Lưu lại</span>
              </Button>
            )}

            <Button 
              variant="ghost" 
              onClick={() => {
                setStep("history")
                localFarmingService.getAllWeighingRecords().then(setHistory)
              }}
              className={cn("text-white rounded-full h-10 w-10 p-0", step === "history" ? "bg-white/20" : "hover:bg-white/10")}
            >
              <History className="h-5 w-5" />
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
                            onClick={() => {
                               setSelectedCropId(null)
                               setEditingRecordId(null)
                             }}
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
                        onClick={() => {
                          if (selectedCropId === null && !customCropName.trim()) {
                            toast({
                              title: "Thông báo",
                              description: "Vui lòng nhập tên ruộng hoặc chọn vụ lúa để tiếp tục.",
                              variant: "destructive"
                            })
                            return
                          }
                          setStep("weighing")
                        }}
                        className={cn(
                          "w-full h-16 rounded-3xl text-white text-xl font-black shadow-2xl group active:scale-95 transition-all",
                          (selectedCropId !== null || customCropName.trim()) 
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" 
                            : "bg-slate-300 cursor-not-allowed shadow-none"
                        )}
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
                 <div className="bg-white/90 backdrop-blur-md p-3 grid grid-cols-2 gap-3 border-b border-blue-100 sticky top-0 z-30 shadow-sm">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowResultPopup(true)}
                      className="flex flex-col items-center justify-center gap-1 h-14 w-full text-blue-800 hover:bg-blue-100/50 active:scale-95 transition-all bg-blue-50 border border-blue-200 rounded-2xl"
                    >
                       <Calculator className="w-5 h-5 text-blue-600" />
                       <span className="text-[10px] font-black uppercase tracking-tighter leading-none text-center">Kết quả/ Cài đặt</span>
                    </Button>
                    <div className="bg-blue-900 text-white flex flex-col items-center justify-center rounded-2xl shadow-inner h-14 w-full">
                       <div className="text-2xl font-black tracking-tighter leading-none">
                          {weights.reduce((s, w) => s + (w ? parseFloat(w) / 10 : 0), 0).toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
                       </div>
                       <div className="text-[9px] uppercase font-black text-blue-300 mt-1">Tổng kg</div>
                    </div>
                </div>

                <div 
                  ref={scrollContainerRef} 
                  className="flex-1 overflow-y-auto p-4 no-scrollbar pb-10 transition-all duration-300 relative"
                >
                   {[...Array(MAX_TABLES)].map((_, i) => {
                     const startIdx = i * CELLS_PER_TABLE
                     const hasData = weights.slice(startIdx, startIdx + CELLS_PER_TABLE).some(w => w !== "")
                     const isActiveTable = Math.floor(activeIndex / CELLS_PER_TABLE) === i
                     
                     const isPrevTableFull = i > 0 ? weights.slice((i - 1) * CELLS_PER_TABLE, i * CELLS_PER_TABLE).every(w => w !== "") : true
                     
                     // Chỉ render bảng 1 (i=0), hoặc bảng có dữ liệu, hoặc bảng đang nhập, hoặc khi bảng trước đã đầy
                     if (i > 0 && !hasData && !isActiveTable && !isPrevTableFull) return null

                     return renderTable(i)
                   })}

                   {/* BẢNG TÍNH TOÁN KẾT QUẢ - THEO HÌNH 2 & 3 */}
                   <div className="mt-8 mb-20">
                      <div className="bg-[#d32f2f] text-white p-4 rounded-t-2xl font-black text-center text-xl uppercase tracking-widest flex items-center justify-center gap-3">
                         <Calculator className="w-6 h-6" /> KẾT QUẢ
                      </div>
                      {renderResultContent()}
                   </div>
                </div>
                   {/* Quick Result Popup */}
                   {showResultPopup && (
                     <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 flex flex-col justify-end">
                        <div 
                          className="bg-slate-50 rounded-t-[2.5rem] shadow-2xl w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-500"
                          style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.3)' }}
                        >
                           {/* Header Popup */}
                           <div className="flex justify-between items-center p-6 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 bg-[#d32f2f] rounded-2xl flex items-center justify-center shadow-lg">
                                    <Calculator className="w-6 h-6 text-white" />
                                 </div>
                                 <div>
                                    <div className="text-xl font-black text-slate-800 flex items-center gap-2">KẾT QUẢ/ CÀI ĐẶT <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /></div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">Cập nhật đơn giá & các loại trừ</div>
                                  </div>
                               </div>
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => setShowResultPopup(false)}
                                 className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-90"
                               >
                                  <X className="w-6 h-6 text-slate-400" />
                               </Button>
                            </div>

                            {/* Body Popup */}
                            <div className="flex-1 overflow-y-auto p-6 pb-20 no-scrollbar">
                               {renderResultContent()}
                               
                               <div className="mt-8 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                                  <div className="text-sm font-black text-blue-900 uppercase mb-4 text-center">XÁC NHẬN CHỐT SỔ</div>
                                  <Button 
                                    onClick={() => {
                                      setShowResultPopup(false)
                                      handleComplete()
                                    }}
                                    className="w-full h-16 rounded-[1.5rem] bg-blue-900 hover:bg-blue-950 text-white font-black text-xl shadow-xl shadow-blue-200 group relative transition-all active:scale-95"
                                  >
                                     HOÀN TẤT & LƯU
                                     <Check className="ml-3 w-6 h-6 group-hover:scale-125 transition-transform" />
                                  </Button>
                               </div>
                            </div>
                         </div>
                     </div>
                   )}
             </>
           )}

           {/* Floating Draggable Mic Button */}
           {step === "weighing" && (
             <div 
               className="fixed z-[150] touch-none"
               style={{ 
                 left: micPosition.x, 
                 bottom: -micPosition.y,
                 cursor: isDragging ? 'grabbing' : 'grab'
               }}
               onTouchMove={(e) => {
                 const touch = e.touches[0]
                 if (touch) {
                   setMicPosition({
                     x: Math.max(10, Math.min(window.innerWidth - 70, touch.clientX - 30)),
                     y: Math.max(-window.innerHeight + 100, Math.min(-20, touch.clientY - window.innerHeight + 30))
                   })
                   setIsDragging(true)
                 }
               }}
               onTouchEnd={() => setIsDragging(false)}
             >
               <div className="relative">
                 {isListening && (
                   <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-25 scale-150 pointer-events-none" />
                 )}
                 <Button
                   type="button"
                   onClick={() => {
                     if (isDragging) return
                     toggleListening()
                   }}
                   className={cn(
                     "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 border-4 border-white",
                     isListening ? "bg-red-600 scale-110 animate-pulse" : "bg-emerald-600"
                   )}
                 >
                   {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                 </Button>
                 {isListening && (
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap animate-bounce shadow-lg border-2 border-white">
                     ĐANG NGHE...
                   </div>
                 )}
               </div>
             </div>
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
                            onClick={() => handleViewDetail(record)}
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
