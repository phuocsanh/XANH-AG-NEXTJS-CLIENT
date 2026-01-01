import * as React from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface NumberInputProps extends Omit<NumericFormatProps, "value" | "defaultValue"> {
  value?: number | string | null
  defaultValue?: number | string
  onValueChange?: (values: { floatValue?: number; value: string; formattedValue: string }) => void
  decimalScale?: number
  className?: string
  placeholder?: string
  disabled?: boolean
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, decimalScale = 0, value, onValueChange, ...props }, ref) => {
    return (
      <NumericFormat
        customInput={Input}
        getInputRef={ref}
        className={cn(className)}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={decimalScale}
        allowNegative={false}
        value={value ?? ""}
        onValueChange={onValueChange}
        {...props}
      />
    )
  }
)

NumberInput.displayName = "NumberInput"

export { NumberInput }
