import { NextResponse } from 'next/server'
import envConfig from '@/config'

/**
 * API Route: Get products by type
 * Endpoint: GET /api/products/by-type/[typeId]
 * 
 * Fetches products for a specific product type
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ typeId: string }> }
) {
  try {
    // Next.js 15 requires awaiting params
    const { typeId } = await params
    
    // Lấy page và limit từ query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const keyword = searchParams.get('keyword') || ''
    
    console.log(`[API] Fetching products for type: ${typeId}, page: ${page}, limit: ${limit}`)

    // Sử dụng endpoint /products/search của backend vì nó hỗ trợ phân trang tốt hơn
    const url = `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/products/search`
    console.log(`[API] Calling backend search: ${url}`)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type_id: parseInt(typeId),
        page,
        limit,
        keyword: keyword || undefined,
        status: 'active', // Chỉ lấy sản phẩm đang hoạt động
        is_sold_on_web: true // Chỉ lấy sản phẩm cho phép bán trên web
      }),
      cache: 'no-store',
    })

    console.log(`[API] Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API] Failed to fetch products for type ${typeId}:`, response.status, response.statusText)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch products', 
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    // Trả về dữ liệu bao gồm cả pagination info nếu có
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
