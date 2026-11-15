import { Route, Routes, useLocation, type Location } from 'react-router'
import { AppLayout } from '@/components/app-layout'
import { Toaster } from '@/components/ui/sonner'
import { ArchivePage } from '@/routes/archive'
import { Dashboard } from '@/routes/dashboard'
import { InProgress } from '@/routes/in-progress'
import { ItemDialog } from '@/routes/item-dialog'
import { NotFound } from '@/routes/not-found'

/**
 * An item opens as a modal over the page it was opened from: that page is the
 * `backgroundLocation` (see useOpenItem). A direct link to /items/:id shows
 * the Dashboard behind the modal.
 */
export default function App() {
  const location = useLocation()
  const backgroundLocation = (
    location.state as { backgroundLocation?: Location } | null
  )?.backgroundLocation

  const isItemRoute = location.pathname.startsWith('/items/')
  const pageLocation =
    backgroundLocation ??
    (isItemRoute ? { ...location, pathname: '/' } : location)

  return (
    <>
      <Routes location={pageLocation}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="in-progress" element={<InProgress />} />
          <Route path="archive" element={<ArchivePage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>

      {isItemRoute && (
        <Routes>
          <Route path="/items/:id" element={<ItemDialog />} />
        </Routes>
      )}

      <Toaster />
    </>
  )
}
