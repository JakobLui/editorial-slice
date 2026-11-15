import type { CookieOptions } from 'express'
import { SignJWT, jwtVerify } from 'jose'
import { env } from '../config/env'

const SESSION_LIFETIME_SECONDS = 8 * 60 * 60
const secretKey = new TextEncoder().encode(env.SESSION_SECRET)

/**
 * The session is a signed token (JWT) holding the user id. Nothing is stored
 * on the server, so logout only clears the cookie (see the README's limits).
 */
export async function createSessionToken(userId: string) {
  return new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_LIFETIME_SECONDS}s`)
    .sign(secretKey)
}

/** The user id in a valid token, or null when it is tampered with or expired. */
export async function userIdFromSessionToken(sessionToken: string) {
  try {
    const { payload } = await jwtVerify(sessionToken, secretKey, {
      algorithms: ['HS256'],
    })
    return payload.sub ?? null
  } catch {
    return null
  }
}

/**
 * httpOnly keeps the token away from scripts. SameSite=Lax stops other sites
 * from sending it with their requests, which covers CSRF for a JSON API.
 */
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
}

export const sessionCookieLifetimeMs = SESSION_LIFETIME_SECONDS * 1000
