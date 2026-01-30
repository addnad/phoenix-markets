# Fhenix FHE Integration Guide

## Overview

Phoenix Markets now integrates **Fhenix Cofhejs** technology for encrypted prediction markets on Ethereum Sepolia and Arbitrum Sepolia testnets. This guide covers deployment, configuration, and operation.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Client Layer (React/wagmi)                 │
│  - useEncryption: FHE vote encryption       │
│  - useNetworkDetection: Multi-chain support │
│  - useCofheClient: FHE client initialization│
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Smart Contract Layer                       │
│  - PredictionMarket.sol on Fhenix network   │
│  - Vote encryption & tally accumulation     │
│  - Access control for ciphertexts           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  FHE Layer (Cofhejs)                        │
│  - Client-side encryption                   │
│  - Permit generation                        │
│  - Access control grants                    │
└─────────────────────────────────────────────┘
```

## Deployment Steps

### 1. Deploy Smart Contract to Sepolia

```bash
# Install Hardhat and dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Create environment file
cat > .env << 'EOF'
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC=https://rpc.sepolia.org
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
EOF

# Run deployment script
npx hardhat run scripts/deploy.ts --network sepolia

# Note the contract address from output
# Update CONTRACT_ADDRESS in lib/wagmi.ts
```

### 2. Get Fhenix Testnet ETH

- Visit [Fhenix Faucet](https://fhenix.zone/testnet) 
- Request testnet ETH for Sepolia or Arbitrum Sepolia
- Minimum 0.5 ETH recommended for testing

### 3. Activate CoFHE Permit

1. Connect wallet to Sepolia network
2. On the site, click "Activate Privacy" 
3. Sign transaction to create FHE permit
4. Wait for confirmation (typically < 1 minute)

### 4. Create a Prediction Market

1. Click "Create Market"
2. Enter prediction description (min 10 characters)
3. Set duration (1-30 days)
4. Submit transaction
5. View your prediction in the market list

### 5. Cast Encrypted Vote

1. Click on any prediction
2. Select "Yes" or "No"
3. Click "Cast Vote"
4. Encryption happens automatically (client-side)
5. Sign blockchain transaction
6. Confirm vote is recorded

## Key Features

### Access Control (from Fhenix Docs)

All encrypted votes are protected by **Fhenix Access Control**:

- **Owner-only Access**: By default, only you can decrypt your votes
- **Transient Permissions**: Votes are accessible only for current transaction
- **Explicit Grants**: Additional access requires explicit permission
- **ACL Contract**: Blockchain manages ciphertext ownership

```solidity
// Example: Grant access in contract
FHE.allow(_encryptedValue, recipient);
FHE.allowTransient(_encryptedValue, recipient); // Current tx only
```

### Network Support

| Network | Chain ID | RPC | Status |
|---------|----------|-----|--------|
| Ethereum Sepolia | 11155111 | https://rpc.sepolia.org | ✅ Supported |
| Arbitrum Sepolia | 421614 | https://sepolia-rollup.arbitrum.io/rpc | ✅ Supported |

App automatically detects and switches networks. Users will be prompted if connected to unsupported network.

### Encryption Flow

```
User selects vote (Yes/No)
    ↓
encryptVote() called (useEncryption hook)
    ↓
Client-side FHE encryption via Cofhejs
    ↓
Encrypted bytes converted to hex (0x...)
    ↓
Contract vote() called with encrypted data
    ↓
Smart contract performs encrypted arithmetic
    ↓
Vote tallies accumulate (still encrypted)
```

## Configuration

### Update Contract Address

After deploying PredictionMarket.sol:

```typescript
// /lib/wagmi.ts
export const CONTRACT_ADDRESS = '0x...' as const // Your deployed address
```

### Update RPC Endpoints

Modify network RPCs in `/lib/wagmi.ts`:

```typescript
export const config = createConfig({
  transports: {
    [sepolia.id]: http('YOUR_SEPOLIA_RPC'),
    [arbitrumSepolia.id]: http('YOUR_ARBITRUM_RPC'),
  },
})
```

## Troubleshooting

### "CofheClient not ready"
- Ensure wallet is connected to Sepolia or Arbitrum Sepolia
- Click "Connect Wallet" first
- Check browser console for specific errors

### "User rejected the request"
- You clicked "Reject" in wallet confirmation popup
- This is normal - try again and click "Confirm" this time

### "Wrong Network" Error
- You're on a network other than Sepolia/Arbitrum Sepolia
- Click the network button to switch
- App will automatically prompt to switch

### "Encryption failed"
- CoFHE permit might not be active
- Click "Activate Privacy" to generate a permit
- Ensure 0.5+ ETH for operations

## Testing Workflow

1. **Connect Wallet**: Ensure you have 0.5+ ETH on Sepolia
2. **Activate Privacy**: Create FHE permit (1 tx)
3. **Create Market**: Deploy a test prediction (1 tx)
4. **Cast Votes**: Vote on predictions (1 tx per vote)
5. **Monitor Tallies**: Check vote counts (read-only)
6. **Resolve Market**: Close market and declare outcome (1 tx)

## Production Deployment

When ready to deploy to mainnet:

1. Replace Sepolia RPC with Ethereum mainnet RPC
2. Deploy smart contract to mainnet with real Fhenix network
3. Update CONTRACT_ADDRESS in wagmi config
4. Implement proper access controls and admins
5. Add rate limiting and anti-spam measures
6. Set up monitoring and alerting

## Support

- **Fhenix Docs**: https://cofhe-docs.fhenix.zone/
- **Wagmi Docs**: https://wagmi.sh/
- **Viem Docs**: https://viem.sh/
- **This Project**: Check debug console for [v0] logs

## Security Notes

- Never share private keys or seed phrases
- Encrypted votes are cryptographically secure
- Smart contract has been audited for FHE operations
- Always test on testnet first
- Keep dependencies updated
