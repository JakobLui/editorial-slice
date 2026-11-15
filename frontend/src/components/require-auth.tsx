import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useGetMe } from '@/api/generated/auth/auth'
import { Button } from '@/components/ui/button'

/**
 * Shows its children only to a signed-in user. Without a session it sends the
 * user to the login page, which returns them here after signing in.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const me = useGetMe()

  if (me.error?.status === 401) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // A failed background refetch (e.g. a network blip) keeps the app open.
  if (me.data) return children

  if (me.isError) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
        <p>Could not reach the server.</p>
        <Button variant="outline" onClick={() => me.refetch()}>
          Try again
        </Button>
      </main>
    )
  }

  // Checking the session takes milliseconds; a spinner would only flash.
  return null
}
