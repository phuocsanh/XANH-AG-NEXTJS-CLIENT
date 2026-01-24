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
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4 transform hover:-translate-y-1 transition-transform">
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

            <div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4 transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-agri-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="text-agri-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Điện thoại</h3>
                <p className="text-gray-600 text-sm font-semibold">0987.383.606</p>
                <p className="text-gray-500 text-xs">Hỗ trợ khách hàng 24/7</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4 transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-agri-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="text-agri-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Email</h3>
                <p className="text-gray-600 text-sm">contact@xanhag.com</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4 transform hover:-translate-y-1 transition-transform">
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

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 md:p-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi tin nhắn cho chúng tôi</h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập tên của bạn"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium text-gray-700">Địa chỉ Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@gmail.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium text-gray-700">Chủ đề</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Bạn quan tâm đến vấn đề gì?"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium text-gray-700">Tin nhắn</label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Lời nhắn của bạn..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-agri-600 hover:bg-agri-700 text-white px-8 py-4 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                    >
                      <Send className="w-5 h-5" />
                      Gửi tin nhắn ngay
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-4 h-[400px] overflow-hidden">
          {/* Placeholder for Google Maps - in real world use an iframe or map library */}
          <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center relative group">
            <div className="text-center z-10">
              <MapPin className="w-12 h-12 text-agri-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Bản đồ đang được tải...</p>
              <p className="text-xs text-gray-400 mt-2">Số nhà 257, Tân Hòa A, Tân Hiệp - An Giang</p>
            </div>
            {/* Dark overlay with link to Google Maps */}
            <a 
              href="https://www.google.com/maps/search/An+Giang+Tân+Hiệp" 
              target="_blank" 
              className="absolute inset-0 bg-agri-900/0 group-hover:bg-agri-900/10 transition-colors flex items-center justify-center"
            >
              <span className="opacity-0 group-hover:opacity-100 bg-white text-agri-700 px-4 py-2 rounded-full font-bold shadow-lg transition-opacity duration-300">
                Mở trong Google Maps
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
