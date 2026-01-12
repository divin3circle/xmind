# Cronos Agent Bazaar – Overview

**Project Name:** Cronos Agent Bazaar  
**Focus Areas:** Agent-triggered payments, AI-driven contract interactions, automated treasury/routing logic

## Overview

Cronos Agent Bazaar is a decentralized AI agent marketplace built on Cronos EVM, where users post crypto-native tasks (e.g., "Analyze current CRO market trends and suggest a trade") in natural language, and specialized AI agents compete to complete them. Payments are handled securely through x402-powered escrow smart contracts, ensuring trustless execution: funds are locked only after agent selection, partial releases occur on milestones, and full payment is triggered upon verified completion. The system leverages the Crypto.com AI Agent SDK for intent parsing and on-chain operations, combined with real-time market data from Crypto.com MCP Server and interactions with Cronos dApps (e.g., VVS Finance swaps, Delphi predictions).

This project solves key Web3 problems: enabling reliable, pay-per-task AI services without intermediaries, reducing scam risks in agent economies, and providing gas-efficient programmatic payments via x402. It delivers a polished, consumer-friendly experience with a modern frontend, on-chain reputation for agent trust, and automated workflows that demonstrate true agentic functionality. The prototype is designed for Cronos Testnet with easy extensibility to Mainnet, showcasing strong potential for ecosystem growth and long-term development.

## High-Level Architecture

```
User (Frontend)
     ↓ (natural language input, wallet connect)
Backend Service (Node.js / TypeScript)
     ↓ (intent parsing & orchestration)
Crypto.com AI Agent SDK (modules: Wallet, Token, Transaction, Contract, etc.)
     ↔ (on-chain reads/writes)
Smart Contracts (Solidity)
     ↔ (x402 Facilitator for payments)
Cronos EVM (Testnet/Mainnet)
     ↔ (real-time data)
Crypto.com MCP Server & dApps (VVS, Delphi, Moonlander)
     ↑ (feedback & status)
Frontend (React/Next.js)
```

## 1. Frontend

**Purpose**  
User interface for posting tasks, browsing agents, selecting bids, monitoring progress, and viewing results.

**Key Features**

- Task creation form (natural language description + budget in USDC)
- Agent directory with reputation scores & bid previews
- Wallet connection (Crypto.com Onchain Wallet / WalletConnect)
- Real-time task dashboard (status, milestones, reports)
- Mobile-responsive design

**Tech Stack (TypeScript)**

- Framework: React.js or Next.js
- UI: Chakra UI / Tailwind CSS
- Wallet: ethers.js / viem + WalletConnect
- State: Zustand or Redux Toolkit
- Real-time: Socket.io (optional) or polling

**Interactions**

- Sends user task to backend → receives agent bids & status
- Triggers wallet approvals for x402 escrow locking
- Displays on-chain data (reputation, escrow status) fetched via SDK/backend

## 2. Smart Contracts

**Purpose**  
Provide trustless escrow, reputation tracking, and task registry on Cronos EVM.

**Main Contracts**

- **Escrow Contract**

  - Locks budget (USDC) when agent is selected
  - Supports milestone-based partial releases
  - Final release triggered by completion proof

- **Reputation Contract**

  - Stores agent success ratings & dispute history
  - Simple ERC-20 style points or mapping

- **Task Registry Contract** (optional)
  - Stores task ID, description hash, status, budget

**Tech Stack**

- Language: Solidity ^0.8.20
- Framework: Hardhat / Foundry
- Testing: Chai / Mocha
- Deployment: Hardhat scripts to Cronos Testnet

**x402 Integration**

- Uses EIP-3009 authorization for gasless ERC-20 transfers
- Facilitator client triggers transfers to/from escrow

## 3. Crypto.com AI Agent SDK (On-Chain Developer Platform Client SDK)

**Purpose**  
Parses natural language intents and executes on-chain operations with minimal boilerplate.

**Modules We Will Use**

| Module          | Purpose                             | Usage in Bazaar                                                             | Example TS Usage (inferred)                          |
| --------------- | ----------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Wallet**      | Wallet creation & balance checks    | Check user/agent balance before escrow lock                                 | `await Wallet.getBalance('user-address.cro')`        |
| **Token**       | ERC-20/NFT balances & transfers     | Handle USDC budget locking, transfers, & swaps if needed                    | `await Token.getErc20Balance(address, usdcContract)` |
| **Transaction** | Transaction status & gas estimation | Track escrow deposits/releases, confirm tx success                          | `await Transaction.getTransactionStatus('tx-hash')`  |
| **Contract**    | Fetch contract code & interact      | Interact with custom escrow/reputation contracts                            | `await Contract.getContractCode('escrow-address')`   |
| **DeFi**        | VVS/H2 farm & token data            | Enable agents to analyze/execute DeFi strategies (e.g., yield optimization) | `await Defi.getAllFarms(DefiProtocol.VVS)`           |
| **Exchange**    | Market tickers (chain-agnostic)     | Pull real-time prices for analysis tasks                                    | `await Exchange.getTickerByInstrument('CRO_USDC')`   |
| **Event**       | Smart contract event logs           | Listen for escrow release, bid acceptance, task completion events           | `await Event.getLogs('escrow-address')`              |
| **Network**     | Chain metadata (ID, info)           | Ensure correct chain (Testnet/Mainnet)                                      | `await Network.chainId()`                            |

**Backend Integration Pattern (TypeScript)**

```typescript
import {
  AiAgentSdk,
  Wallet,
  Token,
  Transaction /* etc */,
} from "@crypto.com/ai-agent-sdk";

const sdk = new AiAgentSdk({ environment: "testnet" });

// Example: Process user task intent
async function processTaskIntent(userInput: string, userAddress: string) {
  // 1. Parse natural language (LLM + SDK)
  const intent = await sdk.parseIntent(userInput);

  // 2. Validate user has enough funds
  const balance = await Wallet.getBalance(userAddress);
  if (balance < intent.budget) throw new Error("Insufficient funds");

  // 3. Lock escrow via x402 + Token module
  await Token.transferToken({
    to: escrowAddress,
    value: intent.budget,
    // x402 authorization params...
  });

  // 4. Notify agents & wait for bids
  // ...
}
```

## Overall Flow Summary

1. User posts task via frontend → backend receives natural language input
2. Backend uses AI Agent SDK + LLM to parse intent & validate (Wallet/Token modules)
3. User approves x402 authorization → funds locked in escrow contract
4. Agents bid (reputation checked via Contract module)
5. User selects agent → task execution begins
6. Agent uses SDK modules (DeFi, Exchange, Transaction) to complete work
7. Completion proof submitted → Event module detects → x402 triggers escrow release
8. Frontend shows updated status & report
