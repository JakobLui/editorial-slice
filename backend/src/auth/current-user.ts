import type { Request, RequestHandler } from 'express'
import { z } from 'zod'
import { dataSource } from '../database/data-source'
import { UnauthorizedError } from '../errors'
import { User, type UserRole } from '../modules/users/user.entity'
import { DEV_USER_HEADER } from './dev-user-header'

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
 * Stand-in for real auth: trusts the user id in the `X-User-Id` header.
 * Anyone can claim to be anyone, so it is for development only. The auth
 * module replaces it with a session; the endpoints keep reading `req.user`.
 */
export const devUserFromHeader: RequestHandler = async (req, _res, next) => {
  const userId = req.header(DEV_USER_HEADER)
  if (!userId) throw new UnauthorizedError(`Missing ${DEV_USER_HEADER} header`)

  // Check the format first: PostgreSQL rejects a malformed UUID with an error.
  const user = z.uuid().safeParse(userId).success
    ? await dataSource.getRepository(User).findOneBy({ id: userId })
    : null
  if (!user) throw new UnauthorizedError('Unknown user')

  req.user = { id: user.id, name: user.name, role: user.role }
  next()
}

/**
 * The signed-in user, for handlers on routers behind `devUserFromHeader`.
 * `req.user` is optional on Express's shared Request type; this narrows it,
 * and answers 401 if a router was mounted without the middleware.
 */
export function currentUser(req: Request): CurrentUser {
  if (!req.user) throw new UnauthorizedError()
  return req.user
}
