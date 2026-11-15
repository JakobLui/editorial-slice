import type { CurrentUser } from '../../auth/auth.middleware'
import {
  AppError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../errors'
import { User } from '../users/user.entity'
import type { ContentItem } from './content-item.entity'
import * as policy from './content.policy'
import {
  allUsersExist,
  applyFilters,
  contentItemRepository,
  findById,
  loadByIds,
  orderByDeadline,
  SORT_COLUMNS,
} from './content.repository'
import {
  BOARD_STATUSES,
  type BoardQuery,
  type ContentBoard,
  type ContentItemDto,
  type ContentItemSummary,
  type ContentPage,
  type CreateContent,
  type ListQuery,
  type UpdateContent,
} from './content.schemas'

/** The board loads every active item at once, up to this many. */
export const BOARD_CAP = 500

// --- Reads -------------------------------------------------------------------

export async function getBoard(
  user: CurrentUser,
  query: BoardQuery,
): Promise<ContentBoard> {
  const queryBuilder = contentItemRepository()
    .createQueryBuilder('item')
    .select('item.id')
  applyFilters(queryBuilder, user, { ...query, status: [...BOARD_STATUSES] })
  orderByDeadline(queryBuilder, 'ASC')

  // One past the cap, to learn whether items were left out.
  const contentItems = await queryBuilder.take(BOARD_CAP + 1).getMany()
  const truncated = contentItems.length > BOARD_CAP
  const boardItems = await loadByIds(
    contentItems.slice(0, BOARD_CAP).map((contentItem) => contentItem.id),
  )

  const board: ContentBoard = { idea: [], draft: [], review: [], truncated }

  boardItems.forEach((item) => {
    if (item.status === 'published') return
    board[item.status].push(toSummary(item, user))
  })

  return board
}

export async function list(
  user: CurrentUser,
  query: ListQuery,
): Promise<ContentPage> {
  const queryBuilder = contentItemRepository()
    .createQueryBuilder('item')
    .select('item.id')
  applyFilters(queryBuilder, user, query)

  const order = query.order === 'asc' ? 'ASC' : 'DESC'

  // Items without a deadline or publish date go last, whichever the order.
  queryBuilder.orderBy(SORT_COLUMNS[query.sort], order, 'NULLS LAST')
  queryBuilder.addOrderBy('item.id', order) // stable order across pages

  const [contentItems, total] = await queryBuilder
    .skip((query.page - 1) * query.pageSize)
    .take(query.pageSize)
    .getManyAndCount()
  const pageItems = await loadByIds(
    contentItems.map((item) => item.id),
    query.archived,
  )

  return {
    items: pageItems.map((item) => toSummary(item, user)),
    total,
    page: query.page,
    pageSize: query.pageSize,
  }
}

export async function get(
  user: CurrentUser,
  id: string,
): Promise<ContentItemDto> {
  return toDetail(await findVisible(user, id), user)
}

// --- Writes ------------------------------------------------------------------

export async function create(
  user: CurrentUser,
  input: CreateContent,
): Promise<ContentItemDto> {
  await assertUsersExist(input.authorIds)

  const saved = await contentItemRepository().save(
    contentItemRepository().create({
      title: input.title,
      type: input.type,
      status: input.status,
      deadline: input.deadline ?? null,
      brief: input.brief ?? null,
      draftUrl: input.draftUrl ?? null,
      createdById: user.id, // never from the request body
      authors: input.authorIds.map((id) => ({ id })),
    }),
  )

  return loadDetail(user, saved.id)
}

export async function update(
  user: CurrentUser,
  id: string,
  input: UpdateContent,
): Promise<ContentItemDto> {
  const item = await findVisible(user, id)

  assertNotArchived(item)

  const { authorIds, ...fields } = input
  const changesFields = Object.values(fields).some(
    (value) => value !== undefined,
  )

  if (changesFields && !policy.canEdit(user, policyItem(item))) {
    throw new ForbiddenError('You may not edit this item')
  }

  if (authorIds) {
    if (!policy.canChangeAuthors(user, policyItem(item), authorIds)) {
      throw new ForbiddenError('You may not change the authors of this item')
    }

    await assertUsersExist(authorIds)
    item.authors = authorIds.map((authorId) => ({ id: authorId }) as User)
  }

  Object.assign(item, withoutUndefined(fields))
  await contentItemRepository().save(item)

  return loadDetail(user, id)
}

export async function changeStatus(
  user: CurrentUser,
  id: string,
  status: ContentItem['status'],
): Promise<ContentItemDto> {
  const item = await findVisible(user, id)

  assertNotArchived(item)

  if (!policy.canChangeStatus(user, policyItem(item), status)) {
    throw new ForbiddenError(
      status === 'published' || item.status === 'published'
        ? 'Only editors can publish or unpublish'
        : 'You may not change the status of this item',
    )
  }

  item.status = status
  // Set the first time only: an unpublished item keeps its first publish date.
  if (status === 'published' && !item.publishedAt) item.publishedAt = new Date()
  await contentItemRepository().save(item)

  return loadDetail(user, id)
}

/** Archive is soft delete. Archiving an archived item does nothing. */
export async function archive(user: CurrentUser, id: string) {
  const item = await findVisible(user, id)

  if (!policy.canArchive(user, policyItem(item))) {
    throw new ForbiddenError('You may not archive this item')
  }

  if (!item.archivedAt) await contentItemRepository().softDelete(id)
}

/** Restoring an item that isn't archived does nothing. */
export async function restore(user: CurrentUser, id: string) {
  const item = await findVisible(user, id)

  if (!policy.canArchive(user, policyItem(item))) {
    throw new ForbiddenError('You may not restore this item')
  }

  if (item.archivedAt) await contentItemRepository().restore(id)
}

// --- Helpers -----------------------------------------------------------------

/**
 * The item after a write, without checking visibility again: an author who
 * just removed themselves still gets the result of their own change.
 */
async function loadDetail(user: CurrentUser, id: string) {
  const [item] = await loadByIds([id], true)

  return toDetail(item!, user)
}

/** The item, archived or not, or 404 if it doesn't exist or the user may not see it. */
async function findVisible(user: CurrentUser, id: string) {
  const item = await findById(id)

  // Same answer for "doesn't exist" and "not yours", so ids reveal nothing.
  if (!item || !policy.canView(user, policyItem(item))) {
    throw new NotFoundError('Content item not found')
  }

  return item
}

function assertNotArchived(item: ContentItem) {
  if (item.archivedAt) {
    throw new AppError(
      409,
      'The item is archived. Restore it before changing it.',
    )
  }
}

async function assertUsersExist(ids: string[]) {
  if (!(await allUsersExist(ids)))
    throw new BadRequestError('Unknown author id')
}

function withoutUndefined<T extends object>(fields: T) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}

// --- Responses ---------------------------------------------------------------

function policyItem(item: ContentItem): policy.PolicyItem {
  return {
    createdById: item.createdById,
    authorIds: item.authors.map((author) => author.id),
    status: item.status,
  }
}

const userRef = (user: User) => ({ id: user.id, name: user.name })

function toSummary(item: ContentItem, user: CurrentUser): ContentItemSummary {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    type: item.type,
    deadline: item.deadline,
    draftUrl: item.draftUrl,
    createdBy: userRef(item.createdBy),
    authors: item.authors
      .map(userRef)
      .sort((authorA, authorB) => authorA.name.localeCompare(authorB.name)),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    publishedAt: item.publishedAt?.toISOString() ?? null,
    archivedAt: item.archivedAt?.toISOString() ?? null,
    allowed: policy.allowedActions(user, policyItem(item)),
  }
}

function toDetail(item: ContentItem, user: CurrentUser): ContentItemDto {
  return {
    ...toSummary(item, user),
    brief: (item.brief as ContentItemDto['brief']) ?? null,
  }
}
