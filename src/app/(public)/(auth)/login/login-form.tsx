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
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema"
import Btn from "@/app/components/Btn"
import { useRouter } from "next/navigation"
import Link from "next/link"

const LoginForm = () => {
  const router = useRouter()
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      user_account: "",
      user_password: "",
    },
  })

  const onSubmit = async ({ user_account, user_password }: LoginBodyType) => {
    // TODO: Implement login logic
    console.log("Login:", { user_account, user_password })
  }

  return (
    <section className='bg-white/85 w-[90%] md:w-[450px] min-h-[400px] flex items-center px-6 sm:px-10 rounded-lg shadow-lg'>
      <article className='w-full py-8'>
        <h1 className='text-center md:text-left font-bold text-2xl sm:text-3xl mb-8 text-primary'>
          Đăng nhập
        </h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 w-full'
            noValidate
          >
            <FormField
              control={form.control}
              name='user_account'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base'>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nhập email'
                      type='email'
                      className='w-full h-12 text-base bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-gray-800 font-medium'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='text-red-600 font-medium' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='user_password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base'>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nhập mật khẩu'
                      type='password'
                      className='w-full h-12 text-base bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-gray-800 font-medium'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='text-red-600 font-medium' />
                </FormItem>
              )}
            />

            <div className='flex flex-col space-y-4'>
              <Btn
                title='Đăng nhập'
                type='submit'
              />
              <Link
                href='/register'
                className='text-center text-sm text-gray-600 hover:text-primary transition-colors'
              >
                Chưa có tài khoản? Đăng ký ngay
              </Link>
            </div>
          </form>
        </Form>
      </article>
    </section>
  )
}

export default LoginForm
