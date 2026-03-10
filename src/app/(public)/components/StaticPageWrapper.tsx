'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface StaticPageWrapperProps {
  title: string
  breadcrumb: { label: string; href?: string }[]
  children: React.ReactNode
}

export default function StaticPageWrapper({ title, breadcrumb, children }: StaticPageWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header section with breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-10 mb-8 sm:mb-12">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 font-medium">
            <Link href="/" className="hover:text-agri-600 flex items-center gap-1 transition-colors">
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </Link>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                {item.href ? (
                  <Link href={item.href} className="hover:text-agri-600 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-agri-600 font-bold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            {title}
          </h1>
          <div className="w-20 h-1.5 bg-accent-gold rounded-full mt-6"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-12 md:p-16 border border-gray-50 overflow-hidden relative">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-agri-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl opacity-50 -ml-32 -mb-32"></div>
            
            <div className="prose prose-lg prose-agri max-w-none relative z-10 text-gray-600 leading-relaxed space-y-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
