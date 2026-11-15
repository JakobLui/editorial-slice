import type { ContentStatus } from '@/api/generated/model'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/lib/content'
import { STATUS_COLORS } from '@/lib/status-colors'

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge variant="secondary" className={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
