# CLINE Rules - XANH-AG-NEXTJS-CLIENT (Next.js Frontend)

## Project Overview

Frontend client cho ứng dụng Xanh AG, sử dụng Next.js 15 với App Router, Tailwind CSS, và Shadcn/UI components.

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript v5
- **Styling:** Tailwind CSS v3
- **UI Components:** Shadcn/UI (Radix UI primitives + Tailwind)
- **State Management:** Zustand v5
- **Data Fetching:** TanStack React Query v5
- **Form Handling:** React Hook Form + Zod validation
- **Authentication:** JWT via cookies
- **Database Offline:** Dexie (IndexedDB wrapper)
- **Icons:** Lucide React
- **Deploy:** Vercel

## Architecture Pattern

### Directory Structure

```
XANH-AG-NEXTJS-CLIENT/
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js App Router pages & layouts
│   │   ├── (public)/   # Public route group (no auth required)
│   │   ├── api/        # API routes
│   │   ├── components/ # App-specific components
│   │   └── fonts/      # Local fonts
│   ├── components/     # Shared UI components
│   │   ├── common/     # Common components (data-table, search, etc.)
│   │   ├── form/       # Form components (form fields, inputs)
│   │   ├── ui/         # Shadcn/UI primitives
│   │   └── disease-warning/ # Disease warning specific components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions, api clients
│   │   ├── chat/       # Chat client utilities
│   ├── models/         # TypeScript interfaces/types
│   ├── provider/       # React context providers
│   ├── stores/         # Zustand stores
│   ├── constants/      # Constants and config
│   └── schemaValidations/ # Zod validation schemas
```

### Route Organization

```
app/
├── (public)/               # Route group không cần auth
│   ├── (auth)/            # Route cần auth (nhóm con)
│   │   ├── login/
│   │   ├── register/
│   │   └── rice-crops/
│   ├── about/
│   ├── products/
│   └── rewards/
└── api/                   # API routes (serverless functions)
    ├── auth/
    └── chat/
```

## Naming Conventions

### Files & Directories

- Component files: `PascalCase.tsx` (e.g., `DataTable.tsx`, `LoadingSpinner.tsx`)
- Hook files: `kebab-case.ts` (e.g., `use-api.ts`, `use-rice-crops.ts`)
- Store files: `camelCase.ts` (e.g., `chatStore.ts`)
- Utility files: `camelCase.ts` (e.g., `utils.ts`, `http.ts`)
- Type files: `camelCase.ts` (e.g., `auth.model.ts`, `product.ts`)
- Schema files: `camelCase.schema.ts` (e.g., `auth.schema.ts`)

### Components

- Named exports: `PascalCase` function components
- Default exports: Use for page components in `app/` directory

### Variables & Functions

- camelCase for variables and functions
- Use descriptive names

## Code Style

### Page Components (App Router)

```tsx
// Server component mặc định trong app/
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Mô tả trang",
}

export default function HomePage() {
  return (
    <div>
      <h1>Trang chủ</h1>
    </div>
  )
}
```

### Client Components

```tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface HomePageProps {
  initialData?: DataType[]
}

export default function HomePage({ initialData }: HomePageProps) {
  const [data, setData] = useState(initialData)

  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}
```

### Layout Components

```tsx
import React from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div>
      <header>Header</header>
      <main>{children}</main>
    </div>
  )
}
```

## Hooks Pattern

### Custom Hook Structure

```typescript
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/http"

interface UseYourEntityOptions {
  page?: number
  limit?: number
  // Add other query params
}

export function useEntities(options?: UseYourEntityOptions) {
  const queryClient = useQueryClient()

  // Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["entities", options],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/entities", {
        params: options,
      })
      return response.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateEntityDto) => {
      const response = await axiosInstance.post("/api/entities", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEntityDto }) => {
      const response = await axiosInstance.put(`/api/entities/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] })
    },
  })

  return {
    data,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
  }
}
```

## UI Components

### Shadcn/UI Pattern

- Components trong `components/ui/` không nên sửa đổi
- Sử dụng `extends` để tạo variant mới nếu cần
- Props truyền vào nên dùng `React.ComponentProps` khi phù hợp

### Form Components Pattern

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
})

type FormValues = z.infer<typeof formSchema>

interface YourFormProps {
  onSubmit: (data: FormValues) => void
  defaultValues?: Partial<FormValues>
}

export function YourForm({ onSubmit, defaultValues }: YourFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên</FormLabel>
              <FormControl>
                <Input placeholder='Nhập tên' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Lưu</Button>
      </form>
    </Form>
  )
}
```

