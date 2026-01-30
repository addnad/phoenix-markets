'use client'

import { useReadContracts, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/wagmi'

export interface Prediction {
  id: number
  description: string
  endTime: number
  resolved: boolean
  outcome?: boolean
}

export function usePredictionCount() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getPredictionCount',
  })

  return {
    count: data ? Number(data) : 0,
    isLoading,
    error,
  }
}

export function usePredictions(ids: bigint[]) {
  const contracts = ids.map((id) => ({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getPrediction',
    args: [id],
  }))

  const { data, isLoading, error } = useReadContracts({
    contracts: contracts as any,
  })

  const predictions: Prediction[] = (data || [])
    .map((result, index) => {
      if (!result.result) return null
      const [description, endTime, resolved, outcome] = result.result as any
      return {
        id: Number(ids[index]),
        description,
        endTime: Number(endTime),
        resolved,
        outcome,
      }
    })
    .filter(Boolean) as Prediction[]

  return {
    predictions,
    isLoading,
    error,
  }
}

export function usePrediction(id: bigint) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getPrediction',
    args: [id],
  })

  if (!data) {
    return { prediction: null, isLoading, error }
  }

  const [description, endTime, resolved, outcome] = data as any

  return {
    prediction: {
      id: Number(id),
      description,
      endTime: Number(endTime),
      resolved,
      outcome,
    },
    isLoading,
    error,
  }
}
