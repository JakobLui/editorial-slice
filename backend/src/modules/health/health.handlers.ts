import type { Request, Response } from 'express'
import * as healthService from './health.service'

// Handlers translate HTTP to and from service calls. No business logic here.
// Parse input with the module's zod schemas, e.g. `schema.parse(req.body)`;
// the error handler turns a ZodError into a 400.
export async function getHealth(_req: Request, res: Response) {
  res.json(await healthService.getHealth())
}
