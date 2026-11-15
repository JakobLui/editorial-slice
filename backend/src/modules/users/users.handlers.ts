import type { Request, Response } from 'express'
import * as usersService from './users.service'

// Handlers translate HTTP to and from service calls. No business logic here.
export async function list(_req: Request, res: Response) {
  res.json(await usersService.list())
}
