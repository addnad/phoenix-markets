#!/bin/bash

# Deploy PredictionMarket contract to Fhenix testnets
# This script deploys the contract using Hardhat

# Configuration
SEPOLIA_RPC="https://rpc.sepolia.org"
ARBITRUM_SEPOLIA_RPC="https://sepolia-rollup.arbitrum.io/rpc"

# Fhenix Devnet (for testing FHE operations)
FHENIX_DEVNET_RPC="https://api.devnet.fhenix.zone/rpc"

echo "========================================"
echo "Fhenix PredictionMarket Deployment"
echo "========================================"

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers

# Step 2: Initialize Hardhat if not already done
if [ ! -f "hardhat.config.ts" ]; then
    echo "Step 2: Initializing Hardhat..."
    npx hardhat
fi

# Step 3: Create deployment script
echo "Step 3: Creating deployment script..."
cat > scripts/deploy.ts << 'EOF'
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PredictionMarket contract...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get contract factory
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  
  // Deploy contract
  const contract = await PredictionMarket.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("PredictionMarket deployed to:", contractAddress);
  
  // Save deployment info
  const deployment = {
    network: process.env.NETWORK || "unknown",
    contract: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  console.log("Deployment Info:", JSON.stringify(deployment, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF

# Step 4: Create hardhat.config.ts
echo "Step 4: Creating Hardhat configuration..."
cat > hardhat.config.ts << 'EOF'
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Ethereum Sepolia
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    // Arbitrum Sepolia
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
    // Fhenix Devnet (for FHE testing)
    fhenixDevnet: {
      url: process.env.FHENIX_DEVNET_RPC || "https://api.devnet.fhenix.zone/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8008,
    },
  },
};

export default config;
EOF

echo ""
echo "========================================"
echo "Deployment Configuration Ready"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Create .env file with:"
echo "   PRIVATE_KEY=your_wallet_private_key"
echo "   SEPOLIA_RPC=https://rpc.sepolia.org"
echo "   ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc"
echo "   FHENIX_DEVNET_RPC=https://api.devnet.fhenix.zone/rpc"
echo ""
echo "2. Deploy to Sepolia:"
echo "   npx hardhat run scripts/deploy.ts --network sepolia"
echo ""
echo "3. Deploy to Arbitrum Sepolia:"
echo "   npx hardhat run scripts/deploy.ts --network arbitrumSepolia"
echo ""
echo "4. Deploy to Fhenix Devnet:"
echo "   npx hardhat run scripts/deploy.ts --network fhenixDevnet"
echo ""
echo "========================================"
