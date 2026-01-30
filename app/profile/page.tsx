'use client'

import { useEffect, useState } from 'react'
import React from "react"
import { useAccount } from 'wagmi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Copy, Check, Flame, Vote, Award } from 'lucide-react'
import { usePredictionCount } from '@/hooks/useContractData'

interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  subtext?: string
}

function StatsCard({ label, value, icon, subtext }: StatsCardProps) {
  return (
    <Card className="p-6 border-orange-900/20 bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-2">{label}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        </div>
        <div className="text-orange-500/50">{icon}</div>
      </div>
    </Card>
  )
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)
  const { count } = usePredictionCount() // Move the hook call to the top level
  const [userStats, setUserStats] = useState({
    marketsCreated: 0,
    votesCast: 0,
    winRate: 0,
    privacyScore: 0, // Declare privacyScore in the state
  })

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Not connected'

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    // Calculate user stats from all predictions
    const calculateStats = async () => {
      // This would typically fetch from contract mappings like:
      // - userCreatedMarkets[address]
      // - userVotedMarkets[address]
      // For now, using mock data based on address hash
      if (address) {
        const hash = parseInt(address.slice(2, 6), 16)
        setUserStats({
          marketsCreated: Math.floor((hash % 15) + 2),
          votesCast: Math.floor((hash % 200) + 20),
          winRate: Math.floor((hash % 30) + 50),
          privacyScore: Math.floor((hash % 100) + 1), // Calculate privacyScore
        })
      }
    }

    calculateStats()
  }, [address])

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Card className="max-w-md w-full p-8 text-center border-orange-900/20 bg-slate-900/50">
          <User className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">My Profile</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your profile and participation stats
          </p>
          <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            Connect Wallet
          </Button>
        </Card>
      </div>
    )
  }

  const { marketsCreated, votesCast, winRate, privacyScore } = userStats // Destructure userStats

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white flex items-center gap-3 mb-4">
            <User className="w-10 h-10 text-orange-500" />
            My Profile
          </h1>
          <p className="text-lg text-slate-400">Your prediction activity and statistics</p>
        </div>

        {/* Wallet Address Section */}
        <Card className="mb-8 p-6 border-orange-900/20 bg-slate-900/50">
          <p className="text-sm text-slate-400 mb-2">Connected Wallet</p>
          <div className="flex items-center justify-between gap-4">
            <p className="text-2xl font-mono font-bold text-white break-all">{address}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
              className="border-orange-900/30 hover:bg-orange-500/10 bg-transparent"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            label="Markets Created"
            value={userStats.marketsCreated}
            icon={<Flame className="w-8 h-8" />}
            subtext="Predictions you started"
          />
          <StatsCard
            label="Votes Cast"
            value={userStats.votesCast}
            icon={<Vote className="w-8 h-8" />}
            subtext="Total participations"
          />
          <StatsCard
            label="Win Rate"
            value={`${userStats.winRate}%`}
            icon={<Award className="w-8 h-8" />}
            subtext="Correct predictions"
          />
          <StatsCard
            label="Privacy Score"
            value={Math.floor(Math.random() * 35 + 65)}
            icon={<Flame className="w-8 h-8" />}
            subtext="0-100 (higher is better)"
          />
        </div>

        {/* Activity Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Participation</h2>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card
                key={i}
                className="p-4 border-orange-900/20 bg-slate-900/50 hover:bg-slate-900/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white line-clamp-1">
                      {['Bitcoin reaches $100k', 'Ethereum Layer-2 TVL surges', 'CBDC launches in US', 'Crypto adoption in Asia', 'DeFi revenue grows'][i]}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {['5 days ago', '12 days ago', '24 days ago', '30 days ago', '45 days ago'][i]}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      {['Voted Yes', 'Voted No', 'Voted Yes', 'Voted No', 'Voted Yes'][i]}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <Alert className="mt-8 border-orange-900/20 bg-orange-500/5">
          <Flame className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-200">
            Your votes are encrypted using Fhenix CoFHE and completely private until market resolution.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
