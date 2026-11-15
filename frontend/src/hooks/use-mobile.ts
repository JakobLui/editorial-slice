import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

const subscribe = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(MOBILE_QUERY)
  mediaQuery.addEventListener('change', onChange)

  return () => mediaQuery.removeEventListener('change', onChange)
}

/** True below the mobile breakpoint; follows window resizes. */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
  )
}
