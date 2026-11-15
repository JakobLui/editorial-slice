import { Route, Routes } from 'react-router'
import { Home } from '@/routes/home'
import { NotFound } from '@/routes/not-found'

export default function App() {
  return (
    <Routes>
      {/* Add each page here. */}
      <Route index element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
