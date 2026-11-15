import { ContentListPage } from '@/components/content/content-list-page'

/** Every item that isn't archived: create, edit and (for editors) publish. */
export function Dashboard() {
  return <ContentListPage mode="active" />
}
