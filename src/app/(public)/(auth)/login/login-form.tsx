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
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"

const LoginForm = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      user_account: "",
      user_password: "",
    },
  })

  const onSubmit = async ({ user_account, user_password }: LoginBodyType) => {
    setIsLoading(true)
    try {
      // TODO: Implement login logic
      console.log("Login:", { user_account, user_password, rememberMe })
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
    } catch (error) {
      console.error("Login error:", error)
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
          {/* Email Field */}
          <FormField
            control={form.control}
            name='user_account'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-bold text-gray-700 flex items-center gap-2'>
                  <Mail className="w-4 h-4 text-green-600" />
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='example@xanhag.vn'
                    type='email'
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
