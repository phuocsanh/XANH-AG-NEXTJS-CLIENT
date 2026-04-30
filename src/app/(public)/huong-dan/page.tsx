import { Metadata } from 'next'
import StaticPageWrapper from '../components/StaticPageWrapper'
import { ShoppingCart, ClipboardList, CreditCard, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hướng dẫn mua hàng | Xanh AGRI',
  description: 'Hướng dẫn các bước đặt mua vật tư nông nghiệp tại Xanh AGRI: từ việc chọn sản phẩm, đặt hàng cho đến thanh toán và nhận hàng thuận tiện nhất.',
  keywords: ['hướng dẫn mua hàng', 'mua vật tư nông nghiệp', 'đặt hàng nông sản', 'Xanh AGRI'],
  openGraph: {
    title: 'Hướng dẫn mua hàng tại Xanh AGRI',
    description: 'Quy trình đặt hàng dễ dàng và nhanh chóng giúp bà con sở hữu những sản phẩm nông nghiệp tốt nhất.',
    url: 'https://xanh-ag-nextjs-client.vercel.app/huong-dan',
  },
}

export default function GuidePage() {
  const steps = [
    {
      title: 'Bước 1: Chọn sản phẩm',
      desc: 'Tìm kiếm hoặc lựa chọn các sản phẩm vật tư nông nghiệp (phân bón, thuốc bảo vệ thực vật, hạt giống...) mà bạn cần trong danh mục sản phẩm của Xanh AGRI.',
      icon: <ShoppingCart className="w-8 h-8" />
    },
    {
      title: 'Bước 2: Cung cấp thông tin',
      desc: 'Điền chính xác các mục thông tin nhận hàng bao gồm: Họ tên, Số điện thoại và Địa chỉ chi tiết để chúng tôi có thể giao hàng nhanh nhất.',
      icon: <ClipboardList className="w-8 h-8" />
    },
    {
      title: 'Bước 3: Phương thức thanh toán',
      desc: 'Bạn có thể lựa chọn hình thức thanh toán khi nhận hàng (COD) hoặc chuyển khoản qua ngân hàng. Hệ thống của chúng tôi luôn đảm bảo tính an toàn.',
      icon: <CreditCard className="w-8 h-8" />
    },
    {
      title: 'Bước 4: Xác nhận & Nhận hàng',
      desc: 'Sau khi nhận đơn, nhân viên tư vấn của Xanh AGRI sẽ liên hệ xác nhận và tiến hành đóng gói giao hàng cho bạn trong thời gian sớm nhất.',
      icon: <CheckCircle2 className="w-8 h-8" />
    }
  ]

  return (
    <StaticPageWrapper 
      title="Hướng dẫn mua hàng" 
      breadcrumb={[{ label: 'Hỗ trợ' }, { label: 'Hướng dẫn mua hàng' }]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Quy trình đặt hàng đơn giản</h2>
        <p className="text-gray-600">Xanh AGRI luôn nỗ lực tối giản hóa quy trình để bà con có thể tiếp cận với vật tư nông nghiệp chất lượng một cách nhanh chóng nhất.</p>
        
        <div className="space-y-8 mt-10">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 group hover:translate-x-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-agri-100 text-agri-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-agri-600 group-hover:text-white transition-colors duration-300 shadow-sm font-bold text-xl order-1">
                {step.icon}
              </div>
              <div className="flex-grow pt-2 order-2">
                <h3 className="text-xl font-bold text-agri-800 mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 my-12">
        <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
          <span>💡</span> Ghi chú quan trọng
        </h3>
        <ul className="text-sm space-y-3 text-orange-950 font-medium">
          <li>- Quý khách nên kiểm tra kỹ thông tin sản phẩm và quy cách trước khi đặt hàng.</li>
          <li>- Nếu bạn gặp khó khăn trong quá trình đặt mua, hãy gọi trực tiếp đến <strong>Hotline: 0987.383.606</strong> để được kỹ thuật viên hỗ trợ nhanh nhất.</li>
          <li>- Miễn phí vận chuyển cho các đơn hàng lớn tại khu vực An Giang và các tỉnh lân cận.</li>
        </ul>
      </div>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-6 underline decoration-accent-gold decoration-4 underline-offset-8">Giao hàng & Theo dõi vận chuyển</h3>
        <p className="text-sm">Xanh AGRI hợp tác với các đơn vị vận chuyển uy tín để đảm bảo hàng hóa được giao nguyên vẹn và đúng lịch hẹn. Bạn sẽ được cung cấp mã theo dõi vận chuyển (nếu có) sau khi đơn hàng được gửi đi.</p>
      </section>
    </StaticPageWrapper>
  )
}
