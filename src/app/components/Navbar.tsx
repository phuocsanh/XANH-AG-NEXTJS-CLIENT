// components/Navbar.tsx
"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CreditCard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IoMdArrowDropdown } from "react-icons/io"
import { useAppStore } from "@/stores"
import Img from "./Img"
import Block from "./Block"
import { useState, useEffect } from "react"

interface ProductType {
  id: number
  name: string
  code: string
  status: string
}

export default function Navbar() {
  const isAuthenticated = useAppStore((state) => state.isLogin)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [productTypes, setProductTypes] = useState<ProductType[]>([])

  // Fetch product types for dropdown
  useEffect(() => {
    async function fetchProductTypes() {
      try {
        const response = await fetch('/api/product-types')
        if (!response.ok) return
        
        const data = await response.json()
        if (data.success && data.data) {
          setProductTypes(data.data)
        }
      } catch (error) {
        console.error('Error fetching product types:', error)
      }
    }

    fetchProductTypes()
  }, [])

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logout clicked")
  }

  return (
    <nav className='fixed left-0 w-full z-50 h-auto bg-background'>
      <Block className='px-0'>
        <div className='px-2 sm:px-8 py-3 flex items-center justify-between'>
          <div className='flex items-center space-x-4 sm:space-x-8'>
            {/* Logo */}
            <Link
              href='/'
              className='text-sm md:text-lg font-semibold text-foreground truncate flex items-center'
            >
              <div className='w-8 h-8 sm:w-9 sm:h-9'>
                <Img
                  alt=''
                  src='https://cdn-icons-png.flaticon.com/128/8044/8044419.png'
                  fill
                />
              </div>
            </Link>

            {/* Menu chính - Desktop */}
            <div className='hidden sm:flex items-center space-x-6'>
              <Link
                href='/'
                className='text-foreground hover:text-primary font-medium'
              >
                Trang chủ
              </Link>
              <div className='relative group'>
                <Link
                  href='/products'
                  className='text-foreground hover:text-primary font-medium flex items-center'
                >
                  Sản phẩm
                  <IoMdArrowDropdown className='w-5 h-5 ml-1 transition-transform duration-300 transform group-hover:rotate-180' />
                </Link>
                <div className='absolute top-full left-0 text-sm bg-background border border-border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] py-2 mt-1'>
                  <Link
                    href='/products'
                    className='block px-4 py-2 hover:bg-accent text-foreground font-medium'
                  >
                    Tất cả sản phẩm
                  </Link>
                  {productTypes.length > 0 && (
                    <>
                      <div className='border-t border-border my-1' />
                      {productTypes.map((type) => (
                        <Link
                          key={type.id}
                          href={`/products#type-${type.id}`}
                          className='block px-4 py-2 hover:bg-accent text-foreground'
                        >
                          {type.name}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <Link
                href='/promotions'
                className='text-foreground hover:text-primary font-medium'
              >
                Khuyến mãi
              </Link>
              <Link
                href='/chat'
                className='text-foreground hover:text-primary font-medium'
              >
                Chat
              </Link>
              <Link
                href='/weather-forecast'
                className='text-foreground hover:text-primary font-medium'
              >
                Thời tiết
              </Link>
              <Link
                href='/lunar-calendar'
                className='text-foreground hover:text-primary font-medium'
              >
                Lịch vạn niên
              </Link>
              <Link
                href='/contact'
                className='text-foreground hover:text-primary font-medium'
              >
                Liên hệ
              </Link>
            </div>
          </div>

          <div className='flex items-center space-x-2 sm:space-x-4'>
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='sm:hidden p-1 text-foreground hover:text-primary'
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* User menu - Visible on both mobile and desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className='h-8 w-8 sm:h-10 sm:w-10'>
                  <AvatarImage
                    src='https://github.com/shadcn.png'
                    alt='@shadcn'
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-48 md:w-56 bg-background'
              >
                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className='mr-2 h-4 w-4' />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className='mr-2 h-4 w-4' />
                      <span>Billing</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                ) : (
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className='mr-2 h-4 w-4' />
                      <Link href={"/register"}>Đăng kí</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className='mr-2 h-4 w-4' />
                      <Link href={"/login"}>Đăng nhập</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LifeBuoy className='mr-2 h-4 w-4' />
                  <span>Hỗ trợ</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className='mr-2 h-4 w-4' />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAuthenticated && (
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className='sm:hidden bg-background border-t'>
            <div className='px-4 py-2 space-y-1'>
              <Link
                href='/'
                className='block py-2 text-foreground hover:text-primary font-medium text-sm'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <div className='relative'>
                <button className='w-full py-2 text-left text-foreground hover:text-primary font-medium text-sm flex items-center justify-between'>
                  Sản phẩm
                  <IoMdArrowDropdown className='w-4 h-4' />
                </button>
              </div>
              <Link
                href='/'
                className='block py-2 text-foreground hover:text-primary font-medium text-sm'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Khuyến mãi
              </Link>
              <Link
                href='/weather-forecast'
                className='block py-2 text-foreground hover:text-primary font-medium text-sm'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Thời tiết
              </Link>
              <Link
                href='/lunar-calendar'
                className='block py-2 text-foreground hover:text-primary font-medium text-sm'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Lịch vạn niên
              </Link>
              <Link
                href='/contact'
                className='block py-2 text-foreground hover:text-primary font-medium text-sm'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Liên hệ
              </Link>
            </div>
          </div>
        )}
      </Block>
    </nav>
  )
}
