import type { Request, Response } from 'express'
import { loginSchema } from './auth.schemas'
import * as authService from './auth.service'
import { currentUser } from './auth.middleware'
import { sessionCookieLifetimeMs, sessionCookieOptions } from './auth.session'
import { SESSION_COOKIE } from './auth.cookie'

// Handlers translate HTTP to and from service calls. No business logic here.

export async function login(req: Request, res: Response) {
  const credentials = loginSchema.parse(req.body)

  const { me, sessionToken } = await authService.login(credentials)

  res.cookie(SESSION_COOKIE, sessionToken, {
    ...sessionCookieOptions,
    maxAge: sessionCookieLifetimeMs,
  })
  res.json(me)
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions)
  res.status(204).end()
}

export function me(req: Request, res: Response) {
  res.json(authService.me(currentUser(req)))
}
