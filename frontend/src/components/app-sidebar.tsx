import { Archive, Columns3, Newspaper, Table2 } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { UserMenu } from '@/components/user-menu'

const NAVIGATION = [
  { to: '/', label: 'Dashboard', icon: Table2 },
  { to: '/in-progress', label: 'In progress', icon: Columns3 },
  { to: '/archive', label: 'Archive', icon: Archive },
]

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    // Collapses to an icon rail rather than disappearing.
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Newspaper className="size-5 shrink-0" />
          <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
            Editorial Tracker
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAVIGATION.map((link) => (
              <SidebarMenuItem key={link.to}>
                <SidebarMenuButton
                  className="relative h-10 gap-3 px-3 text-base group-data-[collapsible=icon]:p-1.5! hover:bg-sidebar-accent/60 [&_svg]:size-5 data-active:bg-sidebar-accent data-active:hover:bg-sidebar-accent data-active:before:absolute data-active:before:inset-y-1.5 data-active:before:left-0 data-active:before:w-0.5 data-active:before:rounded-full data-active:before:bg-brand"
                  tooltip={link.label}
                  isActive={pathname === link.to}
                  render={<NavLink to={link.to} end />}
                >
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
