'use client'

import { formatDistanceToNowStrict } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Lock } from 'lucide-react'
import VoteButtons from './vote-buttons'
import TallyViewer from './tally-viewer'

interface PredictionCardProps {
  id: number
  description: string
  endTime: number
  resolved: boolean
  outcome?: boolean
  isOwner: boolean
}

export default function PredictionCard({
  id,
  description,
  endTime,
  resolved,
  outcome,
  isOwner,
}: PredictionCardProps) {
  const now = Date.now()
  const endTimeMs = endTime * 1000
  const isVotingOpen = !resolved && endTimeMs > now
  const countdownText = isVotingOpen
    ? `ends in ${formatDistanceToNowStrict(endTimeMs)}`
    : resolved
      ? 'Voting closed - Resolved'
      : 'Voting closed'

  return (
    <Card className="h-full relative overflow-hidden border-orange-900/20 bg-slate-950/50 hover:bg-slate-950/80 transition-colors flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 pointer-events-none" />
      
      <CardHeader className="relative pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base text-foreground line-clamp-3 leading-tight">{description}</CardTitle>
          </div>
          {resolved && (
            <Badge
              variant="outline"
              className="flex-shrink-0 bg-green-500/10 border-green-500/30 text-green-400 text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Done
            </Badge>
          )}
          {!resolved && (
            <Badge
              variant="outline"
              className="flex-shrink-0 bg-orange-500/10 border-orange-500/30 text-orange-400 text-xs"
            >
              <Lock className="w-3 h-3 mr-1" />
              Open
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-1 mt-2 text-xs">
          <Clock className="w-3 h-3 text-orange-500 flex-shrink-0" />
          <span className="truncate">{countdownText}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-3 flex-1 flex flex-col">
        {/* Encrypted Votes Indicator */}
        <div className="p-2 rounded-lg bg-slate-900/50 border border-orange-900/20 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3 text-orange-500 flex-shrink-0" />
            <span>Encrypted</span>
          </div>
        </div>

        {/* Outcome display when resolved */}
        {resolved && outcome !== undefined && (
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 flex-shrink-0">
            <p className="text-xs font-semibold text-foreground">
              Result: <span className="text-green-400">{outcome ? 'YES' : 'NO'}</span>
            </p>
          </div>
        )}

        {/* Voting Buttons */}
        {isVotingOpen && <div className="mt-auto"><VoteButtons predictionId={id} description={description} endTime={endTime} /></div>}

        {/* Tally Viewer for Owner */}
        {resolved && isOwner && <TallyViewer predictionId={id} />}
      </CardContent>
    </Card>
  )
}
