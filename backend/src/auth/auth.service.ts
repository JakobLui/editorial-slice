import argon2 from 'argon2'
import { dataSource } from '../database/data-source'
import { UnauthorizedError } from '../errors'
import { User } from '../modules/users/user.entity'
import type { LoginInput, MeDto } from './auth.schemas'
import type { CurrentUser } from './auth.middleware'
import { permissionsFor } from './auth.permissions'
import { createSessionToken } from './auth.session'

// Verified against when the email is unknown, so a wrong email takes as long
// as a wrong password and the response time doesn't reveal which emails exist.
const unknownUserHash = argon2.hash('no user has this password')

/** Checks the credentials and starts a session. One message for every failure. */
export async function login({ email, password }: LoginInput) {
  const user = await dataSource.getRepository(User).findOne({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  })

  const passwordMatches = await argon2.verify(
    user?.passwordHash ?? (await unknownUserHash),
    password,
  )
  if (!user || !passwordMatches) {
    throw new UnauthorizedError('Wrong email or password')
  }

  const signedInUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
  const sessionToken = await createSessionToken(user.id)

  return { me: me(signedInUser), sessionToken }
}

/** The signed-in user, with what their role allows. */
export function me(user: CurrentUser): MeDto {
  return { ...user, permissions: permissionsFor(user.role) }
}
