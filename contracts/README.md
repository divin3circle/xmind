# XMind AI Agent Smart Contracts

Professional smart contracts for deploying and managing AI agents on the Cronos blockchain.

## 📋 Overview

This project contains two main smart contracts:

- **Agent.sol**: Individual AI agent contract with metadata storage and task management
- **AgentFactory.sol**: Factory contract for deploying and tracking AI agents

## 🏗️ Architecture

### Agent Contract

Each agent is a separate smart contract that stores:

- Agent metadata (name, description, image, system prompt)
- Wallet addresses (agent wallet, creator address)
- Task statistics (completed tasks, ran tasks)
- Payment tracking and earnings management
- Active/inactive status

### AgentFactory Contract

The factory manages agent deployment:

- Deploys new Agent contracts with a deployment fee
- Tracks all deployed agents
- Maps creators to their agents
- Handles fee collection and withdrawal

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn

### Installation

```bash
cd contracts
npm install
```

### Configuration

1. Create a `.env` file (already created with your private key):

```bash
PRIVATE_KEY=your_private_key_here
CRONOSCAN_API_KEY=optional_for_verification
```

2. Network configuration is already set up for:
   - Cronos Testnet (default)
   - Cronos Mainnet

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

## 📦 Compilation

Compile the contracts:

```bash
npm run compile
```

## 🚢 Deployment

### Deploy to Cronos Testnet

```bash
npm run deploy:testnet
```

### Deploy to Cronos Mainnet

```bash
npm run deploy:mainnet
```

### After Deployment

The deployment script will output:

- Factory contract address
- Deployment fee
- Verification command

Save the factory address for frontend integration!

## 🔍 Contract Verification

After deployment, verify your contracts on Cronoscan:

```bash
npx hardhat verify --network cronosTestnet <FACTORY_ADDRESS> "2000000000000000000"
```

## 💻 Usage Examples

### Deploy an Agent

```javascript
const factory = await ethers.getContractAt("AgentFactory", FACTORY_ADDRESS);

const tx = await factory.deployAgent(
  "Trading Assistant",
  "AI-powered trading agent",
  "ipfs://QmImageHash",
  "You are a helpful trading assistant",
  agentWalletAddress,
  { value: ethers.parseEther("2.0") }, // 2 CRO deployment fee
);

await tx.wait();
```

### Interact with an Agent

```javascript
const agent = await ethers.getContractAt("Agent", agentAddress);

// Get agent info
const info = await agent.getAgentInfo();

// Record task completion
await agent.recordTaskCompleted(taskId);

// Update agent details
await agent.updateAgentInfo("New Name", "New Description", "new-image.png");

// Withdraw earnings
await agent.withdrawEarnings(ethers.parseEther("1.0"));
```

### Query Agents

```javascript
// Get all agents
const allAgents = await factory.getAllAgents();

// Get agents by creator
const myAgents = await factory.getAgentsByCreator(creatorAddress);

// Get paginated agents
const agents = await factory.getAgentsPaginated(0, 10);
```

## 📁 Project Structure

```
contracts/
├── contracts/
│   ├── Agent.sol              # Individual agent contract
│   └── AgentFactory.sol       # Factory contract
├── test/
│   ├── Agent.test.js          # Agent contract tests
│   └── AgentFactory.test.js   # Factory contract tests
├── scripts/
│   ├── deploy.js              # Deployment script
│   └── interact.js            # Interaction examples
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Dependencies
└── .env                       # Environment variables
```

## 🔒 Security Features

- **OpenZeppelin Contracts**: Uses audited, battle-tested libraries
- **Ownable**: Only creators can modify their agents
- **ReentrancyGuard**: Protects against reentrancy attacks
- **Input Validation**: Comprehensive validation on all inputs
- **Access Control**: Proper permission checks throughout

## 💡 Key Features

### Agent Contract

- ✅ Store agent metadata and system prompts
- ✅ Track task execution and completion
- ✅ Receive and manage payments
- ✅ Toggle active/inactive status
- ✅ Withdraw earnings securely
- ✅ Full ownership control

### AgentFactory Contract

- ✅ Deploy new agents with deployment fee
- ✅ Track all deployed agents
- ✅ Map creators to their agents
- ✅ Paginated agent queries
- ✅ Fee management and withdrawal
- ✅ Configurable deployment fee

## 🌐 Network Information

### Cronos Testnet

- RPC: https://evm-t3.cronos.org
- Chain ID: 338
- Explorer: https://testnet.cronoscan.com
- Faucet: https://cronos.org/faucet

### Cronos Mainnet

- RPC: https://evm.cronos.org
- Chain ID: 25
- Explorer: https://cronoscan.com

## 📊 Gas Optimization

Contracts are optimized for gas efficiency:

- Efficient storage patterns
- Minimal external calls
- Batch operations where possible
- Compiler optimizations enabled

## 🤝 Integration Guide

### Frontend Integration

1. Install ethers.js:

```bash
npm install ethers
```

2. Connect to factory:

```javascript
import { ethers } from "ethers";
import AgentFactoryABI from "./AgentFactory.json";

const provider = new ethers.BrowserProvider(window.ethereum);
const factory = new ethers.Contract(FACTORY_ADDRESS, AgentFactoryABI, provider);
```

3. Deploy agent from frontend:

```javascript
const signer = await provider.getSigner();
const factoryWithSigner = factory.connect(signer);

const tx = await factoryWithSigner.deployAgent(
  name,
  description,
  image,
  systemPrompt,
  walletAddress,
  { value: ethers.parseEther("2.0") },
);

const receipt = await tx.wait();
```

## 📝 License

MIT License - feel free to use in your projects!

## 🐛 Troubleshooting

### Common Issues

1. **"Insufficient deployment fee"**

   - Ensure you're sending at least 2 CRO with deployment

2. **"Agent does not exist"**

   - Verify the agent address is correct
   - Check the agent was actually deployed

3. **"Insufficient balance"**
   - Ensure your wallet has enough TCRO for gas + deployment fee

## 📞 Support

For issues or questions:

1. Check the test files for usage examples
2. Review the contract comments and documentation
3. Ensure your environment is properly configured

## 🎯 Next Steps

After deployment:

1. Save the factory address
2. Update your frontend with the address
3. Test agent deployment on testnet
4. Verify contracts on Cronoscan
5. Deploy to mainnet when ready

---

Built with ❤️ for the xMind AI Agent Platform
