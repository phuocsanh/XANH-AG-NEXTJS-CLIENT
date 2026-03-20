'use client'

import { X, ShieldCheck, Truck, PhoneCall, Star, Hand, Wind, Baby } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Img from '@/app/components/Img'
 
const PESTICIDE_TYPES = [
  { group: 'Mát nhất', icon: '🟢', color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f', codes: ['SL', 'AL', 'SP', 'SG'] },
  { group: 'Mát vừa', icon: '🟡', color: '#faad14', bgColor: '#fffbe6', borderColor: '#ffe58f', codes: ['SC', 'WG', 'WP', 'DC'] },
  { group: 'Trung bình', icon: '🟠', color: '#fa8c16', bgColor: '#fff7e6', borderColor: '#ffd591', codes: ['CS', 'SE', 'ME', 'EW'] },
  { group: 'Gây nóng', icon: '🔴', color: '#ff4d4f', bgColor: '#fff1f0', borderColor: '#ffa39e', codes: ['EC', 'OD', 'DP', 'DS'] },
];

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
  mechanism?: string
  web_name?: string
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
  // Rating logic - ổn định theo ID sản phẩm
  const ratingInfo = useMemo(() => {
    if (!product) return { rating: '4.9', count: 120 }
    const seed = product.id || 0
    const rating = (4.4 + (seed % 7) / 10).toFixed(1)
    const count = 100 + (seed % 150)
    return { rating, count }
  }, [product?.id])

  // Phân loại thuốc (mát/nóng) dựa trên dạng thuốc
  const pesticideProperty = useMemo(() => {
    if (!product?.symbol?.name) return null
    const upperCode = product.symbol.name.toUpperCase()
    return PESTICIDE_TYPES.find(t => t.codes.includes(upperCode))
  }, [product?.symbol?.name])

  // Zoom state for desktop "Amazon/Shopee style"
  const [zoomData, setZoomData] = useState<{ show: boolean; x: number; y: number; img: string }>({
    show: false,
    x: 0,
    y: 0,
    img: ''
  })

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
      setZoomData({ show: false, x: 0, y: 0, img: '' }) // Reset zoom when close
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null
  
  const displayName = product.web_name || product.trade_name || product.name || ''

  // Common handlers for zoom
  const handleZoomMove = (e: React.MouseEvent, img: string) => {
    if (window.innerWidth < 768) return // Only for desktop
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomData({ show: true, x, y, img });
  };

  const handleZoomLeave = () => {
    setZoomData(prev => ({ ...prev, show: false }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
        <div
          className="relative bg-white rounded-2xl w-[95vw] md:w-[90vw] max-w-[1400px] h-[95vh] md:h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button - Higher up and subtle style */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/5 backdrop-blur-md hover:bg-black/10 text-gray-800 transition-all z-[110] border border-black/5"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-agri-200 scrollbar-track-transparent">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-12 p-6 md:p-8 pb-3 md:pb-3 relative">
          {/* Zoom Portal Window (Amazon style) - Desktop Only */}
          {zoomData.show && (
            <div 
              className="absolute right-0 top-0 w-[33.3%] h-full z-[100] hidden md:block bg-white shadow-2xl border-l border-gray-100 overflow-hidden pointer-events-none animate-in fade-in duration-200"
              style={{
                backgroundImage: `url(${zoomData.img})`,
                backgroundSize: '500%', // 5x Zoom factor
                backgroundPosition: `${zoomData.x}% ${zoomData.y}%`,
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Overlay tint effect for better visibility inside zoom window */}
              <div className="absolute inset-0 bg-white/5 pointer-events-none" />
            </div>
          )}

          {/* Left column: Images (Takes 2/3 width on desktop) */}
          <div className="md:col-span-2 space-y-4 mb-6 md:mb-0 pt-12 md:pt-0">
            {product.pictures && product.pictures.length > 0 ? (
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-agri-400 scrollbar-track-agri-100">
                  {product.pictures.map((pic, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full snap-center"
                    >
                      <div 
                        className="relative aspect-square bg-white rounded-lg overflow-hidden border border-agri-100 shadow-inner group cursor-crosshair"
                        onMouseMove={(e) => handleZoomMove(e, pic || '')}
                        onMouseLeave={handleZoomLeave}
                      >
                        <div className="relative z-10 w-full h-full">
                          <Img
                            src={pic || ''}
                            alt={`${displayName} - Ảnh ${index + 1}`}
                            className="object-contain"
                          />
                        </div>
                        
                        {/* Zoom Lens overlay */}
                        {zoomData.show && zoomData.img === pic && (
                          <div 
                            className="absolute z-50 border border-agri-400 bg-agri-500/10 pointer-events-none hidden md:block"
                            style={{
                                width: '33.3%', // Proportion of viewport
                                height: '33.3%',
                                left: `${zoomData.x}%`,
                                top: `${zoomData.y}%`,
                                transform: 'translate(-50%, -50%)',
                                boxShadow: '0 0 0 2000px rgba(0,0,0,0.1)' // Dim background around lens
                            }}
                          />
                        )}
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
              <div 
                className="relative aspect-square bg-white rounded-lg overflow-hidden border border-agri-100 shadow-inner max-w-md mx-auto w-full group cursor-crosshair"
                onMouseMove={(e) => handleZoomMove(e, product.thumb || '')}
                onMouseLeave={handleZoomLeave}
              >
                <div className="relative z-10 w-full h-full">
                  <Img
                    src={product.thumb || ''}
                    alt={displayName}
                    className="object-contain"
                  />
                </div>
                {/* Zoom Lens overlay for thumb */}
                {zoomData.show && zoomData.img === product.thumb && (
                  <div 
                    className="absolute z-50 border border-agri-400 bg-agri-500/10 pointer-events-none hidden md:block"
                    style={{
                        width: '33.3%',
                        height: '33.3%',
                        left: `${zoomData.x}%`,
                        top: `${zoomData.y}%`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 0 2000px rgba(0,0,0,0.1)'
                    }}
                  />
                )}
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

          {/* Right column: Product Details (Takes 1/3 width on desktop) */}
          <div className="md:col-span-1">
            {/* Product Name & Trade Name */}
            <div className="mb-4">
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {displayName}
              </h2>
              
              {/* Rating Star */}
              <div className="flex items-center gap-1.5 mb-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.floor(Number(ratingInfo.rating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-600">{ratingInfo.rating}/5</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-medium">({ratingInfo.count}+ nhà vườn đã tin dùng)</span>
              </div>

              {/* Ingredients - Moved up */}
              {product.ingredient && product.ingredient.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.ingredient.map((item, index) => (
                    <span key={index} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-[10px] md:text-xs border border-orange-100 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Volume & Dosage Form */}
              <div className="flex flex-wrap gap-3">
                {product.volume && (
                  <span className="text-gray-500 bg-agri-50 px-3 py-1 rounded-full text-[10px] md:text-xs border border-agri-100">
                    Dung tích / Khối lượng: <span className="font-semibold text-agri-700">{product.volume}</span>
                  </span>
                )}
                {product.symbol?.name && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-500 bg-blue-50 px-3 py-1 rounded-full text-[10px] md:text-xs border border-blue-100">
                      Dạng thuốc: <span className="font-semibold text-blue-700">{product.symbol.name}</span>
                    </span>
                    
                    {pesticideProperty && (
                      <span 
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs border font-black"
                        style={{ 
                          backgroundColor: pesticideProperty.bgColor, 
                          borderColor: pesticideProperty.borderColor, 
                          color: pesticideProperty.color 
                        }}
                      >
                        {pesticideProperty.icon} {pesticideProperty.group === 'Gây nóng' ? 'Tính nóng - Phun chiều mát' : pesticideProperty.group}
                      </span>
                    )}
                  </div>
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
                    <span className="text-gray-600 font-medium whitespace-nowrap">Giá liên hệ:</span>
                    <span className="font-bold text-xl text-agri-700">0987.383.606</span>
                  </div>
                )}
              </div>

              {/* Trust Badges - Hàng Cam Kết */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100/50">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-[11px] font-medium text-blue-900 leading-tight">Chính hãng 100%</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50/50 border border-orange-100/50">
                  <Truck className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="text-[11px] font-medium text-orange-900 leading-tight">Giao hàng toàn quốc</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50/50 border border-green-100/50">
                  <PhoneCall className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-[11px] font-medium text-green-900 leading-tight">Hỗ trợ kỹ thuật 24/7</span>
                </div>
              </div>

              {/* Safety Guidelines - Khối An toàn & Bảo quản (Moved here to the right of the image) */}
              <div className="bg-red-50/30 p-4 rounded-xl border border-red-100">
                <h4 className="text-[10px] font-bold text-red-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                   <div className="w-1 h-3 bg-red-500 rounded-full" />
                   An toàn & Bảo quản
                </h4>
                <div className="flex justify-between px-2">
                  <div className="flex flex-col items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-red-100">
                      <Hand className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-[10px] font-medium text-red-900 text-center leading-tight">Đeo găng tay</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-red-100">
                      <Wind className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-[10px] font-medium text-red-900 text-center leading-tight">Khẩu trang</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-red-100">
                      <Baby className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-[10px] font-medium text-red-900 text-center leading-tight">Tránh trẻ em</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-8 pb-8 space-y-8 border-t border-gray-50 pt-8">
          {product.description && (
            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <div className="w-1.5 h-6 bg-agri-500 rounded-full" />
                Mô tả sản phẩm
              </h3>
              <div 
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {product.mechanism && (
            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                Cơ chế tác động
              </h3>
              <div 
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: product.mechanism }}
              />
            </div>
          )}

          <div className="pt-8 space-y-3 border-t border-gray-100 mt-8">
            <a
              href="tel:0987383606"
              className="group relative block w-full bg-agri-600 hover:bg-agri-700 text-white text-center px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-agri-200"
            >
              LIÊN HỆ ĐẶT HÀNG: 0987.383.606
            </a>
            <button
              onClick={onClose}
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-center px-6 py-4 rounded-xl font-bold transition-all"
            >
              ĐÓNG
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
