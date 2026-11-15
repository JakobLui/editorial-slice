import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Maximize2,
  Send,
  Undo2,
} from 'lucide-react'
import { keepPreviousData } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import {
  useArchiveContent,
  useListContent,
  useRestoreContent,
  useUpdateContentStatus,
} from '@/api/generated/content/content'
import type {
  ContentItemSummary,
  ContentStatus,
  ListContentParams,
} from '@/api/generated/model'
import { CreateItemDialog } from '@/components/content/create-item-dialog'
import { Deadline } from '@/components/content/deadline'
import { FilterBar } from '@/components/content/filter-bar'
import { AuthorAvatars } from '@/components/content/people'
import { StatusBadge } from '@/components/content/status-badge'
import { TypeBadge } from '@/components/content/type-badge'
import { PageHeader } from '@/components/page-header'
import { Toolbar } from '@/components/toolbar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useOpenItem } from '@/hooks/use-open-item'
import { formatDate, STATUS_LABELS } from '@/lib/content'
import {
  appendFilters,
  filtersFromSearchParams,
  type ContentFilters,
} from '@/lib/content-filters'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20
const ALL_STATUSES = Object.keys(STATUS_LABELS) as ContentStatus[]

/** The start and end of a local day ('YYYY-MM-DD') as ISO timestamps for the API. */
type ListMode = 'active' | 'archived'

type SortKey = NonNullable<ListContentParams['sort']>
type Sort = { key: SortKey; order: 'asc' | 'desc' }

const SORT_KEYS: readonly SortKey[] = [
  'title',
  'status',
  'type',
  'deadline',
  'archivedAt',
  'createdAt',
  'updatedAt',
  'publishedAt',
]
/** Dates people usually want newest first. */
const DESCENDING_FIRST: readonly SortKey[] = [
  'archivedAt',
  'createdAt',
  'updatedAt',
  'publishedAt',
]

function parseSort(searchParams: URLSearchParams): Sort | null {
  const key = searchParams.get('sort') as SortKey | null
  const order = searchParams.get('order')

  if (!key || !SORT_KEYS.includes(key) || (order !== 'asc' && order !== 'desc'))
    return null

  return { key, order }
}

/** Everything about the list that lives in the URL. */
interface ListState {
  filters: ContentFilters
  page: number
  sort: Sort
}

function toSearchParams(listState: ListState) {
  const searchParams = new URLSearchParams()

  appendFilters(searchParams, listState.filters)

  searchParams.set('page', String(listState.page))
  searchParams.set('sort', listState.sort.key)
  searchParams.set('order', listState.sort.order)

  return searchParams
}

/**
 * A paginated table of content items with its filters above it. `active` is
 * the Dashboard: every item that isn't archived, where editors publish.
 * `archived` is the Archive: archived items only, which can be restored.
 */
