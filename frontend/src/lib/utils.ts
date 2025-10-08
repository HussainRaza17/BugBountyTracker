import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(date)
}

export function getSeverityColor(score: number) {
  if (score >= 9) return 'severity-critical'
  if (score >= 7) return 'severity-high'
  if (score >= 4) return 'severity-medium'
  return 'severity-low'
}

export function getSeverityLabel(score: number) {
  if (score >= 9) return 'Critical'
  if (score >= 7) return 'High'
  if (score >= 4) return 'Medium'
  return 'Low'
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'REPORTED':
      return 'badge-reported'
    case 'VERIFIED':
      return 'badge-verified'
    case 'FIXED':
      return 'badge-fixed'
    default:
      return 'badge-reported'
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'REPORTED':
      return 'Reported'
    case 'VERIFIED':
      return 'Verified'
    case 'FIXED':
      return 'Fixed'
    default:
      return status
  }
}
