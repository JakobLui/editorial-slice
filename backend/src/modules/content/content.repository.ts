import { In, type SelectQueryBuilder } from 'typeorm'
import type { CurrentUser } from '../../auth/current-user'
import { dataSource } from '../../database/data-source'
import { User } from '../users/user.entity'
import { ContentItem } from './content-item.entity'
import * as policy from './content.policy'
import type { ListQuery } from './content.schemas'

// Data access for content items: building queries and loading rows. The
// service decides what to load and what is allowed; this file knows how.

export const contentItemRepository = () => dataSource.getRepository(ContentItem)

export const SORT_COLUMNS = {
  deadline: 'item.deadline',
  createdAt: 'item.createdAt',
  updatedAt: 'item.updatedAt',
  publishedAt: 'item.publishedAt',
  archivedAt: 'item.archivedAt',
  title: 'item.title',
  type: 'item.type',
  // Workflow order, not alphabetical: Idea, Draft, Review, Published.
  status:
    "CASE item.status WHEN 'idea' THEN 0 WHEN 'draft' THEN 1 WHEN 'review' THEN 2 ELSE 3 END",
} as const

type Filters = Partial<
  Pick<
    ListQuery,
    | 'status'
    | 'type'
    | 'authorId'
    | 'createdById'
    | 'deadlineFrom'
    | 'deadlineTo'
    | 'publishedFrom'
    | 'publishedTo'
    | 'archived'
    | 'q'
  >
>

const AUTHORED_BY = (param: string) =>
  `EXISTS (SELECT 1 FROM content_item_authors item_author WHERE item_author.content_item_id = item.id AND item_author.user_id = :${param})`

/** Role scope first, always; then the optional filters, combined with AND. */
export function applyFilters(
  queryBuilder: SelectQueryBuilder<ContentItem>,
  user: CurrentUser,
  filters: Filters,
) {
  if (!policy.seesAllItems(user)) {
    queryBuilder.andWhere(`(item.createdById = :me OR ${AUTHORED_BY('me')})`, {
      me: user.id,
    })
  }

  // Archived rows are left out unless asked for; then only they are returned.
  if (filters.archived) {
    queryBuilder.withDeleted().andWhere('item.archivedAt IS NOT NULL')
  }

  if (filters.status) {
    queryBuilder.andWhere('item.status IN (:...status)', {
      status: filters.status,
    })
  }

  if (filters.type) {
    queryBuilder.andWhere('item.type IN (:...type)', { type: filters.type })
  }

  if (filters.authorId) {
    queryBuilder.andWhere(AUTHORED_BY('authorId'), {
      authorId: filters.authorId,
    })
  }

  if (filters.createdById) {
    queryBuilder.andWhere('item.createdById = :createdById', {
      createdById: filters.createdById,
    })
  }

  if (filters.deadlineFrom) {
    queryBuilder.andWhere('item.deadline >= :deadlineFrom', {
      deadlineFrom: filters.deadlineFrom,
    })
  }

  if (filters.deadlineTo) {
    queryBuilder.andWhere('item.deadline <= :deadlineTo', {
      deadlineTo: filters.deadlineTo,
    })
  }

  if (filters.publishedFrom) {
    queryBuilder.andWhere('item.publishedAt >= :publishedFrom', {
      publishedFrom: filters.publishedFrom,
    })
  }

  if (filters.publishedTo) {
    queryBuilder.andWhere('item.publishedAt <= :publishedTo', {
      publishedTo: filters.publishedTo,
    })
  }

  if (filters.q) {
    const pattern = `%${filters.q.replace(/[\\%_]/g, '\\$&')}%`
    queryBuilder.andWhere('item.title ILIKE :q', { q: pattern })
  }
}

export function orderByDeadline(
  queryBuilder: SelectQueryBuilder<ContentItem>,
  order: 'ASC' | 'DESC',
) {
  queryBuilder
    .orderBy('item.deadline', order, 'NULLS LAST')
    .addOrderBy('item.id', order)
}

/** Loads full items with their people, in the order of `ids`. */
export async function loadByIds(ids: string[], withDeleted = false) {
  if (ids.length === 0) return []

  const foundItems = await contentItemRepository().find({
    where: { id: In(ids) },
    relations: { createdBy: true, authors: true },
    withDeleted,
  })
  const itemsById = new Map(foundItems.map((item) => [item.id, item]))

  return ids.flatMap((id) => itemsById.get(id) ?? [])
}

/** One item with its people, archived or not. */
export function findById(id: string) {
  return contentItemRepository().findOne({
    where: { id },
    relations: { createdBy: true, authors: true },
    withDeleted: true,
  })
}

/** Whether every id belongs to a user. */
export async function allUsersExist(ids: string[]) {
  if (ids.length === 0) return true

  const userCount = await dataSource
    .getRepository(User)
    .countBy({ id: In(ids) })

  return userCount === ids.length
}
