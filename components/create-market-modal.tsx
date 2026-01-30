'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/wagmi'
import { Plus, Loader2, Flame, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const createMarketSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be under 500 characters'),
  durationDays: z
    .number()
    .min(0.042, 'Duration must be at least 1 hour')
    .max(365, 'Duration must be less than 1 year'),
})

type CreateMarketFormValues = z.infer<typeof createMarketSchema>

interface CreateMarketModalProps {
  onSuccess?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  prefillDescription?: string
}

export default function CreateMarketModal({
  onSuccess,
  isOpen: controlledIsOpen,
  onOpenChange,
  prefillDescription = '',
}: CreateMarketModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const actualIsOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpen
  const setActualIsOpen = onOpenChange || setIsOpen

  const form = useForm<CreateMarketFormValues>({
    resolver: zodResolver(createMarketSchema),
    defaultValues: {
      description: prefillDescription,
      durationDays: 7,
    },
  })

  const { writeContract, isPending, data: hash } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  })

  const isLoading = isPending || isWaiting || form.formState.isSubmitting

  useEffect(() => {
    if (isSuccess) {
      toast.success('Market created successfully!')
      setActualIsOpen(false)
      form.reset()
      onSuccess?.()
    }
  }, [isSuccess, onSuccess, setActualIsOpen, form])

  const onSubmit = async (values: CreateMarketFormValues) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      // Convert days to seconds
      const durationInSeconds = Math.floor(values.durationDays * 24 * 60 * 60)

      const toastId = toast.loading('Creating market...')

      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'createPrediction',
          args: [values.description, BigInt(durationInSeconds)],
        },
        {
          onSuccess: () => {
            toast.dismiss(toastId)
            toast.success('Market created! Waiting for confirmation...')
          },
          onError: (error) => {
            toast.dismiss(toastId)
            const errorMsg = error.message || 'Failed to create market'
            toast.error(errorMsg)
          },
        }
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to create market: ${errorMessage}`)
      console.error('Create market error:', error)
    }
  }

  const durationDays = form.watch('durationDays')
  const endTime = new Date()
  endTime.setTime(endTime.getTime() + durationDays * 24 * 60 * 60 * 1000)

  const formattedDuration =
    durationDays < 1
      ? `${Math.round(durationDays * 24)}h`
      : durationDays < 7
        ? `${Math.round(durationDays)}d`
        : `${(durationDays / 7).toFixed(1)}w`

  if (!isConnected) {
    return (
      <Dialog open={actualIsOpen} onOpenChange={setActualIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Create Market
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md border-orange-900/20 bg-slate-950/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          <Alert className="border-orange-900/20 bg-orange-500/5">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <AlertDescription>
              Connect your wallet to create a prediction market
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={actualIsOpen} onOpenChange={setActualIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Create Market
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-orange-900/20 bg-slate-950/95 backdrop-blur max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Create New Market
          </DialogTitle>
          <DialogDescription>
            Create a prediction market for the Phoenix Markets community
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Will Bitcoin reach $100k by end of year?"
                      className="resize-none border-orange-900/20 bg-slate-900/50"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration Slider */}
            <FormField
              control={form.control}
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration: {formattedDuration}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0.042}
                      max={365}
                      step={0.042}
                      value={[field.value]}
                      onValueChange={(val) => field.onChange(val[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription>
                    Market will end on {endTime.toLocaleDateString()} at{' '}
                    {endTime.toLocaleTimeString()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Card */}
            <Card className="p-4 border-orange-900/20 bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <p className="text-base font-semibold text-foreground line-clamp-3 mb-3">
                {form.getValues('description') || 'Your market question will appear here...'}
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Duration: {formattedDuration}</p>
                <p>Ends: {endTime.toLocaleDateString()} at {endTime.toLocaleTimeString()}</p>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setActualIsOpen(false)}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="flex-1 gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    Create Market
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 z-10">
            <div className="text-center">
              <div className="inline-block mb-2">
                <Flame className="w-8 h-8 text-orange-500 animate-bounce" />
              </div>
              <p className="text-sm text-orange-400 font-semibold">Creating market...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
