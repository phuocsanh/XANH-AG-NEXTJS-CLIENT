import { Metadata } from 'next'
import StaticPageWrapper from '../components/StaticPageWrapper'
import { FileText, Gavel, AlertTriangle, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng dịch vụ | Xanh AGRI',
  description: 'Các quy định và điều khoản sử dụng dịch vụ của Xanh AGRI: quy định về mua hàng, bản quyền nội dung và trách nhiệm của người dùng trên hệ thống.',
  keywords: ['điều khoản sử dụng', 'quy định mua hàng', 'quy tắc sử dụng website', 'Xanh AGRI'],
  openGraph: {
    title: 'Điều khoản sử dụng tại Xanh AGRI',
    description: 'Quy định và quyền lợi khi tham gia hệ sinh thái nông nghiệp của Xanh AGRI.',
    url: 'https://xanh-ag-nextjs-client.vercel.app/dieu-khoan',
  },
}

export default function TermsOfServicePage() {
  const terms = [
    {
      title: 'Quy định về tài khoản',
      content: 'Người dùng có trách nhiệm bảo mật thông tin tài khoản và chịu trách nhiệm về mọi hoạt động diễn ra dưới tên tài khoản của mình. Xanh AGRI có quyền tạm khóa tài khoản nếu phát hiện dấu hiệu vi phạm hoặc gian lận.',
      icon: <ShieldCheck className="w-6 h-6 text-agri-600" />
    },
    {
      title: 'Thông tin sản phẩm & dịch vụ',
      content: 'Tất cả thông tin về sản phẩm, giá cả và chương trình khuyến mãi trên website của Xanh AGRI được cung cấp một cách trung thực nhất. Tuy nhiên, chúng tôi có quyền điều chỉnh thông tin này vào bất kỳ lúc nào mà không cần thông báo trước.',
      icon: <FileText className="w-6 h-6 text-agri-600" />
    },
    {
      title: 'Bản quyền & Nội dung',
      content: 'Mọi nội dung, hình ảnh và bài viết trên website thuộc bản quyền của Xanh AGRI. Nghiêm cấm mọi hành vi sao chép, sử dụng nội dung khi chưa được sự đồng ý bằng văn bản từ chúng tôi.',
      icon: <Gavel className="w-6 h-6 text-agri-600" />
    },
    {
      title: 'Giới hạn trách nhiệm',
      content: 'Xanh AGRI không chịu trách nhiệm trong trường hợp khách hàng sử dụng sản phẩm sai quy cách hoặc không tuân thủ hướng dẫn kỹ thuật của nhà sản xuất dẫn đến thiệt hại về mùa vụ.',
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />
    }
  ]

  return (
    <StaticPageWrapper 
      title="Điều khoản sử dụng" 
      breadcrumb={[{ label: 'Hỗ trợ' }, { label: 'Điều khoản sử dụng' }]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 underline decoration-agri-500 decoration-4 underline-offset-10">Quy tắc cộng đồng nông nghiệp sạch</h2>
        <p className="text-gray-600 mt-8 leading-relaxed font-medium">Bằng việc truy cập và sử dụng dịch vụ của Xanh AGRI, quý khách đồng ý tuân thủ các điều khoản và điều kiện được nêu rõ dưới đây. Các quy định này nhằm đảm bảo môi trường mua sắm an toàn và minh bạch cho tất cả mọi người.</p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {terms.map((term, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-agri-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                {term.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{term.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                {term.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-orange-50 p-10 rounded-3xl border border-orange-100 my-16 text-center">
        <h3 className="text-2xl font-bold text-orange-900 mb-4 tracking-tight">Cần hỗ trợ thêm về các điều khoản?</h3>
        <p className="text-sm text-orange-800 mb-8 max-w-lg mx-auto leading-relaxed">Nếu bạn có bất kỳ thắc mắc nào về các quy định này, hãy liên hệ ngay với đội ngũ pháp lý và hỗ trợ khách hàng của Xanh AGRI.</p>
        <div className="flex justify-center flex-wrap gap-4">
          <a href="/contact" className="bg-orange-600 px-10 py-3 rounded-full text-white font-black shadow-xl hover:bg-orange-700 transition-all transform hover:scale-105 active:scale-95">Liên hệ trực tiếp</a>
          <a href="tel:0987383606" className="bg-white border-2 border-orange-200 px-10 py-3 rounded-full text-orange-800 font-black shadow-lg hover:bg-orange-50 transition-all transform hover:scale-105 active:scale-95">Gọi: 0987.383.606</a>
        </div>
      </div>

      <p className="text-xs text-center text-gray-400 italic">Cập nhật lần cuối: 10/03/2026. Xanh AGRI có quyền sửa đổi các điều khoản này bất kỳ lúc nào.</p>
    </StaticPageWrapper>
  )
}
