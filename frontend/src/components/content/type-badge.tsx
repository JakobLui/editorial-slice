import type { ContentType } from '@/api/generated/model'
import { TYPE_LABELS } from '@/lib/content'
import { TYPE_ICONS } from '@/lib/content-types'
import { cn } from '@/lib/utils'

/**
 * The content type as a quiet, neutral tag with an icon: it categorises, so
 * it stays calmer than the coloured status badges.
 */
export function TypeBadge({
  type,
  className,
}: {
  type: ContentType
  className?: string
}) {
  const Icon = TYPE_ICONS[type]

  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-md bg-muted px-1.5 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      <Icon className="size-3" />
      {TYPE_LABELS[type]}
    </span>
  )
}
