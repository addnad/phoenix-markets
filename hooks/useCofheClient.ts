'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

/**
 * Hook to initialize and manage CofheClient with proper signer
 * Uses window.ethereum directly for compatibility with cofhejs
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
        console.log('[v0] Initializing CofheClient with window.ethereum...')
        
        if (!window.ethereum) {
          throw new Error('window.ethereum not available')
        }

        const { CofheClient } = await import('cofhejs')
        console.log('[v0] CofheClient imported')
        
        const client = await CofheClient.init({
          provider: window.ethereum,
          chainId: 11155111, // Sepolia
        })
        
        setCofhe(client)
        setError(null)
        console.log('[v0] CofheClient initialized successfully')
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
