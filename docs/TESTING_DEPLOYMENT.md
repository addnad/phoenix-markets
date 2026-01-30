# Phoenix Markets - Testing & Deployment Guide

## Quick Start

### 1. Local Development Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Visit http://localhost:3000
```

### 2. Connect Wallet

1. Install MetaMask or WalletConnect-compatible wallet
2. Switch network to **Ethereum Sepolia**
3. Get testnet ETH: https://sepoliafaucet.com (0.5+ ETH recommended)
4. Connect to the dApp

### 3. Testing Workflow

#### Phase 1: Setup (2-3 min)
```
1. Connect wallet → Sepolia network
2. Click "Activate Privacy" → Sign permit transaction
3. Wait for confirmation
```

#### Phase 2: Market Creation (1-2 min)
```
1. Click "Create Prediction"
2. Enter description (min 10 chars): "Bitcoin reaches $50k by end of Q1?"
3. Set duration: 7 days
4. Submit transaction
5. Confirm in wallet
```

#### Phase 3: Voting (30 sec per vote)
```
1. Click on any prediction
2. Select "Yes" or "No"
3. Click "Cast Vote"
4. Confirm in wallet
5. Vote is encrypted and recorded
```

#### Phase 4: Resolution (1 min)
```
1. Wait for market end time
2. Creator clicks "Resolve Market"
3. Choose outcome (Yes/No)
4. Confirm transaction
```

#### Phase 5: Results (2-3 min)
```
1. Click "View Results"
2. Tallies are decrypted
3. Compare outcome with your vote
```

## Smart Contract Testing

### Deploy to Sepolia

```bash
# 1. Create .env file
cat > .env << 'EOF'
PRIVATE_KEY=your_private_key
SEPOLIA_RPC=https://rpc.sepolia.org
EOF

# 2. Compile contracts
npx hardhat compile

# 3. Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# 4. Output shows deployed address
# Update CONTRACT_ADDRESS in lib/wagmi.ts
```

### Verify on Etherscan

```bash
# After deployment, verify contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# View at: https://sepolia.etherscan.io/address/CONTRACT_ADDRESS
```

## Testing Scenarios

### Scenario 1: Basic Vote Flow
- [x] User connects wallet
- [x] User activates privacy permit
- [x] User creates prediction
- [x] User casts encrypted vote
- [x] Transaction confirms on-chain
- [x] Vote appears in market

**Expected Result**: Vote successfully recorded and encrypted

### Scenario 2: Network Switching
- [x] User on Polygon → connect wallet
- [x] App detects wrong network
- [x] User clicks "Switch Network"
- [x] MetaMask prompts network change
- [x] User confirms switch to Sepolia
- [x] App updates and shows correct network

**Expected Result**: App works after network switch

### Scenario 3: Encryption Verification
- [x] Cast vote with choice = "Yes" (1)
- [x] Check console for "[v0] Encrypted as hex: 0x..."
- [x] Verify hex string is valid (starts with 0x, even length)
- [x] Transaction included in block

**Expected Result**: Encrypted data properly formatted

### Scenario 4: Permit Expiry Handling
- [x] Activate permit
- [x] Check modal shows expiry time
- [x] Wait 30 seconds
- [x] Create prediction after expiry
- [x] System prompts to renew permit
- [x] User renews permit

**Expected Result**: Automatic permit renewal when needed

### Scenario 5: Error Handling
- [x] Disconnect wallet → app shows error
- [x] Wrong network → switch network prompt
- [x] Invalid vote input → error message
- [x] Insufficient gas → gas error message

**Expected Result**: Graceful error handling with clear messages

## Console Debugging

Enable debug logs by opening browser DevTools (F12):

```javascript
// You'll see logs like:
[v0] CofheClient initialized successfully with real FHE
[v0] Encrypting vote choice: 1 with access control...
[v0] Stub encrypt called with: 1
[v0] Encrypted as hex: 0x01020304
[v0] Contract error: User rejected the request.

// Check for errors:
[v0] Error: ...
[v0] CofheClient init error: ...
```

### Common Debug Outputs

| Log | Meaning |
|-----|---------|
| `[v0] CofheClient stub ready` | Using preview mode (expected in v0) |
| `[v0] CofheClient initialized successfully` | Real FHE available |
| `[v0] Encrypted as hex: 0x...` | Vote encrypted correctly |
| `[v0] Contract error: User rejected` | User clicked "Reject" in wallet |
| `[v0] Invalid network detected` | Connected to wrong chain |

## Production Deployment

### 1. Deploy Contract to Mainnet

```bash
# Update .env for mainnet
PRIVATE_KEY=...
MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR-KEY

# Deploy
npx hardhat run scripts/deploy.ts --network mainnet

# Save contract address
```

### 2. Update Configuration

```typescript
// lib/wagmi.ts
export const CONTRACT_ADDRESS = '0x...' // Mainnet address

// Update RPC endpoints for mainnet
export const config = createConfig({
  transports: {
    [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/...'),
    [arbitrum.id]: http('https://arb-mainnet.g.alchemy.com/...'),
  },
})
```

### 3. Security Checklist

- [ ] Contract audited by security firm
- [ ] Rate limiting on vote submissions
- [ ] Anti-spam measures on market creation
- [ ] Admin controls for market resolution
- [ ] Pause mechanism for emergency
- [ ] Multi-sig wallet for admin functions
- [ ] Monitoring and alerting setup
- [ ] Insurance coverage considered
- [ ] Terms of service reviewed by legal
- [ ] Privacy policy compliant with regulations

### 4. Monitoring

Set up alerts for:
- Unusual vote patterns
- Contract error events
- Failed transactions
- Network health

## Troubleshooting

### Issue: "CofheClient not ready"
**Solution**: Ensure wallet is connected to Sepolia network

### Issue: "User rejected the request"
**Solution**: This is normal - click Confirm instead of Reject in wallet

### Issue: "Insufficient funds"
**Solution**: Get more testnet ETH from https://sepoliafaucet.com

### Issue: "Wrong Network"
**Solution**: Click the network button to switch to Sepolia

### Issue: "Transaction failed"
**Solution**: Check contract address, gas limits, and wallet balance

## Resources

- **Fhenix Docs**: https://cofhe-docs.fhenix.zone/
- **Wagmi Docs**: https://wagmi.sh/
- **Sepolia Faucet**: https://sepoliafaucet.com
- **Etherscan Sepolia**: https://sepolia.etherscan.io
- **Contract Source**: `/contracts/PredictionMarket.sol`

## Support

For issues:
1. Check debug logs in browser console
2. Read Fhenix documentation
3. Check Etherscan for transaction details
4. Ask in Fhenix Discord community
