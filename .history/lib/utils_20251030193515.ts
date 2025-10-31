import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('sv-SE').format(num)
}

export const formatCurrency = (num: number) => {
  return new Intl.NumberFormat('sv-SE', { 
    style: 'currency', 
    currency: 'SEK',
    maximumFractionDigits: 0 
  }).format(num)
}

export const formatPercentage = (num: number) => {
  return new Intl.NumberFormat('sv-SE', { 
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1 
  }).format(num / 100)
}