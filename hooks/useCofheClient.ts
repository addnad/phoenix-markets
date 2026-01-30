'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

/**
 * Hook to initialize and manage real CofheClient from cofhejs
 * Handles both real FHE operations and graceful fallback to stubs
 * for preview environments
 */
export function useCofheClient() {
  const { isConnected } = useAccount()
  const [cofhe, setCofhe] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    if (!isConnected) {
      console.log('[v0] Wallet not connected, skipping CofheClient init')
      setCofhe(null)
      setIsInitializing(false)
      return
    }

    if (typeof window === 'undefined') {
      console.log('[v0] Window undefined, skipping CofheClient init')
      setIsInitializing(false)
      return
    }

    const init = async () => {
      setIsInitializing(true)
      try {
        console.log('[v0] Initializing real CofheClient with window.ethereum...')
        
        if (!window.ethereum) {
          throw new Error('window.ethereum not available - wallet not installed')
        }

        // Attempt to import and use real cofhejs
        try {
          const { CofheClient } = await import('cofhejs')
          console.log('[v0] CofheClient module imported')
          
          const client = await CofheClient.init({
            provider: window.ethereum,
            chainId: 11155111, // Default to Sepolia, can be switched
          })
          
          setCofhe(client)
          setError(null)
          console.log('[v0] CofheClient initialized successfully with real FHE')
        } catch (importError: any) {
          console.warn('[v0] Real CofheClient unavailable, using stub:', importError?.message)
          
          // Fall back to stub for v0 preview environment
          const stubCofhe = {
            encrypt: async (value: any) => {
              console.log('[v0] Stub encrypt called (real FHE would run here) with:', value)
              // In production, this would use real FHE encryption
              // For now, return deterministic bytes for testing
              if (typeof value === 'object' && value.value !== undefined) {
                return new Uint8Array([value.value, 0, 0, 0])
              }
              return new Uint8Array([value || 0, 0, 0, 0])
            },
            createPermit: async (config: any) => {
              console.log('[v0] Stub createPermit called (real operation would run here) with:', config)
              return { success: true, transactionHash: '0x' + Array(64).fill('0').join('') }
            },
            hasPermit: async () => {
              console.log('[v0] Stub hasPermit called')
              return false // Always false for stub, user will create permit
            },
            seal: async (value: any) => {
              console.log('[v0] Stub seal called with:', value)
              return new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF])
            },
          }
          
          setCofhe(stubCofhe)
          setError('Using stub mode - real FHE not available in preview')
        }
      } catch (err: any) {
        console.error('[v0] CofheClient init error:', err?.message || err)
        setError(err?.message || 'Initialization failed')
        setCofhe(null)
      } finally {
        setIsInitializing(false)
      }
    }

    init()

    // Cleanup on disconnect
    return () => {
      setCofhe(null)
      setIsInitializing(false)
    }
  }, [isConnected])

  return { 
    cofhe, 
    isReady: !!cofhe && !isInitializing, 
    error,
    isInitializing 
  }
}
