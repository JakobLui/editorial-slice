import { registry } from '../openapi/registry'
import { loginSchema, meSchema } from './auth.schemas'
import { SESSION_COOKIE } from './auth.cookie'

/** The session cookie that `POST /api/auth/login` sets. */
export const sessionScheme = registry.registerComponent(
  'securitySchemes',
  'session',
  {
    type: 'apiKey',
    in: 'cookie',
    name: SESSION_COOKIE,
    description: 'Set by POST /api/auth/login; httpOnly, valid for 8 hours.',
  },
)

/** Put on every path that needs a signed-in user. */
export const signedIn = [{ [sessionScheme.name]: [] }]

export const authErrorResponses = {
  401: { description: 'Not signed in, or the session expired.' },
}

const meResponse = {
  description: 'The signed-in user.',
  content: { 'application/json': { schema: meSchema } },
}

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  operationId: 'login',
  tags: ['auth'],
  summary: 'Sign in with email and password; sets the session cookie',
  request: {
    body: { content: { 'application/json': { schema: loginSchema } } },
  },
  responses: {
    200: meResponse,
    400: { description: 'The request failed validation.' },
    401: { description: 'Wrong email or password.' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  operationId: 'logout',
  tags: ['auth'],
  summary: 'Sign out; clears the session cookie',
  responses: { 204: { description: 'Signed out.' } },
})

registry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  operationId: 'getMe',
  tags: ['auth'],
  summary: 'The signed-in user, with their role and permissions',
  security: signedIn,
  responses: { 200: meResponse, ...authErrorResponses },
})
