import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

/** Every module registers its routes here, in its `<module>.openapi.ts` file. */
export const registry = new OpenAPIRegistry()
