import { ContentListPage } from '@/components/content/content-list-page'

/** Archived items, kept apart from the Dashboard. They can be restored. */
export function ArchivePage() {
  return <ContentListPage mode="archived" />
}
