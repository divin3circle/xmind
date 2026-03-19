# XMind Capital — Litepaper

> *Version 0.9 — March 2026*

---

## Abstract

XMind Capital is an AI-native asset management protocol built on Avalanche. It enables any investor to deploy a personalised, autonomous AI vault that makes real-time trading decisions across DeFi protocols — without surrendering custody and without trusting the AI blindly. Every decision the AI makes is cryptographically signed and verified on-chain before a single token moves. The AI reasons freely. The blockchain enforces the rules. Neither layer can override the other.

---

## 1. The Problem

Giving an AI agent raw access to a DeFi wallet is one of the most dangerous things you can do in Web3. Large Language Models:

- **Hallucinate** — they confidently produce incorrect output. A hallucinated trade size could be 1,000× the intended value.
- **Lack intrinsic constraints** — nothing in a base LLM prevents it from deciding that the optimal move is to bridge 100% of a portfolio to an unaudited chain.
- **Are not accountable** — when a human-supervised trade goes wrong, there is an audit trail. When a naive AI trade goes wrong, there is nothing but a transaction hash.

Traditional approaches resolve this tension badly: either keep the AI fully human-supervised (destroying the autonomous value proposition) or grant it full wallet access and hope for the best.

**XMind Capital takes a third path.**

---

## 2. The Solution: Think → Sign → Verify → Execute

The XMind protocol separates intelligence from enforcement across two layers that are architecturally incapable of overriding each other.

```
┌─────────────────────────────────────────────┐
│  INTELLIGENCE LAYER (off-chain)             │
│  Gemini 1.5 Flash reasons about market      │
│  conditions and produces a trade decision   │
│  ↓                                          │
│  MCP Server signs the decision              │
│  with EIP-191 using the AI signer key       │
└────────────────────┬────────────────────────┘
                     │  signed payload
┌────────────────────▼────────────────────────┐
│  ENFORCEMENT LAYER (on-chain, Avalanche)    │
│  CREIntegration.sol verifies the signature  │
│  RiskValidator.sol checks trade constraints │
│  AgentVault.sol executes — or REVERTS       │
└─────────────────────────────────────────────┘
```

The AI can propose anything it wants. The blockchain only executes what is safe, signed, and within the vault's hard-coded risk parameters. There is no admin override, no backdoor, and no way for the AI to circumvent these guarantees.

### The Four Steps

| Step | What Happens | Who/What Performs It |
|---|---|---|
| **Think** | Gemini 1.5 Flash analyses vault state, live market data, and risk score to produce a `targetAllocation` decision | Google Gemini via Chainlink CRE |
| **Sign** | The MCP Server converts the AI decision into a precise on-chain instruction, hashes it, and signs it with EIP-191 | XMind MCP Server (Cloudflare Workers) |
| **Verify** | `CREIntegration.sol` calls `ecrecover()` to confirm the signature came from the authorised AI signer and checks the nonce for replay protection | Avalanche C-Chain |
| **Execute** | `AgentVault.sol` calls `RiskValidator.sol` — the trade executes only if it passes all risk constraints, otherwise the transaction reverts | Avalanche C-Chain |

---

## 3. Architecture

The system is composed of four independent layers. Each has a single, clear responsibility.

### Layer 1 — The Blockchain (Avalanche Fuji / C-Chain)

**Why Avalanche?**

- Sub-2-second finality makes AI rebalancing cycles feel responsive, not sluggish.
- Full EVM compatibility — Solidity, Hardhat, Ethers.js, zero porting cost.
- Low gas costs allow the AI to make frequent, smaller rebalancing trades without gas destroying yield.

**Core Smart Contracts:**

| Contract | Role |
|---|---|
| `AgentVault.sol` | ERC-4626 tokenized vault. Tracks NAV via `totalAssets()`. Issues and redeems shares. |
| `CREIntegration.sol` | Signature gateway. Verifies every AI instruction before touching the vault. |
| `RiskValidator.sol` | Stateless library. Enforces deployment caps, position size limits, and minimum liquidity reserves. |
| `VaultFactory.sol` | Permissionless deployer. Any user can create an isolated `AgentVault` in one transaction. |
| `MockDeFiRouter.sol` | Testnet execution simulator matching the exact interface of Trader Joe (SWAP) and Stargate (BRIDGE). |
| `PlatformTreasury.sol` | Collects protocol performance fees on each profitable cycle. |

**Why ERC-4626?** The Tokenized Vault Standard makes NAV tracking automatic. When the AI executes a trade that gains value, the share price rises for all depositors with no manual accounting.