### Data Table Pattern

```tsx
"use client"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table"
import { DataTable } from "@/components/common/data-table"

interface YourTableProps {
  data: YourEntity[]
  columns: ColumnDef<YourEntity>[]
}

export function YourTable({ data, columns }: YourTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return <DataTable table={table} columns={columns} />
}
```

## API Client Pattern

### HTTP Client Setup

- Sử dụng axios instance từ `@/lib/http`
- Tự động đính kèm auth token
- Xử lý error response thống nhất

### API Call Example

```typescript
import { axiosInstance } from "@/lib/http"

export async function getEntities(): Promise<Entity[]> {
  const response = await axiosInstance.get("/api/entities")
  return response.data
}

export async function createEntity(data: CreateEntityDto): Promise<Entity> {
  const response = await axiosInstance.post("/api/entities", data)
  return response.data
}
```

## State Management

### Zustand Store Pattern

```typescript
import { create } from "zustand"

interface YourStore {
  selectedItem: Entity | null
  setSelectedItem: (item: Entity | null) => void
  reset: () => void
}

export const useYourStore = create<YourStore>((set) => ({
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
  reset: () => set({ selectedItem: null }),
}))
```

## Styling

### Tailwind CSS

- Sử dụng utility classes của Tailwind
- Không viết CSS tùy chỉnh trừ khi cần thiết
- Sử dụng `cn()` từ `@/lib/utils` cho conditional classes

### className Pattern

```tsx
import { cn } from "@/lib/utils"

interface YourComponentProps {
  className?: string
  isActive?: boolean
}

export function YourComponent({ className, isActive }: YourComponentProps) {
  return (
    <div className={cn("base-styles", isActive && "active-styles", className)}>
      Content
    </div>
  )
}
```

## Zod Validation Schema

### Schema Pattern

```typescript
import { z } from "zod"

export const createEntitySchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  description: z.string().optional(),
  quantity: z.number().positive("Số lượng phải lớn hơn 0"),
  date: z.date(),
})

export type CreateEntityDto = z.infer<typeof createEntitySchema>
```

## Components Organization

### Shared Components (src/components/)

- `ui/` - Shadcn/UI primitives (không sửa)
- `form/` - Form-related components
- `common/` - Common reusable components

### App Components (src/app/components/)

- Components specific to app routes
- Layout components
- Page-specific components

## Important Patterns

### Loading States

```tsx
import { LoadingSpinner } from '@/app/components/LoadingSpinner'

function YourComponent() {
  const { data, isLoading } = useQuery(...)

  if (isLoading) {
    return <LoadingSpinner />
  }

  return <div>{/* render data */}</div>
}
```

### Error Handling

```tsx
import { useToast } from "@/hooks/use-toast"

function YourComponent() {
  const { toast } = useToast()

  const handleAction = async () => {
    try {
      await someAction()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi",
      })
    }
  }
}
```

### Client Layouts

```tsx
"use client"

import { useState } from "react"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {children}
    </div>
  )
}
```

## Comments & Documentation

### Vietnamese Comments

```tsx
// ✅ Component chính của trang
// ❌ Lỗi khi gọi API
// 🔄 Đang tải dữ liệu...
```

### React Component Documentation

```tsx
/**
 * Component hiển thị danh sách entities
 * @param props - Props cho component
 * @param props.data - Danh sách entities
 * @param props.onSelect - Callback khi chọn entity
 */
```

## Component Reuse Strategy

### Ưu tiên sử dụng component có sẵn

**LUÔN LUÔN** kiểm tra và sử dụng các component đã viết sẵn theo thứ tự ưu tiên:

