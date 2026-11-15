import type { ReactNode } from 'react'

/**
 * The filters for a board or table, directly above it. Page headers hold only
 * the page name and the page's main action.
 */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-wrap items-end gap-2 px-4 pt-4">
      {children}
    </div>
  )
}