### Layer 2 — The AI Execution Engine (Chainlink CRE)

The Chainlink Custom Runtime Environment (CRE) is the autonomous agent's heartbeat. It is a secure, off-chain sandbox for running arbitrary logic that culminates in verifiable on-chain writes.

The CRE workflow fires on a **cron trigger every 15 minutes** and executes exactly 4 HTTP calls per cycle (the CRE enforces a strict maximum of 5):

| HTTP Call | Endpoint | Purpose |
|---|---|---|
| 1 | `get_full_context()` | Fetches merged vault state + market snapshot + risk score in one request |
| 2 | Gemini 1.5 Flash API | Sends the full context as a structured prompt; receives the trade decision |
| 3 | `compile_vault_instruction()` | Compiles the AI decision into a signed, wei-denominated instruction payload |
| 4 | `logAction()` | Persists the AI reasoning text and signed payload to MongoDB |

> **The 5-call constraint and how we solved it:** A naive implementation would require 6 calls. We resolved this with a server-side aggregation pattern: `get_full_context` runs vault state reads, market feeds, and risk analysis in parallel internally and returns a single merged JSON. This freed two call slots for the compilation and logging steps.

### Layer 3 — The Intelligence Layer (XMind MCP Server on Cloudflare Workers)

The MCP (Model Context Protocol) Server is the AI's Bloomberg Terminal — a semantically self-describing tool registry that Gemini calls to understand the world and act on it.

**Why MCP?** Tools are described semantically (name, description, parameter schema). Gemini understands *what* a tool does from its description alone, without hardcoded prompt engineering for every action.

**Why Cloudflare Workers?** Edge-deployed, zero cold starts, scales automatically. Critical for a time-sensitive 15-minute cycle with a strict HTTP budget.

**Why Gemini 1.5 Flash?** A 1M-token context window for complex market reasoning, optimized for low-latency inference, and reliable structured JSON output for the `targetAllocation` block.

### Layer 4 — The Frontend (Next.js 15 App Router)

The dashboard is the user's window into what the AI is doing and why.

- **`/dashboard`** — Overview of all deployed vaults: cumulative NAV, utilisation rate, active positions.
- **`/agents/[id]`** — Per-vault audit trail: Gemini's full written reasoning for each cycle, the `targetAllocation` it produced, and the cryptographic signature of every signed instruction.
- **`/create`** — Vault creation wizard. Configures name, risk profile (Conservative / Balanced / Aggressive), and strategy mandate before deploying through `VaultFactory`.

---

## 4. The Autonomous AI Cycle

Every 15 minutes, the following sequence runs without any human intervention:

```
CRE cron fires
    │
    ▼
[Call 1] get_full_context(vaultAddress)
    │ → vault NAV, cash balance, risk profile
    │ → live market prices (AVAX, ETH, BTC)
    │ → computed risk score (VaR, safety recommendation)
    │
    ▼
[Call 2] Gemini 1.5 Flash
    │ → Receives structured prompt with full context
    │ → Reasons about market conditions and mandate
    │ → Returns written assessment + targetAllocation JSON
    │   e.g. { "AVAX": 0.10, "ETH": 0.10 }
    │
    ▼
[Call 3] compile_vault_instruction()
    │ → Calculates exact trade delta vs. current position
    │ → Computes wei-denominated amount
    │ → Generates fresh nonce (replay protection)
    │ → Creates keccak256 message hash
    │ → Signs with EIP-191 using aiSignerKey
    │ → Returns fully-formed signed payload
    │
    ▼
[Call 4] logAction() → MongoDB
    │ → Persists full AI reasoning text
    │ → Persists signed instruction payload
    │ → Visible on user dashboard immediately
    │
    ▼
submitAIInstruction(payload, signature) → Avalanche
    │
    ├─ ecrecover() — must match aiSigner ✅ or REVERT ❌
    ├─ nonce check — must be fresh ✅ or REVERT ❌
    ├─ RiskValidator.validateTrade() — must pass ✅ or REVERT ❌
    │
    └─ AgentVault.executeTrade() → MockDeFiRouter
         → Trade executed. NAV updated. Share price rises.
```

---

## 5. Risk Framework

The `RiskValidator` library is the protocol's safety backbone. It is a **stateless, immutable library** — not an upgradeable proxy. Its rules cannot be changed by the AI, the protocol team, or any admin key.

**Enforced constraints:**

