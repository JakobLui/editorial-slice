import { useGetHealth } from '@/api/generated/health/health'
import { Button } from '@/components/ui/button'

export function Home() {
  const health = useGetHealth()

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-start justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Editorial slice</h1>
      <p className="text-muted-foreground">
        {health.isPending && 'Checking the API…'}
        {health.isError && 'The API did not answer.'}
        {health.data &&
          `API: ${health.data.data.status}. Database: ${health.data.data.database}.`}
      </p>
      <Button variant="outline" onClick={() => health.refetch()}>
        Check again
      </Button>
    </main>
  )
}
