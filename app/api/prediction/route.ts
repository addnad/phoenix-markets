import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/wagmi'

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://rpc.sepolia.org'),
})

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (typeof id !== 'number') {
      return Response.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const prediction = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'getPrediction',
      args: [BigInt(id)],
    })

    if (!prediction) {
      return Response.json({ error: 'Prediction not found' }, { status: 404 })
    }

    const [description, endTime, resolved, outcome] = prediction as [
      string,
      bigint,
      boolean,
      boolean,
    ]

    return Response.json({
      id,
      description,
      endTime: Number(endTime),
      resolved,
      outcome,
    })
  } catch (error) {
    console.error('API error:', error)
    return Response.json(
      { error: 'Failed to fetch prediction' },
      { status: 500 }
    )
  }
}
