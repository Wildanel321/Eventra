import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "IDR"): string {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined, formatStr: string = "dd MMM yyyy, HH:mm"): string {
  if (!date) return "-";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, formatStr);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function generateTicketCode(eventPrefix: string = "EVT", tier: string = "REG"): string {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const cleanTier = tier.substring(0, 3).toUpperCase();
  return `${eventPrefix}-${year}-${cleanTier}-${randomHex}`;
}

export function generateOrderNumber(): string {
  const dateStr = format(new Date(), "yyyyMMdd");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomNum}`;
}

export function generateCertificateCode(): string {
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CERT-${new Date().getFullYear()}-${randomHex}`;
}
