import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { initials } from '@/lib/content'
import { cn } from '@/lib/utils'

/**
 * Soft tints for initials avatars. Each person always gets the same one
 * (picked from their name), which helps tell people apart at a glance.
 * Kept clear of the status hues so avatars don't read as statuses.
 */
const AVATAR_COLORS = [
  'bg-amber-100 text-amber-900',
  'bg-teal-100 text-teal-900',
  'bg-rose-100 text-rose-900',
  'bg-sky-100 text-sky-900',
  'bg-lime-100 text-lime-900',
  'bg-fuchsia-100 text-fuchsia-900',
]

const colorFor = (name: string) =>
  AVATAR_COLORS[
    [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0) %
      AVATAR_COLORS.length
  ]

/** A round initials avatar in the person's colour. */
export function UserAvatar({
  name,
  size = 'default',
  className,
}: {
  name: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={cn('font-medium', colorFor(name))}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
