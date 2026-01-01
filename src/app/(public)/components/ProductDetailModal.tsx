'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

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
        className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 md:p-8">
          {/* Product Name & Close Button Row */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h2>
            {product.trade_name && product.trade_name !== product.name && (
              <p className="text-lg text-agri-600">{product.trade_name}</p>
            )}
          </div>

          {/* Image Gallery Carousel */}
          <div className="mb-6">
            {product.pictures && product.pictures.length > 0 ? (
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-agri-400 scrollbar-track-agri-100">
                  {product.pictures.map((pic, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 snap-center"
                    >
                      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-agri-100 shadow-inner">
                        {/* Background Blurred Image */}
                        <img
                          src={pic}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-30"
                        />
                        {/* Foreground Original Image */}
                        <img
                          src={pic}
                          alt={`${product.name} - Ảnh ${index + 1}`}
                          className="relative z-10 w-full h-full object-contain p-2"
                        />
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
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-agri-100 shadow-inner max-w-md mx-auto">
                {/* Background Blurred Image */}
                <img
                  src={product.thumb}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-30"
                />
                {/* Foreground Original Image */}
                <img
                  src={product.thumb}
                  alt={product.name}
                  className="relative z-10 w-full h-full object-contain p-2"
                />
              </div>
            ) : (
              <div className="relative aspect-square bg-gradient-to-br from-agri-50 to-agri-100 rounded-lg overflow-hidden border-2 border-agri-200 max-w-md mx-auto">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-8xl mb-4">📦</div>
                  <p className="text-gray-400 text-sm">Chưa có hình ảnh</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Code & Volume */}
            <div className="flex flex-wrap gap-4">
              <span className="text-sm text-gray-500">
                Mã: <span className="font-semibold">{product.code}</span>
              </span>
              {product.volume && (
                <span className="text-sm text-gray-500">
                  Dung tích: <span className="font-semibold">{product.volume}</span>
                </span>
              )}
            </div>

            {/* Prices */}
            <div className="bg-agri-50 rounded-lg p-4">
              {product.price && Number(product.price) > 0 ? (
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
                <div className="text-center text-gray-500">
                  Liên hệ để biết giá
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả:</h3>
                <div 
                  className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Ingredients */}
            {product.ingredient && product.ingredient.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Thành phần:</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  {product.ingredient.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Unit & Symbol */}
            {(product.unit || product.symbol) && (
              <div className="flex gap-4 text-sm text-gray-500">
                {product.unit && (
                  <span>
                    Đơn vị: <span className="font-semibold">{product.unit.name}</span>
                  </span>
                )}
                {product.symbol && (
                  <span>
                    Ký hiệu: <span className="font-semibold">{product.symbol.name}</span>
                  </span>
                )}
              </div>
            )}

            {/* Notes */}
            {product.notes && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> {product.notes}
                </p>
              </div>
            )}

            {/* Contact Button */}
            <div className="pt-4">
              <a
                href="tel:0987.383.606"
                className="block w-full bg-accent-purple hover:bg-accent-purple/90 text-white text-center px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Liên hệ đặt hàng: 0987.383.606
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
