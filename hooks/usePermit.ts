'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useCofheClient } from './useCofheClient'

export interface PermitStatus {
  hasPermit: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Hook to manage CoFHE permit generation and checking
 * Uses the pre-initialized CofheClient from useCofheClient
 */
export function usePermit() {
  const { cofhe, isReady } = useCofheClient()
  const [hasPermit, setHasPermit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Check if CofheClient has an existing permit
   */
  const checkPermit = useCallback(async () => {
    if (!isReady || !cofhe) {
      console.log('[v0] CofheClient not ready for permit check')
      return false
    }

    try {
      // Try to check if permit exists
      if (typeof cofhe.hasPermit === 'function') {
        try {
          const permitExists = await cofhe.hasPermit()
          setHasPermit(permitExists)
          return permitExists
        } catch (err) {
          console.log('[v0] hasPermit check threw (likely not implemented):', err)
          // If hasPermit throws, assume no permit
          return false
        }
      }

      // Fallback: assume no permit if method unavailable
      return false
    } catch (err) {
      console.log('[v0] Permit check error:', err)
      setHasPermit(false)
      return false
    }
  }, [cofhe, isReady])

  /**
   * Generate and activate a CoFHE permit for the user's wallet
   */
  const generatePermit = useCallback(async () => {
    if (!isReady || !cofhe) {
      const msg = 'CofheClient not ready. Ensure wallet is connected.'
      setError(msg)
      toast.error(msg)
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create permit with 30-day expiration
      const expirationTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

      let permitResult
      try {
        // CofheClient uses createPermit to generate permits
        if (typeof cofhe.createPermit === 'function') {
          permitResult = await cofhe.createPermit({
            type: 'self',
            name: 'Phoenix Markets',
            expiration: expirationTime,
          })
        } else {
          throw new Error('No permit creation method available in CofheClient')
        }

        console.log('[v0] Permit created:', permitResult)
        setHasPermit(true)
        toast.success('CoFHE permit activated! Ready for private voting.')
        setIsLoading(false)
        return true
      } catch (permitError) {
        const errorMsg = permitError instanceof Error ? permitError.message : 'Failed to create permit'
        setError(errorMsg)
        console.log('[v0] Permit creation error:', permitError)
        toast.error(`Permit failed: ${errorMsg}`)
        setIsLoading(false)
        return false
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error('[v0] Permit flow error:', err)
      toast.error(errorMsg)
      setIsLoading(false)
      return false
    }
  }, [cofhe, isReady])

  return {
    hasPermit,
    isLoading,
    error,
    checkPermit,
    generatePermit,
  }
}