| Rule | Description |
|---|---|
| **Deployment Cap** | Maximum percentage of vault NAV that can be deployed at any one time (40% conservative / 60% balanced / 80% aggressive) |
| **Position Size Limit** | No single trade can exceed the vault's configured `maxPositionSize` (default 10%) |
| **Minimum Liquidity Reserve** | The vault always retains at least 20% in idle stablecoin, guaranteeing LP redemptions without forcing the AI to unwind positions |
| **Nonce Replay Protection** | Every signed instruction includes a unique nonce. Used nonces are blacklisted on-chain. |

If any constraint is violated, the transaction **reverts entirely**. The AI cannot override this. The protocol team cannot override this.

---

## 6. User Experience

### For Depositors

1. Connect MetaMask and open the XMind Capital dashboard.
2. Click **"Deploy New Agent"** — configure a vault name, risk profile, and strategy mandate.
3. `VaultFactory.createVault()` deploys an isolated `AgentVault` to Avalanche.
4. Deposit `mUSDC` — receive vault shares representing proportional ownership.
5. The AI begins managing the vault on the next 15-minute cycle.
6. Visit the **AI Execution Logs** panel at any time to read the full reasoning behind every trade.
7. Withdraw at any time. The minimum liquidity reserve guarantees there is always idle capital for immediate redemption.

### For Strategy Curators

Curators author and publish strategy templates — a strategy mandate plus a set of target assets and risk parameters. Rather than managing their own vault, they stake their reputation on a published strategy. Every vault that adopts their template generates a **30% cut of the vault's performance fee** for the curator, indefinitely.

---

## 7. Competitive Differentiation

| Feature | XMind Capital | Yearn Finance | dHEDGE | Gauntlet |
|---|---|---|---|---|
| **AI-driven execution** | ✅ Autonomous Gemini agent | ❌ Yield optimizers, no LLM | ❌ Human fund managers | ✅ Simulation-based, not live |
| **Cryptographic AI accountability** | ✅ EIP-191 signature on every trade | ❌ None | ❌ None | ❌ None |
| **On-chain risk enforcement** | ✅ Immutable RiskValidator | ⚠️ Strategy-level only | ⚠️ Manager discretion | ✅ Simulation guardrails |
| **Non-custodial** | ✅ Full ERC-4626 custody | ✅ Yes | ✅ Yes | ❌ Advisory only |
| **Auditable AI reasoning** | ✅ Full Gemini log per cycle | ❌ No AI | ❌ No AI | ⚠️ Internal only |
| **Permissionless vault creation** | ✅ VaultFactory | ⚠️ Governance-gated | ✅ Yes | ❌ No |

**Our moat is not the AI.** Any team can call the Gemini API. Our moat is the **cryptographic accountability layer** — the `Think → Sign → Verify → Execute` primitive — which makes AI-managed capital safe enough to trust at scale. This architecture is the novel contribution, and it is the foundation on which all future product layers are built.

---

## 8. Revenue Model

XMind Capital earns only when its users earn. There are no subscription fees, no token gating, and no upfront costs.

### Primary: Performance Fee

**10% of realised profits**, collected at the vault level when the AI's cycle produces a NAV increase. The fee is split:
- **70%** → Protocol Treasury (funds development, audits, operations)
- **30%** → Strategy Curator (rewards the strategy author)

| Protocol TVL | Avg Annual Return | Annual Protocol Revenue |
|---|---|---|
| $500K | 8% | $4,000 |
| $5M | 8% | $40,000 |
| $50M | 8% | $400,000 |
| $500M | 8% | $4,000,000 |

**Break-even** is estimated at approximately **$8M TVL** (Q1 2027 target).

### Secondary Revenue Streams

| Stream | Description | Timeline |
|---|---|---|
| **Curator Marketplace Rake** | 5% of the curator's 30% performance share | At launch |
| **Institutional Vault Tier** | 15% perf fee + $500/mo retainer for DAOs and funds with >$100K TVL | Q4 2026 |
| **Protocol SDK Licensing** | License the `CREIntegration` + `RiskValidator` primitive to other protocols building agentic integrations | 2027 |

---

## 9. Roadmap

