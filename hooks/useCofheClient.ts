'use client'

import { useEffect, useState } from 'react'
import { useWalletClient, useAccount } from 'wagmi'

/**
 * Hook to initialize and manage CofheClient with proper signer
 * Initializes on mount and whenever wallet/connection changes
 */
export function useCofheClient() {
  const { data: walletClient } = useWalletClient()
  const { isConnected } = useAccount()
  const [cofhe, setCofhe] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !walletClient) {
      setCofhe(null)
      return
    }

    const init = async () => {
      try {
        console.log('[v0] Initializing CofheClient with signer...')
        const { CofheClient } = await import('cofhejs')
        const client = await CofheClient.init({
          provider: walletClient,
          chainId: 11155111, // Sepolia
        })
        setCofhe(client)
        setError(null)
        console.log('[v0] CofheClient ready!')
      } catch (err: any) {
        console.error('[v0] CofheClient init failed:', err)
        setError(err.message || 'Initialization failed')
        setCofhe(null)
      }
    }

    init()

    // Cleanup on disconnect
    return () => setCofhe(null)
  }, [isConnected, walletClient])

  return { cofhe, isReady: !!cofhe, error }
}
