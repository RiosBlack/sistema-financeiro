"use client";

import { CreditCard } from "lucide-react";
import Image from "next/image";

interface BrandIconProps {
  className?: string;
}

export function VisaIcon({ className }: BrandIconProps) {
  return (
    <div className={`relative ${className || ""}`} style={{ width: "48px", height: "16px" }}>
      <Image
        src="/visa.png"
        alt="Visa"
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

export function MastercardIcon({ className }: BrandIconProps) {
  return (
    <div className={`relative ${className || ""}`} style={{ width: "48px", height: "16px" }}>
      <Image
        src="/mastercard.png"
        alt="Mastercard"
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

export function EloIcon({ className }: BrandIconProps) {
  return (
    <div className={`relative ${className || ""}`} style={{ width: "48px", height: "16px" }}>
      <Image
        src="/elo.png"
        alt="Elo"
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

export function AmexIcon({ className }: BrandIconProps) {
  return (
    <div className={`relative ${className || ""}`} style={{ width: "48px", height: "16px" }}>
      <Image
        src="/americanExpress.png"
        alt="American Express"
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

export function HipercardIcon({ className }: BrandIconProps) {
  return (
    <div className={`relative ${className || ""}`} style={{ width: "48px", height: "16px" }}>
      <Image
        src="/hipercard.png"
        alt="Hipercard"
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

export function OtherIcon({ className }: BrandIconProps) {
  return (
    <div className={className}>
      <CreditCard className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export const brandIcons = {
  VISA: VisaIcon,
  MASTERCARD: MastercardIcon,
  ELO: EloIcon,
  AMEX: AmexIcon,
  HIPERCARD: HipercardIcon,
  OTHER: OtherIcon,
};
