'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/lib/redux/hooks'
import { setAuth } from '@/lib/redux/slices/authSlice'

export default function MessageListener() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Company app received message:', event.data)
      
      // In production, you should validate the origin
      // if (event.origin !== 'expected-origin') return

      if (event.data?.type === 'company-auth') {
        console.log('Processing company-auth message:', event.data)
        const { user, accessToken, selectedCompany } = event.data
        if (user && accessToken) {
          console.log('Dispatching setAuth with user:', user)
          dispatch(setAuth({ user, accessToken, selectedCompany }))
        } else {
          console.log('Missing user or accessToken:', { user, accessToken })
        }
      }
    }

    console.log('MessageListener: Setting up message listener')
    console.log('MessageListener: Parent window exists?', window.parent !== window)
    console.log('MessageListener: Running in iframe?', window !== window.top)
    window.addEventListener('message', handleMessage)

    return () => {
      console.log('MessageListener: Cleaning up message listener')
      window.removeEventListener('message', handleMessage)
    }
  }, [dispatch])

  return null
}