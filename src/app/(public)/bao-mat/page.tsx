import { Metadata } from 'next'
import StaticPageWrapper from '../components/StaticPageWrapper'
import { ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật thông tin | Xanh AG',
  description: 'Chính sách bảo mật thông tin khách hàng tại Xanh AG: quy trình thu thập, xử lý và cam kết bảo vệ dữ liệu cá nhân của bà con nông dân khi mua sắm.',
  keywords: ['chính sách bảo mật', 'bảo vệ thông tin khách hàng', 'bảo mật dữ liệu', 'Xanh AG'],
  openGraph: {
    title: 'Cam kết bảo mật thông tin tại Xanh AG',
    description: 'An tâm mua sắm với cam kết bảo vệ dữ liệu cá nhân cao nhất tại Xanh AG.',
    url: 'https://xanh-ag-nextjs-client.vercel.app/bao-mat',
  },
}

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'Mục đích thu thập thông tin',
      content: 'Xanh AG thu thập thông tin khách hàng (Họ tên, SĐT, Địa chỉ) để xử lý đơn hàng, liên hệ tư vấn kỹ thuật và thông báo các chương trình ưu đãi, khuyến mãi mới nhất cho bà con.',
      icon: <UserCheck className="w-6 h-6 text-agri-600" />
    },
    {
      title: 'Phạm vi sử dụng thông tin',
      content: 'Thông tin cá nhân chỉ được sử dụng nội bộ trong công ty và cho các đơn vị vận chuyển đối tác để hoàn thành việc giao nhận hàng hóa. Chúng tôi tuyệt đối không bán hay chia sẻ thông tin cho bên thứ ba vì mục đích thương mại.',
      icon: <ShieldCheck className="w-6 h-6 text-agri-600" />
    },
    {
      title: 'Cam kết bảo mật dữ liệu',
      content: 'Toàn bộ dữ liệu khách hàng được lưu trữ an toàn trên hệ thống máy chủ bảo mật của Xanh AG. Chúng tôi áp dụng các biện pháp kỹ thuật tiên tiến để phòng tránh việc truy cập trái phép hoặc rò rỉ thông tin.',
      icon: <Lock className="w-6 h-6 text-agri-600" />
    },
    {
      title: 'Quyền lợi của khách hàng',
      content: 'Quý khách có quyền yêu cầu truy xuất, chỉnh sửa hoặc xóa bỏ thông tin cá nhân của mình khỏi hệ thống của Xanh AG bất kỳ lúc nào bằng cách liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.',
      icon: <EyeOff className="w-6 h-6 text-agri-600" />
    }
  ]

  return (
    <StaticPageWrapper 
      title="Chính sách bảo mật" 
      breadcrumb={[{ label: 'Hỗ trợ' }, { label: 'Chính sách bảo mật' }]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 underline decoration-agri-500 decoration-4 underline-offset-10">Sự tin tưởng khơi nguồn thịnh vượng</h2>
        <p className="text-gray-600 mt-8">Bảo mật thông tin khách hàng là nền tảng cốt lõi trong hoạt động kinh doanh của Xanh AG. Chúng tôi cam kết bảo vệ quyền riêng tư của quý khách một cách tuyệt đối thông qua những quy định cụ thể dưới đây.</p>
        
        <div className="space-y-12 mt-12 px-2">
          {sections.map((section, idx) => (
            <div key={idx} className="flex gap-8 group">
              <div className="w-14 h-14 bg-agri-50 text-agri-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-agri-600 group-hover:text-white transition-all duration-500 shadow-sm">
                {section.icon}
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500 font-medium">{section.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-gray-100 p-8 rounded-3xl border border-gray-200 my-12 text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Mọi thắc mắc về bảo mật dịch vụ</h3>
        <p className="text-sm text-gray-500 mb-6 px-4">Đội ngũ của chúng tôi luôn lắng nghe và giải đáp mọi câu hỏi liên quan đến chính sách bảo mật thông tin.</p>
        <div className="flex justify-center flex-wrap gap-4">
          <a href="tel:0987383606" className="bg-white px-8 py-3 rounded-full text-agri-700 font-extrabold shadow-lg hover:bg-agri-700 hover:text-white transition-all transform hover:-translate-y-1 underline decoration-agri-500 decoration-2 underline-offset-4">0987.383.606</a>
          <a href="mailto:phuocsanhtps@gmail.com" className="bg-white px-8 py-3 rounded-full text-agri-700 font-extrabold shadow-lg hover:bg-agri-700 hover:text-white transition-all transform hover:-translate-y-1 underline decoration-agri-500 decoration-2 underline-offset-4">phuocsanhtps@gmail.com</a>
        </div>
      </div>
      <p className="text-xs text-gray-400 italic text-center">* Chính sách bảo mật này có hiệu lực từ ngày 01/01/2024 và có thể được cập nhật theo quy định của pháp luật Việt Nam.</p>
    </StaticPageWrapper>
  )
}
