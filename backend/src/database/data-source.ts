import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from '../config/env'
import { ContentItem } from '../modules/content/content-item.entity'
import { User } from '../modules/users/user.entity'
import { SnakeNamingStrategy } from './snake-naming-strategy'

export const dataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  // Add each entity class here.
  entities: [User, ContentItem],
  namingStrategy: new SnakeNamingStrategy(),
  // The database schema follows the entities on every start. No migrations.
  synchronize: true,
  logging: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})
