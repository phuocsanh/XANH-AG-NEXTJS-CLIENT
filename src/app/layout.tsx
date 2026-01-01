import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Lexend } from "next/font/google"
import RootProvider from "@/provider/root-provider"
import Block from "./components/Block"
import { FirebaseNotificationsProvider } from "./components/firebase-notifications-provider"

const lexend = Lexend({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Xanh AG - Nông nghiệp thông minh",
  description: "Ứng dụng quản lý nông nghiệp thông minh cho nông dân",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
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
  themeColor: "#16a34a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          lexend.className,
          "min-h-screen bg-background antialiased"
        )}
      >
        <RootProvider>
          <FirebaseNotificationsProvider />
          <Block>{children}</Block>
        </RootProvider>
      </body>
    </html>
  )
}
