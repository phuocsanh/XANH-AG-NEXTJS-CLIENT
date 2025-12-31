'use client'

import { Award, Users, ThumbsUp, Package } from 'lucide-react'

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const features: Feature[] = [
  {
    id: 'quality',
    title: 'Sản phẩm chính hãng',
    description: 'Cung cấp 100% sản phẩm chính hãng có nguồn gốc xuất xứ rõ ràng',
    icon: <Award className="w-12 h-12 text-agri-500" />,
  },
  {
    id: 'support',
    title: 'Tư vấn tận tình',
    description: 'Luôn đồng hành hỗ trợ khách hàng tốt nhất',
    icon: <Users className="w-12 h-12 text-agri-500" />,
  },
  {
    id: 'experience',
    title: 'Kinh nghiệm dày dặn',
    description: 'Với hơn 30 năm kinh nghiệm, chúng tôi tự tin rằng sẽ là bạn đồng hành tốt nhất của quý khách',
    icon: <ThumbsUp className="w-12 h-12 text-agri-500" />,
  },
  {
    id: 'variety',
    title: 'Đa dạng sản phẩm',
    description: 'Cung cấp toàn bộ sản phẩm về vật tư nông nghiệp',
    icon: <Package className="w-12 h-12 text-agri-500" />,
  },
]

/**
 * Features Section Component
 * "VỀ CHÚNG TÔI" section với 4 feature highlights
 */
export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-accent-gold mb-4">
            VỀ CHÚNG TÔI
          </h2>
          <div className="flex justify-center mb-6">
            <svg width="80" height="20" viewBox="0 0 80 20" className="text-accent-gold">
              <path
                d="M5,10 Q10,5 15,10 T25,10 T35,10 T45,10 T55,10 T65,10 T75,10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Hơn 30 năm đồng hành cùng nông nghiệp Việt, chúng tôi tạo dựng thương hiệu và uy tín của cửa hàng bằng những điều tốt đẹp mà đội ngũ kỹ sư mạng lại cho từng mảnh vườn trên khắp toàn quốc. Với mong muốn góp phần vào sự phát triển nền nông nghiệp nước nhà theo hướng sạch, an toàn và chất lượng. Chúng tôi đã và đang hoàn thiện và kiện thực nông nghiệp tiên tiến nhằm đáp ứng tốt nhất nhu cầu của nông dân thời đại 4.0
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="group text-center"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Icon container */}
              <div className="mb-4 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-agri-50 flex items-center justify-center group-hover:bg-agri-100 transition-colors duration-300 group-hover:scale-110 transform">
                  {feature.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add fadeInUp animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
