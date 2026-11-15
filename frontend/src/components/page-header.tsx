import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import type { ReactNode } from 'react'

/** The top bar of a page: title on the left, the page's own controls after it. */
export function PageHeader({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <header className="border-b px-4 py-2">
      <div className="mx-auto flex min-h-10 w-full max-w-(--breakpoint-2xl) flex-wrap items-center gap-2 h-full">
        <SidebarTrigger className="-ml-1" />
        <div className="h-full py-2">
          <Separator orientation="vertical" className="mr-1 h-full " />
        </div>
        <h1 className="mr-auto font-semibold">{title}</h1>
        {children}
      </div>
    </header>
  )
}
