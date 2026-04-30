import { Metadata } from 'next'
import StaticPageWrapper from '../components/StaticPageWrapper'
import { Undo2, XCircle, Clock4, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chính sách đổi trả hàng | Xanh AGRI',
  description: 'Chính sách đổi trả hàng hóa rõ ràng tại Xanh AGRI: quy trình đổi hàng lỗi, trả hàng không đúng quy cách để bảo vệ quyền lợi khách hàng và bà con nông dân.',
  keywords: ['chính sách đổi trả', 'đổi trả hàng lỗi', 'quy định mua hàng', 'Xanh AGRI'],
  openGraph: {
    title: 'Chính sách đổi trả linh hoạt tại Xanh AGRI',
    description: 'Bảo vệ quyền lợi tối đa cho bà con nông dân với quy trình đổi trả đơn giản và minh bạch.',
    url: 'https://xanh-ag-nextjs-client.vercel.app/chinh-sach-doi-tra',
  },
}

export default function ExchangePolicyPage() {
  const policies = [
    {
      title: 'Trường hợp được đổi trả',
      items: [
        'Sản phẩm không đúng chủng loại, mẫu mã theo đơn đặt hàng.',
        'Sản phẩm bị hư hỏng, vỡ bao bì trong quá trình vận chuyển.',
        'Sản phẩm bị lỗi kỹ thuật hoặc hết hạn sử dụng khi vừa nhận hàng.',
      ],
      icon: <Undo2 className="w-6 h-6 text-agri-600" />
    },
    {
      title: 'Điều kiện đổi trả',
      items: [
        'Sản phẩm phải còn nguyên bao bì, nhãn mác, chưa qua sử dụng.',
        'Có hóa đơn mua hàng hoặc phiếu giao hàng kèm theo.',
        'Thông báo đổi trả trong vòng 48 giờ kể từ khi nhận hàng.',
      ],
      icon: <CheckCircle className="w-6 h-6 text-agri-600" />
    },
    {
      title: 'Thời gian xử lý',
      items: [
        'Xanh AGRI sẽ xác nhận và xử lý đổi trả trong vòng 3-5 ngày làm việc.',
        'Đối với trường hợp hoàn tiền, thời gian sẽ tùy thuộc vào phương thức thanh toán ban đầu.',
      ],
      icon: <Clock4 className="w-6 h-6 text-agri-600" />
    },
    {
      title: 'Các trường hợp không áp dụng',
      items: [
        'Sản phẩm đã bị mở bao bì, tem nhãn không còn nguyên vẹn.',
        'Quá thời gian thông báo đổi trả (48 giờ sau khi nhận hàng).',
        'Lỗi phát sinh do quá trình bảo quản sai quy cách của khách hàng.',
      ],
      icon: <XCircle className="w-6 h-6 text-orange-600" />
    }
  ]

  return (
    <StaticPageWrapper 
      title="Chính sách đổi trả" 
      breadcrumb={[{ label: 'Hỗ trợ' }, { label: 'Đổi trả hàng' }]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Quyền lợi khách hàng trên hết</h2>
        <p className="text-gray-600">Tại Xanh AGRI, chúng tôi luôn nỗ lực mang lại trải nghiệm mua sắm an tâm tuyệt đối cho khách hàng. Chính sách đổi trả này giúp bảo vệ quyền lợi của bà con khi sản phẩm gặp vấn đề ngoài ý muốn.</p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {policies.map((policy, idx) => (
            <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col gap-4 relative">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md absolute -top-4 -left-4">
                {policy.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{policy.title}</h3>
              <ul className="text-sm space-y-4">
                {policy.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-agri-600 font-black">•</span>
                    <span className="text-gray-500 leading-relaxed font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 my-12">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
          <span>📮</span> Quy trình đổi trả hàng
        </h3>
        <p className="text-sm mb-6 font-medium text-blue-900 leading-relaxed">Để việc đổi trả diễn ra thuận lợi, quý khách vui lòng chụp ảnh hoặc quay video tình trạng sản phẩm khi gặp lỗi và liên hệ ngay với bộ phận hỗ trợ khách hàng qua các kênh sau:</p>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-6 py-3 rounded-full flex items-center gap-2 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hotline:</span>
            <span className="text-blue-900 font-black">0987.383.606</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-full flex items-center gap-2 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email:</span>
            <span className="text-blue-900 font-black">phuocsanhtps@gmail.com</span>
          </div>
        </div>
      </div>
      <p className="text-center text-xs italic text-gray-400">* Lưu ý: Xanh AGRI có quyền đưa ra quyết định cuối cùng về việc chấp nhận đổi trả dựa trên tình trạng kiểm định thực tế của sản phẩm.</p>
    </StaticPageWrapper>
  )
}
