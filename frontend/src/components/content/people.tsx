import type { UserRef } from '@/api/generated/model'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserAvatar } from '@/components/user-avatar'

/** At most this many avatars; the rest become "+N", so the row never outgrows its cell. */
const MAX_AVATARS = 3

/** Overlapping avatars, with the full names on hover. */
export function AuthorAvatars({
  authors,
  showEmpty = true,
}: {
  authors: UserRef[]
  /** Show "No authors" when the list is empty; off on cards, where space is short. */
  showEmpty?: boolean
}) {
  if (authors.length === 0) {
    return showEmpty ? (
      <span className="block truncate text-xs text-muted-foreground">
        No authors
      </span>
    ) : null
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<div className="flex -space-x-1.5" />}>
        {authors.slice(0, MAX_AVATARS).map((author) => (
          <UserAvatar
            key={author.id}
            name={author.name}
            size="sm"
            className="ring-2 ring-background"
          />
        ))}
        {authors.length > MAX_AVATARS && (
          <span className="relative flex size-6 items-center justify-center rounded-full bg-muted text-[0.625rem] font-medium text-muted-foreground ring-2 ring-background">
            +{authors.length - MAX_AVATARS}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent>
        {authors.map((author) => author.name).join(', ')}
      </TooltipContent>
    </Tooltip>
  )
}
