import { useGetMe } from '@/api/generated/auth/auth'
import { useListUsers } from '@/api/generated/users/users'
import { UserAvatar } from '@/components/user-avatar'
import type { PickerOption } from '@/lib/content-options'

/** Every user as an option with their avatar: you first, marked "(you)". */
export function useAuthorOptions(): PickerOption[] {
  const users = useListUsers()
  const me = useGetMe()

  return [...(users.data ?? [])]
    .sort(
      (first, second) =>
        Number(second.id === me.data?.id) - Number(first.id === me.data?.id),
    )
    .map((user) => ({
      value: user.id,
      label: user.id === me.data?.id ? `${user.name} (you)` : user.name,
      leading: <UserAvatar name={user.name} size="sm" className="size-5" />,
    }))
}
