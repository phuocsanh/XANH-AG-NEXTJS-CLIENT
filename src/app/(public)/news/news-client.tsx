'use client'

import { Calendar, ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import Img from '@/app/components/Img'
import { useApiQuery } from '@/hooks/use-api'
import { format } from 'date-fns'

interface NewsItem {
  id: number
  title: string
  slug: string
  content: string
  thumbnail_url: string
  created_at: string
  author: string
  category: string
}

interface NewsResponse {
  data: NewsItem[]
  total: number
}

/**
 * News Client Component
 * Trang hiển thị danh sách tất cả tin tức
 */
export default function NewsClient() {
  const { data: newsData, isLoading } = useApiQuery<NewsResponse>('/news/search', {
    queryKey: ['news-list'],
    method: 'POST',
    body: { page: 1, limit: 12 },
  })

  const allNews = newsData?.data || []

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb - Added for SEO and UX */}
      <nav className="bg-gray-50 border-b border-gray-100 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-agri-600 transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-400">Tin tức nông nghiệp</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-r from-agri-600 to-agri-700 text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-6xl font-bold mb-6 text-center text-white tracking-tight">Kỹ Thuật & Tin Tức</h1>
          <p className="text-agri-100 text-center max-w-2xl mx-auto text-sm md:text-lg leading-relaxed">
            Cập nhật những thông tin mới nhất về kỹ thuật canh tác, thị trường nông sản và các giải pháp nông nghiệp bền vững từ chuyên gia Xanh AG.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <section className="lg:w-2/3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-600"></div>
              </div>
            ) : (
              <div className="grid gap-8">
                {allNews.length > 0 ? (
                  allNews.map((news) => (
                    <article key={news.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-agri-200 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row">
                      <div className="md:w-2/5 relative h-56 md:h-auto overflow-hidden">
                        <Img 
                          src={news.thumbnail_url || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop'} 
                          alt={news.title}
                          className="bg-transparent"
                          classNameImg="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-[10px] font-bold text-agri-700 px-3 py-1 bg-agri-50 rounded-full uppercase tracking-wider">
                              {news.category || 'Tin tức'}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <time dateTime={news.created_at}>{format(new Date(news.created_at), 'dd/MM/yyyy')}</time>
                            </div>
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 group-hover:text-agri-600 transition-colors leading-snug tracking-tight">
                            <Link href={`/news/${news.slug}`}>
                              {news.title}
                            </Link>
                          </h2>
                          <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                            {news.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()}
                          </p>
                        </div>
                        <Link 
                          href={`/news/${news.slug}`}
                          className="inline-flex items-center gap-2 text-agri-600 font-bold text-sm hover:gap-3 transition-all"
                        >
                          Đọc chi tiết
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">Chưa có bài viết nào được đăng.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-28 space-y-8">
              {/* Search Widget */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 group">
                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-agri-600 rounded-full"></span>
                  Tìm bài viết
                </h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Nhập nội dung cần tìm..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all text-sm"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5 group-focus-within:text-agri-600 transition-colors" />
                </div>
              </div>

              {/* Categories Widget */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-agri-600 rounded-full"></span>
                  Chuyên mục chính
                </h3>
                <ul className="space-y-4">
                  {['Kỹ thuật canh tác', 'Bảo vệ thực vật', 'Thị trường nông sản', 'Công nghệ xanh', 'Bền vững'].map(cat => (
                    <li key={cat}>
                      <a href="#" className="flex items-center justify-between text-sm text-gray-600 hover:text-agri-600 transition-colors group">
                        <span className="group-hover:translate-x-1 transition-transform">{cat}</span>
                        <span className="bg-agri-50 text-agri-600 px-2.5 py-0.5 rounded-lg text-[10px] font-bold group-hover:bg-agri-600 group-hover:text-white transition-colors tracking-tighter uppercase italic">12</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Banner Widget */}
              <div className="relative h-64 rounded-3xl overflow-hidden group shadow-lg">
                <Img 
                  src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&h=800&fit=crop" 
                  alt="Tư vấn nông nghiệp"
                  className="bg-transparent"
                  classNameImg="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-agri-800/90 via-agri-800/40 to-transparent flex flex-col justify-end p-6">
                  <h4 className="text-white font-bold mb-2">Tư vấn kỹ thuật MIỄN PHÍ</h4>
                  <p className="text-agri-100 text-xs mb-4">Kết nối ngay với các chuyên gia nông nghiệp giàu kinh nghiệm.</p>
                  <Link href="/contact" className="w-max bg-white text-agri-700 px-5 py-2 rounded-xl text-xs font-bold hover:bg-agri-50 transition-colors">
                    Liên hệ ngay
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
