import HeroSection from "./components/HeroSection"
import ToolsSection from "./components/ToolsSection"
import FeaturesSection from "./components/FeaturesSection"
import ProductShowcase from "./components/ProductShowcase"
import LatestNews from "./components/LatestNews"
import { Metadata } from 'next'
import Block from "@/app/components/Block"

export const metadata: Metadata = {
  title: 'Xanh AG - Nông nghiệp thông minh | Vật tư nông nghiệp chất lượng',
  description: 'Xanh AG cung cấp vật tư nông nghiệp chất lượng cao, dự báo thời tiết chính xác, lịch vạn niên và tư vấn kỹ thuật canh tác cho nông dân Việt Nam',
  keywords: ['nông nghiệp', 'vật tư nông nghiệp', 'phân bón', 'thuốc trừ sâu', 'dự báo thời tiết', 'lịch vạn niên'],
  openGraph: {
    title: 'Xanh AG - Nông nghiệp thông minh',
    description: 'Giải pháp nông nghiệp toàn diện cho nông dân Việt Nam',
    url: 'https://xanhag.com',
    siteName: 'Xanh AG',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://xanhag.com',
  },
}

/**
 * Homepage của Xanh AG
 */
async function Page() {
  try {
    return (
      <main className='min-h-screen'>
        {/* Hero Section - Banner với gradient xanh nông nghiệp - FULL WIDTH */}
        <HeroSection />
        
        <Block>
          {/* Tools Section - Dự báo thời tiết và Lịch vạn niên */}
          <ToolsSection />

          {/* Product Showcase - Tab danh mục và danh sách sản phẩm nổi bật */}
          <ProductShowcase />

          {/* Latest News - Tin tức nông nghiệp mới nhất */}
          <LatestNews />
          
           {/* Features Section - Giới thiệu về Xanh AG */}
          <FeaturesSection />
        </Block>
      </main>
    )
  } catch (error) {
    console.error("Error in Page component:", error)
    return (
      <main className='min-h-screen flex items-center justify-center py-20'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-500 mb-4'>
            Đã xảy ra lỗi
          </h1>
          <p className='text-gray-600'>Vui lòng thử lại sau</p>
        </div>
      </main>
    )
  }
}

export default Page
