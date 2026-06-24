'use client'

import { useMemo, useState } from 'react'
import {
  Beaker,
  Calculator,
  FlaskConical,
  Plus,
  RotateCcw,
  Scale,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type NutrientKey = 'n' | 'p' | 'k'

type Ingredient = {
  id: string
  name: string
  kg: string
  n: string
  p: string
  k: string
}

const nutrientLabels: Record<NutrientKey, string> = {
  n: 'Đạm',
  p: 'Lân',
  k: 'Kali',
}

const createIngredient = (index?: number): Ingredient => ({
  id: index ? `ingredient-${index}` : `ingredient-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: '',
  kg: '',
  n: '',
  p: '',
  k: '',
})

const initialIngredients: Ingredient[] = [createIngredient(1), createIngredient(2)]

const KG_RANGE = { min: 1, max: 500 }
const PERCENT_RANGE = { min: 1, max: 100 }

const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0)

const toNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

const getSliderValue = (value: string, min: number, max: number) => {
  const numericValue = toNumber(value)

  if (numericValue <= 0) {
    return min
  }

  return Math.min(max, Math.max(min, numericValue))
}

type NumberSliderInputProps = {
  value: string
  min: number
  max: number
  unit?: string
  ariaLabel: string
  onChange: (value: string) => void
}

function NumberSliderInput({ value, min, max, unit = '', ariaLabel, onChange }: NumberSliderInputProps) {
  const suffix = unit ? ` ${unit}` : ''

  return (
    <div className="min-w-0">
      <Input
        className="min-w-0"
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        aria-label={`${ariaLabel} từ ${min} đến ${max}`}
        className="mt-2 h-2 w-full cursor-pointer accent-emerald-600"
        type="range"
        min={min}
        max={max}
        step={1}
        value={getSliderValue(value, min, max)}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="mt-1 flex justify-between text-[11px] font-bold text-gray-400">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </div>
    </div>
  )
}

export default function FertilizerCalculatorClient() {
  const [targetWeight, setTargetWeight] = useState('')
  const [target, setTarget] = useState<Record<NutrientKey, string>>({ n: '', p: '', k: '' })
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients)

  const totals = useMemo(() => {
    const targetWeightValue = Math.max(0, toNumber(targetWeight))
    const totalKg = ingredients.reduce((sum, item) => sum + Math.max(0, toNumber(item.kg)), 0)
    const nutrientKg = ingredients.reduce(
      (sum, item) => ({
        n: sum.n + (Math.max(0, toNumber(item.kg)) * Math.max(0, toNumber(item.n))) / 100,
        p: sum.p + (Math.max(0, toNumber(item.kg)) * Math.max(0, toNumber(item.p))) / 100,
        k: sum.k + (Math.max(0, toNumber(item.kg)) * Math.max(0, toNumber(item.k))) / 100,
      }),
      { n: 0, p: 0, k: 0 },
    )
    const actualPercent = {
      n: totalKg > 0 ? (nutrientKg.n / totalKg) * 100 : 0,
      p: totalKg > 0 ? (nutrientKg.p / totalKg) * 100 : 0,
      k: totalKg > 0 ? (nutrientKg.k / totalKg) * 100 : 0,
    }
    const targetKg = {
      n: (targetWeightValue * toNumber(target.n)) / 100,
      p: (targetWeightValue * toNumber(target.p)) / 100,
      k: (targetWeightValue * toNumber(target.k)) / 100,
    }

    return {
      totalKg,
      nutrientKg,
      actualPercent,
      targetKg,
    }
  }, [ingredients, target, targetWeight])

  const updateIngredient = (id: string, patch: Partial<Ingredient>) => {
    setIngredients((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeIngredient = (id: string) => {
    setIngredients((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current))
  }

  const clearForm = () => {
    setTargetWeight('')
    setTarget({ n: '', p: '', k: '' })
    setIngredients([createIngredient(1), createIngredient(2)])
  }

  const activeTargetKeys = (['n', 'p', 'k'] as NutrientKey[]).filter((key) => target[key].trim() !== '')
  const hasTarget = activeTargetKeys.length > 0
  const isWithinTarget = hasTarget && activeTargetKeys.every(
    (key) => Math.abs(totals.actualPercent[key] - toNumber(target[key])) <= 0.05,
  )

  return (
    <main className="w-full max-w-full overflow-x-hidden py-6 md:py-10">
      <div className="mb-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            <FlaskConical className="h-4 w-4" />
            Công cụ nhà nông
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-5xl">Tính phối phân</h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-500 md:text-lg">
            Nhập kg từng loại phân để xem NPK thực tế, rồi quy đổi lượng bón theo tổng kg dinh dưỡng cây nhận.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
          <Button variant="outline" className="w-full md:w-auto" onClick={clearForm}>
            <RotateCcw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-w-0 w-full max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border bg-white p-4 shadow-sm md:max-w-full md:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-black text-gray-900">Mục tiêu</h2>
          </div>

          <label className="mb-4 block min-w-0">
            <span className="mb-2 block text-sm font-bold text-gray-700">Số kg phân chuẩn muốn so sánh</span>
            <Input
              className="min-w-0 max-w-full"
              type="number"
              min={0}
              value={targetWeight}
              onChange={(event) => setTargetWeight(event.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(['n', 'p', 'k'] as NutrientKey[]).map((key) => (
              <label key={key} className="block min-w-0">
                <span className="mb-2 block text-sm font-bold text-gray-700">{nutrientLabels[key]} %</span>
                <Input
                  className="min-w-0 max-w-full"
                  type="number"
                  min={0}
                  max={100}
                  value={target[key]}
                  onChange={(event) => setTarget((current) => ({ ...current, [key]: event.target.value }))}
                />
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Dinh dưỡng mục tiêu</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(['n', 'p', 'k'] as NutrientKey[]).map((key) => (
                <div key={key} className="min-w-0">
                  <p className="text-xs font-bold text-gray-500">{nutrientLabels[key]}</p>
                  <p className="break-words text-lg font-black text-gray-950">{formatNumber(totals.targetKg[key])} kg</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 w-full max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border bg-white p-4 shadow-sm md:max-w-full md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-black text-gray-900">Thành phần bao phân</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Tổng {formatNumber(totals.totalKg)} kg
              </Badge>
              <Button size="sm" onClick={() => setIngredients((current) => [...current, createIngredient()])}>
                <Plus className="h-4 w-4" />
                Thêm phân
              </Button>
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            {ingredients.map((item, index) => (
              <div key={item.id} className="rounded-lg border bg-gray-50 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-gray-700">Loại phân {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={ingredients.length <= 1}
                    onClick={() => removeIngredient(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <label className="mb-3 block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Tên phân</span>
                  <Input value={item.name} onChange={(event) => updateIngredient(item.id, { name: event.target.value })} />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block min-w-0">
                    <span className="mb-2 block text-sm font-bold text-gray-700">Kg có sẵn</span>
                    <NumberSliderInput
                      value={item.kg}
                      min={KG_RANGE.min}
                      max={KG_RANGE.max}
                      unit="kg"
                      ariaLabel="Kg có sẵn"
                      onChange={(value) => updateIngredient(item.id, { kg: value })}
                    />
                  </label>

                  {(['n', 'p', 'k'] as NutrientKey[]).map((key) => (
                    <label key={key} className="block min-w-0">
                      <span className="mb-2 block text-sm font-bold text-gray-700">{nutrientLabels[key]} %</span>
                      <NumberSliderInput
                        value={item[key]}
                        min={PERCENT_RANGE.min}
                        max={PERCENT_RANGE.max}
                        unit="%"
                        ariaLabel={`${nutrientLabels[key]} %`}
                        onChange={(value) => updateIngredient(item.id, { [key]: value })}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden max-w-full overflow-x-auto lg:block">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.4fr_150px_130px_130px_130px_48px] gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm font-black text-gray-600">
                <span>Tên phân</span>
                <span>Kg có sẵn</span>
                <span>Đạm %</span>
                <span>Lân %</span>
                <span>Kali %</span>
                <span />
              </div>
              <div className="divide-y">
                {ingredients.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1.4fr_150px_130px_130px_130px_48px] gap-3 px-3 py-3"
                  >
                    <Input value={item.name} onChange={(event) => updateIngredient(item.id, { name: event.target.value })} />
                    <NumberSliderInput
                      value={item.kg}
                      min={KG_RANGE.min}
                      max={KG_RANGE.max}
                      unit="kg"
                      ariaLabel="Kg có sẵn"
                      onChange={(value) => updateIngredient(item.id, { kg: value })}
                    />
                    {(['n', 'p', 'k'] as NutrientKey[]).map((key) => (
                      <NumberSliderInput
                        key={key}
                        value={item[key]}
                        min={PERCENT_RANGE.min}
                        max={PERCENT_RANGE.max}
                        unit="%"
                        ariaLabel={`${nutrientLabels[key]} %`}
                        onChange={(value) => updateIngredient(item.id, { [key]: value })}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={ingredients.length <= 1}
                      onClick={() => removeIngredient(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid min-w-0 grid-cols-1 gap-4">
        <div className="min-w-0 w-full max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border bg-white p-4 shadow-sm md:max-w-full md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-black text-gray-900">Kết quả phối</h2>
            </div>
            {hasTarget && (
              <Badge variant={isWithinTarget ? 'success' : 'warning'}>{isWithinTarget ? 'Đạt mục tiêu' : 'Chưa đạt'}</Badge>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-700">Tổng phân đã phối</p>
              <p className="mt-1 text-3xl font-black text-emerald-700">{formatNumber(totals.totalKg)} kg</p>
              <p className="mt-2 text-sm font-medium text-emerald-700/80">Tổng kg từ các loại phân đã nhập</p>
            </div>
            {(['n', 'p', 'k'] as NutrientKey[]).map((key) => {
              const hasNutrientTarget = target[key].trim() !== ''
              const targetValue = hasNutrientTarget ? toNumber(target[key]) : 0
              const isOff = hasNutrientTarget && Math.abs(totals.actualPercent[key] - targetValue) > 0.05
              return (
                <div key={key} className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-bold text-gray-500">{nutrientLabels[key]} thực tế</p>
                  <p className={`mt-1 text-3xl font-black ${isOff ? 'text-red-600' : 'text-emerald-700'}`}>
                    {formatNumber(totals.actualPercent[key])}%
                  </p>
                  {hasNutrientTarget && (
                    <p className="mt-2 text-sm font-medium text-gray-500">Mục tiêu {formatNumber(targetValue)}%</p>
                  )}
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Có {formatNumber(totals.nutrientKg[key])} kg {nutrientLabels[key].toLowerCase()}
                  </p>
                </div>
              )
            })}
          </div>

        </div>

      </section>
    </main>
  )
}
