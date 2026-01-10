'use client'

import { useParams } from 'next/navigation'
import { Calendar, ArrowLeft, Share2, Facebook, Twitter } from 'lucide-react'
import Link from 'next/link'
import Img from '@/app/components/Img'

/**
 * News Detail Client Component
 * Component hiển thị chi tiết bài viết tin tức phụ trách các logic phía client
 */
export default function NewsDetailClient() {
  const params = useParams()
  const id = params.id

  // In real app, fetch data based on ID
  const news = {
    id,
    title: 'Kỹ thuật trồng lúa bền vững cho năng suất cao',
    date: '28/12/2024',
    author: 'Nguyễn Văn A',
    category: 'Kỹ thuật canh tác',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
    content: `
      <p className="mb-6">Nông nghiệp bền vững không chỉ là một xu hướng mà là con đường tất yếu để bảo vệ môi trường và đảm bảo an ninh lương thực. Đối với cây lúa, việc áp dụng các kỹ thuật canh tác tiên tiến giúp giảm đáng kể chi phí phân bón và thuốc trừ sâu.</p>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Chọn giống lúa chất lượng cao</h2>
      <p className="mb-6">Việc chọn giống là khâu quan trọng nhất. Nên ưu tiên các giống lúa có khả năng chống chịu sâu bệnh tốt, chịu phèn mặn và phù hợp với thổ nhưỡng từng vùng. Các giống lúa thơm xuất khẩu đang là lựa chọn ưu tiên của bà con.</p>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Kỹ thuật làm đất và bón lót</h2>
      <p className="mb-6">Đất cần được cày ải kỹ, phơi đất ít nhất 15 ngày trước khi xuống giống để diệt mầm bệnh. Bón lót bằng phân hữu cơ vi sinh thay vì chỉ dùng phân hóa học giúp cải tạo đất và tạo nền tảng tốt cho bộ rễ phát triển mạnh.</p>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Quản lý nước thông minh</h2>
      <p className="mb-6">Áp dụng kỹ thuật tưới "ướt khô xen kẽ" không chỉ tiết kiệm nước mà còn giúp rễ lúa ăn sâu, cây cứng cáp, ít đổ ngã và giảm phát thải khí nhà kính.</p>
      
      <blockquote className="border-l-4 border-agri-500 pl-6 py-4 my-8 bg-agri-50 italic text-gray-700">
        "Áp dụng kỹ thuật đúng giúp tăng năng suất trung bình từ 15-20% trong khi giảm 30% chi phí đầu vào." - Chuyên gia nông nghiệp chia sẻ.
      </blockquote>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Phòng trừ sâu bệnh theo hướng sinh học</h2>
      <p className="mb-6">Ưu tiên sử dụng các chế phẩm sinh học, nấm đối kháng để quản lý sâu bệnh. Chỉ sử dụng thuốc bảo vệ thực vật khi thật sự cần thiết và tuân thủ nguyên tắc 4 đúng.</p>
    `
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <div className="relative h-[400px] md:h-[500px]">
        <Img 
          src={news.image} 
          alt={news.title}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-12 left-0 w-full">
          <div className="container mx-auto px-4">
            <Link 
              href="/news"
              className="inline-flex items-center gap-2 text-agri-100 hover:text-white mb-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại tin tức</span>
            </Link>
            <div className="flex items-center gap-4 text-agri-200 mb-4">
              <span className="bg-agri-600 text-white px-3 py-1 rounded-md text-sm font-bold pb-1 shadow-lg">
                {news.category}
              </span>
              <div className="flex items-center gap-1 text-sm bg-black/20 px-2 py-1 rounded">
                <Calendar className="w-4 h-4" />
                <span>{news.date}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl tracking-tight">
              {news.title}
            </h1>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-full bg-agri-500 flex items-center justify-center font-bold border-2 border-white/50">
                {news.author[0]}
              </div>
              <div>
                <p className="font-bold text-sm leading-none mb-1">{news.author}</p>
                <p className="text-xs text-white/60">Tác giả chuyên mục Tin tức</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Article Full Content */}
          <div className="lg:w-2/3">
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed product-description" 
                 dangerouslySetInnerHTML={{ __html: news.content }}>
            </div>
            
            {/* Tags & Action */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400">Từ khóa:</span>
                {['Kỹ thuật', 'Lúa', 'Năng suất', 'Bền vững'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 hover:bg-agri-50 hover:text-agri-600 cursor-pointer transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400">Chia sẻ:</span>
                <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-500 hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-800 hover:text-white transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-28 space-y-10">
              {/* Related Products */}
              <div className="bg-agri-50 p-8 rounded-3xl border border-agri-100">
                <h3 className="font-bold text-xl text-agri-800 mb-6 flex items-center gap-2">
                  Sản phẩm liên quan
                </h3>
                <div className="space-y-6">
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative">
                        <Img 
                          src={`https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=200&h=200&fit=crop`} 
                          alt="Sản phẩm liên quan"
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-gray-800 group-hover:text-agri-600 transition-colors line-clamp-2">
                          Phân bón lá NPK cao cấp giúp lúa trổ đều
                        </h4>
                        <p className="text-agri-600 font-bold mt-1 text-sm">Liên hệ</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link 
                  href="/products" 
                  className="mt-8 block w-full py-3 bg-white border border-agri-200 text-agri-700 font-bold rounded-xl text-center hover:bg-agri-600 hover:text-white hover:border-agri-600 transition-all shadow-sm"
                >
                  Xem tất cả sản phẩm
                </Link>
              </div>

              {/* Newsletter */}
              <div className="relative overflow-hidden bg-gradient-to-br from-agri-600 to-agri-800 p-8 rounded-3xl text-white shadow-xl">
                 <h4 className="text-xl font-bold mb-4 z-10 relative">Bản tin Xanh AG</h4>
                 <p className="text-agri-100 text-sm mb-6 pb-2 border-b border-agri-500/30 z-10 relative leading-relaxed">
                   Đăng ký nhận những kỹ thuật canh tác mới nhất từ đội ngũ kỹ sư của chúng tôi.
                 </p>
                 <div className="space-y-3 z-10 relative">
                    <input 
                      type="email" 
                      placeholder="Email của bạn"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder:text-white/50 focus:outline-none"
                    />
                    <button className="w-full bg-white text-agri-700 font-bold py-3 rounded-xl hover:bg-agri-50 transition-colors">
                      Đăng ký ngay
                    </button>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 opacity-20 transform translate-x-10 -translate-y-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                      <path d="M50,10 Q80,30 90,60 Q85,80 60,90 Q40,85 30,60 Q20,30 50,10 Z" />
                    </svg>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-description :global(p) { margin-bottom: 1.5rem; }
        .product-description :global(h2) { margin-top: 2.5rem; margin-bottom: 1rem; color: #1f2937; }
      `}</style>
    </div>
  )
}
