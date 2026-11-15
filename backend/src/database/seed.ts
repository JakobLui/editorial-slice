import type { DataSource, EntityManager } from 'typeorm'
import { logger } from '../logger'
import {
  ContentItem,
  type TiptapDocument,
} from '../modules/content/content-item.entity'
import { User } from '../modules/users/user.entity'

/**
 * Fills an empty database with the hardcoded users and sample content items.
 * Does nothing when any user exists, so it is safe to run on every start.
 * To start over: `docker compose down -v`, then `docker compose up`.
 */
export async function seedIfEmpty(dataSource: DataSource) {
  if ((await dataSource.getRepository(User).count()) > 0) return

  await dataSource.transaction(seed)
  logger.info('Seeded the database with sample users and content items')
}

async function seed(manager: EntityManager) {
  const [editor, jonas, sara] = await manager.save(User, [
    { name: 'Mette Hansen', email: 'mette@frihedsbrevet.test', role: 'editor' },
    {
      name: 'Jonas Nielsen',
      email: 'jonas@frihedsbrevet.test',
      role: 'contributor',
    },
    {
      name: 'Sara Larsen',
      email: 'sara@frihedsbrevet.test',
      role: 'contributor',
    },
  ])

  const items = await manager.save(ContentItem, [
    {
      title: 'Who owns the Danish wind farms?',
      type: 'article',
      status: 'idea',
      createdById: jonas.id,
      authors: [],
      brief: brief('Map the ownership chain behind the largest wind farms.'),
    },
    {
      // Sara took over an idea Mette created: creator and author differ.
      title: 'Housing prices outside the cities',
      type: 'article',
      status: 'draft',
      deadline: daysFromToday(5),
      createdById: editor.id,
      authors: [sara],
      brief: brief('Compare prices in five towns over ten years.'),
      draftUrl: 'https://docs.example.com/housing-prices',
    },
    {
      // Co-authored: both contributors can see and edit it.
      title: 'Weekly newsletter: the budget talks',
      type: 'newsletter',
      status: 'review',
      deadline: daysFromToday(1),
      createdById: jonas.id,
      authors: [jonas, sara],
    },
    {
      title: 'Podcast: an interview with a former minister',
      type: 'podcast',
      status: 'draft',
      deadline: daysFromToday(12),
      createdById: sara.id,
      authors: [sara],
    },
    {
      title: 'Explainer video: how the EU votes',
      type: 'video',
      status: 'published',
      deadline: daysFromToday(-3),
      createdById: editor.id,
      authors: [editor],
      publishedAt: new Date(),
    },
    {
      title: 'Old idea about local elections',
      type: 'article',
      status: 'idea',
      createdById: jonas.id,
      authors: [jonas],
    },
  ])

  // The last item starts archived.
  await manager.softDelete(ContentItem, items.at(-1)!.id)
}

/** A one-paragraph Tiptap document. */
function brief(text: string): TiptapDocument {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

/** A `date` column value ('YYYY-MM-DD'), relative to today, so deadlines stay current. */
function daysFromToday(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