export function ContentListPage({ mode }: { mode: ListMode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const isArchive = mode === 'archived'

  // Filters, sorting and the page live in the URL, so a list can be shared
  // or reloaded as it is.
  const defaultSort: Sort = isArchive
    ? { key: 'archivedAt', order: 'desc' }
    : { key: 'deadline', order: 'asc' }
  const sort: Sort = parseSort(searchParams) ?? defaultSort
  const filters = filtersFromSearchParams(searchParams)
  const search = useDebouncedValue(filters.search.trim())

  // Any change but paging starts again at page 1.
  const updateList = (changes: Partial<ListState>, { replace = false } = {}) =>
    setSearchParams(
      toSearchParams({
        filters,
        sort,
        page: 1,
        ...changes,
      }),
      { replace },
    )

  const goToPage = (nextPage: number) => updateList({ page: nextPage })

  // A new column starts in its natural direction; the same column flips.
  const sortBy = (key: SortKey) =>
    updateList({
      sort:
        sort.key === key
          ? { key, order: sort.order === 'asc' ? 'desc' : 'asc' }
          : { key, order: DESCENDING_FIRST.includes(key) ? 'desc' : 'asc' },
    })

  // Typing replaces the history entry, so Back doesn't step through every letter.
  const changeFilters = (nextFilters: ContentFilters) =>
    updateList(
      { filters: nextFilters },
      { replace: nextFilters.search !== filters.search },
    )

  const params: ListContentParams = {
    status: filters.statuses.length > 0 ? filters.statuses : undefined,
    type: filters.types.length > 0 ? filters.types : undefined,
    authorId: filters.authorId ?? undefined,
    q: search || undefined,
    page,
    pageSize: PAGE_SIZE,
    sort: sort.key,
    order: sort.order,
    archived: isArchive ? 'true' : undefined,
  }

  // Keep the rows on screen while the next sort, page or filter loads, so
  // the table doesn't blank out and jump; they dim until the new rows arrive.
  const list = useListContent(params, {
    query: { placeholderData: keepPreviousData },
  })
  const isRefreshing = list.isPlaceholderData
  const pageCount = list.data
    ? Math.max(1, Math.ceil(list.data.total / PAGE_SIZE))
    : 1

  return (
    <>
      <PageHeader title={isArchive ? 'Archive' : 'Dashboard'}>
        {!isArchive && <CreateItemDialog />}
      </PageHeader>

      {/* A clear mode signal, so the Archive can't be mistaken for the Dashboard. */}
      {isArchive && (
        <div className="border-b bg-zinc-100">
          <p className="mx-auto flex w-full max-w-(--breakpoint-2xl) items-center gap-2 px-4 py-2.5 text-sm text-zinc-700">
            <Archive className="size-4 shrink-0" />
            Archived items are kept out of the Dashboard and can't be edited.
            Restore an item to work on it again.
          </p>
        </div>
      )}

      <Toolbar>
        <FilterBar
          filters={filters}
          onChange={changeFilters}
          statuses={ALL_STATUSES}
        />
      </Toolbar>

      <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-1 flex-col gap-4 p-4">
        <div className="overflow-x-auto rounded-lg border">
          {/*
            Fixed column widths: the columns keep their size whatever the rows
            contain, so sorting or paging never shifts the layout. Long titles
            are cut with an ellipsis and shown in full on hover.
          */}
          <Table
            aria-busy={isRefreshing}
            className={cn(
              'min-w-[64rem] table-fixed transition-opacity',
              isRefreshing && 'opacity-60',
            )}
          >
            <colgroup>
              <col />
              <col className="w-32" />
              <col className="w-36" />
              <col className="w-36" />
              <col className="w-28" />
              <col className="w-40" />
              <col className="w-44" />
            </colgroup>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <SortableHead
                  label="Title"
                  sortKey="title"
                  sort={sort}
                  onSort={sortBy}
                />
                <SortableHead
                  label="Status"
                  sortKey="status"
                  sort={sort}
                  onSort={sortBy}
                />
                <SortableHead
                  label="Type"
                  sortKey="type"
                  sort={sort}
                  onSort={sortBy}
                />
                {isArchive ? (
                  <SortableHead
                    label="Archived"
                    sortKey="archivedAt"
                    sort={sort}
                    onSort={sortBy}
                  />
                ) : (
                  <SortableHead
                    label="Deadline"
                    sortKey="deadline"
                    sort={sort}
                    onSort={sortBy}
                  />
                )}
                <TableHead className={HEADER_TEXT}>Authors</TableHead>
                <TableHead className={HEADER_TEXT}>Created by</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data?.items.map((item) => (
                <ContentRow key={item.id} item={item} />
              ))}

              {list.data?.items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {isArchive
                      ? 'Nothing archived.'
                      : 'No items match these filters.'}
                  </TableCell>
                </TableRow>
              )}

              {list.isPending && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {list.isError && (
          <p className="text-sm text-destructive">
            The list could not load: {list.error.message}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pageCount}
            {list.data && ` · ${list.data.total} items`}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}

/**
 * One item. The row opens the item; the frequent action is inline (Publish
 * on items in Review, Unpublish on published ones, editors only; Restore in
 * the Archive), the rest sits in the ⋯ menu.
 */
function ContentRow({ item }: { item: ContentItemSummary }) {
  const openItem = useOpenItem()
  const updateStatus = useUpdateContentStatus()
  const archiveContent = useArchiveContent()
  const restoreContent = useRestoreContent()

  const isArchived = item.archivedAt !== null
  const canPublish =
    item.allowed.publish && !isArchived && item.status === 'review'
  const canUnpublish =
    item.allowed.publish && !isArchived && item.status === 'published'
  const canRestore = item.allowed.archive && isArchived

  return (
    <TableRow
      // Archived rows are muted, like their read-only content.
      // Hovering a row action highlights the action, not the whole row.
      className={cn(
        'cursor-pointer hover:has-[[data-row-actions]:hover]:bg-transparent',
        isArchived && 'text-muted-foreground',
      )}
      onClick={() => openItem(item.id)}
    >
      <TableCell className="font-medium">
        <button
          type="button"
          title={item.title}
          className="block max-w-full cursor-pointer truncate rounded-sm text-left outline-offset-2"
          onClick={(event) => {
            event.stopPropagation()
            openItem(item.id)
          }}
        >
          {item.title}
        </button>
      </TableCell>
      <TableCell>
        <span className={cn(isArchived && 'opacity-60 grayscale')}>
          <StatusBadge status={item.status} />
        </span>
      </TableCell>
      <TableCell>
        <TypeBadge type={item.type} />
      </TableCell>
      <TableCell>
        {isArchived ? (
          <span className="text-xs text-muted-foreground">
            {formatDate(item.archivedAt!)}
          </span>
        ) : (
          <Deadline deadline={item.deadline} status={item.status} />
        )}
      </TableCell>
      <TableCell>
        <AuthorAvatars authors={item.authors} />
      </TableCell>
      <TableCell className="truncate">{item.createdBy.name}</TableCell>
      {/*
        Only the buttons themselves stop the row's click; the empty part of
        the cell still opens the item. (React events from the ⋯ menu's portal
        bubble through this element too, so the menu doesn't open the item.)
      */}
      <TableCell className="text-right">
        <div
          data-row-actions
          className="inline-flex items-center gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          {canPublish && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateStatus.mutate(
                  { id: item.id, data: { status: 'published' } },
                  {
                    onSuccess: () => toast.success(`Published "${item.title}"`),
                  },
                )
              }
            >
              <Send />
              Publish
            </Button>
          )}
          {canUnpublish && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                updateStatus.mutate(
                  { id: item.id, data: { status: 'review' } },
                  {
                    onSuccess: () =>
                      toast.success(`Moved "${item.title}" back to Review`),
                  },
                )
              }
            >
              <Undo2 />
              Unpublish
            </Button>
          )}
          {canRestore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                restoreContent.mutate(
                  { id: item.id },
                  {
                    onSuccess: () => toast.success(`Restored "${item.title}"`),
                  },
                )
              }
            >
              <ArchiveRestore />
              Restore
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`More actions for ${item.title}`}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openItem(item.id)}>
                <Maximize2 />
                Open
              </DropdownMenuItem>
              {item.allowed.archive && !isArchived && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    archiveContent.mutate(
                      { id: item.id },
                      {
                        onSuccess: () =>
                          toast.success(`Archived "${item.title}"`),
                      },
                    )
                  }
                >
                  <Archive />
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}

/** Header labels: small and muted, so the rows stay the focus. */
const HEADER_TEXT = 'text-xs font-medium text-muted-foreground'

/**
 * A column header you can click to sort by. The sorted column shows its
 * direction; on the others the arrow appears on hover or focus. The icon's
 * space is always reserved, so the header never shifts. `aria-sort` tells
 * screen readers the current order.
 */
function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string
  sortKey: SortKey
  sort: Sort
  onSort: (key: SortKey) => void
}) {
  const isSorted = sort.key === sortKey
  const Icon = !isSorted
    ? ArrowUpDown
    : sort.order === 'asc'
      ? ArrowUp
      : ArrowDown

  return (
    <TableHead
      aria-sort={
        isSorted ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'group/sort -mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
          HEADER_TEXT,
          isSorted && 'text-foreground',
        )}
      >
        {label}
        <Icon
          aria-hidden
          className={cn(
            'size-3.5 shrink-0',
            !isSorted &&
              'opacity-0 group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60',
          )}
        />
      </button>
    </TableHead>
  )
}
