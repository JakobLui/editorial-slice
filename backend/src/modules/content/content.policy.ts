import type { CurrentUser } from '../../auth/current-user'
import { hasPermission } from '../../auth/permissions'
import type { ContentStatus } from './content-item.entity'

/**
 * Who may do what with a content item. Pure functions, no database: the
 * service loads the item and asks here. Every rule lives in this file.
 *
 * Owning an item: having created it, or being one of its authors.
 * Published items are locked: only users who can publish may change them.
 */

/** The parts of an item the rules look at. */
export interface PolicyItem {
  createdById: string
  authorIds: string[]
  status: ContentStatus
}

const isCreator = (user: CurrentUser, item: PolicyItem) =>
  item.createdById === user.id

const isAuthor = (user: CurrentUser, item: PolicyItem) =>
  item.authorIds.includes(user.id)

const isOwner = (user: CurrentUser, item: PolicyItem) =>
  isCreator(user, item) || isAuthor(user, item)

const can = (
  user: CurrentUser,
  permission: Parameters<typeof hasPermission>[1],
) => hasPermission(user.role, permission)

/** Users without `content:read:any` only see items they own. */
export function seesAllItems(user: CurrentUser) {
  return can(user, 'content:read:any')
}

export function canView(user: CurrentUser, item: PolicyItem) {
  return (
    seesAllItems(user) || (can(user, 'content:read:own') && isOwner(user, item))
  )
}

/** Edit fields other than authors and status. */
export function canEdit(user: CurrentUser, item: PolicyItem) {
  if (item.status === 'published') return can(user, 'content:publish')

  return (
    can(user, 'content:update:any') ||
    (can(user, 'content:update:own') && isOwner(user, item))
  )
}

/** Replace the authors list with `nextAuthorIds`. */
/** Add or remove any author. */
export function canAssignAuthors(user: CurrentUser, item: PolicyItem) {
  if (item.status === 'published') return can(user, 'content:publish')

  return (
    can(user, 'content:assign:any') ||
    (can(user, 'content:assign:own') && isCreator(user, item))
  )
}

/** Replace the authors list with `nextAuthorIds`. */
export function canChangeAuthors(
  user: CurrentUser,
  item: PolicyItem,
  nextAuthorIds: string[],
) {
  if (sameIds(item.authorIds, nextAuthorIds)) return true
  if (canAssignAuthors(user, item)) return true

  // Anyone else may only take themselves off the list.
  return (
    canRemoveSelf(user, item) && sameIds(withoutSelf(user, item), nextAuthorIds)
  )
}

/** Take oneself off the authors list. Published items stay locked. */
export function canRemoveSelf(user: CurrentUser, item: PolicyItem) {
  if (!isAuthor(user, item)) return false
  return item.status !== 'published' || can(user, 'content:publish')
}

export function canChangeStatus(
  user: CurrentUser,
  item: PolicyItem,
  nextStatus: ContentStatus,
) {
  const touchesPublished =
    item.status === 'published' || nextStatus === 'published'
  if (touchesPublished) return can(user, 'content:publish')

  return canEdit(user, item)
}

/** Archive and restore follow the same rule. */
export function canArchive(user: CurrentUser, item: PolicyItem) {
  if (item.status === 'published') return can(user, 'content:publish')
  return (
    can(user, 'content:archive:any') ||
    (can(user, 'content:archive:own') && isCreator(user, item))
  )
}

/**
 * What the user may do with the item, for the frontend to show or hide
 * actions. Built from the same rules that the API enforces.
 */
export function allowedActions(user: CurrentUser, item: PolicyItem) {
  return {
    // Fields and the status among Idea, Draft and Review.
    edit: canEdit(user, item),
    // Move into or out of published.
    publish: canChangeStatus(user, item, 'published'),
    assignAuthors: canAssignAuthors(user, item),
    removeSelf: canRemoveSelf(user, item),
    // Archive and restore.
    archive: canArchive(user, item),
  }
}

const withoutSelf = (user: CurrentUser, item: PolicyItem) =>
  item.authorIds.filter((id) => id !== user.id)

function sameIds(firstIds: string[], secondIds: string[]) {
  return (
    firstIds.length === secondIds.length &&
    firstIds.every((id) => secondIds.includes(id))
  )
}
