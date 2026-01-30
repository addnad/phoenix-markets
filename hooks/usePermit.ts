'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useCofheClient } from './useCofheClient'

export function usePermit() {
  const { cofhe, isReady } = useCofheClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Check if permit exists
   */
  const checkPermit = useCallback(async () => {
    if (!isReady || !cofhe) {
      console.log('[v0] CofheClient not ready for permit check')
      return false
    }

    try {
      if (typeof cofhe.hasPermit === 'function') {
        try {
          const permitExists = await cofhe.hasPermit()
          return permitExists
        } catch (err) {
          console.log('[v0] hasPermit check threw:', err)
          return false
        }
      }
      return false
    } catch (err) {
      console.log('[v0] Permit check error:', err)
      return false
    }
  }, [cofhe, isReady])

  /**
   * Generate permit
   */
  const generatePermit = useCallback(async () => {
    if (!isReady || !cofhe) {
      const msg = 'CofheClient not ready. Ensure wallet is connected to Sepolia.'
      setError(msg)
      toast.error(msg)
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const expirationTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

      if (typeof cofhe.createPermit === 'function') {
        await cofhe.createPermit({
          type: 'self',
          name: 'Phoenix Markets',
          expiration: expirationTime,
        })

        console.log('[v0] Permit created successfully')
        toast.success('CoFHE permit activated! Ready for private voting.')
        setIsLoading(false)
        return true
      } else {
        throw new Error('No permit creation method available')
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to create permit'
      setError(errorMsg)
      console.log('[v0] Permit creation error:', err)
      toast.error(`Permit failed: ${errorMsg}`)
      setIsLoading(false)
      return false
    }
  }, [cofhe, isReady])

  return {
    isLoading,
    error,
    checkPermit,
    generatePermit,
  }
}
