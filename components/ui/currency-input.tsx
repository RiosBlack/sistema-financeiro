"use client";

import * as React from "react";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof NumericFormat>, "customInput" | "value" | "onValueChange"> {
  className?: string;
  value?: number | string;
  onValueChange?: (values: { value: string; floatValue: number | undefined }) => void;
}

const CurrencyInput = React.forwardRef<
  React.ElementRef<typeof NumericFormat>,
  CurrencyInputProps
>(({ className, value, onValueChange, ...props }, ref) => {
  // Converter valor para número válido
  const numericValue = React.useMemo(() => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    
    const num = typeof value === "number" ? value : parseFloat(String(value));
    return isNaN(num) ? undefined : num;
  }, [value]);

  // Props base do NumericFormat
  const numericFormatProps: any = {
    ...props,
    getInputRef: ref,
    thousandSeparator: ".",
    decimalSeparator: ",",
    prefix: "R$ ",
    decimalScale: 2,
    fixedDecimalScale: false,
    allowNegative: false,
    onValueChange: onValueChange,
    className: cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
  };

  // Só adicionar value se não for undefined
  if (numericValue !== undefined) {
    numericFormatProps.value = numericValue;
  }

  return <NumericFormat {...numericFormatProps} />;
});

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };

