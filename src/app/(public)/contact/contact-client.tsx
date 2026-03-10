'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/**
 * Contact Page
 * Trang liên hệ với form và thông tin bản đồ
 */
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Gửi thông báo thành công
    toast({
      title: "Gửi tin nhắn thành công!",
      description: "Cảm ơn bạn đã liên hệ. Xanh AG sẽ phản hồi sớm nhất có thể.",
    })
    
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-agri-50 to-white pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-600 to-agri-700 text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên Hệ</h1>
          <p className="text-agri-100 max-w-2xl mx-auto text-lg">
            Xanh AG luôn sẵn sàng lắng nghe và tư vấn giải pháp tốt nhất cho mùa vụ của bạn.
          </p>
        </div>
        {/* Abstract leaf shape decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 transform translate-x-32 -translate-y-32">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
            <path d="M50,10 Q80,30 90,60 Q85,80 60,90 Q40,85 30,60 Q20,30 50,10 Z" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 mb-12 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center gap-4 transform hover:-translate-y-1 transition-transform border-t-4 border-agri-500">
                <div className="w-12 h-12 bg-agri-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-agri-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Địa chỉ</h3>
                  <p className="text-gray-600 text-sm">
                    Số nhà 257, Tân Hòa A, Tân Hiệp - An Giang
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center gap-4 transform hover:-translate-y-1 transition-transform border-t-4 border-accent-gold">
                <div className="w-12 h-12 bg-agri-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="text-agri-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Điện thoại</h3>
                  <a href="tel:0987383606" className="text-agri-600 text-sm font-bold hover:underline block">0987.383.606</a>
                  <p className="text-gray-500 text-xs mt-1">Hỗ trợ khách hàng 24/7</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center gap-4 transform hover:-translate-y-1 transition-transform border-t-4 border-agri-400">
                <div className="w-12 h-12 bg-agri-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="text-agri-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Email</h3>
                  <a href="mailto:phuocsanhtps@gmail.com" className="text-gray-600 text-sm hover:text-agri-600 transition-colors block">phuocsanhtps@gmail.com</a>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center gap-4 transform hover:-translate-y-1 transition-transform border-t-4 border-agri-300">
                <div className="w-12 h-12 bg-agri-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-agri-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Giờ mở cửa</h3>
                  <p className="text-gray-600 text-sm">Thứ 2 - Chủ Nhật</p>
                  <p className="text-gray-600 text-sm font-semibold">07:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-4 h-[500px] overflow-hidden border border-gray-100">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29539.09235150459!2d105.2500775!3d10.1288883!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0a5cce1d733c7%3A0xa2864e2504d6969c!2zQ-G7rWEgaMOgbmcgVlROTiBYQU5I!5e1!3m2!1svi!2s!4v1773149127517!5m2!1svi!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Vị trí Xanh AG trên Google Maps"
            className="rounded-xl"
          ></iframe>
        </div>
      </div>
    </div>
  )
}
