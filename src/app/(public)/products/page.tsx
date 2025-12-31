'use client'

import { useState, useEffect } from 'react'
import { Leaf, Search, ChevronDown } from 'lucide-react'
import ProductDetailModal from '../components/ProductDetailModal'

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
  description?: string
  thumb?: string
  pictures?: string[]
  ingredient?: string[]
  notes?: string
  type: number
  unit?: {
    id: number
    name: string
  }
  symbol?: {
    id: number
    name: string
  }
}

interface ProductsByType {
  type: ProductType
  products: Product[]
}

const PRODUCTS_PER_PAGE = 10 // Số sản phẩm hiển thị ban đầu cho mỗi loại

/**
 * Products Page
 * Trang hiển thị tất cả sản phẩm, phân theo từng loại với pagination
 */
export default function ProductsPage() {
  const [productsByType, setProductsByType] = useState<ProductsByType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // State để track số sản phẩm hiển thị cho mỗi type
  const [visibleCounts, setVisibleCounts] = useState<Record<number, number>>({})

  // Fetch all product types and their products
  useEffect(() => {
    async function fetchAllProducts() {
      try {
        // 1. Fetch product types
        const typesResponse = await fetch('/api/product-types')
        if (!typesResponse.ok) throw new Error('Failed to fetch product types')
        
        const typesData = await typesResponse.json()
        
        if (typesData.success && typesData.data) {
          const types: ProductType[] = typesData.data
          
          // 2. Fetch products for each type
          const productsPromises = types.map(async (type) => {
            const productsResponse = await fetch(`/api/products/by-type/${type.id}`)
            if (!productsResponse.ok) return { type, products: [] }
            
            const productsData = await productsResponse.json()
            return {
              type,
              products: productsData.success && productsData.data ? productsData.data : []
            }
          })
          
          const results = await Promise.all(productsPromises)
          // Chỉ hiển thị các type có sản phẩm
          const filteredResults = results.filter(r => r.products.length > 0)
          setProductsByType(filteredResults)
          
          // Initialize visible counts
          const initialCounts: Record<number, number> = {}
          filteredResults.forEach(r => {
            initialCounts[r.type.id] = PRODUCTS_PER_PAGE
          })
          setVisibleCounts(initialCounts)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  // Filter products by search query
  const filteredProductsByType = productsByType.map(group => ({
    ...group,
    products: group.products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.products.length > 0)

  // Handle show more for a specific type
  const handleShowMore = (typeId: number) => {
    setVisibleCounts(prev => ({
      ...prev,
      [typeId]: (prev[typeId] || PRODUCTS_PER_PAGE) + PRODUCTS_PER_PAGE
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-agri-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-agri-500 border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-agri-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-agri-600 to-agri-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Danh Sách Sản Phẩm</h1>
          <p className="text-agri-100">Tất cả sản phẩm vật tư nông nghiệp</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
        </div>
      </div>

      {/* Products by Type */}
      <div className="container mx-auto px-4 py-12">
        {filteredProductsByType.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {searchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
          </div>
        ) : (
          <div className="space-y-16">
            {filteredProductsByType.map((group) => {
              const visibleCount = visibleCounts[group.type.id] || PRODUCTS_PER_PAGE
              const displayedProducts = group.products.slice(0, visibleCount)
              const hasMore = visibleCount < group.products.length

              return (
                <div key={group.type.id} className="scroll-mt-20" id={`type-${group.type.id}`}>
                  {/* Type Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-agri-700 mb-2">
                          {group.type.name}
                        </h2>
                        <div className="h-1 w-20 bg-accent-gold rounded-full" />
                      </div>
                      <span className="text-sm text-gray-500">
                        {group.products.length} sản phẩm
                      </span>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {displayedProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product)
                          setIsModalOpen(true)
                        }}
                        className="group text-left w-full"
                      >
                        <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                          {/* Leaf decoration - top left */}
                          <div className="absolute top-0 left-0 w-12 h-12 opacity-20 z-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-agri-500">
                              <path
                                d="M10,10 Q30,20 40,40 Q35,50 20,55 Q10,50 5,40 Q5,20 10,10 Z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>

                          {/* Product image */}
                          <div className="relative w-full h-40 md:h-48 bg-gray-50 overflow-hidden">
                            {product.pictures && product.pictures.length > 0 ? (
                              <img
                                src={product.pictures[0]}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : product.thumb ? (
                              <img
                                src={product.thumb}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Leaf className="w-16 h-16 text-gray-200" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-agri-50 to-agri-100 opacity-50" />
                              </>
                            )}
                          </div>

                          {/* Product info */}
                          <div className="relative z-10 p-3 bg-white">
                            <h3 className="text-xs md:text-sm font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2rem]">
                              {product.name}
                            </h3>
                            <p className="text-sm md:text-base font-bold text-agri-600">
                              {product.price && Number(product.price) > 0
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

                  {/* Show More Button */}
                  {hasMore && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => handleShowMore(group.type.id)}
                        className="flex items-center gap-2 bg-white hover:bg-agri-50 text-agri-700 px-6 py-3 rounded-lg font-semibold border-2 border-agri-500 transition-all transform hover:scale-105 shadow-md"
                      >
                        <span>Xem thêm ({group.products.length - visibleCount} sản phẩm)</span>
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
    </div>
  )
}

