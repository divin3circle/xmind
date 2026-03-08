# XMind Capital: AI-Driven DeFi Vaults (Avalanche)

XMind Capital is a professional smart contract infrastructure for deploying AI-managed investment vaults on the Avalanche blockchain. It leverages the ERC-4626 standard and on-chain risk guardrails to enable AI agents to manage user capital securely across DEXs, bridges, and lending protocols.

## 🏗️ Architecture Overview

The system is designed to bridge the gap between off-chain AI strategy and on-chain capital security.

```mermaid
graph TD
    User((User)) -->|Deposit mUSDC| Vault[AgentVault ERC-4626]
    Vault -->|Mint Shares| User
    
    AI[Chainlink CRE / Gemini] -->|Sign Trade Payload| CRE[CREIntegration]
    CRE -->|Verify EIP-191 Signature| Vault
    
    Vault -->|Validate Risk| Risk[RiskValidator Lib]
    Risk -->|Enforce 60% Cap| Vault
    
    Vault -->|Execute SWAP| Router[MockDeFiRouter / TraderJoe]
    Vault -->|Execute BRIDGE| Router
    Vault -->|Execute LEND| Router
    
    Vault -->|Distribute Fees| Treasury[PlatformTreasury]
```

## 📋 Core Components

### 1. `AgentVault.sol` (ERC-4626)
The heart of the system. Each vault represents a specific AI strategy.
- **NAV Tracking**: Calculates Net Asset Value (NAV) by summing idle cash and active investments.
- **Action Suite**: Routes `SWAP`, `BRIDGE`, and `POOL` actions.
- **Fee Management**: Automatically distributes performance fees to the platform treasury.

### 2. `VaultFactory.sol`
Enables the rapid deployment of new AI strategy vaults.
- Maintains a registry of all deployed vaults.
- Standardizes protocol router addresses across all agents.

### 3. `RiskValidator.sol` (Library)
A stateless guardrail that protects user capital from aggressive AI behavior.
- **Risk Profiles**: Enforces Conservative, Balanced, or Aggressive limits.
- **40% Liquidity Buffer**: Strictly prevents the AI from investing more than 60% of the vault's assets, ensuring liquidity for immediate withdrawals.

### 4. `CREIntegration.sol`
The secure gateway for AI instructions.
- Uses strict EIP-191 signature verification (`recover`) to ensure only the authorized AI signer (the Chainlink DON) can trigger trades.
- Prevents replay attacks using an incrementing nonce mapping.

### 5. `MockDeFiRouter.sol` & Tokens (Testnet Simulation)
Since full DEX liqudity isn't always reliable on testnets, we simulate execution safely on Fuji.
- Simulates SWAP logic (Burns mUSDC, unconditionally mints output mWAVAX/mWETH 1:1).
- Supports mock bridging and simulated yield harvesting (mints 2% APY on deposits).

## 🚀 Getting Started

### Installation
```bash
cd contracts
npm install
```

### Compilation
```bash
npx hardhat compile
```

### Deployment (Avalanche Fuji)
1. Configure your `.env` with `PRIVATE_KEY` and `SNOWTRACE_API_KEY`.
2. Run the deployment script to deploy the Mocks and the Factory:
```bash
npx hardhat run scripts/deploy-testnet-mocks.js --network avalancheFuji
```

## 🧪 Safety Features

- **Net Asset Value (NAV)**: Shares are always priced based on the total portfolio value (Cash + Active Trades).
- **Hard Liquidity Cap**: 40% of every deposit is kept as idle mUSDC by default to satisfy user withdrawals.
- **Signature Auth**: No one, not even the owner, can execute a trade without a valid AI-signed instruction verified by `CREIntegration`.

## 📁 Project Structure
- `contracts/`: Core Solidity logic (`AgentVault`, `CREIntegration`, `RiskValidator`).
- `scripts/`: Deployment and interaction scripts.
- `test/`: Comprehensive unit tests for withdrawals, risk, and integration.
