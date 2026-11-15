import { Column, Entity, PrimaryColumn } from 'typeorm'

export const USER_ROLES = ['editor', 'contributor'] as const
export type UserRole = (typeof USER_ROLES)[number]

@Entity('users')
export class User {
  // UUIDv7: time-ordered, so inserts stay fast, and safe to show in URLs.
  @PrimaryColumn({ type: 'uuid', default: () => 'uuidv7()' })
  id: string

  @Column({ type: 'text' })
  name: string

  @Column({ type: 'text', unique: true })
  email: string

  // Roles are fixed; their permissions live in code (see the policy module).
  @Column({ type: 'text' })
  role: UserRole
}
