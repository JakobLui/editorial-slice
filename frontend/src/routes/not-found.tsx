import { Link } from 'react-router'

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-start justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="underline">
        Go to the front page
      </Link>
    </main>
  )
}
