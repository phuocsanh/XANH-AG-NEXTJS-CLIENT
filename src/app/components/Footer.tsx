'use client'

import React from "react"
import Link from "next/link"
import { FaFacebook, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"
import Img from "./Img"

const footerLinks = {
  customerService: [
    { name: "Hướng dẫn mua hàng", href: "/huong-dan" },
    { name: "Chính sách đổi trả", href: "/chinh-sach-doi-tra" },
    { name: "Chính sách bảo mật", href: "/bao-mat" },
    { name: "Điều khoản sử dụng", href: "/dieu-khoan" },
  ],
  company: [
    { name: "Giới thiệu Xanh AG", href: "/about" },
    { name: "Sản phẩm", href: "/products" },
    { name: "Tin tức", href: "/news" },
    { name: "Liên hệ", href: "/contact" },
  ]
}

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-agri-900 to-agri-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-full p-1 overflow-hidden">
                  <Img
                    alt="Xanh AG Logo"
                    src="/assets/logo3.png"
                    fill
                    classNameImg="object-contain scale-150"
                  />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white uppercase">
                  Xanh <span className="text-agri-400">AG</span>
                </span>
              </div>
            </Link>
            <p className="text-agri-100/80 leading-relaxed">
              Xanh AG - Giải pháp nông nghiệp xanh, bền vững. Chúng tôi cung cấp vật tư nông nghiệp chất lượng cao cho bà con nông dân.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-agri-700 flex items-center justify-center hover:bg-agri-600 transition-colors shadow-lg">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-agri-700 flex items-center justify-center hover:bg-agri-600 transition-colors shadow-lg">
                <FaYoutube className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Về Xanh AG
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-accent-gold rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-agri-100/80 hover:text-white hover:translate-x-1 transition-all inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Hỗ trợ khách hàng
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-accent-gold rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-agri-100/80 hover:text-white hover:translate-x-1 transition-all inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Liên hệ với chúng tôi
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-accent-gold rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-agri-100/80">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-accent-gold" />
                <span>Số nhà 257, Tân Hòa A, Tân Hiệp - An Giang</span>
              </li>
              <li className="flex items-center gap-3 text-agri-100/80">
                <FaPhoneAlt className="flex-shrink-0 text-accent-gold" />
                <a href="tel:0987383606" className="hover:text-white transition-colors font-semibold text-lg">
                  0987.383.606
                </a>
              </li>
              <li className="flex items-center gap-3 text-agri-100/80">
                <FaEnvelope className="flex-shrink-0 text-accent-gold" />
                <a href="mailto:contact@xanhag.com" className="hover:text-white transition-colors">
                  contact@xanhag.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-agri-700/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-agri-100/60">
          <p>© {new Date().getFullYear()} Xanh AG. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Bảo mật</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Điều khoản</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
