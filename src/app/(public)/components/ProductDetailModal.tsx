'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'
import Img from '@/app/components/Img'

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

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Product Detail Modal Component
 * Modal hiển thị chi tiết sản phẩm
 */
export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 p-6 md:p-8">
          {/* Left column: Images */}
          <div className="space-y-4 mb-6 md:mb-0">
            {product.pictures && product.pictures.length > 0 ? (
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-agri-400 scrollbar-track-agri-100">
                  {product.pictures.map((pic, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full snap-center"
                    >
                      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-agri-100 shadow-inner">
                        <div className="relative z-10 w-full h-full">
                          <Img
                            src={pic || ''}
                            alt={`${product.name} - Ảnh ${index + 1}`}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {product.pictures.length > 1 && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Vuốt để xem thêm ({product.pictures.length} ảnh)
                  </p>
                )}
              </div>
            ) : product.thumb ? (
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-agri-100 shadow-inner max-w-md mx-auto w-full">
                <div className="relative z-10 w-full h-full">
                  <Img
                    src={product.thumb || ''}
                    alt={product.name}
                    className="object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="relative aspect-square bg-gradient-to-br from-agri-50 to-agri-100 rounded-lg overflow-hidden border-2 border-agri-200 max-w-md mx-auto w-full">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-8xl mb-4">📦</div>
                  <p className="text-gray-400 text-sm">Chưa có hình ảnh</p>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Product Details */}
          <div>
            {/* Product Name & Trade Name */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.trade_name || product.name}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Code & Volume */}
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs">
                  Mã: <span className="font-semibold">{product.code}</span>
                </span>
                {product.volume && (
                  <span className="text-gray-500 bg-agri-50 px-3 py-1 rounded-full text-xs">
                    Dung tích: <span className="font-semibold text-agri-700">{product.volume}</span>
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="bg-agri-50 p-4 rounded-xl border border-agri-100">
                {product.show_price_on_web !== false && product.price && Number(product.price) > 0 ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Giá:</span>
                    <span className="font-bold text-2xl text-agri-700">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(Number(product.price))}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="text-gray-600 font-medium">Giá:</span>
                    <span className="font-bold text-xl text-agri-700">Liên hệ</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-agri-500 rounded-full" />
                    Mô tả sản phẩm
                  </h3>
                  <div 
                    className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none prose-agri"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {/* Ingredients */}
              {product.ingredient && product.ingredient.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-yellow-500 rounded-full" />
                    Thành phần
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredient.map((item, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs border border-gray-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unit & Symbol */}
              {(product.unit || product.symbol) && (
                <div className="flex gap-6 pt-2 border-t border-gray-100">
                  {product.unit && (
                    <div className="text-xs">
                      <span className="text-gray-400 block mb-1">Đơn vị tính</span>
                      <span className="font-semibold text-gray-700">{product.unit.name}</span>
                    </div>
                  )}
                  {product.symbol && (
                    <div className="text-xs">
                      <span className="text-gray-400 block mb-1">Ký hiệu</span>
                      <span className="font-semibold text-gray-700">{product.symbol.name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {product.notes && (
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-sm italic text-yellow-800">
                  <strong className="block mb-1 not-italic">Ghi chú:</strong>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.notes }}
                  />
                </div>
              )}

              {/* Contact Button */}
              <div className="pt-4">
                <a
                  href="tel:0987383606"
                  className="group relative block w-full bg-agri-600 hover:bg-agri-700 text-white text-center px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-agri-200"
                >
                  LIÊN HỆ ĐẶT HÀNG: 0987.383.606
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
