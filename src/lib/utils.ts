import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function captureError(error: unknown, context?: Record<string, any>) {
  console.error(error, context);
}
