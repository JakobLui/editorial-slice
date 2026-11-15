import { registry } from '../../openapi/registry'
import { healthResponseSchema } from './health.schemas'

registry.registerPath({
  method: 'get',
  path: '/api/health',
  operationId: 'getHealth',
  tags: ['health'],
  responses: {
    200: {
      description: 'The API is running.',
      content: { 'application/json': { schema: healthResponseSchema } },
    },
  },
})
