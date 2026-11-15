import { writeFileSync } from 'node:fs'
import { buildOpenApiDocument } from './document'

// Writes backend/openapi.json. Orval in the frontend reads this file.
const outputPath = new URL('../../openapi.json', import.meta.url)
writeFileSync(
  outputPath,
  JSON.stringify(buildOpenApiDocument(), null, 2) + '\n',
)
console.log(`Wrote ${outputPath.pathname}`)
