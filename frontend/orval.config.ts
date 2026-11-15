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
      override: {
        // Every call goes through our fetch: it sends the current user and
        // throws on error statuses.
        mutator: { path: 'src/api/fetcher.ts', name: 'customFetch' },
        // Return the parsed body, not { data, status, headers }.
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
})
