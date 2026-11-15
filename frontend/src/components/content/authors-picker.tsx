import { Users } from 'lucide-react'
import { useListUsers } from '@/api/generated/users/users'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** Pick authors from all users. `onChange` gets the full new list of ids. */
export function AuthorsPicker({
  authorIds,
  onChange,
  disabled,
}: {
  authorIds: string[]
  onChange: (authorIds: string[]) => void
  disabled?: boolean
}) {
  const users = useListUsers()

  const selectedNames = (users.data ?? [])
    .filter((user) => authorIds.includes(user.id))
    .map((user) => user.name)

  const toggleAuthor = (userId: string, checked: boolean) =>
    onChange(
      checked
        ? [...authorIds, userId]
        : authorIds.filter((authorId) => authorId !== userId),
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button
            variant="outline"
            className="h-auto min-h-8 justify-start text-left"
          />
        }
      >
        <Users />
        <span className="whitespace-normal">
          {selectedNames.length > 0 ? selectedNames.join(', ') : 'No authors'}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        {(users.data ?? []).map((user) => (
          <DropdownMenuCheckboxItem
            key={user.id}
            checked={authorIds.includes(user.id)}
            onCheckedChange={(checked) => toggleAuthor(user.id, checked)}
            closeOnClick={false}
          >
            {user.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
