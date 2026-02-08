"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { getRemoteValue, getAllRemoteValues } from "@/lib/firebase"

interface VoiceToFormButtonProps {
  onDataParsed: (data: any) => void
  categories: { id: number; name: string }[]
  className?: string
}

export default function VoiceToFormButton({
  onDataParsed,
  categories,
  className,
}: VoiceToFormButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const { toast } = useToast()
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Kiểm tra và khởi tạo SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "vi-VN"

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript
        handleParseText(text)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  // Hàm bóc tách dữ liệu bằng Gemini trực tiếp ở FE
  const handleParseText = async (text: string) => {
    setIsParsing(true)
    try {
      // 1. Lấy API Key từ Remote Config (giống logic bên server)
      const keys = await getAllRemoteValues('GEMINI_API_KEY_');
      let apiKey: string = "";
      
      if (keys.length > 0) {
        apiKey = keys[Math.floor(Math.random() * keys.length)] || "";
      } else {
        // Fallback nếu không tìm thấy key theo prefix
        apiKey = await getRemoteValue('GOOGLE_AI_API_KEY') || "";
      }

      if (!apiKey) throw new Error("Không tìm thấy Gemini API Key");

      // 2. Gọi Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
Hãy đóng vai một trợ lý quản lý nông nghiệp thông minh. 
Nhiệm vụ: Trích xuất thông tin chi phí từ câu nói của người nông dân sang định dạng JSON để điền vào form.

CÂU NÓI: "${text}"

DANH SÁCH LOẠI CHI PHÍ (CATEGORY):
${categories.map(c => `- ID: ${c.id}, Tên: ${c.name}`).join('\n')}

YÊU CẦU TRÍCH XUẤT:
1. item_name: Tên sản phẩm hoặc dịch vụ.
2. total_cost: Tổng số tiền (số nguyên). Phải xử lý các tiếng lóng:
   - "ngàn", "k", "nghìn" -> x 1.000 (Vd: 500 ngàn -> 500000)
   - "triệu", "củ" -> x 1.000.000 (Vd: 2 củ -> 2000000)
   - "xị", "lít", "loét" -> x 100.000 (Vd: 5 xị -> 500000)
   - Nếu nói "năm trăm" mà không có đơn vị, thường là 500.000 VNĐ.
3. category_id: ID phù hợp nhất từ danh sách trên, nếu không rõ để null.
4. expense_date: Ngày (YYYY-MM-DD). Hôm nay là ${new Date().toISOString().split('T')[0]}.
5. notes: Số lượng, đơn giá hoặc lưu ý khác.

Chỉ trả về JSON:
{
  "item_name": string,
  "total_cost": number,
  "category_id": number | null,
  "expense_date": string,
  "notes": string
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text());

      onDataParsed(data)
      toast({
        title: "Đã tự động điền form",
        description: `Nội dung: "${text}"`,
      })
    } catch (error: any) {
      console.error("AI Parse Error:", error);
      toast({
        title: "Lỗi phân tích AI",
        description: "Không thể kết nối Gemini hoặc bóc tách dữ liệu.",
        variant: "destructive",
      })
      // Vẫn điền tên vào nếu AI lỗi
      onDataParsed({ item_name: text })
    } finally {
      setIsParsing(false)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Không hỗ trợ",
        description: "Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      className={cn(
        "gap-2 h-9 rounded-full px-3",
        isListening && "animate-pulse",
        className
      )}
      onClick={toggleListening}
      disabled={isParsing}
    >
      {isParsing ? (
        <Loader2 className="h-4 w-4 animate-spin text-agri-600" />
      ) : isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4 text-agri-600" />
      )}
      <span className="text-xs font-semibold">
        {isParsing ? "Đang xử lý..." : isListening ? "Đang nghe..." : "Nhập bằng giọng nói"}
      </span>
    </Button>
  )
}
