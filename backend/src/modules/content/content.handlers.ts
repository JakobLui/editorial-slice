import type { Request, Response } from 'express'
import { currentUser } from '../../auth/current-user'
import {
  boardQuerySchema,
  contentIdParamsSchema,
  createContentSchema,
  listQuerySchema,
  updateContentSchema,
  updateStatusSchema,
} from './content.schemas'
import * as contentService from './content.service'

// Handlers translate HTTP to and from service calls. No business logic here.
// The error handler turns a ZodError into a 400.

export async function getBoard(req: Request, res: Response) {
  const user = currentUser(req)
  const query = boardQuerySchema.parse(req.query)

  res.json(await contentService.getBoard(user, query))
}

export async function list(req: Request, res: Response) {
  const user = currentUser(req)
  const query = listQuerySchema.parse(req.query)

  res.json(await contentService.list(user, query))
}

export async function get(req: Request, res: Response) {
  const user = currentUser(req)
  const { id } = contentIdParamsSchema.parse(req.params)

  res.json(await contentService.get(user, id))
}

export async function create(req: Request, res: Response) {
  const user = currentUser(req)
  const input = createContentSchema.parse(req.body)

  res.status(201).json(await contentService.create(user, input))
}

export async function update(req: Request, res: Response) {
  const user = currentUser(req)
  const { id } = contentIdParamsSchema.parse(req.params)

  const input = updateContentSchema.parse(req.body)
  res.json(await contentService.update(user, id, input))
}

export async function changeStatus(req: Request, res: Response) {
  const user = currentUser(req)
  const { id } = contentIdParamsSchema.parse(req.params)
  const { status } = updateStatusSchema.parse(req.body)

  res.json(await contentService.changeStatus(user, id, status))
}

export async function archive(req: Request, res: Response) {
  const user = currentUser(req)
  const { id } = contentIdParamsSchema.parse(req.params)

  await contentService.archive(user, id)
  res.status(204).end()
}

export async function restore(req: Request, res: Response) {
  const user = currentUser(req)
  const { id } = contentIdParamsSchema.parse(req.params)

  await contentService.restore(user, id)
  res.status(204).end()
}
