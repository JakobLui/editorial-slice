import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    // Written by `pnpm openapi:generate` in the backend.
    input: '../backend/openapi.json',
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
    },
  },
})
