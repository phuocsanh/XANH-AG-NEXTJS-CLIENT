'use client'

import { Calendar, ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import Img from '@/app/components/Img'

interface NewsItem {
  id: number
  title: string
  excerpt: string
  image: string
  date: string
  author: string
  category: string
}

const allNews: NewsItem[] = [
  {
    id: 1,
    title: 'Kỹ thuật trồng lúa bền vững cho năng suất cao',
    excerpt: 'Hướng dẫn chi tiết các bước trồng lúa theo phương pháp bền vững, giúp tăng năng suất và giảm chi phí đầu vào. Phương pháp này không chỉ bảo vệ môi trường mà còn đem lại hiệu quả kinh tế lâu dài cho nhà nông.',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop',
    date: '28/12/2024',
    author: 'Nguyễn Văn A',
    category: 'Kỹ thuật canh tác'
  },
  {
    id: 2,
    title: 'Phòng trừ sâu bệnh hiệu quả trong mùa mưa',
    excerpt: 'Những biện pháp phòng trừ sâu bệnh an toàn và hiệu quả cho cây trồng trong điều kiện thời tiết mưa nhiều. Thời điểm này vi khuẩn và nấm mốc phát triển mạnh, đòi hỏi sự can thiệp kịp thời bằng các chế phẩm sinh học.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
    date: '25/12/2024',
    author: 'Trần Thị B',
    category: 'Bảo vệ thực vật'
  },
  {
    id: 3,
    title: 'Xu hướng nông nghiệp công nghệ cao 2025',
    excerpt: 'Tìm hiểu về các công nghệ mới trong nông nghiệp và cách ứng dụng vào sản xuất để tăng hiệu quả. Từ IoT đến drone, công nghệ đang thay đổi diện mạo của cánh đồng Việt Nam.',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop',
    date: '22/12/2024',
    author: 'Lê Văn C',
    category: 'Công nghệ'
  },
  {
    id: 4,
    title: 'Thị trường gạo xuất khẩu: Cơ hội và thách thức',
    excerpt: 'Phân tích tình hình xuất khẩu gạo của Việt Nam trong quý cuối năm và dự báo cho năm mới. Những thị trường tiềm năng như EU và Trung Đông đang mở ra nhiều cơ hội cho giống lúa chất lượng cao.',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop',
    date: '15/12/2024',
    author: 'Phạm Văn D',
    category: 'Thị trường'
  }
]

/**
 * News Client Component
 * Trang hiển thị danh sách tất cả tin tức
 */
export default function NewsClient() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-agri-600 to-agri-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center text-white">Tin Tức Nông Nghiệp</h1>
          <p className="text-agri-100 text-center max-w-2xl mx-auto">
            Cập nhật những thông tin mới nhất về kỹ thuật, thị trường và công nghệ nông nghiệp
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="grid gap-8">
              {allNews.map((news) => (
                <article key={news.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group flex flex-col md:flex-row">
                  <div className="md:w-2/5 relative h-56 md:h-auto overflow-hidden">
                    <Img 
                      src={news.image} 
                      alt={news.title}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="md:w-3/5 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-agri-600 px-2 py-1 bg-agri-50 rounded uppercase pb-1">
                          {news.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{news.date}</span>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-agri-600 transition-colors tracking-tight">
                        {news.title}
                      </h2>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {news.excerpt}
                      </p>
                    </div>
                    <Link 
                      href={`/news/${news.id}`}
                      className="inline-flex items-center gap-2 text-agri-600 font-bold text-sm hover:gap-3 transition-all"
                    >
                      Đọc tiếp
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-28 space-y-8">
              {/* Search Widget */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Tìm kiếm tin tức</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Nhập từ khóa..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* Categories Widget */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Danh mục</h3>
                <ul className="space-y-3">
                  {['Kỹ thuật canh tác', 'Bảo vệ thực vật', 'Thị trường', 'Công nghệ', 'Vấn đề môi trường'].map(cat => (
                    <li key={cat}>
                      <a href="#" className="flex items-center justify-between text-sm text-gray-600 hover:text-agri-600 transition-colors">
                        <span>{cat}</span>
                        <span className="bg-agri-50 text-agri-600 px-2 py-0.5 rounded-full text-xs font-medium italic">12</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter Widget */}
              <div className="bg-agri-600 p-8 rounded-2xl shadow-lg text-white">
                <h3 className="font-bold text-xl mb-3 pr-2">Đăng ký nhận tin nông nghiệp</h3>
                <p className="text-agri-100 text-sm mb-6 pb-2 border-b border-agri-500/30">
                  Nhận những bài báo mới nhất và tư vấn từ chuyên gia hàng đầu.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Email của bạn"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                  />
                  <button className="w-full bg-white text-agri-700 font-bold py-3 rounded-lg hover:bg-agri-50 transition-colors shadow-lg">
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
