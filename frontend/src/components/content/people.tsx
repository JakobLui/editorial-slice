import type { UserRef } from '@/api/generated/model'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserAvatar } from '@/components/user-avatar'

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
      <span className="text-xs text-muted-foreground">No authors</span>
    ) : null
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<div className="flex -space-x-1.5" />}>
        {authors.map((author) => (
          <UserAvatar
            key={author.id}
            name={author.name}
            size="sm"
            className="ring-2 ring-background"
          />
        ))}
      </TooltipTrigger>
      <TooltipContent>
        {authors.map((author) => author.name).join(', ')}
      </TooltipContent>
    </Tooltip>
  )
}
