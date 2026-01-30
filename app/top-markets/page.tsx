'use client'

import { useEffect, useState } from 'react'
import { useReadContracts, useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/wagmi'
import { usePredictionCount, usePredictions, type Prediction } from '@/hooks/useContractData'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Trophy, Zap, Clock, AlertCircle, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import VoteModal from '@/components/vote-modal'

export default function TopMarketsPage() {
  const { address, isConnected } = useAccount()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { count } = usePredictionCount()

  useEffect(() => {
    if (!isConnected || count === 0) {
      setIsLoading(false)
      return
    }

    const fetchPredictions = async () => {
      try {
        setIsLoading(true)

        // Mock predictions data
        const mockPredictions = [
          {
            id: 1,
            description: 'Ethereum Layer-2 TVL to exceed $20B',
            endTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
            resolved: false,
            totalVotes: 1923,
          },
          {
            id: 2,
            description: 'US CBDC pilot program approved',
            endTime: Date.now() + 90 * 24 * 60 * 60 * 1000,
            resolved: false,
            totalVotes: 1456,
          },
          {
            id: 3,
            description: 'Ethereum price to exceed $5000',
            endTime: Date.now() + 45 * 24 * 60 * 60 * 1000,
            resolved: false,
            totalVotes: 1289,
          },
          {
            id: 4,
            description: 'Total crypto market cap to reach $3T',
            endTime: Date.now() + 75 * 24 * 60 * 60 * 1000,
            resolved: false,
            totalVotes: 987,
          },
        ]

        // Sort by total votes descending
        const sorted = mockPredictions.sort((a, b) => b.totalVotes - a.totalVotes)
        setPredictions(sorted)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch markets')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPredictions()
  }, [isConnected, count])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Card className="max-w-md w-full p-8 text-center border-orange-900/20 bg-slate-900/50">
          <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Top Markets</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to see the most popular prediction markets and your participation
          </p>
          <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            Connect Wallet
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-10 h-10 text-orange-500" />
              Top Prediction Markets
            </h1>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-orange-900/20 hover:bg-slate-800 bg-transparent"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>
          </div>
          <p className="text-lg text-slate-400">Most voted and popular predictions</p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card
                key={i}
                className="p-6 border-orange-900/20 bg-slate-900/50 animate-pulse"
              >
                <Skeleton className="h-6 w-3/4 mb-2 bg-slate-800" />
                <Skeleton className="h-4 w-1/2 bg-slate-800" />
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && predictions.length === 0 && (
          <Card className="p-12 text-center border-orange-900/20 bg-slate-900/50">
            <p className="text-muted-foreground mb-4">No prediction markets available yet</p>
          </Card>
        )}

        {/* Markets List */}
        {!isLoading && predictions.length > 0 && (
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <Card
                key={prediction.id}
                className="group p-6 border border-orange-900/20 bg-slate-900/50 hover:bg-slate-900/70 hover:border-orange-600/40 transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left side */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        #{index + 1}
                      </Badge>
                      {prediction.resolved && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                      {prediction.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{prediction.totalVotes.toLocaleString()}</span>
                        <span>votes</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>{formatDistanceToNow(prediction.endTime, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Stats */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1">Popularity</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {Math.round((prediction.totalVotes / 2847) * 100)}%
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-orange-900/30 hover:bg-orange-500/10 hover:border-orange-500/60 bg-transparent"
                    >
                      Vote
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
