import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi'
import { registry } from './registry'

// Import each module's OpenAPI registration here.
import '../modules/health/health.openapi'
import '../auth/auth.openapi'
import '../modules/content/content.openapi'
import '../modules/users/users.openapi'

export function buildOpenApiDocument() {
  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: '3.1.0',
    info: { title: 'Editorial slice API', version: '1.0.0' },
  })
}
