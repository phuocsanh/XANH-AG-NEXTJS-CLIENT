"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Phone, Mail, MapPin, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsActivePath } from "@/hooks/useIsActivePath"
import FloatingChatWindow from "./FloatingChatWindow"

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isOnChatPage = useIsActivePath("/chat")

  // Xử lý click bên ngoài để đóng menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Xử lý các hành động
  const handleChatClick = () => {
    setIsChatOpen(true)
    setIsOpen(false)
  }

  const handleCallClick = () => {
    window.location.href = "tel:+84123456789"
    setIsOpen(false)
  }

  const handleEmailClick = () => {
    window.location.href = "mailto:support@gnfarm.com"
    setIsOpen(false)
  }

  const handleLocationClick = () => {
    window.open("https://maps.google.com/?q=GN+Farm", "_blank")
    setIsOpen(false)
  }

  // Nếu đang ở trang chat, không hiển thị nút
  if (isOnChatPage) return null

  return (
    <>
      {/* Floating Chat Window */}
      <FloatingChatWindow open={isChatOpen} onOpenChange={setIsChatOpen} />

      <div ref={menuRef} className='fixed bottom-6 right-6 z-50'>
        {/* Menu tùy chọn */}
        {isOpen && (
          <div className='absolute bottom-16 right-0 bg-white rounded-lg shadow-lg overflow-hidden w-64 transition-all duration-300 ease-in-out'>
            <div className='p-2'>
              {/* Tùy chọn gọi điện */}
              <button
                onClick={handleCallClick}
                className='flex items-center w-full p-3 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <div className='flex justify-center items-center w-10 h-10 rounded-full bg-red-500 text-white'>
                  <Phone size={20} />
                </div>
                <span className='ml-3 text-gray-800 font-medium'>
                  Gọi ngay cho chúng tôi
                </span>
              </button>

              {/* Tùy chọn chat */}
              <button
                onClick={handleChatClick}
                className='flex items-center w-full p-3 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <div className='flex justify-center items-center w-10 h-10 rounded-full bg-blue-500 text-white'>
                  <MessageCircle size={20} />
                </div>
                <span className='ml-3 text-gray-800 font-medium'>
                  Chat với chúng tôi
                </span>
              </button>

              {/* Tùy chọn email */}
              <button
                onClick={handleEmailClick}
                className='flex items-center w-full p-3 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <div className='flex justify-center items-center w-10 h-10 rounded-full bg-green-500 text-white'>
                  <Mail size={20} />
                </div>
                <span className='ml-3 text-gray-800 font-medium'>
                  Để lại tin nhắn
                </span>
              </button>

              {/* Tùy chọn địa chỉ */}
              <button
                onClick={handleLocationClick}
                className='flex items-center w-full p-3 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <div className='flex justify-center items-center w-10 h-10 rounded-full bg-yellow-500 text-white'>
                  <MapPin size={20} />
                </div>
                <span className='ml-3 text-gray-800 font-medium'>
                  Xem địa chỉ doanh nghiệp
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Nút chat chính */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
            isOpen ? "bg-white" : "bg-pink-200 hover:bg-pink-300"
          )}
        >
          {isOpen ? (
            <X className='w-6 h-6 text-red-500' />
          ) : (
            <div className='relative w-full h-full flex items-center justify-center'>
              <img
                src='https://cdn-icons-png.flaticon.com/128/8044/8044419.png'
                alt='Chat'
                className='w-8 h-8 object-contain'
              />
            </div>
          )}
        </button>
      </div>
    </>
  )
}
