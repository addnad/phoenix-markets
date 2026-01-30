'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/wagmi'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const createPredictionSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be under 500 characters'),
  durationHours: z
    .number()
    .min(1, 'Duration must be at least 1 hour')
    .max(720, 'Duration must be less than 30 days'),
})

type CreatePredictionFormValues = z.infer<typeof createPredictionSchema>

interface CreatePredictionModalProps {
  onSuccess?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  prefillDescription?: string
}

export default function CreatePredictionModal({
  onSuccess,
  isOpen: controlledIsOpen,
  onOpenChange,
  prefillDescription = '',
}: CreatePredictionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const actualIsOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpen
  const setActualIsOpen = onOpenChange || setIsOpen
  const { writeContract, isPending, data: hash } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  })

  // Close modal and show success on transaction confirm
  useEffect(() => {
    if (isSuccess) {
      toast.success('Prediction created successfully!')
      setActualIsOpen(false)
      onSuccess?.()
    }
  }, [isSuccess, onSuccess, setActualIsOpen])

  const form = useForm<CreatePredictionFormValues>({
    resolver: zodResolver(createPredictionSchema),
    defaultValues: {
      description: prefillDescription,
      durationHours: 24,
    },
  })

  const onSubmit = async (values: CreatePredictionFormValues) => {
    try {
      const durationInSeconds = Math.floor(values.durationHours * 3600)

      const toastId = toast.loading('Creating prediction...')

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
            toast.success('Prediction created successfully!')
          },
          onError: (error) => {
            toast.dismiss(toastId)
            const errorMsg = error?.message || 'Failed to create prediction'
            toast.error(errorMsg)
            console.log('[v0] Contract error:', error)
          },
        }
      )
    } catch (error) {
      toast.dismiss()
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to create prediction: ${errorMessage}`)
      console.log('[v0] Create error:', error)
    }
  }

  if (isPending || isWaiting) {
    toast.dismiss()
    toast.loading('Transaction pending...')
  }

  const isLoading = isPending || isWaiting

  return (
    <Dialog open={actualIsOpen} onOpenChange={setActualIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 gap-2 rounded-full h-14 w-14 p-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          title="Create prediction"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Prediction</DialogTitle>
          <DialogDescription>
            Create a new market for community predictions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={async (e) => {
              e.preventDefault()
              const isValid = await form.trigger()
              if (isValid) {
                form.handleSubmit(onSubmit)(e)
              }
            }} 
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prediction Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Will Ethereum price exceed $5000 by end of year?"
                      className="resize-none min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch('description').length}/500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voting Duration</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        min={1}
                        max={720}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{field.value} hour{field.value !== 1 ? 's' : ''}</span>
                        <span>
                          {field.value >= 24
                            ? `${Math.floor(field.value / 24)} day${Math.floor(field.value / 24) !== 1 ? 's' : ''}`
                            : 'Less than 1 day'}
                        </span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Prediction
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
