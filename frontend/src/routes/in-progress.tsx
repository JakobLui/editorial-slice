import { useSearchParams } from 'react-router'
import { useGetContentBoard } from '@/api/generated/content/content'
import type { ContentItemSummary, ContentStatus } from '@/api/generated/model'
import { FilterBar } from '@/components/content/filter-bar'
import { ItemCard } from '@/components/content/item-card'
import { PageHeader } from '@/components/page-header'
import { Toolbar } from '@/components/toolbar'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  appendFilters,
  filtersFromSearchParams,
  type ContentFilters,
} from '@/lib/content-filters'
import { STATUS_LABELS, WORK_STATUSES } from '@/lib/content'
import { STATUS_COLUMN_COLORS } from '@/lib/status-colors'
import { cn } from '@/lib/utils'

/**
 * Overview of work in progress: Idea, Draft and Review side by side.
 * Read-only; items are created and edited on the Dashboard.
 */
export function InProgress() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = filtersFromSearchParams(searchParams)
  const search = useDebouncedValue(filters.search.trim())

  // Typing replaces the history entry, so Back doesn't step through every letter.
  const changeFilters = (nextFilters: ContentFilters) => {
    const nextSearchParams = new URLSearchParams()

    appendFilters(nextSearchParams, nextFilters)

    setSearchParams(nextSearchParams, {
      replace: nextFilters.search !== filters.search,
    })
  }

  const board = useGetContentBoard({
    type: filters.types.length > 0 ? filters.types : undefined,
    authorId: filters.authorId ?? undefined,
    q: search || undefined,
  })

  return (
    <>
      <PageHeader title="In progress" />

      <Toolbar>
        <FilterBar filters={filters} onChange={changeFilters} />
      </Toolbar>

      <div className="mx-auto w-full max-w-(--breakpoint-2xl) flex-1 overflow-x-auto p-4">
        {board.data?.truncated && (
          <p className="mb-3 text-sm text-muted-foreground">
            Showing the first 500 items. Narrow the filters to see the rest.
          </p>
        )}

        <div className="grid min-w-[48rem] grid-cols-3 gap-4">
          {WORK_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              title={STATUS_LABELS[status]}
              items={board.data?.[status]}
              isLoading={board.isPending}
            />
          ))}
        </div>

        {board.isError && (
          <p className="mt-4 text-sm text-destructive">
            The board could not load: {board.error.message}
          </p>
        )}
      </div>
    </>
  )
}

function BoardColumn({
  status,
  title,
  items,
  isLoading,
}: {
  status: ContentStatus
  title: string
  items: ContentItemSummary[] | undefined
  isLoading: boolean
}) {
  return (
    // The column's colour is the status colour, so cards don't repeat it.
    <section
      className={cn(
        'flex flex-col gap-2 rounded-xl p-2',
        STATUS_COLUMN_COLORS[status],
      )}
    >
      <h2 className="flex items-center justify-between px-1 text-sm font-semibold">
        {title}
        <span className="font-normal opacity-70">{items?.length ?? ''}</span>
      </h2>

      {isLoading && <Skeleton className="h-28 w-full rounded-xl" />}

      {items?.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}

      {items?.length === 0 && (
        <p className="px-1 py-6 text-center text-xs opacity-70">Nothing here</p>
      )}
    </section>
  )
}
