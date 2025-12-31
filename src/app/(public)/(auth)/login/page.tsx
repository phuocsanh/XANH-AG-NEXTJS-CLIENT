"use client"

import LoginForm from "./login-form";
import Link from "next/link";

export default function Login() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[url('/assets/leaf.png')] bg-repeat opacity-10 animate-pulse"></div>
      </div>

      {/* Floating Particles - Using CSS only to avoid hydration issues */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        <div className="particle particle-7"></div>
        <div className="particle particle-8"></div>
        <div className="particle particle-9"></div>
        <div className="particle particle-10"></div>
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-2xl sm:text-3xl font-black text-white">🌾</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-green-700 tracking-tight">XANH AG</h1>
            <p className="text-xs text-green-600 font-bold">Nông nghiệp thông minh</p>
          </div>
        </Link>
      </div>

      {/* Register Link */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20">
        <Link
          href="/register"
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/80 backdrop-blur-sm text-green-700 rounded-xl font-bold text-sm hover:bg-white hover:shadow-lg transition-all border border-green-100"
        >
          Đăng ký
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md animate-fade-in-up">
          <LoginForm />
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        .particle {
          position: absolute;
          width: 16px;
          height: 16px;
          background: rgba(34, 197, 94, 0.2);
          border-radius: 50%;
          animation: float linear infinite;
        }
        .particle-1 { left: 10%; animation-delay: 0s; animation-duration: 15s; }
        .particle-2 { left: 20%; animation-delay: 1s; animation-duration: 18s; }
        .particle-3 { left: 30%; animation-delay: 2s; animation-duration: 12s; }
        .particle-4 { left: 40%; animation-delay: 0.5s; animation-duration: 20s; }
        .particle-5 { left: 50%; animation-delay: 3s; animation-duration: 16s; }
        .particle-6 { left: 60%; animation-delay: 1.5s; animation-duration: 14s; }
        .particle-7 { left: 70%; animation-delay: 2.5s; animation-duration: 19s; }
        .particle-8 { left: 80%; animation-delay: 0.8s; animation-duration: 13s; }
        .particle-9 { left: 90%; animation-delay: 3.5s; animation-duration: 17s; }
        .particle-10 { left: 15%; animation-delay: 4s; animation-duration: 21s; }

        @keyframes float {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
