import { NextResponse } from 'next/server'
import envConfig from '@/config'

/**
 * API Route: Get all product types
 * Endpoint: GET /api/product-types
 * 
 * Fetches active product types from backend
 */
export async function GET() {
  try {
    // Gọi backend để lấy product types với status active (public endpoint)
    const response = await fetch(
      `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/product-types/by-status/active`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Không cache để luôn lấy data mới
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch product types:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch product types', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Backend trả về { success, data, meta }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching product types:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
