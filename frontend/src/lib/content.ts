import type { ContentStatus, ContentType } from '@/api/generated/model'

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  draft: 'Draft',
  review: 'Review',
  published: 'Published',
}

/** The statuses anyone with edit rights can set. Published has its own button. */
export const WORK_STATUSES = ['idea', 'draft', 'review'] as const

export const TYPE_LABELS: Record<ContentType, string> = {
  article: 'Article',
  newsletter: 'Newsletter',
  podcast: 'Podcast',
  video: 'Video',
}

export const CONTENT_TYPES = Object.keys(TYPE_LABELS) as ContentType[]

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** '2026-11-20' or an ISO timestamp, shown as '20 Nov 2026'. */
export function formatDate(value: string) {
  const date =
    value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value)

  return dateFormat.format(date)
}

/** Today as 'YYYY-MM-DD' in local time, for date inputs and deadlines. */
export function todayAsDateString(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

/** A deadline before today, on an item that isn't published yet. */
export function isOverdue(deadline: string | null, status: ContentStatus) {
  return (
    deadline !== null &&
    status !== 'published' &&
    deadline < todayAsDateString()
  )
}

/** 'Mette Hansen' → 'MH'. */
export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
