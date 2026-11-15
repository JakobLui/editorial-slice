import { Search, X } from 'lucide-react'
import type { ContentStatus, ContentType } from '@/api/generated/model'
import { useGetMe, useListUsers } from '@/api/generated/users/users'
import {
  FacetedFilter,
  type FilterOption,
} from '@/components/content/faceted-filter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/user-avatar'
import { STATUS_LABELS, TYPE_LABELS } from '@/lib/content'
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  type ContentFilters,
} from '@/lib/content-filters'
import { TYPE_ICONS } from '@/lib/content-types'
import { STATUS_DOT_COLORS } from '@/lib/status-colors'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS: FilterOption[] = (
  Object.keys(TYPE_LABELS) as ContentType[]
).map((type) => {
  const Icon = TYPE_ICONS[type]

  return {
    value: type,
    label: TYPE_LABELS[type],
    leading: <Icon className="size-3.5" />,
  }
})

const statusOption = (status: ContentStatus): FilterOption => ({
  value: status,
  label: STATUS_LABELS[status],
  leading: (
    <span
      className={cn('size-2 shrink-0 rounded-full', STATUS_DOT_COLORS[status])}
    />
  ),
})

/**
 * Search plus one faceted filter per field, and "Clear filters" while any
 * filter is active.
 */
export function FilterBar({
  filters,
  onChange,
  statuses,
}: {
  filters: ContentFilters
  onChange: (filters: ContentFilters) => void
  /** The statuses to offer as a filter; omit to hide the status filter. */
  statuses?: readonly ContentStatus[]
}) {
  const users = useListUsers()
  const me = useGetMe()

  // You first, then everyone else by name.
  const authorOptions: FilterOption[] = [...(users.data ?? [])]
    .sort(
      (first, second) =>
        Number(second.id === me.data?.id) - Number(first.id === me.data?.id),
    )
    .map((user) => ({
      value: user.id,
      label: user.id === me.data?.id ? `${user.name} (you)` : user.name,
      leading: <UserAvatar name={user.name} size="sm" className="size-5" />,
    }))

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search titles"
          aria-label="Search titles"
          className="w-56 pl-8"
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
        />
      </div>

      {statuses && (
        <FacetedFilter
          label="Status"
          options={statuses.map(statusOption)}
          selected={filters.statuses}
          onChange={(selected) =>
            onChange({ ...filters, statuses: selected as ContentStatus[] })
          }
        />
      )}

      <FacetedFilter
        label="Type"
        options={TYPE_OPTIONS}
        selected={filters.types}
        onChange={(selected) =>
          onChange({ ...filters, types: selected as ContentType[] })
        }
      />

      <FacetedFilter
        label="Author"
        multiple={false}
        searchPlaceholder="Search people"
        options={authorOptions}
        selected={filters.authorId ? [filters.authorId] : []}
        onChange={(selected) =>
          onChange({ ...filters, authorId: selected[0] ?? null })
        }
      />

      {hasActiveFilters(filters) && (
        <Button variant="ghost" onClick={() => onChange(EMPTY_FILTERS)}>
          <X />
          Clear filters
        </Button>
      )}
    </div>
  )
}
