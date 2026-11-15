import { ContentStatus, ContentType } from '@/api/generated/model'

/** The filters the pages share. Each page shows the ones that apply to it. */
export interface ContentFilters {
  search: string
  types: ContentType[]
  statuses: ContentStatus[]
  /** Only items this user authors; null for everyone. */
  authorId: string | null
}

export const EMPTY_FILTERS: ContentFilters = {
  search: '',
  types: [],
  statuses: [],
  authorId: null,
}

export const hasActiveFilters = (filters: ContentFilters) =>
  filters.search.trim() !== '' ||
  filters.types.length > 0 ||
  filters.statuses.length > 0 ||
  filters.authorId !== null

const ALL_STATUSES: string[] = Object.values(ContentStatus)
const ALL_TYPES: string[] = Object.values(ContentType)

/**
 * The filters in the URL, so a filtered page can be reloaded or shared.
 * Unknown statuses and types are dropped.
 */
export function filtersFromSearchParams(
  searchParams: URLSearchParams,
): ContentFilters {
  const statuses = searchParams
    .getAll('status')
    .filter((status): status is ContentStatus => ALL_STATUSES.includes(status))
  const types = searchParams
    .getAll('type')
    .filter((type): type is ContentType => ALL_TYPES.includes(type))

  return {
    search: searchParams.get('q') ?? '',
    statuses,
    types,
    authorId: searchParams.get('author'),
  }
}

/** Writes the active filters into `searchParams`; empty ones are left out. */
export function appendFilters(
  searchParams: URLSearchParams,
  filters: ContentFilters,
) {
  if (filters.search) searchParams.set('q', filters.search)
  filters.statuses.forEach((status) => searchParams.append('status', status))
  filters.types.forEach((type) => searchParams.append('type', type))
  if (filters.authorId) searchParams.set('author', filters.authorId)
}
