"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Phone, Lock, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { handleErrorApi } from "@/lib/utils"
import { useAppStore } from "@/stores"

const LoginForm = () => {
  const setIsLogin = useAppStore((state) => state.setIsLogin)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      user_account: "",
      user_password: "",
    },
  })

  const onSubmit = async (data: LoginBodyType, e?: React.BaseSyntheticEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          account: data.user_account,
          password: data.user_password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw { response: { data: result, message: result.message } }
      }

      console.log("✅ Login response:", result)

      // Lưu tokens - response có cấu trúc { success, data: { access_token, refresh_token, user } }
      const tokens = result.data || result // Fallback nếu không có .data wrapper
      
      if (rememberMe) {
        localStorage.setItem("accessToken", tokens.access_token)
        localStorage.setItem("refreshToken", tokens.refresh_token)
        localStorage.setItem("user", JSON.stringify(tokens.user)) // Lưu thông tin user
        console.log("✅ Saved to localStorage:", {
          accessToken: localStorage.getItem("accessToken")?.substring(0, 20) + "...",
          refreshToken: localStorage.getItem("refreshToken")?.substring(0, 20) + "...",
          user: tokens.user?.account
        })
      } else {
        sessionStorage.setItem("accessToken", tokens.access_token)
        sessionStorage.setItem("refreshToken", tokens.refresh_token)
        sessionStorage.setItem("user", JSON.stringify(tokens.user)) // Lưu thông tin user
        console.log("✅ Saved to sessionStorage:", {
          accessToken: sessionStorage.getItem("accessToken")?.substring(0, 20) + "...",
          refreshToken: sessionStorage.getItem("refreshToken")?.substring(0, 20) + "...",
          user: tokens.user?.account
        })
      }

      setIsLogin(true)

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại!",
      })

      // Redirect to dashboard or home
      router.push("/rice-crops")
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-8 sm:p-10 relative overflow-hidden'>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400/20 to-transparent rounded-full blur-2xl"></div>

      {/* Header */}
      <div className='relative mb-8'>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">🌾</span>
          </div>
          <h1 className='font-black text-3xl sm:text-4xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent'>
            Chào mừng trở lại
          </h1>
        </div>
        <p className="text-gray-600 font-medium text-sm">Đăng nhập để tiếp tục quản lý nông trại của bạn</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5 relative'
          noValidate
        >
          {/* Phone Field */}
          <FormField
            control={form.control}
            name='user_account'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-bold text-gray-700 flex items-center gap-2'>
                  <Phone className="w-4 h-4 text-green-600" />
                  Số điện thoại
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Nhập số điện thoại'
                    type='tel'
                    className='h-12 text-base bg-white/50 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all rounded-xl text-gray-800 font-medium placeholder:text-gray-400'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-600 font-medium text-sm animate-shake' />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name='user_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-bold text-gray-700 flex items-center gap-2'>
                  <Lock className="w-4 h-4 text-green-600" />
                  Mật khẩu
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='••••••••'
                    type='password'
                    className='h-12 text-base bg-white/50 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all rounded-xl text-gray-800 font-medium'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-600 font-medium text-sm animate-shake' />
              </FormItem>
            )}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-gray-600 cursor-pointer select-none"
              >
                Nhớ mật khẩu
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-black text-base rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group'
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                href='/register'
                className='font-bold text-green-600 hover:text-green-700 transition-colors hover:underline'
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>
      </Form>

      {/* Shake Animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        :global(.animate-shake) {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default LoginForm
