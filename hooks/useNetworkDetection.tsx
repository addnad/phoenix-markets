'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { sepolia, arbitrumSepolia } from 'wagmi/chains'
import { toast } from 'sonner'

/**
 * Supported networks for Fhenix FHE operations
 */
export const FHENIX_SUPPORTED_NETWORKS = [
  {
    name: 'Ethereum Sepolia',
    chainId: sepolia.id,
    rpc: 'https://rpc.sepolia.org',
    fhenixEnabled: true,
    testnet: true,
  },
  {
    name: 'Arbitrum Sepolia',
    chainId: arbitrumSepolia.id,
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    fhenixEnabled: true,
    testnet: true,
  },
] as const

/**
 * Hook for network detection and automatic switching
 * Ensures user is on a Fhenix-compatible network
 */
export function useNetworkDetection() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  const [isValidNetwork, setIsValidNetwork] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState<(typeof FHENIX_SUPPORTED_NETWORKS)[number] | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)

  // Check if current network is supported
  useEffect(() => {
    if (!isConnected) {
      setIsValidNetwork(false)
      setCurrentNetwork(null)
      return
    }

    const network = FHENIX_SUPPORTED_NETWORKS.find(n => n.chainId === chainId)
    setCurrentNetwork(network || null)
    setIsValidNetwork(!!network)

    if (network) {
      console.log('[v0] Connected to valid network:', network.name)
    } else {
      console.warn('[v0] Connected to unsupported network. Chain ID:', chainId)
    }
  }, [chainId, isConnected])

  /**
   * Switch to a specific Fhenix network
   */
  const switchToNetwork = async (targetChainId: number) => {
    if (!switchChain) {
      toast.error('Network switching not supported')
      return false
    }

    const targetNetwork = FHENIX_SUPPORTED_NETWORKS.find(n => n.chainId === targetChainId)
    if (!targetNetwork) {
      toast.error('Target network not supported')
      return false
    }

    setIsSwitching(true)
    try {
      console.log('[v0] Switching to network:', targetNetwork.name)
      
      switchChain({ chainId: targetChainId }, {
        onSuccess: () => {
          toast.success(`Switched to ${targetNetwork.name}`)
          console.log('[v0] Network switched successfully')
          setIsSwitching(false)
        },
        onError: (error) => {
          const msg = error?.message || 'Failed to switch network'
          toast.error(msg)
          console.error('[v0] Network switch error:', msg)
          setIsSwitching(false)
        },
      })
      return true
    } catch (err: any) {
      const msg = err?.message || 'Failed to switch network'
      toast.error(msg)
      console.error('[v0] Network switch error:', err)
      setIsSwitching(false)
      return false
    }
  }

  /**
   * Switch to Sepolia (default network)
   */
  const switchToSepolia = () => switchToNetwork(sepolia.id)

  /**
   * Switch to Arbitrum Sepolia
   */
  const switchToArbitrumSepolia = () => switchToNetwork(arbitrumSepolia.id)

  /**
   * Ensure user is on a valid network before performing FHE operations
   * If not on valid network, prompt to switch
   */
  const ensureValidNetwork = async (): Promise<boolean> => {
    if (isValidNetwork) {
      return true
    }

    console.log('[v0] Invalid network detected, prompting user to switch')
    
    // Suggest Sepolia as default
    const switched = await switchToSepolia()
    
    if (!switched) {
      toast.error('Please switch to Sepolia or Arbitrum Sepolia to use Fhenix FHE')
    }
    
    return switched
  }

  return {
    isConnected,
    chainId,
    isValidNetwork,
    currentNetwork,
    isSwitching,
    switchToNetwork,
    switchToSepolia,
    switchToArbitrumSepolia,
    ensureValidNetwork,
    supportedNetworks: FHENIX_SUPPORTED_NETWORKS,
  }
}

/**
 * Component to display network status and allow switching
 */
export function NetworkStatusIndicator() {
  const { isValidNetwork, currentNetwork, isSwitching, switchToSepolia, switchToArbitrumSepolia } = useNetworkDetection()

  if (isValidNetwork && currentNetwork) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-500">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        {currentNetwork.name}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-sm text-red-500">Wrong Network</span>
      <div className="flex gap-1">
        <button
          onClick={switchToSepolia}
          disabled={isSwitching}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded"
        >
          {isSwitching ? 'Switching...' : 'Sepolia'}
        </button>
        <button
          onClick={switchToArbitrumSepolia}
          disabled={isSwitching}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded"
        >
          {isSwitching ? 'Switching...' : 'Arbitrum'}
        </button>
      </div>
    </div>
  )
}
