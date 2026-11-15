import { ChevronUp, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useGetMe, useLogout } from '@/api/generated/auth/auth'
import { queryClient } from '@/api/query-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { UserAvatar } from '@/components/user-avatar'

/**
 * The signed-in user, bottom left. The button only names who is signed in;
 * the menu adds the details (email, role) above "Sign out", the only account
 * action there is.
 */
export function UserMenu() {
  const navigate = useNavigate()
  const me = useGetMe()
  const { state: sidebarState } = useSidebar()
  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        navigate('/login', { replace: true })
        // Nothing cached for this user may show for the next one.
        queryClient.clear()
      },
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          // Same height and text size as the navigation items above it.
          <SidebarMenuButton className="h-10 gap-3 px-2 text-base group-data-[collapsible=icon]:p-1! data-popup-open:bg-sidebar-accent" />
        }
      >
        <UserAvatar name={me.data?.name ?? ''} size="sm" />
        <span className="truncate">{me.data?.name ?? 'Loading…'}</span>
        <ChevronUp className="ml-auto size-4 text-sidebar-muted-foreground" />
      </DropdownMenuTrigger>
      {/* Next to the icon rail when collapsed, so it doesn't cover it. */}
      <DropdownMenuContent
        side={sidebarState === 'collapsed' ? 'right' : 'top'}
        align={sidebarState === 'collapsed' ? 'end' : 'start'}
        className="min-w-60"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 font-normal text-foreground">
            <UserAvatar name={me.data?.name ?? ''} />
            <div className="grid text-sm leading-tight">
              <span className="truncate font-medium">{me.data?.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {me.data?.email}
              </span>
              <span className="truncate text-xs text-muted-foreground capitalize">
                {me.data?.role}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
