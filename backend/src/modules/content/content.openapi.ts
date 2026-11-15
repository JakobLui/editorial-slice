import { authErrorResponses, signedIn } from '../../auth/auth.openapi'
import { registry } from '../../openapi/registry'
import {
  boardQuerySchema,
  contentBoardSchema,
  contentIdParamsSchema,
  contentItemSchema,
  contentPageSchema,
  createContentSchema,
  listQuerySchema,
  updateContentSchema,
  updateStatusSchema,
} from './content.schemas'

const json = <T>(schema: T) => ({ 'application/json': { schema } })

const item = {
  description: 'The content item.',
  content: json(contentItemSchema),
}
const notFound = {
  404: { description: 'No such item, or the user may not see it.' },
}
const forbidden = { 403: { description: 'The user may not do this.' } }
const archived = {
  409: { description: 'The item is archived. Restore it first.' },
}
const invalid = { 400: { description: 'The request failed validation.' } }

const common = { tags: ['content'], security: signedIn }

registry.registerPath({
  ...common,
  method: 'get',
  path: '/api/content/board',
  operationId: 'getContentBoard',
  summary: 'Work in progress (Idea, Draft, Review), grouped by status',
  description:
    'Unpaginated, capped at 500 items. Each column is sorted by deadline, items without one last. Role scope always applies.',
  request: { query: boardQuerySchema },
  responses: {
    200: { description: 'The board.', content: json(contentBoardSchema) },
    ...invalid,
    ...authErrorResponses,
  },
})

registry.registerPath({
  ...common,
  method: 'get',
  path: '/api/content',
  operationId: 'listContent',
  summary: 'Content items with filters, search, sorting and pagination',
  description:
    'Filters combine with AND, inside the role scope. `archived=true` returns only archived items.',
  request: { query: listQuerySchema },
  responses: {
    200: {
      description: 'One page of items.',
      content: json(contentPageSchema),
    },
    ...invalid,
    ...authErrorResponses,
  },
})

registry.registerPath({
  ...common,
  method: 'post',
  path: '/api/content',
  operationId: 'createContent',
  summary: 'Create a content item; the current user becomes its creator',
  request: { body: { content: json(createContentSchema) } },
  responses: {
    201: item,
    ...invalid,
    ...authErrorResponses,
  },
})

registry.registerPath({
  ...common,
  method: 'get',
  path: '/api/content/{id}',
  operationId: 'getContent',
  summary: 'One content item, archived or not, with its brief',
  request: { params: contentIdParamsSchema },
  responses: { 200: item, ...invalid, ...authErrorResponses, ...notFound },
})

registry.registerPath({
  ...common,
  method: 'patch',
  path: '/api/content/{id}',
  operationId: 'updateContent',
  summary: 'Edit fields and authors (not status)',
  request: {
    params: contentIdParamsSchema,
    body: { content: json(updateContentSchema) },
  },
  responses: {
    200: item,
    ...invalid,
    ...authErrorResponses,
    ...forbidden,
    ...notFound,
    ...archived,
  },
})

registry.registerPath({
  ...common,
  method: 'patch',
  path: '/api/content/{id}/status',
  operationId: 'updateContentStatus',
  summary:
    'Change the status; only editors move items into or out of published',
  request: {
    params: contentIdParamsSchema,
    body: { content: json(updateStatusSchema) },
  },
  responses: {
    200: item,
    ...invalid,
    ...authErrorResponses,
    ...forbidden,
    ...notFound,
    ...archived,
  },
})

const archiveActions = ['archive', 'restore'] as const

archiveActions.forEach((action) => {
  registry.registerPath({
    ...common,
    method: 'post',
    path: `/api/content/{id}/${action}`,
    operationId: `${action}Content`,
    summary:
      action === 'archive'
        ? 'Archive (soft delete) an item'
        : 'Restore an archived item',
    request: { params: contentIdParamsSchema },
    responses: {
      204: { description: `The item is ${action}d.` },
      ...invalid,
      ...authErrorResponses,
      ...forbidden,
      ...notFound,
    },
  })
})
