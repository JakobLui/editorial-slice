import { z } from 'zod'
import { CONTENT_STATUSES, CONTENT_TYPES } from './content-item.entity'

// `.meta({ id })` names the schema in openapi.json, and so the generated frontend type.

export const contentStatusSchema = z
  .enum(CONTENT_STATUSES)
  .meta({ id: 'ContentStatus' })
export const contentTypeSchema = z
  .enum(CONTENT_TYPES)
  .meta({ id: 'ContentType' })

/** The statuses an item can be created with: anything but published. */
const CREATE_STATUSES = CONTENT_STATUSES.filter(
  (status) => status !== 'published',
)

/** The statuses on the board: work in progress. */
export const BOARD_STATUSES = ['idea', 'draft', 'review'] as const

// --- Shared pieces -----------------------------------------------------------

const dateSchema = z.iso.date() // 'YYYY-MM-DD'

/** Tiptap's document JSON. The editor owns the inner shape. */
const briefSchema = z
  .looseObject({ type: z.literal('doc') })
  .meta({ id: 'Brief', description: 'A Tiptap document (JSON).' })

/** Unique user ids; the order is kept. */
const authorIdsSchema = z.array(z.uuid()).transform((ids) => [...new Set(ids)])

/** A query parameter that may appear once or several times. */
const repeatable = <T extends z.ZodType>(schema: T) =>
  z
    .union([schema, z.array(schema)])
    .transform(
      (value) => (Array.isArray(value) ? value : [value]) as z.output<T>[],
    )

export const userRefSchema = z
  .object({ id: z.uuid(), name: z.string() })
  .meta({ id: 'UserRef' })

// --- Responses ---------------------------------------------------------------

export const allowedActionsSchema = z
  .object({
    edit: z.boolean().meta({
      description: 'Edit fields; change status among Idea, Draft and Review.',
    }),
    publish: z
      .boolean()
      .meta({ description: 'Move the item into or out of published.' }),
    assignAuthors: z
      .boolean()
      .meta({ description: 'Add or remove any author.' }),
    removeSelf: z
      .boolean()
      .meta({ description: 'Take oneself off the authors list.' }),
    archive: z.boolean().meta({ description: 'Archive and restore.' }),
  })
  .meta({
    id: 'AllowedActions',
    description:
      'What the current user may do with the item. The API enforces the same rules.',
  })

export const contentItemSummarySchema = z
  .object({
    id: z.uuid(),
    title: z.string(),
    status: contentStatusSchema,
    type: contentTypeSchema,
    deadline: dateSchema.nullable(),
    draftUrl: z.string().nullable(),
    createdBy: userRefSchema,
    authors: z.array(userRefSchema),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    publishedAt: z.iso.datetime().nullable(),
    archivedAt: z.iso.datetime().nullable(),
    allowed: allowedActionsSchema,
  })
  .meta({ id: 'ContentItemSummary' })

export const contentItemSchema = contentItemSummarySchema
  .extend({ brief: briefSchema.nullable() })
  .meta({ id: 'ContentItem' })

export const contentBoardSchema = z
  .object({
    idea: z.array(contentItemSummarySchema),
    draft: z.array(contentItemSummarySchema),
    review: z.array(contentItemSummarySchema),
    truncated: z.boolean().meta({
      description:
        'True when the board hit its item cap and some items are left out.',
    }),
  })
  .meta({ id: 'ContentBoard' })

export const contentPageSchema = z
  .object({
    items: z.array(contentItemSummarySchema),
    total: z.int(),
    page: z.int(),
    pageSize: z.int(),
  })
  .meta({ id: 'ContentPage' })

// --- Requests ----------------------------------------------------------------

export const contentIdParamsSchema = z.object({ id: z.uuid() })

export const boardQuerySchema = z.object({
  type: repeatable(contentTypeSchema).optional(),
  authorId: z.uuid().optional(),
  q: z.string().trim().min(1).optional(),
})

export const CONTENT_SORTS = [
  'deadline',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'title',
] as const

export const listQuerySchema = z.object({
  status: repeatable(contentStatusSchema).optional(),
  type: repeatable(contentTypeSchema).optional(),
  authorId: z.uuid().optional(),
  createdById: z.uuid().optional(),
  deadlineFrom: dateSchema.optional(),
  deadlineTo: dateSchema.optional(),
  publishedFrom: z.iso.datetime({ offset: true }).optional(),
  publishedTo: z.iso.datetime({ offset: true }).optional(),
  archived: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  q: z.string().trim().min(1).optional(),
  sort: z.enum(CONTENT_SORTS).default('deadline'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const createContentSchema = z
  .object({
    title: z.string().trim().min(1),
    type: contentTypeSchema,
    status: z.enum(CREATE_STATUSES).default('idea'),
    deadline: dateSchema.nullable().optional(),
    brief: briefSchema.nullable().optional(),
    draftUrl: z.url().nullable().optional(),
    authorIds: authorIdsSchema.default([]),
  })
  .meta({ id: 'CreateContent' })

export const updateContentSchema = z
  .object({
    title: z.string().trim().min(1),
    type: contentTypeSchema,
    deadline: dateSchema.nullable(),
    brief: briefSchema.nullable(),
    draftUrl: z.url().nullable(),
    authorIds: authorIdsSchema.meta({
      description:
        'The full new list of authors. It replaces the current list.',
    }),
  })
  .partial()
  .meta({ id: 'UpdateContent' })

export const updateStatusSchema = z
  .object({ status: contentStatusSchema })
  .meta({ id: 'UpdateContentStatus' })

export type ContentItemSummary = z.infer<typeof contentItemSummarySchema>
export type ContentItemDto = z.infer<typeof contentItemSchema>
export type ContentBoard = z.infer<typeof contentBoardSchema>
export type ContentPage = z.infer<typeof contentPageSchema>
export type BoardQuery = z.infer<typeof boardQuerySchema>
export type ListQuery = z.infer<typeof listQuerySchema>
export type CreateContent = z.infer<typeof createContentSchema>
export type UpdateContent = z.infer<typeof updateContentSchema>
