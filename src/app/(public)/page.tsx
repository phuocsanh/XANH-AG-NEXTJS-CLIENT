import HeroSection from "./components/HeroSection"
import ToolsSection from "./components/ToolsSection"
import FeaturesSection from "./components/FeaturesSection"
import ProductShowcase from "./components/ProductShowcase"
import LatestNews from "./components/LatestNews"

/**
 * Homepage của Xanh AG
 */
async function Page() {
  try {
    return (
      <main className='min-h-screen'>
        {/* Hero Section - Banner với gradient xanh nông nghiệp */}
        <HeroSection />
        
        {/* Tools Section - Dự báo thời tiết và Lịch vạn niên */}
        <ToolsSection />

        {/* Product Showcase - Tab danh mục và danh sách sản phẩm nổi bật */}
        <ProductShowcase />

        {/* Features Section - Giới thiệu về Xanh AG */}
        <FeaturesSection />

        {/* Latest News - Tin tức nông nghiệp mới nhất */}
        <LatestNews />
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
