'use client'

import { Provider } from 'react-redux'
import { useEffect, useState } from 'react'
import { store } from './store'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Ensure consistent rendering between server and client
  if (!isClient) {
    return (
      <Provider store={store}>
        <div suppressHydrationWarning>
          {children}
        </div>
      </Provider>
    )
  }

  return <Provider store={store}>{children}</Provider>
}
