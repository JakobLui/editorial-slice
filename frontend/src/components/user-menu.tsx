import { ChevronsUpDown } from 'lucide-react'
import { DEV_USERS, setDevUserId } from '@/api/dev-users'
import { useGetMe } from '@/api/generated/users/users'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { UserAvatar } from '@/components/user-avatar'

/**
 * The signed-in user, bottom left. Until login exists it switches between the
 * seeded users; the auth step replaces the list with "Log out".
 */
export function UserMenu() {
  const me = useGetMe()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className="data-popup-open:bg-sidebar-accent"
          />
        }
      >
        <UserAvatar name={me.data?.name ?? ''} />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">
            {me.data?.name ?? 'Loading…'}
          </span>
          <span className="truncate text-xs text-sidebar-muted-foreground capitalize">
            {me.data?.role}
          </span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Act as (development only)</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={me.data?.id ?? ''}
            onValueChange={(userId) => setDevUserId(userId)}
          >
            {DEV_USERS.map((user) => (
              <DropdownMenuRadioItem key={user.id} value={user.id} closeOnClick>
                <UserAvatar name={user.name} size="sm" />
                {user.name}
                <span className="ml-auto text-xs text-muted-foreground capitalize">
                  {user.role}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
