'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useCofheClient } from './useCofheClient'

/**
 * Hook for managing Fhenix CoFHE permit generation
 * Permits enable FHE operations for a specific wallet/account
 * 
 * Reference: https://cofhe-docs.fhenix.zone/fhe-library/core-concepts/access-control
 */
export function usePermit() {
  const { cofhe, isReady } = useCofheClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permitActive, setPermitActive] = useState(false)
  const [permitExpiry, setPermitExpiry] = useState<Date | null>(null)

  /**
   * Check if an active permit exists for the current user
   * A permit is required to perform FHE operations
   */
  const checkPermit = useCallback(async () => {
    if (!isReady || !cofhe) {
      console.log('[v0] CofheClient not ready for permit check')
      return false
    }

    try {
      console.log('[v0] Checking for active FHE permit...')
      
      // In real cofhejs, this checks if current account has permission
      if (typeof cofhe.hasPermit === 'function') {
        try {
          const hasPermit = await cofhe.hasPermit()
          console.log('[v0] Permit check result:', hasPermit)
          setPermitActive(hasPermit)
          return hasPermit
        } catch (err) {
          console.log('[v0] hasPermit not available or failed:', err)
          // Some versions may not expose hasPermit
          return false
        }
      }
      
      return false
    } catch (err) {
      console.log('[v0] Permit check error:', err)
      setPermitActive(false)
      return false
    }
  }, [cofhe, isReady])

  /**
   * Generate a new FHE permit for the user's wallet
   * This is a transaction that enables FHE operations
   * 
   * Permit details:
   * - Type: 'self' (for personal use)
   * - App: 'Phoenix Markets'
   * - Expiry: 30 days from now
   * - Scope: Enables encryption/decryption operations
   */
  const generatePermit = useCallback(async () => {
    if (!isReady || !cofhe) {
      const msg = 'FHE client not ready. Ensure wallet is connected to Sepolia or Arbitrum Sepolia.'
      setError(msg)
      toast.error(msg)
      console.log('[v0] Cannot generate permit: client not ready')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[v0] Starting FHE permit generation...')
      
      // Calculate expiry (30 days from now)
      const expiryTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      const expiryDate = new Date(expiryTime * 1000)

      if (typeof cofhe.createPermit !== 'function') {
        throw new Error('FHE permit generation not available in this environment')
      }

      console.log('[v0] Creating permit with expiry:', expiryDate.toISOString())

      // Generate the permit
      // This transaction enables FHE operations for your account
      const permitResult = await cofhe.createPermit({
        type: 'self',
        name: 'Phoenix Markets',
        expiration: expiryTime,
      })

      console.log('[v0] Permit created:', permitResult)
      
      setPermitActive(true)
      setPermitExpiry(expiryDate)
      setIsLoading(false)
      
      toast.success('FHE permit activated! You can now cast private votes.')
      return true
    } catch (permitError: any) {
      const errorMsg = permitError?.message || 'Failed to generate permit'
      setError(errorMsg)
      console.error('[v0] Permit generation error:', permitError)
      
      // Provide specific guidance based on error
      if (errorMsg.includes('permission')) {
        toast.error('Permission denied. Check wallet and network.')
      } else if (errorMsg.includes('network')) {
        toast.error('Network error. Switch to Sepolia and try again.')
      } else if (errorMsg.includes('gas')) {
        toast.error('Insufficient funds. Need at least 0.5 ETH.')
      } else {
        toast.error(`Permit failed: ${errorMsg}`)
      }
      
      setIsLoading(false)
      return false
    }
  }, [cofhe, isReady])

  /**
   * Get current permit status with expiry info
   */
  const getPermitStatus = useCallback(() => {
    return {
      active: permitActive,
      expiry: permitExpiry,
      isExpired: permitExpiry ? new Date() > permitExpiry : false,
      hoursRemaining: permitExpiry 
        ? Math.floor((permitExpiry.getTime() - Date.now()) / (1000 * 60 * 60))
        : 0,
    }
  }, [permitActive, permitExpiry])

  return {
    checkPermit,
    generatePermit,
    getPermitStatus,
    permitActive,
    permitExpiry,
    isLoading,
    error,
    isReady,
  }
}
