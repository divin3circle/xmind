
# **XMind Capital Smart Contract Spec (Coding Agent Friendly)**

---

## **1. Contracts Overview**

1. **Agentic Portfolio Manager (Vault) – ERC-4626 based**

   * Core contract, one vault per AI agent.
   * Handles deposits, withdrawals, AI-directed trades, profit distribution.
   * Enforces risk profile limits (Conservative / Balanced / Aggressive).

2. **Platform Treasury**

   * Collects platform fees from profits.
   * Tracks total fees per vault.
   * Allows platform withdrawal.

3. **Risk Guardrails / Validator**

   * Library or contract used by vault to validate trades.
   * Ensures AI does not exceed risk allocation per profile.

4. **CRE Integration**

   * Off-chain AI instructions delivered via Chainlink CRE.
   * Validates signed instructions and triggers trade execution.

---

## **2. Agentic Portfolio Manager Vault (ERC-4626)**

**Storage / State:**

* `uint256 totalAssets` – Total assets under management.
* `mapping(address => uint256) shares` – Investor shares.
* `string riskProfile` – Defines limits for allocations.
* `mapping(address => Investment[]) activeInvestments` – On-chain positions.
* `uint256 treasuryBalance` – For platform fee allocation.

**Core Functions:**

* `deposit(uint256 amount)` – Accept stablecoins, mint shares.
* `withdraw(uint256 shares)` – Burn shares, return underlying assets.
* `executeTrade(address asset, uint256 amount, string tradeType)` – Trigger AI-approved trade.
* `distributeProfit()` – Split profit between investors and platform fees.
* `setRiskProfile(string profile)` – Configure risk limits.
* `pause()` / `unpause()` – Emergency control.

**Events:**

* `Deposit(address investor, uint256 amount, uint256 shares)`
* `Withdrawal(address investor, uint256 amount, uint256 shares)`
* `TradeExecuted(address asset, uint256 amount, string tradeType)`
* `ProfitDistributed(uint256 investorsShare, uint256 platformShare)`
* `Paused() / Unpaused()`
* `RiskProfileUpdated(string profile)`

---

## **3. Platform Treasury Contract**

**Storage / State:**

* `uint256 totalFeesCollected`
* `mapping(address => uint256) vaultFees` – Track fees per vault.
* `address platformWallet` – Withdrawable wallet.

**Core Functions:**

* `collectFee(address vault, uint256 amount)` – Vault calls after profit calculation.
* `withdraw(address to, uint256 amount)` – Platform can withdraw collected fees.

**Events:**

* `FeeCollected(address vault, uint256 amount)`
* `TreasuryWithdraw(address to, uint256 amount)`

---

## **4. Risk Guardrails / Validator**

**Purpose:**

* Ensures that each trade executed by AI adheres to the vault’s risk profile.

**Storage / Rules:**

* Predefined limits per profile:

  * Conservative: max 20% high-risk, 50% stable assets.
  * Balanced: max 50% high-risk, 20% stable.
  * Aggressive: max 80% high-risk, 5% stable.

**Functions:**

* `validateTrade(address asset, uint256 amount, string tradeType)` → returns `bool` or reverts.

**Events:**

* `TradeRejected(string reason, address asset, uint256 amount)`

---

## **5. CRE Integration**

**Purpose:**

* Receives AI instructions signed off-chain.
* Validates instructions before triggering vault execution.

**Functions / Flow:**

1. `submitAIInstruction(bytes signedData)` – AI sends trade action.
2. Vault validates the signature.
3. Calls `executeTrade` if valid.

**Events:**

* `CREInstructionReceived(address vault, string action, address asset, uint256 amount)`

---

## **6. Off-Chain Memory & AI**

* All trade history, past allocations, and AI context stored off-chain.
* Only hashes or essential metadata stored on-chain for verification.
* AI queries off-chain database to generate instructions with relevant context.

---

## **7. How a Coding Agent Could Scaffold**

A coding agent (Codex / Antigravity) could:

1. Generate **ERC-4626 vault template** with:

   * Deposit/withdrawal logic.
   * Share tracking and accounting.
   * Treasury fee allocation.

2. Scaffold **Platform Treasury**:

   * Fee collection and withdrawal logic.

3. Scaffold **Risk Guardrails**:

   * Enforce risk limits based on profile.
   * Reject invalid trades.

4. Create **Events** for transparency:

   * Deposits, withdrawals, trade executions, profits, fee collection.

5. Integrate a **CRE interface**:

   * Receives signed instructions.
   * Calls vault execution functions safely.

6. Add **pause/unpause and emergency functions**:

   * Standard practice for DeFi smart contracts.

**Note:** Off-chain AI integration is **outside Solidity**, but the agent can scaffold function hooks (e.g., `submitAIInstruction`) for later off-chain connection.

---

✅ **Summary for Coding Agent Execution**

* 1 Vault Contract per AI agent (ERC-4626)
* 1 Platform Treasury Contract (collect fees)
* 1 Risk Validator Module / Library
* CRE hooks to trigger AI trades
* Event logging for all key actions
* Off-chain AI memory & logic (linked via CRE)

This is a **minimal viable on-chain layer**, fully AI-agent scaffoldable, and avoids NFT complexity for now.

---

If you want, I can **draw a clean diagram showing the vault, treasury, CRE integration, risk guardrails, and investor flow**, so a coding agent has a visual blueprint to start generating contracts immediately.

Do you want me to create that diagram next?