1. **Common components** (`components/common/`) - **ƯU TIÊN CAO NHẤT** - Các component tái sử dụng của project
2. **Form components** (`components/form/`) - **ƯU TIÊN CAO NHẤT** - Form fields đã chuẩn hóa của project
3. **Shadcn/UI primitives** (`components/ui/`) - Thư viện UI cơ bản, không sửa, chỉ dùng

### Khi nào tạo component mới?

Tạo component mới khi:

- Tính năng chưa có trong thư viện hiện tại
- Component sẽ được sử dụng ở **ít nhất 2 nơi khác nhau**
- Logic phức tạp cần đóng gói để tái sử dụng

### Pattern tạo reusable component

```tsx
"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/loading-spinner"

interface ReusableComponentProps {
  // Props rõ ràng, có type
  data: DataType[]
  onSelect: (item: DataType) => void
  isLoading?: boolean
  className?: string
}

/**
 * Component tái sử dụng cho việc hiển thị danh sách
 * @param data - Danh sách dữ liệu
 * @param onSelect - Callback khi chọn item
 * @param isLoading - Trạng thái loading
 */
export function ReusableComponent({
  data,
  onSelect,
  isLoading,
  className,
}: ReusableComponentProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className={cn("container", className)}>
      {data.map((item) => (
        <Button key={item.id} onClick={() => onSelect(item)}>
          {item.name}
        </Button>
      ))}
    </div>
  )
}
```

### Các component nên tái sử dụng

Thường tạo reusable components cho:

- **Data display**: Tables, lists, cards, grids
- **Form inputs**: Custom inputs, selects, date pickers
- **Feedback**: Loading states, empty states, error messages
- **Layout**: Page headers, sections, containers
- **Navigation**: Breadcrumbs, tabs, pagination

---

## Important Notes

1. **'use client' directive** - Bắt buộc cho client-side features (useState, useEffect, event handlers)
2. **Server Components mặc định** - Chỉ dùng `use client` khi cần thiết
3. **Metadata API** - Dùng cho SEO trong page components
4. **Không sửa** file trong `components/ui/` (Shadcn)
5. **Ưu tiên reuse** - Luôn dùng component có sẵn trước khi tạo mới
6. **Tạo reusable component** - Khi dùng ở 2+ nơi khác nhau
7. **Zod schema** - Cho tất cả form validation
8. **React Query keys** - Đặt là mảng, e.g., `['entities', id]`
9. **Environment variables** - Prefix `NEXT_PUBLIC_` cho client-side
10. **Image optimization** - Dùng `next/image` thay vì `<img>`
11. **Tuân thủ** pattern hiện có trong codebase
12. **Error messages** - Tiếng Việt

## Number Formatting Rules (QUAN TRỌNG)

**Định dạng số theo kiểu Việt Nam:**

- Dấu `.` ngăn cách hàng nghìn (thousands separator)
- Dấu `,` cho phần thập phân (decimal separator)
- Ví dụ: `1000` → `"1.000"`, `1000.5` → `"1.000,50"`

**Cách sử dụng:**

```tsx
// ✅ ĐÚNG - Sử dụng Intl.NumberFormat với locale "vi-VN"
new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(value)

// ❌ SAI - Không dùng toLocaleString() mặc định hoặc format kiểu Mỹ
value.toLocaleString() // Có thể ra "1,000" (kiểu Mỹ)
```

**Áp dụng cho:**

- Tồn kho, tồn thuế, số lượng
- Giá tiền (khi không dùng currency format)
- Mọi số liệu hiển thị trong bảng

## Prohibited Actions

- ❌ Không dùng `any` type
- ❌ Không sửa đổi file trong `components/ui/`
- ❌ Không bypass TypeScript
- ❌ Không hardcode URLs - dùng environment variables
- ❌ Không commit `.env.local` hoặc secrets
- ❌ Không quên `'use client'` cho client-side hooks

## Task Completion Rules

**Khi hoàn thành task, luôn luôn:**

1. **Kiểm tra lỗi TypeScript**: Chạy `npx tsc --noEmit`
2. **Chạy build test**: Chạy `npm run build`
3. **Xác nhận thành công**: Đảm bảo không có lỗi TypeScript mới do thay đổi (lỗi pre-existing không tính)
