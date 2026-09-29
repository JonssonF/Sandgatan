import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets scroll position on route change — otherwise the AppShell.Main content stays scrolled from the previous page. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
