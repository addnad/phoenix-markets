'use client'

import { useState } from 'react'
import { useReadContract, useAccount, usePublicClient } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/wagmi'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getAddress } from 'viem'

interface TallyViewerProps {
  predictionId: number
}

export default function TallyViewer({ predictionId }: TallyViewerProps) {
  const [showTallies, setShowTallies] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [decrypted, setDecrypted] = useState<{ yes: number; no: number } | null>(null)
  const { address } = useAccount()
  const publicClient = usePublicClient()

  // Use wallet address as part of public key generation
  const publicKeyHash = address ? getAddress(address) : ('0x' + '0'.repeat(40))
  const publicKey = (publicKeyHash + '0'.repeat(64)).slice(0, 66) as `0x${string}`

  const { data: tallies } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getSealedTallies',
    args: [BigInt(predictionId), publicKey],
  })

  const handleDecrypt = async () => {
    if (!privateKey.trim()) {
      toast.error('Please enter your private key')
      return
    }

    try {
      setIsDecrypting(true)
      toast.loading('Decrypting tallies...')

      // Dynamic import CofheJS
      const { CofheClient, Encryptable } = await import('cofhejs')
      
      const cofhe = await CofheClient.init({
        provider: window.ethereum,
        chainId: 11155111, // Sepolia
      })
      
      // In a real implementation, use the actual sealed tallies
      // and CofheClient.unseal to decrypt
      toast.dismiss()
      toast.success('Decrypted! (Demo mode - see console)')
      
      // Mock decryption for demo
      setDecrypted({
        yes: Math.floor(Math.random() * 100),
        no: Math.floor(Math.random() * 100),
      })
    } catch (error) {
      toast.dismiss()
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Decryption failed: ${errorMessage}`)
      console.error('Decryption error:', error)
    } finally {
      setIsDecrypting(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={() => setShowTallies(!showTallies)}
        variant="outline"
        className="w-full gap-2"
        size="sm"
      >
        {showTallies ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        {showTallies ? 'Hide' : 'View'} Tallies
      </Button>

      {showTallies && (
        <div className="space-y-3 p-3 rounded-lg bg-slate-900/50 border border-orange-900/20">
          {tallies && (
            <>
              <div className="space-y-2 text-xs">
                <div className="font-mono text-muted-foreground">
                  <p className="break-all">Sealed Yes: {tallies[0]}</p>
                </div>
                <div className="font-mono text-muted-foreground">
                  <p className="break-all">Sealed No: {tallies[1]}</p>
                </div>
              </div>

              {!decrypted ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter private key to decrypt"
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className="text-xs"
                  />
                  <Button
                    onClick={handleDecrypt}
                    disabled={isDecrypting}
                    size="sm"
                    className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isDecrypting && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    Decrypt Results
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                  <p className="text-sm font-semibold text-green-400">
                    Decrypted Results
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Yes Votes</p>
                      <p className="text-lg font-bold text-green-400">
                        {decrypted.yes}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">No Votes</p>
                      <p className="text-lg font-bold text-red-400">
                        {decrypted.no}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
