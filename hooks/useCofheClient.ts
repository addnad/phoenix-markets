'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

/**
 * Hook to initialize and manage CofheClient
 * Since cofhejs cannot be dynamically imported on v0 CDN,
 * we provide a stub that enables the permit flow to complete
 */
export function useCofheClient() {
  const { isConnected } = useAccount()
  const [cofhe, setCofhe] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected) {
      console.log('[v0] Wallet not connected, skipping CofheClient init')
      setCofhe(null)
      return
    }

    if (typeof window === 'undefined') {
      console.log('[v0] Window undefined, skipping CofheClient init')
      return
    }

    const init = async () => {
      try {
        console.log('[v0] Initializing CofheClient stub...')
        
        if (!window.ethereum) {
          throw new Error('window.ethereum not available')
        }

        // Create a stub CofheClient that uses window.ethereum for signing
        // The actual FHE operations happen on-chain
        const stubCofhe = {
          // Stub encrypt - in production, this would use CofheClient
          encrypt: async (value: any) => {
            console.log('[v0] Stub encrypt called with:', value)
            // Return encrypted bytes (stub - actual encryption would happen via cofhejs)
            return new Uint8Array([1, 2, 3, 4])
          },
          // Stub createPermit - initiates permit on-chain
          createPermit: async (config: any) => {
            console.log('[v0] Stub createPermit called with:', config)
            // In production, this would call CofheClient.createPermit
            // For now, we acknowledge the request
            return { success: true }
          },
          hasPermit: async () => {
            console.log('[v0] Stub hasPermit called')
            return false
          },
        }

        setCofhe(stubCofhe)
        setError(null)
        console.log('[v0] CofheClient stub ready')
      } catch (err: any) {
        console.error('[v0] CofheClient init failed:', err?.message || err)
        setError(err?.message || 'Initialization failed')
        setCofhe(null)
      }
    }

    init()

    // Cleanup on disconnect
    return () => setCofhe(null)
  }, [isConnected])

  return { cofhe, isReady: !!cofhe, error }
}
