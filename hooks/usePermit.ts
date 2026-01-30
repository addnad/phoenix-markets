'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface PermitStatus {
  hasPermit: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Hook to manage CoFHE permit generation and checking
 * Provides utilities to check permit status and generate permits
 */
export function usePermit() {
  const [hasPermit, setHasPermit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Check if FhenixClient has an existing permit
   */
  const checkPermit = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return false
      }

      const { FhenixClient } = await import('fhenixjs')
      const fheClient = new FhenixClient({ provider: window.ethereum })

      // Try to check if permit exists (method may vary by fhenixjs version)
      // If hasPermit doesn't exist, we assume no permit if encrypt_uint32 fails later
      if (typeof fheClient.hasPermit === 'function') {
        const permitExists = await fheClient.hasPermit()
        setHasPermit(permitExists)
        return permitExists
      }

      // Fallback: assume permit exists if this succeeds
      setHasPermit(true)
      return true
    } catch (err) {
      console.log('[v0] Permit check error:', err)
      setHasPermit(false)
      return false
    }
  }, [])

  /**
   * Generate and activate a CoFHE permit for the user's wallet
   */
  const generatePermit = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        const msg = 'Web3 provider not available'
        setError(msg)
        toast.error(msg)
        setIsLoading(false)
        return false
      }

      const { FhenixClient } = await import('fhenixjs')

      // Initialize FhenixClient
      let fheClient
      try {
        fheClient = new FhenixClient({ provider: window.ethereum })
      } catch (initError) {
        const msg = 'Failed to initialize encryption client'
        setError(msg)
        console.log('[v0] FhenixClient init error:', initError)
        setIsLoading(false)
        return false
      }

      // Generate permit with 30-day expiration
      const expirationTime = Math.round(Date.now() / 1000) + 30 * 24 * 60 * 60

      let permitResult
      try {
        // Try createPermit (common in newer fhenixjs versions)
        if (typeof fheClient.createPermit === 'function') {
          permitResult = await fheClient.createPermit({
            type: 'self',
            name: 'Phoenix Markets',
            expiration: expirationTime,
          })
        } else if (typeof fheClient.generatePermit === 'function') {
          // Fallback to generatePermit if available
          permitResult = await fheClient.generatePermit({
            expiration: expirationTime,
          })
        } else {
          throw new Error('No permit generation method available in FhenixClient')
        }

        console.log('[v0] Permit generated:', permitResult)
        setHasPermit(true)
        toast.success('Permit activated! Ready to vote privately.')
        setIsLoading(false)
        return true
      } catch (permitError) {
        const errorMsg = permitError instanceof Error ? permitError.message : 'Failed to generate permit'
        setError(errorMsg)
        console.log('[v0] Permit generation error:', permitError)
        toast.error(`Permit generation failed: ${errorMsg}`)
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
  }, [])

  return {
    hasPermit,
    isLoading,
    error,
    checkPermit,
    generatePermit,
  }
}
