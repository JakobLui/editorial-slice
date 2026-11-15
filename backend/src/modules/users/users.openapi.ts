import { z } from 'zod'
import { authErrorResponses, signedIn } from '../../auth/auth.openapi'
import { registry } from '../../openapi/registry'
import { meSchema, userSchema } from './users.schemas'

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

registry.registerPath({
  method: 'get',
  path: '/api/users/me',
  operationId: 'getMe',
  tags: ['users'],
  summary: 'The signed-in user, with their role and permissions',
  security: signedIn,
  responses: {
    200: {
      description: 'The signed-in user.',
      content: { 'application/json': { schema: meSchema } },
    },
    ...authErrorResponses,
  },
})
