import type { CurrentUser } from '../../auth/current-user'
import { permissionsFor } from '../../auth/permissions'
import { dataSource } from '../../database/data-source'
import { User } from './user.entity'
import type { MeDto, UserDto } from './users.schemas'

/** Everyone, for picking authors. No emails: the list only needs names. */
export async function list(): Promise<UserDto[]> {
  const users = await dataSource.getRepository(User).find({
    select: { id: true, name: true, role: true },
    order: { name: 'ASC' },
  })
  return users.map(({ id, name, role }) => ({ id, name, role }))
}

/** The signed-in user, with what their role allows. */
export function me(user: CurrentUser): MeDto {
  return { ...user, permissions: permissionsFor(user.role) }
}
