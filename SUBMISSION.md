# xMind — Hackathon Submission

## Inspiration

AI agents are powerful, but creators still struggle to monetize usage in a way that feels native to agents and fast enough for micro-interactions. Traditional payment rails aren’t built for pay-per-action experiences, and centralized services obscure how funds flow. We wanted a transparent, programmable way for agents to charge for services on the fly—so users pay only when value is delivered—using Web3-native primitives and the x402 standard.

## What it does

xMind is a decentralized marketplace where creators launch AI agents as on-chain entities and earn from user interactions via x402 micropayments.
- Users chat with agents in a natural UI; when an agent needs a paid capability, it triggers an HTTP 402 Payment Required flow.
- Payments settle via EIP-3009 (gasless authorization) using USDC.e on the blockchain; earnings accrue on the agent and are fully transparent.
- Agents can perform DeFi, wallet, bridging, and other Web3 actions through our MCP server (30+ tools).
- A dashboard shows agent performance: tasks, earnings, histories, and live balances across agents.

## How we built it
- Gemini 2.5 Flash model acts as the foundation of the agenst on xMind
- Frontend: Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Thirdweb SDK for wallet connection and chain reads.
- Smart Contracts: Solidity (AgentFactory + Agent) on Cronos EVM with OpenZeppelin patterns (Ownable, ReentrancyGuard). Hardhat for deploy/test.
- Payments: x402 facilitator integration using EIP-3009 TransferWithAuthorization and EIP-712 domain from USDC.e; automatic header generation and settlement verification.
- Backend/API: Next.js routes with MongoDB/Mongoose for agents, chats, and analytics.
- MCP Server: Cloudflare Workers + Model Context Protocol, integrating Crypto.com Developer Platform SDK and LiFi SDK for DeFi, wallet, and cross-chain tooling.

## Challenges we ran into

- Database connectivity: Mongoose buffering/server selection timeouts due to missing connection calls, SRV/DNS issues, and URI encoding pitfalls (special characters in passwords).
- x402 correctness: Normalizing network values, preserving facilitator payment schemes, resolving payTo/address formatting, and ensuring EIP-712 domain/version matched USDC.e for valid EIP-3009 signatures.
- Tooling integration: Aligning agent prompts and backend MCP tools to reuse payment headers and minimize user friction.
- Build/runtime ergonomics: Path alias resolution for scripts and seed data across environments.

## Accomplishments that we're proud of

- End-to-end paygated agent interactions with transparent earnings on the blockchain
- A robust MCP server exposing 30+ Web3 tools (DeFi, wallet, bridge, x402 helpers).
- Clean agent UX: creation, deployment, live details, earnings aggregation across agents.
- A simplified, reliable x402 header generation flow with automatic requirement fetching and signature validation.
- Clear product narrative and onboarding via the README and app UI.

## What we learned

- Practical nuances of EIP-3009/EIP-712 signatures and domain separation in production token contracts.
- Designing agentic payment flows: when to request payment, how to minimize retries, and how to reuse authorization safely.
- Operational realities of MongoDB in cloud environments (SRV/DNS, IP allowlisting, connection reuse).
- How MCP can make agents truly capable by abstracting Web3 functionality behind safe, composable tools.

## What's next for xMind

- Marketplace discovery and agent reputation to help users find trustworthy, high-value agents.
- Agent-to-agent communication and multi-agent orchestration.
- Google's Gemini Multi-model support with pluggable system prompts and capabilities.
- Enhanced analytics: deeper earnings insights, cohort analysis, and performance tuning.
- Security hardening: at-rest encryption for agent keys, rate limiting, and granular permissions.
- Mainnet deployment, mobile client, DAO governance, staking/rewards, and cross-chain agent deployment.
