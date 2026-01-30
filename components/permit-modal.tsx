'use client'

import { useState } from 'react'
import { useWalletClient } from 'wagmi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Shield, Loader2, ExternalLink } from 'lucide-react'
import { usePermit } from '@/hooks/usePermit'

interface PermitModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPermitGenerated?: () => void
}

export default function PermitModal({ isOpen, onOpenChange, onPermitGenerated }: PermitModalProps) {
  const { data: walletClient } = useWalletClient()
  const { generatePermit, isLoading, error } = usePermit(walletClient)
  const [hasError, setHasError] = useState(false)

  const handleGeneratePermit = async () => {
    setHasError(false)
    const success = await generatePermit()
    if (success) {
      setTimeout(() => {
        onOpenChange(false)
        onPermitGenerated?.()
      }, 1500)
    } else {
      setHasError(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-orange-900/20 bg-slate-950">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl">Activate Privacy Mode</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Enable private voting with CoFHE encryption
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Explanation */}
          <div className="space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              One-time setup to enable private voting. This signs a permission grant for your wallet — completely gas-free and valid for approximately 30 days.
            </p>
            <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-900/20 space-y-2">
              <p className="text-xs font-semibold text-orange-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                What happens:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Your wallet signs a privacy permit (off-chain)</li>
                <li>Enables encrypted voting via FHE technology</li>
                <li>No gas fees required</li>
                <li>Valid for ~30 days, then reactivate</li>
              </ul>
            </div>
          </div>

          {/* Error Alert */}
          {hasError && error && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertDescription className="text-red-400 text-sm">
                {error}. Need help? Check{' '}
                <a
                  href="https://docs.fhenix.zone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-red-300 inline-flex items-center gap-1"
                >
                  Fhenix docs
                  <ExternalLink className="w-3 h-3" />
                </a>
                {' '}or ask in Discord.
              </AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGeneratePermit}
            disabled={isLoading}
            className="w-full h-11 gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Permit...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Generate & Activate Permit
              </>
            )}
          </Button>

          {/* Info Footer */}
          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-slate-800">
            <p>
              Your privacy is important. All voting is encrypted on-chain.{' '}
              <a
                href="https://docs.fhenix.zone"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 underline"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
