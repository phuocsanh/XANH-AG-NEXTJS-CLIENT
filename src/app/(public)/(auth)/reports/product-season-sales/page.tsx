"use client"

import { useState } from "react"
import { BarChart3, PackageSearch, RotateCcw, ShoppingCart } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-user-profile"
import { useSeasons } from "@/hooks/use-seasons"
import { useApiQuery } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

interface Product { id: number; name?: string; trade_name?: string; code?: string }
interface ProductSearchResponse { data: Product[]; total: number }
interface ProductSeasonSales {
  product_name: string
  season_name: string
  quantity_invoiced: number
  quantity_returned: number
  quantity_sold: number
  unit_name?: string
  invoice_count: number
}

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 4 }).format(value)

export default function ProductSeasonSalesPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const isSuperAdmin = user?.role?.code === "SUPER_ADMIN"
  const [seasonId, setSeasonId] = useState("")
  const [productId, setProductId] = useState("")
  const { data: seasonsData, isLoading: seasonsLoading } = useSeasons({ limit: 100 }, isSuperAdmin)
  const { data: productsData, isLoading: productsLoading } = useApiQuery<ProductSearchResponse>(`${API_URL}/products/search`, {
    method: "POST",
    body: { page: 1, limit: 200 },
    queryKey: ["report-products"],
    enabled: isSuperAdmin,
  })
  const report = useApiQuery<ProductSeasonSales>(`${API_URL}/store-profit-report/season/${seasonId}/product/${productId}`, {
    queryKey: ["product-season-sales", seasonId, productId],
    enabled: isSuperAdmin && Boolean(seasonId && productId),
  })

  if (userLoading) return <div className="mx-auto max-w-5xl p-6"><Skeleton className="h-48 w-full" /></div>
  if (!isSuperAdmin) return <div className="mx-auto max-w-3xl p-6"><Alert variant="destructive"><AlertTitle>Không có quyền truy cập</AlertTitle><AlertDescription>Chỉ Super Admin được xem thống kê sản phẩm theo mùa vụ.</AlertDescription></Alert></div>

  const seasons = seasonsData?.data || []
  const products = productsData?.data || []
  const unit = report.data?.unit_name || "đơn vị"

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div className="flex items-center gap-3 text-emerald-700"><BarChart3 className="h-6 w-6" /><span className="text-sm font-semibold uppercase tracking-wide">Báo cáo bán hàng</span></div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Số lượng sản phẩm đã bán theo mùa vụ</h1>
          <p className="mt-2 text-sm text-slate-600">Chọn một sản phẩm và mùa vụ để xem số lượng thực bán sau khi trừ hàng trả lại.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Bộ lọc báo cáo</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="space-y-2 text-sm font-medium text-slate-700">Mùa vụ
              <Select value={seasonId} onValueChange={setSeasonId}><SelectTrigger><SelectValue placeholder={seasonsLoading ? "Đang tải..." : "Chọn mùa vụ"} /></SelectTrigger><SelectContent>{seasons.map((season) => <SelectItem key={season.id} value={String(season.id)}>{season.name} ({season.year})</SelectItem>)}</SelectContent></Select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Sản phẩm
              <Select value={productId} onValueChange={setProductId}><SelectTrigger><SelectValue placeholder={productsLoading ? "Đang tải..." : "Chọn sản phẩm"} /></SelectTrigger><SelectContent>{products.map((product) => <SelectItem key={product.id} value={String(product.id)}>{product.trade_name || product.name || `Sản phẩm #${product.id}`} {product.code ? `(${product.code})` : ""}</SelectItem>)}</SelectContent></Select>
            </label>
            <Button variant="outline" onClick={() => { setSeasonId(""); setProductId("") }} title="Xóa lựa chọn"><RotateCcw className="mr-2 h-4 w-4" />Xóa lọc</Button>
          </CardContent>
        </Card>

        {!seasonId || !productId ? <Card><CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-slate-500"><PackageSearch className="h-10 w-10" /><p>Chọn đủ mùa vụ và sản phẩm để xem kết quả.</p></CardContent></Card>
          : report.isLoading ? <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
          : report.isError ? <Alert variant="destructive"><AlertTitle>Không tải được báo cáo</AlertTitle><AlertDescription>{report.error.message}</AlertDescription></Alert>
          : report.data ? <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Thực bán</p><p className="mt-2 text-3xl font-bold text-emerald-700">{formatNumber(report.data.quantity_sold)} <span className="text-base font-medium">{unit}</span></p></CardContent></Card>
              <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Đã trả lại</p><p className="mt-2 text-3xl font-bold text-amber-600">{formatNumber(report.data.quantity_returned)} <span className="text-base font-medium">{unit}</span></p></CardContent></Card>
              <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Số hóa đơn</p><p className="mt-2 flex items-center gap-2 text-3xl font-bold text-slate-900"><ShoppingCart className="h-6 w-6" />{formatNumber(report.data.invoice_count)}</p></CardContent></Card>
            </div>
            <Card><CardContent className="grid gap-3 p-5 text-sm md:grid-cols-2"><p><span className="text-slate-500">Sản phẩm:</span> <strong>{report.data.product_name}</strong></p><p><span className="text-slate-500">Mùa vụ:</span> <strong>{report.data.season_name}</strong></p><p><span className="text-slate-500">Tổng trên hóa đơn:</span> <strong>{formatNumber(report.data.quantity_invoiced)} {unit}</strong></p></CardContent></Card>
          </section> : null}
      </div>
    </main>
  )
}
