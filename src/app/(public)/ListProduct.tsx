"use client"
import React, { useEffect } from "react"
import Block from "@/app/components/Block"
import Img from "../components/Img"
import { useInfiniteQuery } from "@tanstack/react-query"
import { convertCurrency } from "@/lib/utils"
import { IoMdStar } from "react-icons/io"
import { useSearchParams, useRouter } from "next/navigation"
import { PagingResponseData } from "@/models/common"
import { ProductItem } from "@/models/product"
import LoadingSpinner from "../components/LoadingSpinner"
import { COLLOR } from "@/lib/color"
import { useInView } from "react-intersection-observer"

function ListProduct({ data }: { data: PagingResponseData<ProductItem> }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { ref, inView } = useInView()
  const category = searchParams.get("category")
  
  // TODO: Implement direct API call to backend
  /* Original code - restore when implementing:
  const {
    data: queryData,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products", category],
    queryFn: async ({ pageParam }) => {
      const res = await productApiRequest.findAllOrTypePublishProduct({
        product_type: category || "",
        limit: 30,
        page: pageParam || 1,
      })

      return res
    },
    getNextPageParam: (pages) => {
      if (pages.data.currentPage >= pages.data.totalPages) {
        return undefined
      }
      return pages.data.currentPage + 1
    },
    initialPageParam: data.data.currentPage,
    initialData: {
      pages: [data],
      pageParams: [1],
    },
  })
  const products = queryData?.pages.flatMap((page) => page.data.data) || []
  */
  
  // Mock data for now
  const products: ProductItem[] = []
  const isFetchingNextPage = false
  const fetchNextPage = () => {}
  const refetch = () => {}

  useEffect(() => {
    refetch() // Lấy lại dữ liệu khi `category` thay đổi
  }, [category, refetch])

  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage])

  useEffect(() => {
    if (searchParams) {
      router.replace(`?${searchParams.toString()}`)
    }
  }, [searchParams, router])

  return (
    <Block>
      <section className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8  mt-6 bg-white justify-items-center '>
        {products.length > 0 &&
          products.map((p) => (
            <div
              onClick={() => {}}
              key={p.id}
              className=' w-full pb-2 bg-white flex flex-col items-center cursor-pointer shadow-md transition-transform duration-300 transform hover:scale-105'
            >
              <div className='w-full h-72 overflow-hidden shadow-sm'>
                <Img
                  src={p?.productThumb}
                  alt={p?.productName || "Sản phẩm"}
                />
              </div>
              <div className='flex flex-col flex-grow justify-between w-full'>
                <p className='mt-2 px-2 line-clamp-2 font-semibold text-center flex-grow'>
                  {p?.productName}
                </p>
                <div>
                  <div className='flex justify-between'>
                    <p className='mt-1 px-2 line-clamp-2 text-slate-400 italic text-sm'>
                      size: {p?.productAttributes?.size}
                    </p>
                    <p className='mt-1 flex px-2 line-clamp-2 text-slate-400 italic items-center text-sm'>
                      {p?.productRatingsAverage || "5.0"}
                      <IoMdStar className='ml-1 text-yellow-400' />
                    </p>
                  </div>
                  <p className='mt-2 px-2 text-primary font-semibold text-center'>
                    {convertCurrency(
                      parseFloat(
                        p?.productDiscountedPrice || p?.productPrice || "0"
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </section>
      {isFetchingNextPage && (
        <LoadingSpinner color={COLLOR.primary} classNameF='mt-4' />
      )}
      <div ref={ref} />
    </Block>
  )
}

export default ListProduct
