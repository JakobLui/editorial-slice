import type { UserRole } from '../modules/users/user.entity'

/**
 * What a user may do. `:any` applies to every item; `:own` only to items the
 * user owns (see `content.policy.ts` for what owning means per action).
 */
export const PERMISSIONS = [
  'content:read:any',
  'content:read:own',
  'content:update:any',
  'content:update:own',
  'content:assign:any',
  'content:assign:own',
  'content:archive:any',
  'content:archive:own',
  // Move items into or out of `published`, and change published items.
  'content:publish',
] as const
export type Permission = (typeof PERMISSIONS)[number]

/**
 * Roles are fixed, so their permissions live in code. Moving this map into
 * tables later only changes where it is loaded from. Code checks permissions,
 * never role names.
 */
const ROLE_PERMISSIONS = {
  editor: [
    'content:read:any',
    'content:update:any',
    'content:assign:any',
    'content:archive:any',
    'content:publish',
  ],
  contributor: [
    'content:read:own',
    'content:update:own',
    'content:assign:own',
    'content:archive:own',
  ],
} satisfies Record<UserRole, Permission[]>

export function permissionsFor(role: UserRole): Permission[] {
  return [...ROLE_PERMISSIONS[role]]
}

export function hasPermission(role: UserRole, permission: Permission) {
  return (ROLE_PERMISSIONS[role] as readonly Permission[]).includes(permission)
}
