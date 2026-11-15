import type { ContentStatus } from '@/api/generated/model'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/lib/content'
import { STATUS_COLORS } from '@/lib/status-colors'
import { cn } from '@/lib/utils'

/** The status as a coloured badge; a too-narrow space cuts the label with an ellipsis. */
export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge
      variant="secondary"
      title={STATUS_LABELS[status]}
      className={cn('max-w-full', STATUS_COLORS[status])}
    >
      <span className="truncate">{STATUS_LABELS[status]}</span>
    </Badge>
  )
}
