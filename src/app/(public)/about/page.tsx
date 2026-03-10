import { Metadata } from 'next'
import StaticPageWrapper from '../components/StaticPageWrapper'
import { CheckCircle, Award, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Giới thiệu về Xanh AG | Giải pháp nông nghiệp bền vững',
  description: 'Xanh AG chuyên cung cấp vật tư nông nghiệp chất lượng cao, giải pháp kỹ thuật canh tác hiện đại và đồng hành cùng bà con nông dân vì một tương lai nông nghiệp xanh.',
  keywords: ['giới thiệu Xanh AG', 'nông nghiệp xanh', 'vật tư nông nghiệp', 'An Giang', 'giải pháp nông nghiệp'],
  openGraph: {
    title: 'Giới thiệu về Xanh AG | Giải pháp nông nghiệp bền vững',
    description: 'Đồng hành cùng bà con nông dân vì một tương lai nông nghiệp xanh và thịnh vượng.',
    url: 'https://xanh-ag-nextjs-client.vercel.app/about',
    siteName: 'Xanh AG',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <StaticPageWrapper 
      title="Về Xanh AG" 
      breadcrumb={[{ label: 'Giới thiệu' }]}
    >
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-agri-700">Câu chuyện thương hiệu</h2>
        <p>
          Chào mừng bạn đến với <strong>Xanh AG</strong> - đối tác chiến lược hàng đầu của bà con nông dân trong hành trình kiến tạo nền nông nghiệp bền vững. Xuất thân từ vùng đất An Giang trù phú, chúng tôi thấu hiểu sâu sắc những thách thức cũng như tiềm năng to lớn của nông sản Việt Nam.
        </p>
        <p>
          Với tâm niệm "Nông nghiệp xanh - Tương lai thịnh", Xanh AG không chỉ dừng lại ở việc cung cấp vật tư, sản phẩm; chúng tôi mang đến những giải pháp toàn diện về kỹ thuật, tư vấn chuyên sâu để tối ưu hóa năng suất và chất lượng sản phẩm cho mọi nhà vườn.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 my-12">
        <div className="bg-agri-50 p-8 rounded-2xl border border-agri-100 flex flex-col gap-4">
          <div className="w-12 h-12 bg-agri-600 text-white rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-agri-800">Sứ mệnh</h3>
          <p className="text-sm leading-relaxed">
            Cung cấp các sản phẩm và giải pháp nông nghiệp thân thiện với môi trường, giúp bà con nông dân nâng cao hiệu quả kinh tế và bảo vệ sức khỏe cộng đồng thông qua việc canh tác an toàn.
          </p>
        </div>
        <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100 flex flex-col gap-4">
          <div className="w-12 h-12 bg-accent-gold text-white rounded-xl flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-orange-800">Tầm nhìn</h3>
          <p className="text-sm leading-relaxed">
            Trở thành hệ sinh thái nông nghiệp hàng đầu tại Việt Nam, tiên phong trong việc ứng dụng công nghệ xanh và quy trình canh tác đạt chuẩn quốc tế vào sản xuất thực tiễn.
          </p>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-agri-700">Giá trị cốt lõi</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <CheckCircle className="w-6 h-6 text-agri-500 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-800">Chất lượng hàng đầu</h4>
              <p className="text-sm">Chúng tôi chỉ cung cấp những sản phẩm đã qua kiểm định nghiêm ngặt và mang lại hiệu quả thực tế rõ rệt trên đồng ruộng.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <CheckCircle className="w-6 h-6 text-agri-500 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-800">Đồng hành & Tận tâm</h4>
              <p className="text-sm">Xanh AG luôn sát cánh cùng bà con trong mọi giai đoạn của mùa vụ, từ lúc gieo hạt cho đến khi thu hoạch.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <CheckCircle className="w-6 h-6 text-agri-500 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-800">Sáng tạo không ngừng</h4>
              <p className="text-sm">Luôn cập nhật những kiến thức và công nghệ mới nhất để giúp nông dân Việt Nam bắt kịp xu hướng nông nghiệp toàn cầu.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 -mx-8 sm:-mx-12 md:-mx-16 px-8 sm:px-12 md:px-16 py-12 mt-12 mb-0 rounded-b-3xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Con số biết nói</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-black text-agri-600">5+</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 px-2">Năm kinh nghiệm</div>
          </div>
          <div>
            <div className="text-4xl font-black text-agri-600">1000+</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 px-2">Hộ nông dân tin dùng</div>
          </div>
          <div>
            <div className="text-4xl font-black text-agri-600">500+</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 px-2">Sản phẩm chất lượng</div>
          </div>
          <div>
            <div className="text-4xl font-black text-agri-600">24/7</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 px-2">Hỗ trợ kỹ thuật</div>
          </div>
        </div>
      </section>
    </StaticPageWrapper>
  )
}
