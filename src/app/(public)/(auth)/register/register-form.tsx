"use client"

import { REGEXP_ONLY_DIGITS } from "input-otp"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { MdArrowBack } from "react-icons/md"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  RegisterEmail,
  RegisterEmailType,
  RegisterPassword,
  RegisterPasswordType,
  RegisterVerifyOTP,
  RegisterVerifyOTPType,
} from "@/schemaValidations/auth.schema"
import { useState } from "react"
import { Player } from "@lottiefiles/react-lottie-player"
import Link from "next/link"
import Btn from "@/app/components/Btn"

type Steps = 1 | 2 | 3 | undefined

const RegisterForm = () => {
  const [step, setStep] = useState<Steps>(undefined)
  const [email, setEmail] = useState<string>("")
  const [token, setToken] = useState<string>("")

  const form = useForm<RegisterEmailType>({
    resolver: zodResolver(RegisterEmail),
    defaultValues: {
      verifyKey: "",
      verifyPurpose: "TEST_USER",
      verifyType: 1, // Thay đổi từ 1 sang 2
    },
  })
  console.log("errr", form.formState.errors)

  const onSubmitEmail = async (values: RegisterEmailType) => {
    // TODO: Implement register email logic
    console.log("Register email:", values)
    setEmail(values.verifyKey)
    setStep(1)
  }

  return (
    <>
      {!step ? (
        <section className='bg-white/85 w-[90%] md:w-[450px] min-h-[400px] flex items-center px-6 sm:px-10 rounded-lg shadow-lg'>
          <article className='w-full py-8'>
            <h1 className='text-center md:text-left font-bold text-2xl sm:text-3xl mb-8 text-primary'>
              Email
            </h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitEmail)}
                className='space-y-6 w-full'
                noValidate
              >
                <FormField
                  control={form.control}
                  name='verifyKey'
                  render={({ field }) => (
                    <FormItem>
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

                <Btn
                  title='Tiếp theo'
                  type='submit'
                />
              </form>
            </Form>
          </article>
        </section>
      ) : step === 1 ? (
        <InputOTPPattern setStep={setStep} email={email} setToken={setToken} />
      ) : step === 2 ? (
        <CreatePass setStep={setStep} token={token} />
      ) : (
        <SuccessRegister />
      )}
    </>
  )
}

function InputOTPPattern({
  setToken,
  setStep,
  email = "",
}: {
  setToken: (token: string) => void
  setStep: (step: Steps) => void
  email: string
}) {
  const form = useForm<RegisterVerifyOTPType>({
    resolver: zodResolver(RegisterVerifyOTP),
    defaultValues: {
      verifyCode: "",
      verifyKey: email,
    },
  })

  async function onSubmitOTP(values: RegisterVerifyOTPType) {
    // TODO: Implement verify OTP logic
    console.log("Verify OTP:", values)
    setToken("dummy-token")
    setStep(2)
  }

  return (
    <section className='bg-white/85 w-[90%] md:w-[450px] min-h-[400px] flex items-center px-6 sm:px-10 rounded-lg shadow-lg'>
      <article className='w-full py-8'>
        <Form {...form}>
          <div className='flex flex-col'>
            <button
              className='self-start p-2 hover:bg-gray-100 rounded-full transition-colors'
              onClick={() => setStep(undefined)}
            >
              <MdArrowBack size={24} />
            </button>
            <div className='text-center md:text-left'>
              <p className='text-2xl sm:text-3xl font-bold mt-4 text-primary'>
                Nhập mã xác thực
              </p>
              <p className='text-sm text-gray-600 mt-2 font-medium'>
                Mã xác thực sẽ được gửi qua email
              </p>
            </div>
            <div className='mt-8 w-full'>
              <form
                onSubmit={form.handleSubmit(onSubmitOTP)}
                className='w-full'
              >
                <FormField
                  control={form.control}
                  name='verifyCode'
                  render={({ field }) => (
                    <FormItem className='flex flex-col items-center md:items-start w-full'>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          {...field}
                          pattern={REGEXP_ONLY_DIGITS}
                          className='gap-2 sm:gap-3'
                        >
                          <InputOTPGroup>
                            <InputOTPSlot
                              index={0}
                              className='bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 font-medium'
                            />
                            <InputOTPSlot
                              index={1}
                              className='bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 font-medium'
                            />
                            <InputOTPSlot
                              index={2}
                              className='bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 font-medium'
                            />
                            <InputOTPSlot
                              index={3}
                              className='bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 font-medium'
                            />
                            <InputOTPSlot
                              index={4}
                              className='bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 font-medium'
                            />
                            <InputOTPSlot
                              index={5}
                              className='bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 font-medium'
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage className='text-red-600 font-medium mt-2' />
                    </FormItem>
                  )}
                />
                <p className='text-center md:text-left mt-8 text-sm text-gray-600'>
                  Bạn vẫn chưa nhận được?{" "}
                  <button
                    onClick={() => {}}
                    className='text-primary hover:underline'
                  >
                    Gửi lại
                  </button>
                </p>
                <div className='mt-8'>
                  <Btn
                    title='Tiếp theo'
                    type='submit'
                  />
                </div>
              </form>
            </div>
          </div>
        </Form>
      </article>
    </section>
  )
}

