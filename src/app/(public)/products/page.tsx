import { Metadata } from 'next'
import ProductsClient from './products-client'
import Block from "@/app/components/Block"

export const metadata: Metadata = {
  title: 'Sản phẩm vật tư nông nghiệp | Xanh AG',
  description: 'Danh sách đầy đủ các sản phẩm vật tư nông nghiệp: phân bón, thuốc trừ sâu, thuốc diệt cỏ, chất kích thích sinh trưởng chất lượng cao',
  keywords: ['vật tư nông nghiệp', 'phân bón', 'thuốc trừ sâu', 'thuốc diệt cỏ', 'chất kích thích sinh trưởng'],
  openGraph: {
    title: 'Sản phẩm vật tư nông nghiệp | Xanh AG',
    description: 'Danh sách đầy đủ các sản phẩm vật tư nông nghiệp chất lượng cao',
    url: 'https://xanhag.com/products',
    siteName: 'Xanh AG',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://xanhag.com/products',
  },
}

/**
 * Products Page - Server Component
 * Trang hiển thị tất cả sản phẩm, phân theo từng loại
 */
export default function ProductsPage() {
  return (
    <Block>
      <ProductsClient />
    </Block>
  )
}
