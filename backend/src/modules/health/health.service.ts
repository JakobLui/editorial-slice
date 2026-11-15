import { dataSource } from '../../database/data-source'
import type { HealthResponse } from './health.schemas'

export async function getHealth(): Promise<HealthResponse> {
  try {
    await dataSource.query('SELECT 1')

    return { status: 'ok', database: 'up' }
  } catch {
    return { status: 'degraded', database: 'down' }
  }
}
