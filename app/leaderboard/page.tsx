'use client'

import { useAccount } from 'wagmi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Trophy, Medal, Crown, Flame } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  address: string
  displayName: string
  score: number
  badge?: string
}

const topCreators: LeaderboardEntry[] = [
  { rank: 1, address: '0x742d...82bF0', displayName: 'Phoenix Master', score: 2847, badge: 'Fire' },
  { rank: 2, address: '0x1234...5678', displayName: 'Oracle', score: 2103, badge: 'Sage' },
  { rank: 3, address: '0x9abc...def0', displayName: 'Predictor', score: 1956 },
  { rank: 4, address: '0x5678...9abc', displayName: 'Analyst', score: 1834 },
  { rank: 5, address: '0xabcd...ef12', displayName: 'Prophet', score: 1723 },
  { rank: 6, address: '0xef12...3456', displayName: 'Seer', score: 1612 },
  { rank: 7, address: '0x3456...7890', displayName: 'Forecaster', score: 1501 },
  { rank: 8, address: '0x7890...bcde', displayName: 'Visionary', score: 1398 },
]

const topVoters: LeaderboardEntry[] = [
  { rank: 1, address: '0xvote...0001', displayName: 'Vote Master', score: 4532, badge: 'Voter' },
  { rank: 2, address: '0xvote...0002', displayName: 'Ballot Box', score: 3847 },
  { rank: 3, address: '0xvote...0003', displayName: 'Poll King', score: 3456 },
  { rank: 4, address: '0xvote...0004', displayName: 'Choice Expert', score: 2934 },
  { rank: 5, address: '0xvote...0005', displayName: 'Decision Maker', score: 2817 },
  { rank: 6, address: '0xvote...0006', displayName: 'Voter Pro', score: 2612 },
  { rank: 7, address: '0xvote...0007', displayName: 'Ballot Cast', score: 2389 },
  { rank: 8, address: '0xvote...0008', displayName: 'Vote Enthusiast', score: 2145 },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />
  if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
  return <span className="text-sm font-bold text-slate-400">#{rank}</span>
}

function LeaderboardTable({ entries, isVoters }: { entries: LeaderboardEntry[]; isVoters?: boolean }) {
  const { address } = useAccount()
  const currentUserRank = entries.find(
    e => address && e.address.toLowerCase().includes(address.slice(2, 6).toLowerCase())
  )

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card
          key={entry.rank}
          className={`p-4 border transition-all duration-300 ${
            currentUserRank?.rank === entry.rank
              ? 'border-orange-500/50 bg-orange-500/10'
              : 'border-orange-900/20 bg-slate-900/50 hover:bg-slate-900/70 hover:border-orange-600/40'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Rank & Name */}
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center justify-center w-10">
                <RankBadge rank={entry.rank} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{entry.displayName}</p>
                <p className="text-xs text-slate-500 font-mono">{entry.address}</p>
              </div>
            </div>

            {/* Badge & Score */}
            <div className="flex items-center gap-3">
              {entry.badge && (
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  {entry.badge}
                </Badge>
              )}
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {entry.score.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">{isVoters ? 'votes cast' : 'predictions'}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function LeaderboardPage() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Card className="max-w-md w-full p-8 text-center border-orange-900/20 bg-slate-900/50">
          <BarChart3 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Leaderboard</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to see the leaderboard and compete with other predictors
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
          <h1 className="text-4xl sm:text-5xl font-bold text-white flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-orange-500" />
            Leaderboard
          </h1>
          <p className="text-lg text-slate-400">Top predictors and most active voters</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="creators" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-900/50 border border-orange-900/20">
            <TabsTrigger value="creators" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Flame className="w-4 h-4 mr-2" />
              Top Creators
            </TabsTrigger>
            <TabsTrigger value="voters" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Trophy className="w-4 h-4 mr-2" />
              Top Voters
            </TabsTrigger>
          </TabsList>

          {/* Creators Tab */}
          <TabsContent value="creators" className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-slate-400">
                Ranked by total votes on all predictions they created
              </p>
            </div>
            <LeaderboardTable entries={topCreators} />
          </TabsContent>

          {/* Voters Tab */}
          <TabsContent value="voters" className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-slate-400">
                Ranked by total number of votes cast across all markets
              </p>
            </div>
            <LeaderboardTable entries={topVoters} isVoters />
          </TabsContent>
        </Tabs>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-orange-900/20 bg-slate-900/50">
            <p className="text-sm text-slate-400 mb-2">Total Markets</p>
            <p className="text-4xl font-bold text-orange-500">1,234</p>
            <p className="text-xs text-slate-500 mt-2">Active predictions</p>
          </Card>
          <Card className="p-6 border-orange-900/20 bg-slate-900/50">
            <p className="text-sm text-slate-400 mb-2">Total Votes</p>
            <p className="text-4xl font-bold text-orange-500">847,392</p>
            <p className="text-xs text-slate-500 mt-2">Community participation</p>
          </Card>
          <Card className="p-6 border-orange-900/20 bg-slate-900/50">
            <p className="text-sm text-slate-400 mb-2">Avg Popularity</p>
            <p className="text-4xl font-bold text-orange-500">687</p>
            <p className="text-xs text-slate-500 mt-2">Votes per market</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
