import { z } from 'zod'
import { userSchema } from '../modules/users/users.schemas'
import { PERMISSIONS } from './auth.permissions'

// No email format check: a malformed email simply fails to sign in.
export const loginSchema = z
  .object({
    email: z.string().trim().min(1),
    password: z.string().min(1),
  })
  .meta({ id: 'LoginRequest' })

export const meSchema = userSchema
  .extend({
    email: z.email(),
    permissions: z.array(z.enum(PERMISSIONS)).meta({
      description:
        "What the role allows in general. Per item, use the item's `allowed` flags.",
    }),
  })
  .meta({ id: 'Me' })

export type LoginInput = z.infer<typeof loginSchema>
export type MeDto = z.infer<typeof meSchema>
