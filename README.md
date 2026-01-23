# 🚀 Bazaar - AI Agent Marketplace on Cronos EVM

> **Built for Cronos x402 Paytech Hackathon 2026**

Bazaar is a decentralized marketplace for creating, deploying, and monetizing AI agents with programmable x402-powered payment capabilities on Cronos EVM. Users can create custom AI agents with specialized skills, deploy them on-chain, and earn from agent interactions through automated micropayments.

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Hackathon Tracks](#hackathon-tracks)
- [Installation](#installation)
- [Deployment](#deployment)
- [Demo Video](#demo-video)
- [Team](#team)

---

## 🎯 Overview

Bazaar revolutionizes how AI agents are created, deployed, and monetized by combining:

- **AI Agent Intelligence**: Custom AI agents powered by LLMs with specialized system prompts
- **x402 Programmable Payments**: Seamless micropayments triggered by agent interactions
- **On-Chain Deployment**: Smart contracts on Cronos EVM for transparent agent ownership and earnings
- **MCP Integration**: Model Context Protocol server for Web3 capabilities (DeFi, wallet management, bridging)

### The Problem We Solve

1. **Agent Monetization**: No easy way for creators to monetize AI agent interactions
2. **Payment Friction**: Traditional payment systems are too slow for agent-to-agent or user-to-agent microtransactions
3. **Trust & Transparency**: Centralized AI services lack transparency in payments and earnings distribution
4. **Web3 Accessibility**: Complex barrier for AI agents to interact with blockchain and DeFi protocols

### Our Solution

Bazaar provides a complete platform where:

- **Creators** can deploy AI agents as NFT-like smart contracts with custom capabilities
- **Users** interact with agents through natural language, paying per interaction via x402
- **Agents** autonomously execute Web3 actions (swaps, transfers, DeFi) through our MCP server
- **Payments** flow automatically from users to agents to creators with full transparency

---

## ✨ Key Features

### 1. **AI Agent Factory**

- Deploy custom AI agents as individual smart contracts on Cronos EVM
- Each agent has unique metadata (name, description, image, system prompt)
- Agents have their own wallets and can execute on-chain transactions
- Creator ownership and earnings tracking built into smart contracts

### 2. **x402 Payment Integration**

- HTTP 402 (Payment Required) standard implementation
- Automatic micropayment requests when users interact with agents
- EIP-3009 token transfer authorization (gasless payments)
- MetaMask integration for seamless user payments
- Real-time payment settlement on Cronos EVM

### 3. **XMind MCP Server**

An intelligent Web3 assistant running as a Model Context Protocol (MCP) server on Cloudflare Workers:

- **DeFi Operations**: Query liquidity pools (VVS, H2), token balances, farm details
- **Wallet Management**: Balance checking, token transfers (TCRO, USDCe)
- **Cronos ID Resolution**: ENS-like name resolution for Cronos addresses
- **Cross-Chain Bridging**: LiFi integration for best bridge routes across chains
- **Transaction Management**: Query transaction status, smart contract ABIs, simulation
- **x402 Payment Handling**: Create payment headers, verify settlements, process 402 flows

### 4. **Complete User Dashboard**

- View all your created agents and their performance metrics
- Track earnings from agent interactions
- Monitor task completion and usage statistics
- Manage agent status (active/inactive)
- View interaction history

### 5. **Agent Templates**

Pre-built agent templates for common use cases:

- Trading Assistant
- DeFi Portfolio Manager
- NFT Collector
- Bridge & Swap Assistant
- Wallet Security Guard
- And more...

### 6. **Natural Language Chat Interface**

- Intuitive chat interface for interacting with agents
- Real-time responses powered by AI
- Automatic x402 payment prompts when needed
- Message history and context preservation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  - Agent Creation UI                                         │
│  - Chat Interface                                            │
│  - Dashboard & Analytics                                     │
│  - x402 Payment Flow Handler                                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├──────────────┬─────────────────────────────┐
                  │              │                             │
         ┌────────▼──────┐  ┌───▼─────────┐        ┌─────────▼────────┐
         │  Smart         │  │  Backend    │        │   XMind MCP      │
         │  Contracts     │  │  API        │        │   Server         │
         │  (Cronos EVM)  │  │  Routes     │        │  (Cloudflare)    │
         │                │  │             │        │                  │
         │ - AgentFactory │  │ - Chat API  │        │ - DeFi Tools     │
         │ - Agent        │  │ - x402 API  │        │ - Wallet Tools   │
         │ - Ownable      │  │ - Templates │        │ - Bridge Tools   │
         │ - ReentrancyG. │  │ - Auth      │        │ - x402 Helpers   │
         └────────────────┘  └─────────────┘        └──────────────────┘
                  │                  │                        │
                  └──────────────────┴────────────────────────┘
                                     │
                              ┌──────▼──────┐
                              │  Database   │
                              │  (MongoDB)  │
                              │             │
                              │ - Users     │
                              │ - Agents    │
                              │ - Chats     │
                              │ - Tasks     │
                              └─────────────┘
```

### Component Breakdown

#### **Frontend (`/frontend`)**

- **Next.js 15** with App Router and TypeScript
- **Thirdweb SDK** for wallet connection and blockchain interactions
- **Custom Hooks**: `useX402`, `useAgentChat`, `useCreateWallet`, `useDeployContract`
- **UI Components**: Built with Tailwind CSS and shadcn/ui
- **Authentication**: Wallet-based auth with NextAuth

#### **Smart Contracts (`/contracts`)**

- **Solidity 0.8.20** with OpenZeppelin libraries
- **AgentFactory.sol**: Factory pattern for deploying agents with deployment fees
- **Agent.sol**: Individual agent contracts with metadata, earnings, and task tracking
- **Hardhat** for development, testing, and deployment

#### **MCP Server (`/xmind-mcp`)**

- **TypeScript** running on Cloudflare Workers
- **Model Context Protocol** for AI agent tool integration
- **Crypto.com Developer Platform SDK** for Cronos interactions
- **LiFi SDK** for cross-chain bridge routing
- **30+ Tools** for comprehensive Web3 functionality

---

## 🛠️ Tech Stack

### Frontend

- Next.js 15.1.4 (App Router)
- React 19
- TypeScript
- Thirdweb SDK
- Tailwind CSS
- shadcn/ui
- Ethers.js v6
- Axios
- Zod (validation)

### Smart Contracts

- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- Ethers.js

### Backend/API

- Next.js API Routes
- MongoDB with Mongoose
- NextAuth.js
- bcryptjs

### MCP Server

- TypeScript
- Cloudflare Workers
- @modelcontextprotocol/sdk
- @crypto.com/developer-platform-client
- @lifi/sdk
- Zod

### Blockchain

- Cronos EVM Testnet
- Cronos EVM Mainnet
- ERC-20 Token Standard (USDC.e)
- EIP-3009 (TransferWithAuthorization)

---

## 🔄 How It Works

### 1. **Agent Creation & Deployment**

```typescript
// User creates agent via UI
1. Connect wallet with Thirdweb
2. Fill agent details (name, description, system prompt, template)
3. Generate agent wallet (private key encrypted and stored)
4. Frontend calls AgentFactory.deployAgent()
5. Pay deployment fee (2 CRO on testnet)
6. Smart contract deploys new Agent contract
7. Agent metadata stored on-chain + database
```

### 2. **x402 Payment Flow**

```typescript
// When user sends message to agent
1. User sends chat message to agent
2. Backend/Agent determines if payment required
3. Returns HTTP 402 with payment requirements:
   {
     scheme: "eip3009",
     network: "cronos-testnet",
     payTo: "0x...",  // Agent wallet
     asset: "0x...",   // USDC.e token
     maxAmountRequired: "1000000", // 1 USDC
     maxTimeoutSeconds: 300
   }
4. Frontend detects 402, triggers useX402 hook
5. User signs EIP-3009 authorization in MetaMask
6. Frontend sends payment header in X-PAYMENT
7. Backend verifies signature and settles payment
8. Agent processes request and responds
9. Earnings recorded on Agent contract
```

### 3. **Agent Interaction with MCP Server**

```typescript
// Agent uses MCP tools via backend
1. User: "Swap 10 USDC for CRO on VVS"
2. Agent parses intent using AI
3. Backend calls XMind MCP server tools:
   - get_available_pools("vvs")
   - check_if_token_whitelisted()
   - get_chain_token_by_symbol("CRO")
4. MCP executes swap via agent wallet
5. Returns transaction hash
6. Agent responds with confirmation
7. Task recorded on-chain (tasksCompleted++)
```

### 4. **Earnings & Withdrawals**

```solidity
// Creator withdraws earnings
1. Agent smart contract tracks totalEarnings
2. Creator calls agent.withdrawEarnings()
3. Contract transfers accumulated funds
4. ReentrancyGuard prevents exploits
5. Event emitted for transparency
```

---

## 🏆 Hackathon Tracks

### ✅ **Main Track - x402 Applications**

- ✅ AI agents with agent-triggered payments
- ✅ AI-driven contract interactions (AgentFactory deployment)
- ✅ Automated treasury logic (earnings distribution)
- ✅ Consumer app with embedded x402 flows

### ✅ **x402 Agentic Finance/Payment Track**

- ✅ Automated settlement pipelines (payment → verification → settlement)
- ✅ Multi-step x402 automation (payment auth + execution)
- ✅ EIP-3009 integration for gasless payments

### ✅ **Crypto.com X Cronos Ecosystem Integration**

- ✅ Crypto.com Developer Platform SDK integration
- ✅ Cronos EVM smart contract deployment
- ✅ VVS Finance integration (DEX queries and swaps)
- ✅ Delphi Prediction Markets support (MCP tools)
- ✅ Cronos ID resolution (ENS-like addressing)

### ✅ **Dev Tooling & Data Virtualization Track**

- ✅ XMind MCP Server - comprehensive Web3 tool suite for AI agents
- ✅ 30+ tools for DeFi, wallet management, bridging, x402
- ✅ Agent runtime orchestration
- ✅ MCP-compatible developer tools
- ✅ Data virtualization layer for blockchain data

---

## 📦 Installation

### Prerequisites

- Node.js >= 18
- npm or yarn or pnpm
- MetaMask wallet
- Git

### 1. Clone Repository

```bash
git clone https://github.com/divin3circle/bazaar.git
cd bazaar
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Contract Dependencies

```bash
cd ../contracts
npm install
```

### 4. Install MCP Server Dependencies

```bash
cd ../xmind-mcp
npm install
```

### 5. Environment Variables

#### Frontend (`.env.local`)

```env
# Blockchain
NEXT_PUBLIC_CHAIN_ID=338
NEXT_PUBLIC_RPC_URL=https://evm-t3.cronos.org
NEXT_PUBLIC_AGENT_FACTORY_ADDRESS=0x...

# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id

# Payment
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x... # USDC.e
SELLER_WALLET_PRIVATE_KEY=0x...

# Database
MONGODB_URI=mongodb://...

# Auth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# AI (optional)
OPENAI_API_KEY=sk-...
```

#### Contracts (`.env`)

```env
CRONOS_TESTNET_RPC_URL=https://evm-t3.cronos.org
PRIVATE_KEY=0x...
CRONOSCAN_API_KEY=your_api_key
```

#### MCP Server (`.dev.vars`)

```env
CRYPTO_COM_API_KEY=your_api_key
PRIVATE_KEY=0x...
LIFI_API_KEY=your_lifi_key
```

---

## 🚀 Deployment

### Deploy Smart Contracts to Cronos Testnet

```bash
cd contracts
npx hardhat run scripts/deploy.js --network cronosTestnet
```

This deploys:

- `AgentFactory.sol` with 2 CRO deployment fee
- Prints contract address (update frontend `.env`)

### Run Frontend Development Server

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

### Deploy MCP Server to Cloudflare Workers

```bash
cd xmind-mcp
npm run deploy
```

MCP server will be available at: `https://xmind-mcp.your-account.workers.dev`

### Production Deployment

#### Frontend (Vercel)

```bash
# Push to GitHub
git push origin main

# Deploy on Vercel
vercel --prod
```

#### Contracts (Cronos Mainnet)

```bash
# Update hardhat.config.js with mainnet RPC
npx hardhat run scripts/deploy.js --network cronosMainnet
```

---

## 🎥 Demo Video

[📹 **Watch Demo Video**](#) _(Add your demo video link here)_

### Demo Highlights:

1. **Agent Creation**: Create custom AI agent with system prompt
2. **On-Chain Deployment**: Deploy agent contract to Cronos testnet
3. **x402 Payment Flow**: User interaction triggers payment prompt
4. **Agent Response**: Agent processes payment and provides service
5. **MCP Integration**: Agent uses Web3 tools (swap, transfer, query)
6. **Dashboard**: View earnings, tasks, and analytics

---

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

Tests cover:

- Agent deployment via factory
- Payment and earnings tracking
- Task completion recording
- Withdrawal functionality
- Access control

### Frontend (Manual Testing)

1. Create agent → Verify on-chain deployment
2. Chat with agent → Test x402 payment flow
3. Execute DeFi action → Verify MCP tool execution
4. Check dashboard → Confirm earnings update

---

## 📊 Project Statistics

- **Smart Contracts**: 2 (AgentFactory, Agent)
- **Frontend Pages**: 12+
- **API Routes**: 8+
- **MCP Tools**: 30+
- **Custom Hooks**: 7
- **UI Components**: 30+

---

## 🔐 Security Features

1. **OpenZeppelin Contracts**: Battle-tested security patterns
2. **ReentrancyGuard**: Prevents reentrancy attacks
3. **Ownable**: Access control for sensitive functions
4. **EIP-3009 Signatures**: Secure gasless payments
5. **Payment Verification**: Signature validation before settlement
6. **Private Key Encryption**: Agent wallets encrypted in database
7. **Rate Limiting**: API route protection (coming soon)

---

## 🛣️ Roadmap

### Phase 1: Hackathon MVP ✅

- [x] Smart contract deployment
- [x] Frontend UI
- [x] x402 payment integration
- [x] MCP server with 30+ tools
- [x] Agent creation and chat

### Phase 2: Post-Hackathon

- [ ] Agent marketplace with discovery
- [ ] Agent-to-agent communication
- [ ] Multi-model support (Claude, GPT-4, Llama)
- [ ] Enhanced analytics dashboard
- [ ] Agent reputation system
- [ ] Mobile app (React Native)

### Phase 3: Advanced Features

- [ ] DAO governance for platform
- [ ] Agent staking and rewards
- [ ] Cross-chain agent deployment
- [ ] Agent skills marketplace
- [ ] Enterprise API access
- [ ] White-label solutions

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ for Cronos x402 Paytech Hackathon 2026

- **Project Lead**: [Your Name]
- **Smart Contract Developer**: [Your Name]
- **Frontend Developer**: [Your Name]
- **MCP Server Developer**: [Your Name]

---

## 🙏 Acknowledgments

- **Cronos Labs** for the x402 Facilitator SDK and developer resources
- **Crypto.com** for the Developer Platform SDK and AI Agent SDK
- **OpenZeppelin** for secure smart contract libraries
- **Thirdweb** for seamless wallet integration
- **LiFi** for cross-chain bridge routing
- **Cloudflare** for MCP server hosting

---

## 📞 Contact & Links

- **Website**: [Your deployed website]
- **GitHub**: https://github.com/divin3circle/bazaar
- **Twitter**: [@your_handle]
- **Demo Video**: [YouTube link]
- **Documentation**: [Notion/GitBook link]

---

## 🎯 Why Bazaar Will Win

1. **Complete x402 Implementation**: Full HTTP 402 flow with EIP-3009 integration
2. **Multiple Track Coverage**: Qualifies for Main, Agentic Finance, Ecosystem Integration, and Dev Tooling tracks
3. **Production Ready**: Deployed on Cronos testnet with functional prototype
4. **Innovation**: First AI agent marketplace with embedded x402 payments
5. **Ecosystem Integration**: Deep integration with Crypto.com SDK, VVS, Delphi, Cronos ID
6. **Developer Impact**: XMind MCP server enables other builders to create x402 agents
7. **Real World Use**: Solves actual problems in agent monetization and Web3 accessibility
8. **Scalable Architecture**: Built to handle thousands of agents and transactions
9. **Security First**: Professional smart contracts with comprehensive testing
10. **User Experience**: Intuitive UI that makes crypto payments feel seamless

---

**Built for the future of AI-powered payments on Cronos EVM** 🚀
