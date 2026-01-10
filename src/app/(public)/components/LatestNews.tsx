'use client'

import { Calendar, User, ArrowRight } from 'lucide-react'
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

// Mock data - sẽ được thay thế bằng data từ API
const mockNews: NewsItem[] = [
  {
    id: 1,
    title: 'Kỹ thuật trồng lúa bền vững cho năng suất cao',
    excerpt: 'Hướng dẫn chi tiết các bước trồng lúa theo phương pháp bền vững, giúp tăng năng suất và giảm chi phí đầu vào...',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop',
    date: '28/12/2024',
    author: 'Nguyễn Văn A',
    category: 'Kỹ thuật canh tác'
  },
  {
    id: 2,
    title: 'Phòng trừ sâu bệnh hiệu quả trong mùa mưa',
    excerpt: 'Những biện pháp phòng trừ sâu bệnh an toàn và hiệu quả cho cây trồng trong điều kiện thời tiết mưa nhiều...',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
    date: '25/12/2024',
    author: 'Trần Thị B',
    category: 'Bảo vệ thực vật'
  },
  {
    id: 3,
    title: 'Xu hướng nông nghiệp công nghệ cao 2025',
    excerpt: 'Tìm hiểu về các công nghệ mới trong nông nghiệp và cách ứng dụng vào sản xuất để tăng hiệu quả...',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop',
    date: '22/12/2024',
    author: 'Lê Văn C',
    category: 'Công nghệ'
  }
]

/**
 * Latest News Component
 * Section "TIN TỨC MỚI NHẤT" hiển thị các bài viết mới nhất
 */
export default function LatestNews() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-agri-50">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-accent-gold mb-4">
            TIN TỨC MỚI NHẤT
          </h2>
          <div className="flex justify-center mb-4">
            <svg width="80" height="20" viewBox="0 0 80 20" className="text-accent-gold">
              <path
                d="M5,10 Q10,5 15,10 T25,10 T35,10 T45,10 T55,10 T65,10 T75,10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cập nhật những thông tin mới nhất về kỹ thuật canh tác, chăm sóc cây trồng và xu hướng nông nghiệp
          </p>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {mockNews.map((news, index) => (
            <article
              key={news.id}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Image */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <Img
                  src={news.image}
                  alt={news.title}
                  className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-accent-gold text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {news.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{news.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{news.author}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-agri-600 transition-colors">
                  {news.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {news.excerpt}
                </p>

                {/* Read More */}
                <Link
                  href={`/news/${news.id}`}
                  className="inline-flex items-center gap-2 text-agri-600 hover:text-agri-700 font-semibold text-sm group-hover:gap-3 transition-all"
                >
                  <span>Đọc thêm</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-12">
          <Link
            href="/news"
            className="bg-agri-600 hover:bg-agri-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Xem tất cả tin tức
          </Link>
        </div>
      </div>

      {/* Add fadeInUp animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
