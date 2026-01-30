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
   * Check if CofheClient has an existing permit
   */
  const checkPermit = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return false
      }

      const { CofheClient } = await import('cofhejs')
      const cofhe = await CofheClient.init({
        provider: window.ethereum,
        chainId: 11155111, // Sepolia
      })

      // Try to check if permit exists
      if (typeof cofhe.hasPermit === 'function') {
        const permitExists = await cofhe.hasPermit()
        setHasPermit(permitExists)
        return permitExists
      }

      // Fallback: assume permit exists if initialization succeeds
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

      const { CofheClient } = await import('cofhejs')

      // Initialize CofheClient
      let cofhe
      try {
        cofhe = await CofheClient.init({
          provider: window.ethereum,
          chainId: 11155111, // Sepolia
        })
      } catch (initError) {
        const msg = 'Failed to initialize encryption client'
        setError(msg)
        console.log('[v0] CofheClient init error:', initError)
        setIsLoading(false)
        return false
      }

      // Generate permit with 30-day expiration
      const expirationTime = Math.round(Date.now() / 1000) + 30 * 24 * 60 * 60

      let permitResult
      try {
        // CofheClient uses generatePermit to create permits
        if (typeof cofhe.generatePermit === 'function') {
          permitResult = await cofhe.generatePermit({
            expirationTime,
          })
        } else {
          throw new Error('No permit generation method available in CofheClient')
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
