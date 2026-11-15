import { useLocation, useNavigate } from 'react-router'

/**
 * Opens an item in the modal at /items/:id, keeping the current page behind
 * it (see App.tsx). The URL can be shared or reloaded.
 */
export function useOpenItem() {
  const navigate = useNavigate()
  const location = useLocation()

  /** `readOnly` opens it for viewing only, e.g. from the In progress overview. */
  return (itemId: string, { readOnly = false } = {}) =>
    navigate(`/items/${itemId}`, {
      state: { backgroundLocation: location, readOnly },
    })
}
