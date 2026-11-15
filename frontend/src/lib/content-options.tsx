import type { ReactNode } from 'react'
import type { ContentStatus, ContentType } from '@/api/generated/model'
import { STATUS_LABELS, TYPE_LABELS } from '@/lib/content'
import { TYPE_ICONS } from '@/lib/content-types'
import { STATUS_DOT_COLORS } from '@/lib/status-colors'
import { cn } from '@/lib/utils'

/** One choice in a filter or picker list. */
export interface PickerOption {
  value: string
  label: string
  /** Shown before the label: a status dot, a type icon, an avatar. */
  leading?: ReactNode
}

/** A status with its colour dot, the same in filters and pickers. */
export const statusOption = (status: ContentStatus): PickerOption => ({
  value: status,
  label: STATUS_LABELS[status],
  leading: (
    <span
      className={cn('size-2 shrink-0 rounded-full', STATUS_DOT_COLORS[status])}
    />
  ),
})

/** Every type with its icon, the same in filters and pickers. */
export const TYPE_OPTIONS: PickerOption[] = (
  Object.keys(TYPE_LABELS) as ContentType[]
).map((type) => {
  const Icon = TYPE_ICONS[type]

  return {
    value: type,
    label: TYPE_LABELS[type],
    leading: <Icon className="size-3.5" />,
  }
})
