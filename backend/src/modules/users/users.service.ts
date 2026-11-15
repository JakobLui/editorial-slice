import { dataSource } from '../../database/data-source'
import { User } from './user.entity'
import type { UserDto } from './users.schemas'

/** Everyone, for picking authors. No emails: the list only needs names. */
export async function list(): Promise<UserDto[]> {
  const users = await dataSource.getRepository(User).find({
    select: { id: true, name: true, role: true },
    order: { name: 'ASC' },
  })
  return users.map(({ id, name, role }) => ({ id, name, role }))
}