| Milestone | Target | Key Deliverables |
|---|---|---|
| **M1 — Testnet Launch** | Q1 2026 | Fuji deployment, live CRE cycle, public dashboard |
| **M2 — Security & Audit** | Q2 2026 | Formal smart contract audit, bug bounty program, EIP-712 upgrade |
| **M3 — Mainnet** | Q3 2026 | Mainnet deployment, first real-capital vaults, referral programme |
| **M4 — Multi-Strategy** | Q3 2026 | Multiple concurrent strategies per vault, Subgraph-powered NAV history |
| **M5 — Multi-Agent Consensus** | Q4 2026 | Trader + Risk Auditor + Opportunity Scout multi-agent committee |
| **M6 — Cross-Chain Vaults** | Q1–Q2 2027 | CCIP-powered cross-chain allocation (Avalanche, Ethereum, Base, Arbitrum), DAO governance for `RiskValidator` parameters |

---

## 10. Technology Stack

| Layer | Technology | Role |
|---|---|---|
| **Blockchain** | Avalanche C-Chain (EVM) | Smart contract execution, NAV settlement |
| **Smart Contracts** | Solidity + Hardhat + OpenZeppelin | Vault, risk, signature, factory |
| **AI Execution** | Chainlink CRE (Custom Runtime Environment) | Secure, attested off-chain agent orchestration |
| **AI Model** | Google Gemini 1.5 Flash | Market reasoning and trade decision generation |
| **Tool Interface** | Model Context Protocol (MCP) | Standardised, semantically self-describing AI tool registry |
| **MCP Host** | Cloudflare Workers | Edge-deployed, zero cold-start serverless execution |
| **Frontend** | Next.js 15 (App Router) + TypeScript | Dashboard, audit log, vault creation wizard |
| **Database** | MongoDB | AI reasoning logs and signed instruction history |
| **Signing** | EIP-191 (→ EIP-712 roadmap) | Cryptographic instruction authentication |

---

## 11. Vision

> *The most profound shift in finance over the next decade will not be a new financial instrument — it will be agency. The question will shift from "what should I buy?" to "which AI can I trust to buy it for me?"*

XMind Capital is building the **trust infrastructure for that shift**.

By constructing the cryptographic accountability layer first — before AUM — we ensure that when capital migrates to AI-managed strategies, the rails it runs on are safe.

**We are not building a better robo-advisor. We are building the operating system for autonomous on-chain wealth management.**

**Three-year targets:**

| Year | Where We'll Be |
|---|---|
| **2026** | Mainnet launch · Multi-strategy vaults · 3 supported chains |
| **2027** | Multi-agent consensus model · DAO governance for risk rails · Protocol SDK |
| **2028** | Institutional-grade vault primitives · Cross-chain settlement · $500M+ AUM target |

---

## 12. Deployed Addresses (Avalanche Fuji Testnet)

> *Mainnet addresses will be published following the Q2 2026 security audit.*

| Contract | Address |
|---|---|
| `VaultFactory` | `0x...` (see README for latest) |
| `AgentVault` (example) | `0x...` |
| `CREIntegration` | `0x...` |
| `RiskValidator` | *(library — no standalone address)* |
| `MockDeFiRouter` | `0x...` |
| `mUSDC` | `0x...` |

Full deployment details and testnet interaction guide: [github.com/divin3circle/xmind](https://github.com/divin3circle/xmind)

---

## 13. Team

XMind Capital was built by a team of full-stack developers, DeFi engineers, and AI practitioners competing in the Hedera Hackathon's DeFi track.

---

## Appendix: Key Design Decisions

| Decision | Alternative Considered | Why We Chose This |
|---|---|---|
| ERC-4626 vault standard | Custom accounting | Automatic NAV via `totalAssets()` override; composable with all future DeFi integrations |
| Stateless `RiskValidator` library | Upgradeable proxy contract | Libraries have no state to manipulate; risk rules are immutable by design |
| `get_full_context` aggregation | 3 separate MCP endpoints | Required to stay within the 5 HTTP call limit imposed by Chainlink CRE |
| MCP as tool interface | Custom REST API | MCP is semantically self-describing; Gemini understands tool purpose from the description alone |
| EIP-191 signing | EIP-712 typed data | Simpler integration for MVP; EIP-712 is the explicit upgrade path |
| MongoDB for AI logs | PostgreSQL | AI reasoning text is variable-length and unstructured; document store avoids schema migrations |
| Cloudflare Workers for MCP | AWS Lambda / Express | Zero cold starts, edge-deployed, `wrangler dev` mirrors production exactly |
| MockDeFiRouter matching real interfaces | Stub out execution | Real interfaces → zero smart contract changes when upgrading to mainnet DEX protocols |

---

*© 2026 XMind Capital. This document is a litepaper and does not constitute financial advice, an offer of securities, or a solicitation of investment.*
