import { z } from 'zod'

// `.meta({ id })` names the schema in openapi.json, and so the generated frontend type.
export const healthResponseSchema = z
  .object({
    status: z.enum(['ok', 'degraded']),
    database: z.enum(['up', 'down']),
  })
  .meta({ id: 'HealthResponse' })

export type HealthResponse = z.infer<typeof healthResponseSchema>
