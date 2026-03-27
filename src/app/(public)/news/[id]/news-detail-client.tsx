'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Calendar, ArrowLeft, Share2, Facebook, Twitter } from 'lucide-react'
import Link from 'next/link'
import Img from '@/app/components/Img'
import { useApiQuery } from '@/hooks/use-api'
import { format } from 'date-fns'
import { convertCurrency } from '@/lib/utils'
interface NewsItem {
  id: number
  title: string
  slug: string
  content: string
  thumbnail_url: string
  images: string[]
  created_at: string
  author: string
  category: string
  tags: string[]
  related_product_ids?: number[]
}

/**
 * News Detail Client Component
 * Component hiển thị chi tiết bài viết tin tức phụ trách các logic phía client
 */
export default function NewsDetailClient() {
  const params = useParams()
  const slug = params.id as string

  // Fetch data từ API bài viết theo slug
  const { data: news, isLoading: isNewsLoading, error } = useApiQuery<NewsItem>(`/news/slug/${slug}`, {
    queryKey: ['news-detail', slug],
    enabled: !!slug,
  })

  // Fetch sản phẩm liên quan nếu có
  const relatedProductIds = news?.related_product_ids || []
  const { data: relatedProductsResponse, isLoading: isProductsLoading } = useApiQuery<{ data: any[] }>(`/products/search`, {
    queryKey: ['related-products', JSON.stringify(relatedProductIds)],
    method: 'POST',
    body: {
      ids: relatedProductIds,
      limit: 10,
      is_sold_on_web: true,
    },
    enabled: relatedProductIds.length > 0,
  })

  const relatedProducts = (relatedProductsResponse?.data || []).filter((product: any) => product.is_sold_on_web === true)

  if (isNewsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-600"></div>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy bài viết</h2>
        <Link href="/news" className="text-agri-600 font-bold hover:underline"> Quay lại danh sách tin tức</Link>
      </div>
    )
  }

  return (
    <>
      <article className="min-h-screen bg-white">
        {/* Breadcrumb - Added for SEO and UX */}
        <nav className="bg-gray-50 border-b border-gray-100 py-3 hidden sm:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/" className="hover:text-agri-600 transition-colors">Trang chủ</Link>
              <span>/</span>
              <Link href="/news" className="hover:text-agri-600 transition-colors">Tin tức</Link>
              <span>/</span>
              <span className="text-gray-400 line-clamp-1">{news.title}</span>
            </div>
          </div>
        </nav>

        {/* Article Header */}
        <header className="relative h-[300px] sm:h-[400px] md:h-[500px]">
          <Img 
            src={news.thumbnail_url || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop'} 
            alt={news.title}
            className="bg-transparent"
            classNameImg="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-6 sm:bottom-12 left-0 w-full">
            <div className="container mx-auto px-4">
              <Link 
                href="/news"
                className="inline-flex items-center gap-2 text-agri-100 hover:text-white mb-4 sm:mb-6 bg-white/10 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-2 rounded-full transition-all text-xs sm:text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại tin tức</span>
              </Link>
              <div className="flex items-center gap-4 text-agri-200 mb-2 sm:mb-4">
                <span className="bg-agri-600 text-white px-3 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-bold shadow-lg">
                  {news.category || 'Tin tức'}
                </span>
                <div className="flex items-center gap-1 text-[10px] sm:text-sm bg-black/20 px-2 py-0.5 sm:py-1 rounded">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <time dateTime={news.created_at}>
                    {format(new Date(news.created_at), 'dd/MM/yyyy')}
                  </time>
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-6 max-w-5xl tracking-tight leading-[1.2] sm:leading-[1.3]">
                <span className="bg-black/30 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-2xl [box-decoration-break:clone] [-webkit-box-decoration-break:clone] inline shadow-2xl border border-white/10">
                  {news.title}
                </span>
              </h1>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-agri-500 flex items-center justify-center font-bold border-2 border-white/50 text-sm">
                  {(news.author || 'A')[0]}
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm leading-none mb-1">{news.author || 'Ban biên tập Xanh AG'}</p>
                  <p className="text-[10px] sm:text-xs text-white/60">Tác giả chuyên mục Tin tức</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Reduced vertical padding on mobile */}
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Article Full Content */}
            <section className="lg:w-2/3">
              <div className="prose prose-sm sm:prose-lg max-w-none text-gray-600 leading-relaxed product-description" 
                   dangerouslySetInnerHTML={{ __html: news.content }}>
              </div>
              
              {/* Gallery images nếu có nhiều ảnh */}
              {news.images && news.images.length > 0 && (
                <section className="mt-12">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 font-primary text-center sm:text-left">Hình ảnh liên quan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {news.images.map((img, idx) => (
                      <div key={idx} className="rounded-2xl overflow-hidden shadow-md h-48 sm:h-64 relative group">
                        <Img 
                          src={img} 
                          alt={`${news.title} - ${idx + 1}`}
                          className="bg-transparent"
                          classNameImg="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tags & Action */}
              <footer className="mt-8 sm:mt-12 pt-8 border-t border-gray-100 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-bold text-gray-400 whitespace-nowrap mr-1">Từ khóa:</span>
                  {(news.tags || []).length > 0 ? (
                    news.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] sm:text-xs text-gray-500 hover:bg-agri-50 hover:text-agri-600 cursor-pointer transition-colors whitespace-nowrap">
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">Không có từ khóa</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400">Chia sẻ:</span>
                  <button title="Facebook" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button title="Twitter" className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-500 hover:text-white transition-all">
                    <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button title="Share" className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-800 hover:text-white transition-all">
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </footer>
            </section>

            {/* Sidebar */}
            <aside className="lg:w-1/3">
              <div className="sticky top-28 space-y-10">
                {/* Related Products Widget */}
                <section className="bg-agri-50 p-6 sm:p-8 rounded-3xl border border-agri-100">
                  <h3 className="font-bold text-lg sm:text-xl text-agri-800 mb-6 flex items-center gap-2 font-primary">
                    Sản phẩm liên quan
                  </h3>
                  
                  {isProductsLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin h-6 w-6 border-2 border-agri-600 border-t-transparent rounded-full"></div>
                    </div>
                  ) : relatedProducts.length > 0 ? (
                    <div className="space-y-6">
                      {relatedProducts.map((product: any) => (
                        <Link 
                          key={product.id} 
                          href={`/products?id=${product.id}`}
                          className="flex gap-4 group cursor-pointer"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative">
                            <Img 
                              src={
                                (product.pictures && product.pictures.length > 0) 
                                ? product.pictures[0] 
                                : (product.thumb || `https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=200&h=200&fit=crop`)
                              } 
                              alt={product.web_name || product.trade_name || product.name || product.productName}
                              className="bg-transparent"
                              classNameImg="object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-agri-600 transition-colors line-clamp-2">
                              {product.web_name || product.trade_name || product.name || product.productName}
                            </h4>
                            <p className="text-agri-600 font-bold mt-1 text-xs sm:text-sm font-primary">
                              {product.show_price_on_web !== false && (product.price || product.productPrice) && parseFloat(product.price || product.productPrice) > 0 
                                ? convertCurrency(parseFloat(product.price || product.productPrice)) 
                                : 'Liên hệ: 0987.383.606'}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm text-center">Không có sản phẩm liên quan</p>
                  )}
                  
                  <Link 
                    href="/products" 
                    className="mt-8 block w-full py-3 bg-white border border-agri-200 text-agri-700 font-bold rounded-xl text-center hover:bg-agri-600 hover:text-white hover:border-agri-600 transition-all shadow-sm text-sm"
                  >
                    Xem tất cả sản phẩm
                  </Link>
                </section>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <style jsx>{`
        .product-description :global(p) { margin-bottom: 1rem; }
        .product-description :global(h2) { margin-top: 2rem; margin-bottom: 0.75rem; color: #1f2937; line-height: 1.3; }
        .product-description :global(ul) { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 1.25rem; }
        .product-description :global(ol) { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 1.25rem; }
        .product-description :global(li) { margin-bottom: 0.4rem; }
        .product-description :global(img) { border-radius: 0.75rem; margin: 1.5rem 0; width: 100%; height: auto; }
        
        @media (min-width: 640px) {
          .product-description :global(p) { margin-bottom: 1.5rem; }
          .product-description :global(h2) { margin-top: 2.5rem; margin-bottom: 1rem; }
          .product-description :global(img) { border-radius: 1rem; margin: 2rem 0; }
        }
      `}</style>
    </>
  )
}
