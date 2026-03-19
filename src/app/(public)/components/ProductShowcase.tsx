'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Leaf, ArrowRight } from 'lucide-react'
import ProductDetailModal from './ProductDetailModal'
import Img from '@/app/components/Img'

interface ProductType {
  id: number
  name: string
  code: string
  status: string
}

interface Product {
  id: number
  name: string
  code: string
  trade_name: string
  web_name?: string
  volume?: string
  price?: string
  credit_price?: string
  retail_price?: number
  wholesale_price?: number
  description?: string
  thumb?: string
  pictures?: string[]
  ingredient?: string[]
  notes?: string
  mechanism?: string
  type: number
  show_price_on_web?: boolean
  unit?: {
    id: number
    name: string
  }
  symbol?: {
    id: number
    name: string
  }
}

/**
 * Product Showcase Component
 * Hiển thị sản phẩm phân theo từng danh mục
 */
export default function ProductShowcase() {
  const [productsByType, setProductsByType] = useState<{ type: ProductType, products: Product[] }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch product types and initial products
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const typesResponse = await fetch('/api/product-types')
        if (!typesResponse.ok) throw new Error('Failed to fetch product types')
        
        const typesData = await typesResponse.json()
        
        if (typesData.success && typesData.data) {
          const types: ProductType[] = typesData.data
          
          // Fetch products for each type (Max 10 per type for homepage)
          const productsPromises = types.map(async (type) => {
            const productsResponse = await fetch(`/api/products/by-type/${type.id}?limit=10`)
            if (!productsResponse.ok) return { type, products: [] }
            
            const productsData = await productsResponse.json()
            return {
              type,
              products: productsData.success && productsData.data ? productsData.data : []
            }
          })
          
          const results = await Promise.all(productsPromises)
          // Only show types that have products
          setProductsByType(results.filter(r => r.products.length > 0))
        }
      } catch (error) {
        console.error('Error fetching showcase data:', error)
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-agri-500 border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      </section>
    )
  }

  if (error || productsByType.length === 0) {
    return null
  }

  return (
    <section className="py-8 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-agri-900 mb-4 uppercase tracking-tighter">
            Danh mục <span className="text-accent-gold">sản phẩm</span>
          </h2>
          <div className="flex justify-center items-center gap-4 mb-2">
             <div className="h-[2px] w-12 bg-agri-200" />
             <Leaf className="w-6 h-6 text-agri-500" />
             <div className="h-[2px] w-12 bg-agri-200" />
          </div>
        </div>

        {/* Product Sections by Type */}
        <div className="space-y-16 md:space-y-24">
          {productsByType.map((group: { type: ProductType, products: Product[] }) => (
            <div key={group.type.id} className="relative">
              {/* Category Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-2 h-8 bg-agri-500 rounded-full" />
                    {group.type.name}
                  </h3>
                  <p className="text-gray-500 mt-2 font-medium">Sản phẩm chất lượng cao từ Xanh AG</p>
                </div>
                
                <Link
                  href={`/products#type-${group.type.id}`}
                  className="inline-flex items-center gap-2 text-agri-600 font-bold hover:text-agri-700 group/link transition-all"
                >
                  Xem tất cả
                  <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                {group.products.map((product: Product, index: number) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product)
                      setIsModalOpen(true)
                    }}
                    className="group"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-50 relative">
                      {/* Product Image */}
                      <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                        {product.pictures && product.pictures.length > 0 ? (
                          <Img
                            src={product.pictures[0] || ''}
                            alt={product.web_name || product.name}
                            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : product.thumb ? (
                          <Img
                            src={product.thumb || ''}
                            alt={product.web_name || product.name}
                            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="flex items-center justify-center">
                            <Leaf className="w-16 h-16 text-gray-200" />
                          </div>
                        )}
                        
                      </div>

                      {/* Info */}
                      <div className="p-3 md:p-4 bg-white text-left">
                        <h4 className="text-[13px] md:text-[15px] leading-tight font-bold text-gray-900 line-clamp-4 min-h-[3.8rem] md:min-h-[4.5rem] group-hover:text-agri-600 transition-colors">
                          {product.web_name || product.trade_name || product.name}
                        </h4>
                        <div className="mt-2 flex flex-col justify-end min-h-[2.5rem] md:min-h-[2.8rem]">
                          <p className={`font-black text-agri-600 leading-tight ${
                            product.show_price_on_web !== false && product.price && Number(product.price) > 0
                              ? 'text-base md:text-lg'
                              : 'text-[10px] md:text-[12px]'
                          }`}>
                            {product.show_price_on_web !== false && product.price && Number(product.price) > 0
                              ? new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(Number(product.price))
                              : 'Giá liên hệ: 0987.383.606'}
                          </p>
                        </div>
                      </div>

                      {/* Subtle hover overlay */}
                      <div className="absolute inset-0 border-2 border-agri-500/0 group-hover:border-agri-500/20 rounded-[1.5rem] transition-all pointer-events-none" />
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Mobile View All Button - visible only on small screens */}
              <div className="mt-8 flex md:hidden justify-center">
                <Link
                  href={`/products#type-${group.type.id}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-full text-sm font-bold transition-all w-full text-center"
                >
                  Xem thêm sản phẩm {group.type.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Global View All Section */}
        <div className="mt-20 flex flex-col items-center">
          <div className="bg-gradient-to-br from-agri-600 to-agri-800 rounded-[2.5rem] p-8 md:p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden text-center text-white">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-20 translate-x-20" />
             <div className="relative z-10">
               <h3 className="text-2xl md:text-4xl font-extrabold mb-4 uppercase">Bạn đang tìm kiếm gì khác?</h3>
               <p className="text-agri-100 mb-8 max-w-xl mx-auto italic font-medium opacity-80">"Xanh AG cam kết mang đến những sản phẩm nông nghiệp sạch, chất lượng và giải pháp canh tác thông minh nhất cho bà con."</p>
               <Link
                href="/products"
                className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-4 rounded-2xl font-black transition-all transform hover:scale-105 shadow-xl uppercase tracking-wider"
              >
                Khám phá tất cả sản phẩm
                <ArrowRight className="w-6 h-6" />
              </Link>
             </div>
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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

