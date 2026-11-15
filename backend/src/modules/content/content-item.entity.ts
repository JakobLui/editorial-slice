import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../users/user.entity'

export const CONTENT_STATUSES = [
  'idea',
  'draft',
  'review',
  'published',
] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]

export const CONTENT_TYPES = [
  'article',
  'newsletter',
  'podcast',
  'video',
] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

/** Tiptap's document JSON. The editor owns its shape. */
export type TiptapDocument = Record<string, unknown>

@Entity('content_items')
export class ContentItem {
  // UUIDv7: time-ordered, so inserts stay fast, and safe to show in URLs.
  @PrimaryColumn({ type: 'uuid', default: () => 'uuidv7()' })
  id: string

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'text', default: 'idea' })
  status: ContentStatus

  @Column({ type: 'text' })
  type: ContentType

  // What the piece is about: angle, sources, notes. Rich text from Tiptap.
  @Column({ type: 'jsonb', nullable: true })
  brief: TiptapDocument | null

  // Where the piece itself is written (the newsroom's own tools).
  @Column({ type: 'text', nullable: true })
  draftUrl: string | null

  // A calendar date, no time. The pg driver returns it as 'YYYY-MM-DD'.
  @Column({ type: 'date', nullable: true })
  deadline: string | null

  // Set by the API from the current user, never from the request body.
  @Column({ type: 'uuid' })
  createdById: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User

  // Who writes the item. Adding someone here also gives them access.
  @ManyToMany(() => User)
  @JoinTable({
    name: 'content_item_authors',
    joinColumn: { name: 'content_item_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  authors: User[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  // Set when the status first becomes published; kept if it changes back.
  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null

  // Archive is soft delete: finds skip archived rows unless withDeleted is set.
  @DeleteDateColumn({ type: 'timestamptz' })
  archivedAt: Date | null
}
