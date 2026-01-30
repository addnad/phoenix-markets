'use client'

import { useEffect, useState } from 'react'
import { useWalletClient, useAccount } from 'wagmi'
import type { WalletClient } from 'wagmi'

export interface CofheClient {
  init?: (config: any) => Promise<CofheClient>
  encrypt?: (value: any) => Promise<any>
  createPermit?: (config: any) => Promise<any>
  hasPermit?: () => Promise<boolean>
  [key: string]: any
}

/**
 * Hook to initialize and manage CofheClient with proper signer
 * Initializes on mount and whenever wallet/connection changes
 */
export function useCofheClient() {
  const { data: walletClient } = useWalletClient()
  const { isConnected } = useAccount()
  const [cofhe, setCofhe] = useState<CofheClient | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initCofhe = async () => {
      // Only initialize if wallet is connected and available
      if (!walletClient || !isConnected) {
        setCofhe(null)
        return
      }

      setIsInitializing(true)
      setError(null)

      try {
        const { CofheClient } = await import('cofhejs')
        const client = await CofheClient.init({
          provider: walletClient,
          chainId: 11155111, // Sepolia
        })
        setCofhe(client)
        console.log('[v0] CofheClient initialized with signer')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize CofheClient'
        setError(errorMsg)
        console.log('[v0] CofheClient init error:', err)
        setCofhe(null)
      } finally {
        setIsInitializing(false)
      }
    }

    initCofhe()
  }, [walletClient, isConnected])

  return {
    cofhe,
    isInitializing,
    error,
    isReady: !!cofhe && !isInitializing,
  }
}
