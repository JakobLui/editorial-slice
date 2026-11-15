import { z } from 'zod'
import { USER_ROLES } from './user.entity'

export const userSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    role: z.enum(USER_ROLES),
  })
  .meta({ id: 'User' })

export type UserDto = z.infer<typeof userSchema>
