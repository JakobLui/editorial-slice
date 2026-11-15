import type { Request, RequestHandler } from 'express'
import { dataSource } from '../database/data-source'
import { UnauthorizedError } from '../errors'
import { User, type UserRole } from '../modules/users/user.entity'
import { userIdFromSessionToken } from './auth.session'
import { SESSION_COOKIE } from './auth.cookie'

/** The signed-in user, as the rest of the backend sees them. */
export interface CurrentUser {
  id: string
  name: string
  role: UserRole
}

declare global {
  // Express's own type is a namespace, so augmenting it needs one too.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: CurrentUser
    }
  }
}

/**
 * Reads the session cookie and sets `req.user`. Answers 401 when the cookie
 * is missing, the token is invalid or expired, or the user no longer exists.
 */
export const requireUser: RequestHandler = async (req, _res, next) => {
  const sessionToken: unknown = req.cookies?.[SESSION_COOKIE]
  if (typeof sessionToken !== 'string') throw new UnauthorizedError()

  const userId = await userIdFromSessionToken(sessionToken)
  if (!userId) throw new UnauthorizedError('Session expired or invalid')

  const user = await dataSource.getRepository(User).findOneBy({ id: userId })
  if (!user) throw new UnauthorizedError()

  req.user = { id: user.id, name: user.name, role: user.role }
  next()
}

/**
 * The signed-in user, for handlers on routers behind `requireUser`.
 * `req.user` is optional on Express's shared Request type; this narrows it,
 * and answers 401 if a router was mounted without the middleware.
 */
export function currentUser(req: Request): CurrentUser {
  if (!req.user) throw new UnauthorizedError()
  return req.user
}
