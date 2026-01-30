# CoFHE Permit System

## Overview

The Phoenix Markets dApp now includes automatic CoFHE permit generation to enable private voting with FHE encryption. Users can activate permits directly in-app without leaving the platform.

## Components

### 1. `usePermit` Hook (`/hooks/usePermit.ts`)
- **checkPermit()**: Checks if a valid CoFHE permit exists for the user's wallet
- **generatePermit()**: Creates a new 30-day permit for private voting
- Returns: `{ hasPermit, isLoading, error, checkPermit, generatePermit }`

### 2. `PermitModal` Component (`/components/permit-modal.tsx`)
- Modal dialog for permit generation
- Explains what permits do (gas-free, 30-day validity, FHE encryption)
- Shows loading spinner during permit generation
- Displays success/error messages with helpful links
- Links to https://docs.fhenix.zone for troubleshooting

### 3. Integration Points

#### Vote Modal (`/components/vote-modal.tsx`)
- Checks `checkPermit()` before starting encryption
- If no permit exists, opens PermitModal instead of encrypting
- After permit generation, automatically retries encryption
- Users don't need to click again

#### Create Market Modal (`/components/create-market-modal.tsx`)
- Same permit checking as vote modal
- Prevents market creation without valid permit
- Auto-retries after successful permit generation

#### Navbar (`/components/navbar.tsx`)
- Added "Privacy Setup" button
- Allows users to manually activate permits anytime
- Only visible when wallet is connected

## User Flow

1. **Voting Without Permit**:
   - User clicks "Confirm Vote"
   - System checks for existing permit
   - If none: PermitModal opens
   - User clicks "Generate & Activate Permit"
   - Permit is created (30-day validity)
   - Toast shows "Permit activated! Ready to vote privately."
   - Encryption and voting continue automatically

2. **Creating Market Without Permit**:
   - Same flow as voting
   - User clicks "Create Market"
   - Permit check happens before market creation
   - If needed, PermitModal handles permit generation
   - After permit, form submission continues automatically

3. **Manual Permit Setup**:
   - User clicks "Privacy Setup" button in navbar
   - PermitModal opens
   - User can activate permit for future voting/market creation
   - Valid for ~30 days

## Error Handling

- **Provider not available**: Shows clear error message
- **Permit generation fails**: Toast with link to Fhenix docs and Discord
- **CoFHE permit required**: Automatically prompts for permit generation
- All errors logged with `[v0]` prefix for debugging

## Configuration

The permit is configured with:
- Type: `"self"` (user's own wallet)
- Name: `"Phoenix Markets"` (app identifier)
- Expiration: 30 days from generation

This can be modified in `usePermit.ts` if needed.

## FhenixJS Integration

The system uses `fhenixjs` with these methods:
- `new FhenixClient({ provider: window.ethereum })`
- `fheClient.hasPermit()` - Check existing permit (if available)
- `fheClient.createPermit()` - Generate new permit (30-day expiration)
- `fheClient.encrypt_uint32()` - Encrypt vote choice

Note: FhenixJS API may vary by version. The hook includes fallbacks for different method names.

## Testing

1. **New Wallet**: Voting/market creation triggers permit modal
2. **After Permit**: Voting/market creation works immediately
3. **Navbar Button**: Manual permit activation without voting/creating

## Troubleshooting

If permit generation fails:
1. Check that wallet is connected to Sepolia or Arbitrum Sepolia
2. Check Fhenix dashboard for CoFHE configuration
3. Visit https://docs.fhenix.zone or Discord for help
4. Ensure fhenixjs library is properly installed

## Future Enhancements

- Show permit expiration timer in UI
- Allow permit renewal
- Batch permit generation for multiple apps
- CoFHE permit status in user profile
