import { Metadata } from 'next'
import ContactClient from './contact-client'

export const metadata: Metadata = {
  title: 'Liên hệ | Xanh AGRI',
  description: 'Liên hệ với Xanh AGRI để được tư vấn về vật tư nông nghiệp, kỹ thuật canh tác và giải pháp nông nghiệp thông minh. Hỗ trợ 24/7',
  keywords: ['liên hệ', 'tư vấn nông nghiệp', 'hỗ trợ khách hàng', 'Xanh AGRI'],
  openGraph: {
    title: 'Liên hệ | Xanh AGRI',
    description: 'Liên hệ với Xanh AGRI để được tư vấn và hỗ trợ',
    url: 'https://xanhag.com/contact',
    siteName: 'Xanh AGRI',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://xanhag.com/contact',
  },
}

/**
 * Contact Page - Server Component
 * Trang liên hệ với form và thông tin
 */
export default function ContactPage() {
  return <ContactClient />
}
