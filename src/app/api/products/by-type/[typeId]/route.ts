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
    
    console.log(`[API] Fetching products for type: ${typeId}`)

    // Gọi backend để lấy products theo type
    const url = `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/products/type/${typeId}`
    console.log(`[API] Calling backend: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Không cache để luôn lấy data mới
    })

    console.log(`[API] Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API] Failed to fetch products for type ${typeId}:`, response.status, response.statusText)
      console.error(`[API] Error response:`, errorText)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch products', 
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`[API] Backend response data:`, JSON.stringify(data).substring(0, 200))
    
    // Backend trả về { success, data, meta }
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
