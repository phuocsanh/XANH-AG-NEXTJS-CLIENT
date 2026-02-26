'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
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
 * Section "DANH MỤC SẢN PHẨM" với category tabs và product grid
 */
export default function ProductShowcase() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [activeTypeId, setActiveTypeId] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // State để track lỗi khi fetch data
  const [error, setError] = useState<string | null>(null)

  // Fetch product types khi component mount
  useEffect(() => {
    async function fetchProductTypes() {
      try {
        const response = await fetch('/api/product-types')
        if (!response.ok) throw new Error('Failed to fetch product types')
        
        const data = await response.json()
        // Backend trả về { success, data, meta }
        if (data.success && data.data) {
          setProductTypes(data.data)
          // Set active type là type đầu tiên
          if (data.data.length > 0) {
            setActiveTypeId(data.data[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching product types:', error)
        setError('Không thể tải danh mục sản phẩm. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchProductTypes()
  }, [])

  // Fetch products khi activeTypeId thay đổi
  useEffect(() => {
    if (!activeTypeId) return

    async function fetchProducts() {
      setProductsLoading(true)
      try {
        const response = await fetch(`/api/products/by-type/${activeTypeId}`)
        if (!response.ok) throw new Error('Failed to fetch products')
        
        const data = await response.json()
        // Backend trả về { success, data, meta }
        if (data.success && data.data) {
          // Lấy tối đa 8 sản phẩm để hiển thị
          setProducts(data.data.slice(0, 8))
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.')
      } finally {
        setProductsLoading(false)
      }
    }

    fetchProducts()
  }, [activeTypeId])

  // Hiển thị loading state
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

  // Không hiển thị gì nếu có lỗi hoặc không có danh mục sản phẩm
  if (error || productTypes.length === 0) {
    return null
  }

  return (
    <section className="py-5 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-accent-gold mb-4">
            DANH MỤC SẢN PHẨM
          </h2>
          <div className="flex justify-center mb-6">
            <svg width="80" height="20" viewBox="0 0 80 20" className="text-accent-gold">
              <path
                d="M5,10 Q10,5 15,10 T25,10 T35,10 T45,10 T55,10 T65,10 T75,10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {productTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveTypeId(type.id)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeTypeId === type.id
                  ? 'bg-agri-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-agri-100 hover:text-agri-700'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {productsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-agri-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Chưa có sản phẩm trong danh mục này
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product)
                  setIsModalOpen(true)
                }}
                className="group text-left w-full"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Leaf decoration - top left */}
                  <div className="absolute top-0 left-0 w-16 h-16 opacity-20 z-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-agri-500">
                      <path
                        d="M10,10 Q30,20 40,40 Q35,50 20,55 Q10,50 5,40 Q5,20 10,10 Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  {/* Leaf decoration - bottom right */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 opacity-20 z-10 rotate-180">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-agri-500">
                      <path
                        d="M10,10 Q30,20 40,40 Q35,50 20,55 Q10,50 5,40 Q5,20 10,10 Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  {/* Product image with Blurred Backdrop Effect */}
                  <div className="relative w-full aspect-square bg-gray-100 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {product.pictures && product.pictures.length > 0 ? (
                      <>
                        {/* Background Blurred Image */}
                        <div className="absolute inset-0 w-full h-full blur-xl scale-110 opacity-50">
                          <Img
                            src={product.pictures[0] || ''}
                            alt=""
                            className="object-cover"
                          />
                        </div>
                        {/* Foreground Original Image */}
                        <div className="relative z-10 w-full h-full">
                          <Img
                            src={product.pictures[0] || ''}
                            alt={product.name}
                            className="object-cover"
                          />
                        </div>
                      </>
                    ) : product.thumb ? (
                      <>
                        {/* Background Blurred Image */}
                        <div className="absolute inset-0 w-full h-full blur-xl scale-110 opacity-50">
                          <Img
                            src={product.thumb || ''}
                            alt=""
                            className="object-cover"
                          />
                        </div>
                        {/* Foreground Original Image */}
                        <div className="relative z-10 w-full h-full">
                          <Img
                            src={product.thumb || ''}
                            alt={product.name}
                            className="object-cover"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Leaf className="w-20 h-20 text-gray-200" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-agri-50 to-agri-100 opacity-50" />
                      </>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="relative z-10 p-4 bg-white">
                    <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-lg md:text-xl font-bold text-agri-600">
                      {product.show_price_on_web !== false && product.price && Number(product.price) > 0
                        ? new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(Number(product.price))
                        : 'Liên hệ'}
                    </p>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-agri-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* View all button */}
        <div className="flex justify-center mt-12">
          <Link
            href="/products"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
      />

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

