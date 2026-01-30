'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import VoteModal from './vote-modal'

interface VoteButtonsProps {
  predictionId: number
  description: string
  endTime: number
}

export default function VoteButtons({ predictionId, description, endTime }: VoteButtonsProps) {
  const [voteModalOpen, setVoteModalOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setVoteModalOpen(true)}
          className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
        >
          <ThumbsUp className="w-4 h-4" />
          Vote
        </Button>
        <Button
          onClick={() => setVoteModalOpen(true)}
          className="flex-1 gap-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold"
        >
          <ThumbsDown className="w-4 h-4" />
          Vote
        </Button>
      </div>
      <VoteModal
        isOpen={voteModalOpen}
        onOpenChange={setVoteModalOpen}
        predictionId={predictionId}
        description={description}
        endTime={endTime}
      />
    </>
  )
}
