import type { ContentStatus } from '@/api/generated/model'

/**
 * One colour per status, used everywhere a status is shown. Soft tints with
 * dark text in the same hue, so they pass contrast and don't compete with
 * the orange action buttons. The label always carries the meaning too.
 */
export const STATUS_COLORS: Record<ContentStatus, string> = {
  idea: 'bg-blue-100 text-blue-800',
  draft: 'bg-zinc-200 text-zinc-800',
  review: 'bg-violet-100 text-violet-800',
  published: 'bg-green-100 text-green-800',
}

/** Column tints for the In progress board: the badge hue, lighter. */
export const STATUS_COLUMN_COLORS: Record<ContentStatus, string> = {
  idea: 'bg-blue-50 text-blue-900',
  draft: 'bg-zinc-100 text-zinc-900',
  review: 'bg-violet-50 text-violet-900',
  published: 'bg-green-50 text-green-900',
}

/** Solid dots for compact places, such as filter options. */
export const STATUS_DOT_COLORS: Record<ContentStatus, string> = {
  idea: 'bg-blue-500',
  draft: 'bg-zinc-400',
  review: 'bg-violet-500',
  published: 'bg-green-500',
}
