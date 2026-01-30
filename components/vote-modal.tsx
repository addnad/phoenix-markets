'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
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
import { Lock, Loader2, Flame, CheckCircle2, AlertCircle, Wallet, Shield, Network } from 'lucide-react'
import { formatDistanceToNowStrict } from 'date-fns'
import { toast } from 'sonner'
import PermitModal from './permit-modal'
import { usePermit } from '@/hooks/usePermit'
import { useEncryption } from '@/hooks/useEncryption'
import { useNetworkDetection } from '@/hooks/useNetworkDetection'
import { useCofheClient } from '@/hooks/useCofheClient' // Import useCofheClient hook

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
  const { encryptVote, isEncrypting } = useEncryption()
  const { isValidNetwork, currentNetwork, ensureValidNetwork } = useNetworkDetection()
  const { cofheReady, cofhe } = useCofheClient() // Declare cofheReady and cofhe variables
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | null>(null)
  const [encryptedPreview, setEncryptedPreview] = useState<string | null>(null)
  const [permitModalOpen, setPermitModalOpen] = useState(false)
  const { writeContract, isPending, data: hash } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  })
  const { checkPermit } = usePermit()
  const [isEncryptingState, setIsEncryptingState] = useState(false) // Declare setIsEncrypting variable

  const timeRemaining = formatDistanceToNowStrict(endTime * 1000)
  const isLoading = isPending || isWaiting || isEncryptingState

  useEffect(() => {
    if (isSuccess) {
      toast.success('Private vote cast successfully!')
      setTimeout(() => {
        onOpenChange(false)
        setSelectedVote(null)
        setEncryptedPreview(null)
      }, 500)
    }
  }, [isSuccess, onOpenChange])

  const handleEncryptAndVote = async () => {
    if (!selectedVote || !isConnected) {
      toast.error('Please select a vote and ensure wallet is connected')
      return
    }

    // Ensure user is on a valid network
    const validNetwork = await ensureValidNetwork()
    if (!validNetwork) {
      toast.error('Please switch to Sepolia or Arbitrum Sepolia')
      return
    }

    try {
      const encryptToastId = toast.loading('Encrypting your private vote...')

      // Encrypt the vote using the new encryption hook with access control
      const choice = selectedVote === 'yes' ? 1 : 0
      const encryptionResult = await encryptVote(choice)

      if (!encryptionResult) {
        toast.dismiss(encryptToastId)
        return
      }

      // Show encrypted preview
      setEncryptedPreview(`${encryptionResult.encryptedValue.substring(0, 10)}...`)

      toast.dismiss(encryptToastId)
      const submitToastId = toast.loading('Submitting private vote to blockchain...')

      // Submit encrypted vote to contract with access control
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'vote',
          args: [BigInt(predictionId), encryptionResult.encryptedValue as any],
        },
        {
          onSuccess: () => {
            toast.dismiss(submitToastId)
            toast.success('Private vote cast successfully!')
          },
          onError: (error) => {
            toast.dismiss(submitToastId)
            const errorMsg = error?.message || 'Failed to submit vote'
            toast.error(errorMsg)
            console.log('[v0] Contract error:', error)
          },
        }
      )
    } catch (err) {
      console.log('[v0] Vote handler error:', err)
      toast.error('Vote submission failed. Please try again.')
    }
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
                  {isEncryptingState ? 'Encrypting vote...' : 'Submitting to blockchain...'}
                </p>
              </div>
            </div>
          )}

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              Private Vote
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <span>Cast your encrypted vote on this prediction</span>
              <div className="flex items-center gap-1 ml-2">
                {isValidNetwork ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-400">{currentNetwork?.name}</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-400">Switch Network</span>
                  </>
                )}
              </div>
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
                    {isEncryptingState ? 'Encrypting...' : 'Submitting...'}
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
      {/* Permit Modal */}
      <PermitModal
        isOpen={permitModalOpen}
        onOpenChange={setPermitModalOpen}
        onPermitGenerated={() => {
          // Retry encryption after permit is generated
          handleEncryptAndVote()
        }}
      />
    </Dialog>
  )
}
