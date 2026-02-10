# Private Prediction Market - Fhenix CoFHE dApp

A production-ready React/Next.js frontend for a Private Prediction Market powered by Fhenix CoFHE on Ethereum Sepolia testnet.

## Features

✨ **Encrypted Voting** - All votes are encrypted using FHE (Fully Homomorphic Encryption) until results are revealed
🔐 **Privacy First** - Orange-red gradient theme with lock/shield icons emphasizing encryption
📊 **Real-time Markets** - Browse active prediction markets with live countdown timers
💳 **Wallet Integration** - Connect MetaMask or any injected wallet provider
🌐 **Multi-Chain** - Supports Ethereum Sepolia and Arbitrum Sepolia
📱 **Responsive Design** - Mobile-friendly interface with loading states and error handling

## Setup

### 1. Configure Owner Address

To enable admin features (create and resolve predictions), set your wallet address in `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_OWNER_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f82bF0
```

Replace with your actual wallet address.

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Contract Details

- **Address**: `0x939839Ae1588A784E09C2A428db44619F1B1D5f9`
- **Network**: Ethereum Sepolia (chainId: 11155111)
- **RPC**: https://rpc.sepolia.org

## Key Components

- **Navbar** - Wallet connection, chain switcher, network badge
- **PredictionCard** - Individual market display with countdown, voting buttons
- **CreatePredictionModal** - Owner-only form to create new markets
- **VoteButtons** - Encrypted voting with FhenixJS integration
- **TallyViewer** - Owner-only feature to view and decrypt vote tallies after resolution
- **Providers** - WagmiProvider + QueryClientProvider setup

## How It Works

1. **Connect Wallet** - Use MetaMask or compatible wallet
2. **Browse Markets** - View all active prediction markets with live timers
3. **Vote Encrypted** - Click Yes/No to submit encrypted vote via FhenixJS
4. **Owner Functions** (if you set NEXT_PUBLIC_OWNER_ADDRESS):
   - Create new predictions using the floating action button
   - Resolve predictions to reveal encrypted tallies
   - Decrypt results using your private key

## Error Handling

The app includes comprehensive error handling with toast notifications for:
- Transaction pending/success/failure
- FHE encryption errors
- CoFHE permit requirements (check Fhenix Discord/docs if needed)
- Network connection issues

## Technologies

- **Next.js 16** - React framework
- **Wagmi 2.x** - Ethereum wallet integration
- **Viem 2.x** - Blockchain client
- **FhenixJS** - Fully Homomorphic Encryption library
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling with dark mode
- **React Hook Form** - Form management
- **Sonner** - Toast notifications
- **Date-fns** - Date formatting

## Environment Variables

```
NEXT_PUBLIC_OWNER_ADDRESS=  # Your wallet address for admin features
```

## API Routes

- `POST /api/prediction` - Fetch individual prediction details

## Notes

- All predictions are displayed with countdown timers
- Encrypted votes remain sealed until owner resolves the market
- Only the contract owner can resolve markets and view decrypted tallies
- Mobile-responsive with loading skeletons during data fetching
- Dark mode with orange-red accent colors

## Support

For issues with FHE or CoFHE permits, check the [Fhenix Discord](https://discord.gg/fhenix) or [Fhenix Documentation](https://docs.fhenix.io).
