import { z } from 'zod'
import { PERMISSIONS } from '../../auth/permissions'
import { USER_ROLES } from './user.entity'

export const userSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    role: z.enum(USER_ROLES),
  })
  .meta({ id: 'User' })

export const meSchema = userSchema
  .extend({
    permissions: z.array(z.enum(PERMISSIONS)).meta({
      description:
        "What the role allows in general. Per item, use the item's `allowed` flags.",
    }),
  })
  .meta({ id: 'Me' })

export type UserDto = z.infer<typeof userSchema>
export type MeDto = z.infer<typeof meSchema>