function CreatePass({
  setStep,
  token,
}: {
  setStep: (step: Steps) => void
  token: string
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const form = useForm<RegisterPasswordType>({
    resolver: zodResolver(RegisterPassword),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: RegisterPasswordType) {
    // TODO: Implement update password logic
    console.log("Update password:", { ...values, token })
    setStep(3)
  }

  return (
    <section className='bg-white/85 w-[90%] md:w-[450px] min-h-[400px] flex items-center px-6 sm:px-10 rounded-lg shadow-lg'>
      <article className='w-full py-8'>
        <p className='text-2xl sm:text-3xl text-center md:text-left font-bold mb-8 text-primary'>
          Tạo mật khẩu
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 w-full'
            noValidate
          >
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base'>Mật khẩu</FormLabel>
                   <FormControl>
                     <div className="relative group">
                       <Input
                         placeholder='Nhập mật khẩu'
                         {...field}
                         type={showPassword ? 'text' : 'password'}
                         className='w-full h-12 text-base bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-gray-800 font-medium pr-10'
                       />
                       <button
                         type="button"
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           setShowPassword(!showPassword);
                         }}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                       >
                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                       </button>
                     </div>
                   </FormControl>
                  <FormMessage className='text-red-600 font-medium' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base'>Nhập lại mật khẩu</FormLabel>
                   <FormControl>
                     <div className="relative group">
                       <Input
                         placeholder='Nhập lại mật khẩu'
                         {...field}
                         type={showConfirmPassword ? 'text' : 'password'}
                         className='w-full h-12 text-base bg-white border-2 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-gray-800 font-medium pr-10'
                       />
                       <button
                         type="button"
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           setShowConfirmPassword(!showConfirmPassword);
                         }}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                       >
                         {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                       </button>
                     </div>
                   </FormControl>
                  <FormMessage className='text-red-600 font-medium' />
                </FormItem>
              )}
            />

            <Btn
              title='Xác nhận'
              type='submit'
            />
          </form>
        </Form>
      </article>
    </section>
  )
}

function SuccessRegister() {
  return (
    <section className='bg-white/85 w-[90%] md:w-[450px] min-h-[400px] flex items-center px-6 sm:px-10 rounded-lg shadow-lg'>
      <article className='w-full py-8 flex flex-col items-center md:items-start'>
        <div className='w-32 h-32'>
          <Player
            autoplay
            loop
            src='/assets/Success.json'
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <p className='mt-6 text-base sm:text-lg text-center md:text-left text-gray-600'>
          Chúc mừng bạn đã đăng kí tài khoản thành công!
        </p>
        <Link className='w-full mt-8' href={"/login"}>
          <Button className='w-full h-12 text-white cursor-pointer text-base'>
            Đến trang đăng nhập
          </Button>
        </Link>
      </article>
    </section>
  )
}

export default RegisterForm
