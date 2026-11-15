import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from '../config/env'

export const dataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  // Add each entity class here, e.g. entities: [Article].
  entities: [],
  // The database schema follows the entities on every start. No migrations.
  synchronize: true,
  logging: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})
