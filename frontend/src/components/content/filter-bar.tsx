import { Search, X } from 'lucide-react'
import type { ContentStatus, ContentType } from '@/api/generated/model'
import { FacetedFilter } from '@/components/content/faceted-filter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthorOptions } from '@/hooks/use-author-options'
import { statusOption, TYPE_OPTIONS } from '@/lib/content-options'
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  type ContentFilters,
} from '@/lib/content-filters'

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
  const authorOptions = useAuthorOptions()

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
