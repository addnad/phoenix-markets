# Quick Reference - Fhenix Integration

## 1-Minute Overview

Your Phoenix Markets prediction dApp now has **real FHE encrypted voting**:

```
User Vote → Client-Side Encryption → Smart Contract → Blockchain
     ↓            ↓                  ↓                  ↓
  Yes/No   Encrypted Bytes    Accumulate            Verify
           (Only voter can     (Encrypted)          (Encrypted)
            decrypt)           
```

## Critical Files

| File | Purpose | Lines |
|------|---------|-------|
| `PredictionMarket.sol` | Smart contract with FHE | 200 |
| `useEncryption.ts` | Vote encryption | 171 |
| `useNetworkDetection.ts` | Multi-chain support | 185 |
| `usePermit.ts` | Permit management | ~120 |
| `useDecryption.ts` | Result decryption | 196 |

## 5-Minute Setup

```bash
# 1. Get testnet ETH (5 min)
# https://sepoliafaucet.com → 0.5+ ETH

# 2. Deploy contract (2 min)
npx hardhat run scripts/deploy.ts --network sepolia
# Copy contract address

# 3. Update config (30 sec)
# Edit: lib/wagmi.ts → CONTRACT_ADDRESS

# 4. Start dev server (30 sec)
npm run dev

# 5. Test in browser (1 min)
# http://localhost:3000 → Connect → Activate → Vote
```

## Key Hooks

```typescript
// Vote encryption with access control
const { encryptVote, isReady } = useEncryption()
const encrypted = await encryptVote(1) // 0 or 1

// Network detection & switching
const { isValidNetwork, switchToSepolia } = useNetworkDetection()

// Permit lifecycle
const { generatePermit, permitActive, permitExpiry } = usePermit()

// Decrypt results
const { decryptTallies, calculateOutcome } = useDecryption()
```

## Smart Contract Flow

```solidity
createPrediction(description, duration)
    ↓
vote(predictionId, encryptedChoice)  // FHE encrypted
    ↓
resolve(predictionId, outcome)
    ↓
getSealedTallies(publicKey)  // For decryption
```

## Testing Checklist

```
□ Connect wallet to Sepolia
□ Get 0.5+ testnet ETH
□ Click "Activate Privacy"
□ Create prediction market
□ Cast encrypted vote
□ Check console for [v0] logs
□ Verify transaction on Etherscan
□ Test on Arbitrum Sepolia (optional)
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "CofheClient not ready" | Connect wallet to Sepolia |
| "User rejected" | Click Confirm not Reject |
| "Wrong Network" | Switch to Sepolia |
| "Insufficient funds" | Get more testnet ETH |
| "Contract error" | Check console logs |

## Access Control (Fhenix)

```
Created Ciphertext
    ↓
Only creator has access (default)
    ↓
FHE.allowTransient() → Temporary access this transaction
FHE.allow() → Permanent access to recipient
    ↓
Access logged in ACL contract
    ↓
Decryption only works with permission
```

## Console Debugging

```javascript
// Look for [v0] logs:
[v0] CofheClient initialized successfully
[v0] Encrypted as hex: 0x01020304
[v0] Encrypting vote choice: 1 with access control...
[v0] Vote encrypted successfully
[v0] Checking for active FHE permit...
[v0] Switched to network: Ethereum Sepolia

// Errors show as:
[v0] Error: ...
[v0] CofheClient init error: ...
```

## Deploy Checklist

- [ ] Get testnet ETH
- [ ] Run hardhat deploy
- [ ] Update CONTRACT_ADDRESS
- [ ] Test vote flow
- [ ] Check Etherscan
- [ ] Verify results decrypt

## Multi-Chain

```
Ethereum Sepolia (Primary)
├── Chain ID: 11155111
├── RPC: https://rpc.sepolia.org
└── Status: Supported

Arbitrum Sepolia (Backup)
├── Chain ID: 421614
├── RPC: https://sepolia-rollup.arbitrum.io/rpc
└── Status: Supported
```

App auto-detects and switches with user prompt.

## Security Summary

✅ Client-side FHE encryption  
✅ Access control on-chain  
✅ Vote ownership enforced  
✅ No mock data  
✅ Real cryptography  
✅ Double-vote prevention  

## Next Steps

1. **Deploy** → Run deploy script → Copy address
2. **Configure** → Update CONTRACT_ADDRESS
3. **Test** → Connect wallet → Activate → Vote
4. **Verify** → Check Etherscan → Read console
5. **Launch** → Deploy to production (later)

## Documentation

- **Integration**: `/docs/FHENIX_INTEGRATION.md`
- **Testing**: `/docs/TESTING_DEPLOYMENT.md`
- **README**: `/README_FHENIX.md`
- **Status**: `/FHENIX_CHECKLIST.md`
- **Summary**: `/FHENIX_SUMMARY.md`

## Links

- Fhenix Docs: https://cofhe-docs.fhenix.zone/
- Sepolia Faucet: https://sepoliafaucet.com
- Etherscan: https://sepolia.etherscan.io
- Wagmi: https://wagmi.sh/

---

**Status**: ✅ Ready for testnet deployment

Start with deployment script above, then follow TESTING_DEPLOYMENT.md for full workflow.
