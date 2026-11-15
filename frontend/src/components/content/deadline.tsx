import { CalendarClock, CalendarX2 } from 'lucide-react'
import type { ContentStatus } from '@/api/generated/model'
import { formatDate, isOverdue } from '@/lib/content'
import { cn } from '@/lib/utils'

/**
 * The deadline, in red when it has passed and the item isn't published. Not
 * by colour alone: an overdue date gets a crossed-out calendar icon, "Overdue"
 * on hover and "(overdue)" for screen readers, while staying as short as a
 * normal date so it fits the table column.
 */
export function Deadline({
  deadline,
  status,
}: {
  deadline: string | null
  status: ContentStatus
}) {
  if (!deadline)
    return (
      <span className="block truncate text-xs text-muted-foreground">
        No deadline
      </span>
    )

  const overdue = isOverdue(deadline, status)
  const Icon = overdue ? CalendarX2 : CalendarClock

  return (
    <span
      title={`${formatDate(deadline)}${overdue ? ' (overdue)' : ''}`}
      className={cn(
        'inline-flex max-w-full items-center gap-1 text-xs',
        overdue ? 'font-medium text-destructive' : 'text-muted-foreground',
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{formatDate(deadline)}</span>
      {overdue && <span className="sr-only"> (overdue)</span>}
    </span>
  )
}
