'use client'

import { createConfig, http } from 'wagmi'
import { sepolia, arbitrumSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia, arbitrumSepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http('https://rpc.sepolia.org'),
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
  },
})

export const CONTRACT_ADDRESS = '0x939839Ae1588A784E09C2A428db44619F1B1D5f9' as const

export const PREDICTION_MARKET_ABI = [
  {
    inputs: [
      { internalType: 'string', name: '_description', type: 'string' },
      { internalType: 'uint256', name: '_durationInSeconds', type: 'uint256' },
    ],
    name: 'createPrediction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_predictionId', type: 'uint256' },
      { internalType: 'inEuint32', name: '_encryptedChoice', type: 'inEuint32' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_predictionId', type: 'uint256' },
      { internalType: 'bool', name: '_yesWins', type: 'bool' },
    ],
    name: 'resolve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_predictionId', type: 'uint256' },
      { internalType: 'bytes32', name: '_publicKey', type: 'bytes32' },
    ],
    name: 'getSealedTallies',
    outputs: [
      { internalType: 'string', name: 'sealedYes', type: 'string' },
      { internalType: 'string', name: 'sealedNo', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_id', type: 'uint256' }],
    name: 'getPrediction',
    outputs: [
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'bool', name: 'resolved', type: 'bool' },
      { internalType: 'bool', name: 'outcome', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPredictionCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
