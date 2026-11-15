import { z } from 'zod'
import { authErrorResponses, signedIn } from '../../auth/auth.openapi'
import { registry } from '../../openapi/registry'
import { userSchema } from './users.schemas'

registry.registerPath({
  method: 'get',
  path: '/api/users',
  operationId: 'listUsers',
  tags: ['users'],
  summary: 'All users, for picking authors',
  security: signedIn,
  responses: {
    200: {
      description: 'Users sorted by name.',
      content: { 'application/json': { schema: z.array(userSchema) } },
    },
    ...authErrorResponses,
  },
})
