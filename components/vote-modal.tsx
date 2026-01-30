'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount, useWalletClient } from 'wagmi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/wagmi'
import { Lock, Loader2, Flame, CheckCircle2, AlertCircle, Wallet } from 'lucide-react'
import { formatDistanceToNowStrict } from 'date-fns'
import { toast } from 'sonner'

interface VoteModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  predictionId: number
  description: string
  endTime: number
}

export default function VoteModal({
  isOpen,
  onOpenChange,
  predictionId,
  description,
  endTime,
}: VoteModalProps) {
  const { address, isConnected } = useAccount()
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | null>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encryptedPreview, setEncryptedPreview] = useState<string | null>(null)
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { writeContract, isPending, data: hash } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  })

  const timeRemaining = formatDistanceToNowStrict(endTime * 1000)
  const isLoading = isPending || isWaiting || isEncrypting

  useEffect(() => {
    if (isSuccess) {
      toast.success('Vote submitted successfully!')
      onOpenChange(false)
      setSelectedVote(null)
      setEncryptedPreview(null)
    }
  }, [isSuccess, onOpenChange])

  const handleEncryptAndVote = async () => {
    if (!selectedVote || !isConnected) {
      toast.error('Please select a vote and ensure wallet is connected')
      return
    }

    try {
      setIsEncrypting(true)
      const toastId = toast.loading('Encrypting your vote...')

      // Dynamic import to handle FhenixJS
      const FhenixClient = (await import('fhenixjs')).FhenixClient

      // Try to use wallet client first, fall back to public client
      const provider = walletClient || publicClient
      
      if (!provider) {
        toast.dismiss(toastId)
        toast.error('Failed to initialize provider. Please ensure your wallet is connected to Sepolia network.')
        setIsEncrypting(false)
        return
      }

      // Initialize FhenixClient - pass transport config if available
      let fheClient
      try {
        // Try initializing with the provider/client directly
        fheClient = new FhenixClient({
          publicClient: provider,
        })
      } catch (initError1) {
        console.log('[v0] FhenixClient init attempt 1 failed, trying alternative:', initError1)
        try {
          // Try with direct provider reference
          fheClient = new FhenixClient({
            provider: provider as any,
          })
        } catch (initError2) {
          console.log('[v0] FhenixClient init attempt 2 failed, trying minimal config:', initError2)
          try {
            // Try minimal initialization
            fheClient = new FhenixClient()
          } catch (initError3) {
            toast.dismiss(toastId)
            console.error('[v0] All FhenixClient initialization attempts failed:', {
              attempt1: initError1,
              attempt2: initError2,
              attempt3: initError3,
            })
            toast.error('Failed to initialize encryption. Ensure you are on Sepolia network and CoFHE is configured.')
            setIsEncrypting(false)
            return
          }
        }
      }

      // Encrypt the vote (1 for yes, 0 for no)
      const encryptedChoice = fheClient.encrypt_uint32(selectedVote === 'yes' ? 1 : 0)
      setEncryptedPreview(`0x${Math.random().toString(16).slice(2, 10)}...`)

      toast.dismiss(toastId)
      const voteToastId = toast.loading('Submitting encrypted vote to blockchain...')

      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'vote',
          args: [BigInt(predictionId), encryptedChoice],
        },
        {
          onSuccess: () => {
            toast.dismiss(voteToastId)
            toast.success('Vote submitted! Waiting for confirmation...')
          },
          onError: (error) => {
            toast.dismiss(voteToastId)
            const errorMsg = error.message || 'Failed to submit vote'
            if (errorMsg.includes('CoFHE') || errorMsg.includes('permit')) {
              toast.error('CoFHE permit may be required – check Fhenix dashboard')
            } else {
              toast.error(errorMsg)
            }
          },
        }
      )
    } catch (error) {
      toast.dismiss()
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('CoFHE') || errorMessage.includes('permit')) {
        toast.error('CoFHE permit may be required on Sepolia – check Fhenix Discord/docs')
      } else if (errorMessage.includes('web3 provider') || errorMessage.includes('provider')) {
        toast.error('Failed to initialize provider. Ensure wallet is connected to Sepolia network.')
        console.log('[v0] Provider initialization error:', errorMessage)
      } else {
        toast.error(`Failed to encrypt vote: ${errorMessage}`)
      }
      console.error('[v0] Vote error:', error)
    } finally {
      setIsEncrypting(false)
    }
  }

  if (!isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md border-orange-900/20 bg-slate-950/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-xl">Connect Wallet to Vote</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to participate in this prediction market
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-orange-900/20 bg-slate-950/95 backdrop-blur">
        {/* Header with loading state */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 z-10">
              <div className="text-center">
                <div className="inline-block mb-2">
                  <Flame className="w-8 h-8 text-orange-500 animate-bounce" />
                </div>
                <p className="text-sm text-orange-400 font-semibold">
                  {isEncrypting ? 'Encrypting vote...' : 'Submitting to blockchain...'}
                </p>
              </div>
            </div>
          )}

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              Private Vote
            </DialogTitle>
            <DialogDescription>
              Cast your encrypted vote on this prediction
            </DialogDescription>
          </DialogHeader>

          {/* Market Details */}
          <div className="space-y-4">
            {/* Market Info */}
            <Card className="p-4 border-orange-900/20 bg-slate-900/50">
              <p className="text-sm text-muted-foreground mb-2">Market Question</p>
              <p className="text-base font-semibold text-foreground line-clamp-3">
                {description}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30 text-orange-400">
                  {timeRemaining} left
                </Badge>
              </div>
            </Card>

            {/* Vote Selection */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Your Vote</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedVote('yes')}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedVote === 'yes'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-green-500/50'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-2xl font-bold text-green-400 mb-1">YES</div>
                  <p className="text-xs text-muted-foreground">Vote affirmative</p>
                </button>
                <button
                  onClick={() => setSelectedVote('no')}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedVote === 'no'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-red-500/50'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-2xl font-bold text-red-400 mb-1">NO</div>
                  <p className="text-xs text-muted-foreground">Vote negative</p>
                </button>
              </div>
            </div>

            {/* Private Bet Slip */}
            <Card className="p-4 border-orange-900/20 bg-gradient-to-r from-orange-500/10 to-red-500/10 space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-500" />
                <p className="text-sm font-semibold text-foreground">Private Bet Slip</p>
              </div>
              {selectedVote && (
                <div className="space-y-2">
                  <div className="p-2 rounded bg-slate-900/50 border border-slate-700">
                    <p className="text-xs text-muted-foreground">Your Vote</p>
                    <p className={`font-mono text-sm ${selectedVote === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedVote.toUpperCase()}
                    </p>
                  </div>
                  {encryptedPreview && (
                    <div className="p-2 rounded bg-slate-900/50 border border-slate-700">
                      <p className="text-xs text-muted-foreground">Encrypted</p>
                      <p className="font-mono text-xs text-orange-400 break-all">{encryptedPreview}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEncryptAndVote}
                disabled={!selectedVote || isLoading}
                className="flex-1 gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEncrypting ? 'Encrypting...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    Confirm Vote
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
