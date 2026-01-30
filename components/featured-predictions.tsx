'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Lock, Sparkles, TrendingUp } from 'lucide-react'
import VoteModal from './vote-modal'

interface FeaturedMarket {
  id: number
  description: string
  endTime: number
  yesProbability: number
  noProbability: number
  volume: string
  liquidity: string
}

const FEATURED_MARKETS: FeaturedMarket[] = [
  {
    id: 1,
    description: 'Will Bitcoin reach $150,000 by December 31, 2026?',
    endTime: Math.floor(new Date('2026-12-31T23:59:59Z').getTime() / 1000),
    yesProbability: 68,
    noProbability: 32,
    volume: '$12.4M',
    liquidity: '$3.1M',
  },
  {
    id: 2,
    description: 'Will Ethereum reach $10,000 by June 30, 2026?',
    endTime: Math.floor(new Date('2026-06-30T23:59:59Z').getTime() / 1000),
    yesProbability: 54,
    noProbability: 46,
    volume: '$8.9M',
    liquidity: '$2.2M',
  },
  {
    id: 3,
    description: 'Will the total crypto market cap exceed $3 trillion by end of 2026?',
    endTime: Math.floor(new Date('2026-12-31T23:59:59Z').getTime() / 1000),
    yesProbability: 72,
    noProbability: 28,
    volume: '$15.7M',
    liquidity: '$4.1M',
  },
  {
    id: 4,
    description: 'Will a major ETF approval for Solana occur by December 2026?',
    endTime: Math.floor(new Date('2026-12-31T23:59:59Z').getTime() / 1000),
    yesProbability: 61,
    noProbability: 39,
    volume: '$5.3M',
    liquidity: '$1.8M',
  },
  {
    id: 5,
    description: 'Will Bitcoin undergo a halving event before December 31, 2026?',
    endTime: Math.floor(new Date('2026-12-31T23:59:59Z').getTime() / 1000),
    yesProbability: 45,
    noProbability: 55,
    volume: '$9.2M',
    liquidity: '$2.7M',
  },
  {
    id: 6,
    description: 'Will XRP reach $2.00 by end of Q3 2026?',
    endTime: Math.floor(new Date('2026-09-30T23:59:59Z').getTime() / 1000),
    yesProbability: 58,
    noProbability: 42,
    volume: '$6.8M',
    liquidity: '$1.9M',
  },
  {
    id: 7,
    description: 'Will a layer-2 solution surpass $10B total value locked?',
    endTime: Math.floor(new Date('2026-06-30T23:59:59Z').getTime() / 1000),
    yesProbability: 76,
    noProbability: 24,
    volume: '$11.1M',
    liquidity: '$3.4M',
  },
  {
    id: 8,
    description: 'Will decentralized exchange volume exceed $100B annually by 2026?',
    endTime: Math.floor(new Date('2026-12-31T23:59:59Z').getTime() / 1000),
    yesProbability: 63,
    noProbability: 37,
    volume: '$7.5M',
    liquidity: '$2.1M',
  },
  {
    id: 9,
    description: 'Will spot Bitcoin ETF trading volume exceed futures by Q3 2026?',
    endTime: Math.floor(new Date('2026-09-30T23:59:59Z').getTime() / 1000),
    yesProbability: 71,
    noProbability: 29,
    volume: '$13.2M',
    liquidity: '$3.8M',
  },
  {
    id: 10,
    description: 'Will a central bank launch a CBDC by mid-2026?',
    endTime: Math.floor(new Date('2026-06-30T23:59:59Z').getTime() / 1000),
    yesProbability: 82,
    noProbability: 18,
    volume: '$10.6M',
    liquidity: '$3.2M',
  },
]

interface FeaturedPredictionsProps {
  onCreateMarket?: (description: string) => void
}

export default function FeaturedPredictions({
  onCreateMarket,
}: FeaturedPredictionsProps) {
  const [markets, setMarkets] = useState<FeaturedMarket[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setMarkets(FEATURED_MARKETS)
  }, [])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleVotePrivately = (description: string) => {
    if (onCreateMarket) {
      onCreateMarket(description)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-900/30">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">
              Community-inspired crypto forecasts
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your private version on-chain for full privacy with FHE encryption
            </p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="text-xs bg-transparent"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Refresh Data
        </Button>
      </div>

      {/* Markets Grid - Square Cards */}
      <div key={refreshKey} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {markets.map((market) => (
          <div key={market.id} className="aspect-square">
            <FeaturedMarketCard
              market={market}
              onVotePrivately={() => handleVotePrivately(market.description)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

interface FeaturedMarketCardProps {
  market: FeaturedMarket
  onVotePrivately: () => void
}

function FeaturedMarketCard({ market, onVotePrivately }: FeaturedMarketCardProps) {
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  
  const now = Date.now()
  const endTimeMs = market.endTime * 1000
  const countdownText = formatDistanceToNowStrict(endTimeMs)

  return (
    <Card className="h-full relative overflow-hidden border-orange-900/20 bg-slate-950/50 hover:bg-slate-950/80 transition-colors flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 pointer-events-none" />

      <CardHeader className="relative pb-2 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm text-foreground line-clamp-3 leading-tight">
              {market.description}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="flex-shrink-0 bg-orange-500/10 border-orange-500/30 text-orange-400 text-xs"
          >
            <Lock className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Ends in {countdownText}</p>
      </CardHeader>

      <CardContent className="relative space-y-2 flex-1 flex flex-col">
        {/* Probability Bars - Condensed */}
        <div className="space-y-1.5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-green-400">YES</span>
              <span className="font-semibold text-green-400">{market.yesProbability}%</span>
            </div>
            <Progress
              value={market.yesProbability}
              className="h-1.5 bg-green-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-red-400">NO</span>
              <span className="font-semibold text-red-400">{market.noProbability}%</span>
            </div>
            <Progress
              value={market.noProbability}
              className="h-1.5 bg-red-500/20"
            />
          </div>
        </div>

        {/* Volume & Liquidity - Condensed */}
        <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-900/50 border border-orange-900/20 text-xs flex-shrink-0">
          <div>
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="text-xs font-semibold text-foreground">
              {market.volume}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Liquidity</p>
            <p className="text-xs font-semibold text-foreground">
              {market.liquidity}
            </p>
          </div>
        </div>

        {/* Vote Privately Button */}
        <Button
          onClick={() => setVoteModalOpen(true)}
          className="w-full mt-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold text-xs py-2 transition-all"
        >
          <Lock className="w-3 h-3 mr-1" />
          Vote Privately
        </Button>
        <VoteModal
          isOpen={voteModalOpen}
          onOpenChange={setVoteModalOpen}
          predictionId={market.id}
          description={market.description}
          endTime={market.endTime}
        />
      </CardContent>
    </Card>
  )
}
