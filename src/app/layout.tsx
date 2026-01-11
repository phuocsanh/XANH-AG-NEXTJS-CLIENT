import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Lexend } from "next/font/google"
import RootProvider from "@/provider/root-provider"
import { FirebaseNotificationsProvider } from "./components/firebase-notifications-provider"
import { RemoteConfigInitializer } from "@/components/remote-config-initializer"
import { JsonLd } from "@/components/JsonLd"

const lexend = Lexend({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Xanh AG - Nông nghiệp thông minh",
  description: "Ứng dụng quản lý nông nghiệp thông minh cho nông dân",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Xanh AG",
  },
  icons: {
    apple: "/assets/logo3.png",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#059669",
  viewportFit: "cover",
}

// Organization Schema cho SEO
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Xanh AG',
  url: 'https://xanhag.com',
  logo: 'https://xanhag.com/assets/logo3.png',
  description: 'Ứng dụng quản lý nông nghiệp thông minh cho nông dân Việt Nam',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+84-987-383-606',
    contactType: 'Customer Service',
    areaServed: 'VN',
    availableLanguage: 'Vietnamese',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Số nhà 257, Tân Hòa A',
    addressLocality: 'Tân Hiệp',
    addressRegion: 'An Giang',
    addressCountry: 'VN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='vi' suppressHydrationWarning>
      <body
        className={cn(
          lexend.className,
          "min-h-screen bg-background antialiased"
        )}
      >
        <JsonLd data={organizationSchema} />
        <RootProvider>
          <RemoteConfigInitializer />
          <FirebaseNotificationsProvider />
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
