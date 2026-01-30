'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { WalletClient } from 'wagmi'

export interface PermitStatus {
  hasPermit: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Hook to manage CoFHE permit generation and checking
 * Requires walletClient with signer capability from wagmi
 */
export function usePermit(walletClient?: WalletClient | null) {
  const [hasPermit, setHasPermit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Check if CofheClient has an existing permit
   */
  const checkPermit = useCallback(async () => {
    try {
      if (!walletClient || !walletClient.account) {
        console.log('[v0] No wallet client available for permit check')
        return false
      }

      const { CofheClient } = await import('cofhejs')
      const cofhe = await CofheClient.init({
        provider: walletClient,
        chainId: 11155111, // Sepolia
      })

      // Try to check if permit exists
      if (typeof cofhe.hasPermit === 'function') {
        try {
          const permitExists = await cofhe.hasPermit()
          setHasPermit(permitExists)
          return permitExists
        } catch (err) {
          console.log('[v0] hasPermit check threw (likely not implemented):', err)
          // If hasPermit throws, assume no permit and let createPermit handle it
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
  }, [walletClient])

  /**
   * Generate and activate a CoFHE permit for the user's wallet
   */
  const generatePermit = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!walletClient || !walletClient.account) {
        const msg = 'Wallet not connected or no signer. Reconnect MetaMask.'
        setError(msg)
        toast.error(msg)
        setIsLoading(false)
        return false
      }

      const { CofheClient } = await import('cofhejs')

      // Initialize CofheClient with walletClient (must have signer)
      let cofhe
      try {
        cofhe = await CofheClient.init({
          provider: walletClient,
          chainId: 11155111, // Sepolia
        })
      } catch (initError) {
        const msg = 'Failed to initialize encryption client'
        setError(msg)
        console.log('[v0] CofheClient init error:', initError)
        toast.error(msg)
        setIsLoading(false)
        return false
      }

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
  }, [walletClient])

  return {
    hasPermit,
    isLoading,
    error,
    checkPermit,
    generatePermit,
  }
}
