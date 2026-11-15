import { CalendarClock } from 'lucide-react'
import type { ContentStatus } from '@/api/generated/model'
import { formatDate, isOverdue } from '@/lib/content'
import { cn } from '@/lib/utils'

/** The deadline, in red when it has passed and the item isn't published. */
export function Deadline({
  deadline,
  status,
}: {
  deadline: string | null
  status: ContentStatus
}) {
  if (!deadline)
    return <span className="text-xs text-muted-foreground">No deadline</span>

  const overdue = isOverdue(deadline, status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs',
        overdue ? 'font-medium text-destructive' : 'text-muted-foreground',
      )}
    >
      <CalendarClock className="size-3.5" />
      {formatDate(deadline)}
      {overdue && ' (overdue)'}
    </span>
  )
}
