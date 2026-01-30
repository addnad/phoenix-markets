# Private Vote Encryption with CofheJS - Phoenix Markets

## What Was Fixed

### 1. ABI Type Error
**Problem**: The vote function input was defined as `"type": "inEuint32"`, which is not a valid Viem ABI type.

**Solution**: Changed to `"type": "bytes"` in `/lib/wagmi.ts`:
```typescript
{
  inputs: [
    { internalType: 'uint256', name: '_predictionId', type: 'uint256' },
    { internalType: 'inEuint32', name: '_encryptedChoice', type: 'bytes' }, // Changed from "inEuint32" to "bytes"
  ],
  name: 'vote',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
}
```

### 2. CofheClient Initialization
**Problem**: The FhenixClient was receiving wagmi's `publicClient` and `walletClient` objects, which don't provide a proper web3 provider interface.

**Solution**: Updated `/components/vote-modal.tsx` to use `window.ethereum` directly with CofheClient:
```typescript
import { CofheClient, Encryptable } from 'cofhejs'

const cofhe = await CofheClient.init({
  provider: window.ethereum,
  chainId: 11155111, // Sepolia
})
```

### 3. Encryption Flow
**Changes**:
- Migrated from `fhenixjs` to `cofhejs` package
- Loading toast shows "Encrypting your private vote..." during FHE encryption
- Encryption uses `Encryptable.uint32()` helper: `await cofhe.encrypt(Encryptable.uint32(choice))`
- Encrypted bytes are passed directly to `writeContract`
- Success toast shows "Private vote cast successfully!" (instead of generic message)
- Clear error handling with CoFHE permit note

## How It Works Now

1. **User clicks Vote** → VoteModal opens
2. **User selects Yes/No** → Button enables
3. **User clicks Submit Vote**:
   - Toast: "Encrypting your private vote..."
   - CofheClient initializes with `window.ethereum` on Sepolia
   - Vote choice (1 or 0) is encrypted via FHE using `Encryptable.uint32()`
   - Toast: "Submitting private vote to blockchain..."
   - writeContract sends encrypted bytes to smart contract
   - MetaMask popup appears for transaction confirmation
4. **On Success**:
   - Toast: "Private vote cast successfully!"
   - Modal closes after 500ms
   - Predictions refetch automatically (handled by wagmi cache invalidation)
5. **On Error**:
   - Clear error toast with diagnostic info
   - If CoFHE permit needed: "CoFHE permit required. Activate via Fhenix testnet dashboard."

## Testing the Fix

1. Ensure MetaMask is connected to Sepolia network
2. Navigate to Dashboard or Top Markets page
3. Click "Vote" on any open market
4. In VoteModal, select Yes or No
5. Click "Cast Private Vote"
6. Confirm transaction in MetaMask
7. Should see "Private vote cast successfully!" toast

## Files Modified

- `/lib/wagmi.ts` - Fixed vote function ABI type from "inEuint32" to "bytes"
- `/components/vote-modal.tsx` - Updated to use CofheClient with Encryptable.uint32()
- `/hooks/usePermit.ts` - Updated permit generation to use CofheClient
- `/components/tally-viewer.tsx` - Updated to use CofheClient for decryption
- `/package.json` - Replaced `fhenixjs` with `cofhejs`

## Key Implementation Details

- CofheClient initialization requires both provider and chainId (11155111 for Sepolia)
- Encryption is async: `await cofhe.encrypt(Encryptable.uint32(choice ? 1 : 0))`
- Encryptable.uint32() creates a typed encryption wrapper for uint32 values
- Encrypted result is passed as bytes to contract
- Loading states show different messages for encryption vs. blockchain submission
- All error cases properly handled with helpful diagnostics

## Package Migration

```json
// Old
"fhenixjs": "^0.4.2-alpha.0"

// New
"cofhejs": "^0.1.0"
```

CofheJS is the maintained successor to FhenixJS with improved stability and API design.
