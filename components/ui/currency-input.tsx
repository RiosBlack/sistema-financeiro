"use client";

import * as React from "react";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof NumericFormat>, "customInput"> {
  className?: string;
}

const CurrencyInput = React.forwardRef<
  React.ElementRef<typeof NumericFormat>,
  CurrencyInputProps
>(({ className, value, ...props }, ref) => {
  return (
    <NumericFormat
      {...props}
      getInputRef={ref}
      value={value ?? ""}
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
});

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };

