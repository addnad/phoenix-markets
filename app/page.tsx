'use client'

import { useState, useEffect } from 'react'
import { useReadContracts, useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/wagmi'
import PredictionCard from '@/components/prediction-card'
import CreatePredictionModal from '@/components/create-prediction-modal'
import FeaturedPredictions from '@/components/featured-predictions'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Prediction {
  id: number
  description: string
  endTime: number
  resolved: boolean
  outcome: boolean
}

// Set your wallet address here as the owner who can create predictions
// Example: '0x742d35Cc6634C0532925a3b844Bc9e7595f82bF0'
const OWNER_ADDRESS = process.env.NEXT_PUBLIC_OWNER_ADDRESS || ''

export default function Home() {
  const { address, isConnected } = useAccount()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('my-markets')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [prefillDescription, setPrefillDescription] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch prediction count
  const { data: countData, isLoading: isCountLoading } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getPredictionCount',
      },
    ],
  })

  const predictionCount = countData?.[0]?.result
    ? Number(countData[0].result)
    : 0

  // Fetch individual predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      if (isCountLoading || predictionCount === 0) {
        if (predictionCount === 0) {
          setPredictions([])
          setIsLoading(false)
        }
        return
      }

      try {
        setError(null)
        setIsLoading(true)

        // For now, fetch a reasonable limit to avoid too many requests
        const limit = Math.min(predictionCount, 50)
        const ids = Array.from({ length: limit }, (_, i) => i)

        // Fetch all predictions in parallel
        const results = await Promise.all(
          ids.map((id) =>
            fetch('/api/prediction', {
              method: 'POST',
              body: JSON.stringify({ id }),
            }).then((res) => res.json())
          )
        )

        setPredictions(results.filter((p) => p && p.id !== undefined))
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load predictions'
        setError(errorMessage)
        console.error('Fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPredictions()
  }, [predictionCount, isCountLoading])

  const isOwner = OWNER_ADDRESS && address?.toLowerCase() === OWNER_ADDRESS?.toLowerCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* If not connected, show hero section */}
      {!isConnected ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <div className="inline-block bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-2xl mb-6">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">Phoenix Markets</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Decentralized prediction market powered by Fhenix CoFHE
              </p>
              <p className="text-lg text-muted-foreground mb-12">
                Secure, private, and transparent - Make predictions with confidence
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                  Phoenix Markets
                </h1>
                <p className="text-lg text-muted-foreground">
                  Explore and participate in prediction markets
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-2">
                <div className="text-sm text-muted-foreground">
                  <p>Total Markets: <span className="font-semibold text-orange-400">{predictionCount}</span></p>
                </div>
                {isConnected && (
                  <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs text-green-400 flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Connected
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-900/50 border border-orange-900/20">
              <TabsTrigger value="my-markets" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                My Private Markets
              </TabsTrigger>
              <TabsTrigger value="featured" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                Featured Crypto
              </TabsTrigger>
            </TabsList>

            {/* My Private Markets Tab */}
            <TabsContent value="my-markets" className="space-y-6">
              {/* Loading State */}
              {isLoading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="aspect-square p-4 bg-slate-950/50 border-orange-900/20 flex flex-col">
                      <Skeleton className="h-6 w-3/4 mb-3 bg-slate-800" />
                      <Skeleton className="h-4 w-1/2 mb-auto bg-slate-800" />
                      <div className="flex gap-2 mt-auto">
                        <Skeleton className="h-9 flex-1 bg-slate-800" />
                        <Skeleton className="h-9 flex-1 bg-slate-800" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && predictions.length === 0 && (
                <div className="flex items-center justify-center min-h-96">
                  <Card className="p-12 text-center border-orange-900/20 bg-slate-950/50 max-w-md">
                    <p className="text-muted-foreground mb-4 text-lg">
                      No predictions yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Markets created by the owner will appear here
                    </p>
                  </Card>
                </div>
              )}

              {/* Predictions Grid - Square Cards */}
              {!isLoading && predictions.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {predictions.map((prediction) => (
                    <div key={prediction.id} className="aspect-square">
                      <PredictionCard
                        id={prediction.id}
                        description={prediction.description}
                        endTime={prediction.endTime}
                        resolved={prediction.resolved}
                        outcome={prediction.outcome}
                        isOwner={isOwner}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Featured Crypto Predictions Tab */}
            <TabsContent value="featured" className="space-y-6">
              <FeaturedPredictions
                onCreateMarket={(description) => {
                  setPrefillDescription(description)
                  setCreateModalOpen(true)
                  setActiveTab('my-markets')
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Create Prediction FAB (Owner only) */}
      {isOwner && (
        <CreatePredictionModal
          isOpen={createModalOpen}
          onOpenChange={setCreateModalOpen}
          prefillDescription={prefillDescription}
          onSuccess={() => {
            setPrefillDescription('')
            setRefreshKey((prev) => prev + 1)
          }}
        />
      )}
    </div>
  )
}
