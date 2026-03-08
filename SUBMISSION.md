# XMind Capital AI Terminal — Hackathon Submission

## 💡 Inspiration
Building on-chain AI traders is terrifying. Smart contracts are blind to shifting market sentiment, and AI agents famously hallucinate and disrespect capital constraints. We wanted to build a secure bridge — holding AI logic back with hard cryptographic guarantees before it ever touches user capital.

## 🚀 What it does
XMind Capital AI Terminal is an intelligent portfolio manager where AI autonomously manages ERC-4626 standard DeFi vaults. 

Instead of risking the entire vault, the system enforces strict liquidity guardrails on-chain. The AI runs securely inside a **Chainlink Custom Runtime Environment (CRE)** workflow, pulls live market data via a **Model Context Protocol (MCP)** server, and makes trading decisions. 

Crucially, it does not execute these trades directly. Instead, the MCP server compiles the AI's intent into a deterministic, **EIP-191 signed instruction**. This signed instruction is then cryptographically verified by our smart contracts on the **Avalanche Fuji** testnet before altering the vault's assets.

## 🛠️ How we built it
- **AI & Automation Layer**: Chainlink CRE workflow simulator orchestrating Gemini 1.5 Flash.
- **Tools Layer (MCP Server)**: A custom Cloudflare Worker acting as the AI's "Bloomberg Terminal," fetching real-time Avalanche Fuji context (Vault State, Market Prices, Risk Metrics).
- **Blockchain Layer (Avalanche)**: Solidity smart contracts (`AgentVault`, `CREIntegration`, `RiskValidator`, `VaultFactory`) deployed to Avalanche Fuji testnet. We also deployed a `MockDeFiRouter` and mock tokens (`mWETH`, `mWAVAX`) to safely simulate TraderJoe/Stargate interactions.
- **Frontend Dashboard**: A robust Next.js App Router interface to track vault performance, deploy new agents, and monitor the AI's semantic reasoning alongside its cryptographic audit logs.

## ⚠️ Challenges we ran into
- **Chainlink CRE Execution Constraints**: The CRE execution simulator has a strict 5-call HTTP limit on fetch nodes. We initially blew past this gathering context. We resolved it by aggregating Vault State, Market Conditions, and Risk Analysis into a single `get_full_context` MCP endpoint, freeing up HTTP budget for the final `compile_vault_instruction` signing step.
- **Ethers v6 Serialization**: Ethers v6 strictly returns `BigInt` for contract calls. This caused JSON serialization crashes when passing vault data to Gemini in the CRE workflow. We built a sanitization layer in the MCP tools to ensure safe numeric casting before formatting prompts.
- **EIP-191 Off-chain vs On-chain**: Debugging deterministic EVM payload signing in TypeScript against strict `keccak256` hashing on-chain (`CREIntegration.sol`) required precise ABI alignment.

## 🏆 Accomplishments that we're proud of
- Successfully architecting a closed-loop **"Think -> Sign -> Verify -> Execute"** pipeline. The AI doesn't just suggest trades; it generates mathematically verifiable payloads.
- Building a stateless `RiskValidator` library that structurally prevents the AI from investing more than 60% of a vault's assets, enforcing a hard 40% liquidity buffer for user withdrawals regardless of the AI's aggression.
- Integrating MCP seamlessly with Chainlink CRE workflows, proving that decentralized agents can be augmented with real-time tool use.

## 🔮 What's next for XMind Capital
- **Mainnet Deployment**: Migrating from the `MockDeFiRouter` to live Trader Joe and Stargate contracts on Avalanche Mainnet.
- **Multi-Agent Orchestration**: Introducing specialized risk-agents that counter-sign trades proposed by trader-agents.
- **Full Chainlink DON Deployment**: Moving from the simulated `cre workflow` environment to a live Decentralized Oracle Network.
