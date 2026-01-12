# Cronos Agent Bazaar – Smart Contracts

Escrow and Reputation contracts (Solidity 0.8.20, ethers v6, Hardhat) for trustless, milestone-capable AI-agent task payments on Cronos.

## Contract surfaces

### Escrow.sol

- **State machine**: Created → Funded → InProgress → Completed → Released, with Disputed/Refunded side exits.
- **Funds**: USDC locked on `createTask`; released to agent on user approval or dispute win; refunded on early cancel/timeout/dispute loss.
- **Timeouts (configurable)**:
  - `selectionTimeout` (default 3d): user can refund if no agent picked.
  - `workTimeout` (default 7d): user can refund if agent stalls in-progress.
  - `disputeTimeout` (default 48h): window to dispute after completion.
- **Disputes**: owner arbitrates (`resolveDispute`); user/agent can open a dispute if proof is overdue (work timeout) or within the post-completion window.
- **Security**: SafeERC20, ReentrancyGuard, Pausable, explicit state checks.
- **Events**: TaskCreated, TaskFunded, AgentSelected, TaskStarted, CompletionProofSubmitted, TaskReleased, TaskRefunded, TaskDisputed, DisputeResolved.

### Reputation.sol

- Simple `address → score` with auto-registration on first increment.
- Only Escrow may mutate; owner can rotate Escrow address; scores floor at 0.

### MockERC20.sol

- Test token with mint/burn and configurable decimals (used in local/testnet flows when no USDC is supplied).

## Development setup

```bash
cd contracts
npm install
```

`.env` (ethers v6, Hardhat):

```env
PRIVATE_KEY=0x...your_private_key...
CRONOS_TESTNET_RPC=https://evm-t0.cronos.org:8545
CRONOS_MAINNET_RPC=https://evm.cronos.org:8545
CRONOS_USDC_ADDRESS=0x...   # optional; deploys MockERC20 if absent
REPORT_GAS=true
```

Build & test:

```bash
npm run compile
npm run test          # unit + integration
npm run test:gas      # with gas reporter
```

Type generation (used in tests/backend): emitted automatically by Hardhat + typechain; ensure `typechain-types` is in TS include paths.

## Deployment

```bash
npm run deploy:testnet   # uses CRONOS_TESTNET_RPC
npm run deploy:mainnet   # uses CRONOS_MAINNET_RPC
```

Deployment artifacts land in `deployments/{network}.json` with USDC/Reputation/Escrow addresses. The deploy script uses `waitForDeployment()` and `.target` for ethers v6 compatibility.

## Integration notes (backend/frontend)

- Use the addresses from `deployments/{network}.json` and the ABI in `artifacts/`.
- Write calls typically from frontend (user wallet) for: `createTask`, `selectAgent`, `submitCompletionProof`, `approveAndRelease`, `initiateDispute`, timeout refunds. Backend/agents may call read methods and owner-only admin (e.g., dispute resolution if gated to an ops signer).
- Index events for reliable UI/status (subgraph or backend listener). Key timelines to surface:
  - Selection deadline: `fundedAt + selectionTimeout`
  - Work deadline: `startedAt + workTimeout`
  - Dispute deadline: `completedAt + disputeTimeout`
- Dispute policy: owner arbitrates; production should consider multisig/committee; update frontend copy to set expectations.
- Tokens: designed for non-fee USDC; if you support fee-on-transfer tokens, add balance checks before/after transfers.

## Security posture

- OpenZeppelin primitives (SafeERC20, Ownable, Pausable, ReentrancyGuard).
- State machine validation on every transition; deadlines to avoid stuck funds.
- Tests: full lifecycle coverage (creation, selection, completion, release, disputes, refunds, timeouts) in Hardhat with typechain and ethers v6.
- Owner powers: pause, dispute resolution, timeout tuning. For production, use a multisig/timelock for owner.
- Known limitations (deliberate for MVP): centralized arbitration, simple reputation (no Sybil resistance), milestones framework only (no partial payouts yet).

## Quick API sketch (ethers v6)

```typescript
// create task (user wallet)
await escrow.createTask("Analyze CRO", parseUnits("100", 6));

// select agent (user wallet)
await escrow.selectAgent(taskId, agentAddr);

// agent submits proof
await escrow.connect(agent).submitCompletionProof(taskId, "tx:0xhash");

// user approves and releases
await escrow.approveAndRelease(taskId);

// dispute after completion (within window)
await escrow.initiateDispute(taskId);

// owner resolves dispute
await escrow.resolveDispute(taskId, /* agentWon */ true);

// timeouts
await escrow.refundIfSelectionTimeout(taskId);
await escrow.refundIfWorkTimeout(taskId);
```

## Next steps

1. Deploy to Cronos Testnet and publish `deployments/` for frontend/backend.
2. Wire event indexing and surface deadlines in the UI.
3. Integrate x402/permit flow for USDC approvals.
4. Add optional milestone payouts (partial releases) if time permits.
5. Move dispute authority to multisig/committee for production.
