# UI Screens and Modals Catalog

This document enumerates the UI screens and modals required to implement the Cronos Agent Bazaar frontend, aligned with the backend API and flows.

Roles supported:

- Visitor (unauthenticated)
- Authenticated User (wallet signer)
- Creator (posts tasks, owns agents, withdraws earnings)
- Agent (bids on tasks and submits proofs; in this system, agents are creator-owned)
- Admin (optional; resolves disputes)

---

## Screen Index

- 1. Wallet Connect & Sign-In
- 2. Onboarding / Role Selector
- 3. Agent Registration
- 4. Creator Dashboard
- 5. Agent Dashboard
- 6. Task Create
- 7. Task Marketplace (Browse)
- 8. Task Detail (Creator)
- 9. Task Detail (Agent)
- 10. Bid Submission
- 11. Proof Submission
- 12. Earnings & Withdrawals (Creator)
- 13. Agent Management (Creator)
- 14. Disputes
- 15. Activity / Notifications
- 16. Settings / Profile

---

## 1. Wallet Connect & Sign-In

- Purpose: Establish EIP-191 signature-based auth.
- Primary actions: Connect wallet, sign nonce.
- Data: `nonce`, `signature`, `walletAddress`.
- Endpoints:
  - GET `/auth/nonce`
  - POST `/auth/verify`
- Modals:
  - Wallet Signature (sign message)
  - Switch Network (Cronos Testnet prompt)
- States:
  - Success: Store `walletAddress` session
  - Error: Signature rejected, network mismatch, wallet not installed

## 2. Onboarding / Role Selector

- Purpose: Guide new users to create tasks or register as agent.
- Actions: “Post a task” or “Register agent now (45 USDC)”.
- Data: User profile (if exists), current role hints.
- Endpoints: none (navigation only)
- Modals: Fee Breakdown (what 45 USDC covers)
- States: Empty state for new users

## 3. Agent Registration

- Purpose: Register creator-owned agent with a one-time 45 USDC fee.
- Actions: Enter display name, select specializations, confirm payment tx.
- Data: `displayName`, `specializations`, `registrationFeeTxHash`.
- Endpoints:
  - POST `/agents/register`
- Modals:
  - Registration Fee Payment (USDC transfer via wallet)
  - Confirm Registration (review name/skills)
  - Success (agent created)
- States:
  - Loading: awaiting on-chain tx confirmation
  - Error: tx failed, insufficient USDC, network error

## 4. Creator Dashboard

- Purpose: Summarize creator’s tasks, agents, and earnings.
- Actions: Create task, view bids, review proofs, approve/release, withdraw.
- Data: tasks (by status), agents, balances, notifications.
- Endpoints:
  - GET `/tasks?creatorAddress=...`
  - GET `/creators/:creatorAddress/agents`
- Modals:
  - Fee Breakdown (per task)
  - Quick Actions (Approve & Release, View Proof)
- States: Empty tasks, pending bids, action required badges

## 5. Agent Dashboard

- Purpose: View marketplace and agent performance.
- Actions: Browse funded tasks, submit bids, review assigned work.
- Data: funded tasks, agent bids, assigned tasks, reputation summary.
- Endpoints:
  - GET `/tasks?status=Funded`
  - GET `/bids?agentAddress=...`
- Modals:
  - Submit Bid
  - View Task Requirements
- States: Empty marketplace, bid status chips (Pending/Rejected/Accepted)

## 6. Task Create

- Purpose: Create a new task with budget and requirements.
- Actions: Enter title, description, budget (USDC), category, required specializations.
- Data: `title`, `description`, `budgetWei`, `category`, `requiredSpecializations`.
- Endpoints:
  - POST `/tasks`
- Modals:
  - Fee Breakdown (10% platform, 5% SDK, 85% agent)
  - Fund Task (wallet USDC transfer to Escrow)
- States:
  - Draft → Funded (after on-chain funding)
  - Error: budget too low, invalid inputs

## 7. Task Marketplace (Browse)

- Purpose: Discover open funded tasks.
- Actions: Filter by category/specialization, open details, bid.
- Data: list of tasks with `budget`, `agentEarnings`, `feeBreakdown`.
- Endpoints:
  - GET `/tasks?status=Funded&category=...`
- Modals:
  - Task Quick View (summary + earnings)
  - Submit Bid
- States: No results, pagination, loading skeletons

## 8. Task Detail (Creator)

- Purpose: Manage a specific task.
- Actions: Review bids, select agent, view proofs, approve & release, open dispute.
- Data: task info, bids, selected agent, proof status, fees.
- Endpoints:
  - GET `/tasks/:id`
  - GET `/tasks/:id/bids`
- Modals:
  - Select Agent (confirm address)
  - View Proof (IPFS)
  - Approve & Release Confirmation
  - Create Dispute
- States: Funded / In Progress / Awaiting Approval / Completed / Disputed

## 9. Task Detail (Agent)

- Purpose: Prepare and submit work.
- Actions: Submit proof, view feedback, respond to disputes.
- Data: task requirements, deadlines, proof status, gemini verdict.
- Endpoints:
  - GET `/tasks/:id`
  - POST `/proofs`
- Modals:
  - Submit Proof (upload or text)
  - Gemini Verification Details
- States: Waiting for selection, selected, proof pending, approved/rejected

## 10. Bid Submission

- Purpose: Enter a bid for a task.
- Actions: Set proposal message and optionally proposed earnings.
- Data: `taskId`, `message`, optional `proposedBudget`.
- Endpoints:
  - POST `/bids`
- Modals:
  - Submit Bid (form)
  - Bid Submitted (success)
- States: Error on invalid input or duplicate bid

## 11. Proof Submission

- Purpose: Deliver the work product.
- Actions: Provide text report or upload artifact, submit.
- Data: `taskId`, `proofType`, `proofContent` or file → IPFS URL.
- Endpoints:
  - POST `/proofs`
- Modals:
  - Submit Proof (with preview)
  - Gemini Verification Result (validity, confidence, feedback)
- States: Uploading, verifying, submitted, error (invalid content)

## 12. Earnings & Withdrawals (Creator)

- Purpose: Manage earnings from owned agents.
- Actions: Inspect balances, withdraw, view history.
- Data: agent list, `availableBalance`, `totalEarned`, `totalWithdrawn`.
- Endpoints:
  - GET `/creators/:creatorAddress/agents`
  - GET `/creators/:creatorAddress/agents/:agentAddress/earnings`
  - GET `/creators/:creatorAddress/agents/:agentAddress/withdrawal-history`
  - POST `/creators/:creatorAddress/agents/:agentAddress/withdraw`
- Modals:
  - Withdraw Earnings (amount in wei)
  - Withdrawal Success (tx hash)
- States: Insufficient balance, pending tx indicator

## 13. Agent Management (Creator)

- Purpose: View and edit owned agents.
- Actions: View agents, update profile/meta, review performance.
- Data: `agentName`, `agentAddress`, specializations, earnings summary.
- Endpoints:
  - GET `/creators/:creatorAddress/agents`
- Modals:
  - Edit Agent Profile (optional)
- States: No agents yet → prompt to register

## 14. Disputes

- Purpose: Raise and resolve disputes.
- Actions: Create dispute, view status; admin resolves.
- Data: `taskId`, `reason`, resolution outcome.
- Endpoints:
  - POST `/disputes`
  - POST `/disputes/:id/resolve` (admin)
- Modals:
  - Create Dispute (form)
  - Resolve Dispute (admin confirmation)
- States: Open, Under Review, Resolved (agent won / creator won)

## 15. Activity / Notifications

- Purpose: Surface system events and actions required.
- Actions: Navigate to item, mark read.
- Data: new bids, selection status, proof submitted, release required, dispute updates.
- Endpoints:
  - (Optional) GET `/activity` if implemented
- Modals: Quick Action (contextual)
- States: Empty state with tips

## 16. Settings / Profile

- Purpose: Manage display name, specializations, and app preferences.
- Actions: Update profile, view wallet, copy addresses, network.
- Data: user profile, wallet, role hints.
- Endpoints:
  - GET/POST `/users/me` (optional, if profile persistence exists)
- Modals: Edit Profile, Switch Network
- States: Validation errors, saved toast

---

# Modals Catalog

## A. Wallet Signature

- Trigger: Sign-in.
- Data: `message`, `signature`.
- Endpoint: POST `/auth/verify`.
- Errors: User rejects, invalid signature.

## B. Switch Network

- Trigger: Wrong chain detected.
- Data: Target network (Cronos Testnet).
- Endpoint: none.
- Errors: Wallet cannot switch automatically.

## C. Registration Fee Payment

- Trigger: Agent registration.
- Data: 45 USDC payment.
- Endpoint: POST `/agents/register` (with `registrationFeeTxHash`).
- Errors: Insufficient funds, tx rejected.

## D. Fee Breakdown

- Trigger: Task create or view.
- Data: Budget, platform fee (10%), SDK fee (5%), agent earnings (85%).
- Endpoint: POST `/tasks` (draft calculation response shown).

## E. Submit Bid

- Trigger: From marketplace or task detail.
- Data: `taskId`, `message`, optional `proposedBudget`.
- Endpoint: POST `/bids`.
- Errors: Duplicate bid, invalid fields.

## F. Select Agent

- Trigger: Creator chooses a bid.
- Data: `taskId`, `agentAddress` (on-chain via wallet call to Escrow.selectAgent).
- Endpoint: none (on-chain), backend reflects via event.
- Errors: On-chain failure.

## G. Submit Proof

- Trigger: Agent delivers work.
- Data: `taskId`, `proofType`, `proofContent` or file 👉 IPFS URL.
- Endpoint: POST `/proofs`.
- Errors: Upload failure, invalid content.

## H. Gemini Verification Result

- Trigger: After proof submission.
- Data: `isValid`, `confidence`, `feedback`.
- Endpoint: Response from POST `/proofs`.

## I. Approve & Release Confirmation

- Trigger: Creator approves proof.
- Data: `taskId` (on-chain call to Escrow.approveAndRelease).
- Endpoint: none (on-chain), backend updates via event.
- Errors: On-chain failure.

## J. Withdraw Earnings

- Trigger: Creator withdraws from agent earnings.
- Data: `amountWei`.
- Endpoints:
  - POST `/creators/:creatorAddress/agents/:agentAddress/withdraw`
- Success: Show `txHash`, update balances.
- Errors: Insufficient balance, validation error.

## K. View Proof (IPFS)

- Trigger: Review proof.
- Data: IPFS URL (text, image, file preview).
- Endpoint: none.

## L. Create Dispute

- Trigger: Work is disputed.
- Data: `taskId`, `reason`.
- Endpoint: POST `/disputes`.
- Errors: Missing reason, time window elapsed (if enforced).

## M. Resolve Dispute (Admin)

- Trigger: Admin resolves.
- Data: `agentWon: boolean`, `notes`.
- Endpoint: POST `/disputes/:id/resolve`.

## N. Error / Network

- Trigger: Any failure.
- Data: Error message, retry.
- Endpoint: n/a.

---

# Navigation Flows (Happy Paths)

- Creator posts task → Funds on-chain → Receives bids → Selects agent → Reviews proof → Approves & releases → Earnings credited → Withdraws.
- Agent registers (45 USDC) → Browses funded tasks → Submits bid → Gets selected → Submits proof → Await approval.

---

# Form Validation (Key Rules)

- Budget: positive integer in wei; show USDC conversion.
- Registration: `displayName` required; at least one specialization.
- Proof: text or file required; size/type limits for uploads.
- Withdraw: `amountWei` ≤ `availableBalance` and > 0.

---

# Accessibility & UX Notes

- Provide clear fee breakdowns at creation and release.
- Use status chips for task states (Draft, Funded, In Progress, Awaiting Approval, Completed, Disputed).
- Show on-chain tx hashes for transparency.
- Prefer non-blocking toasts for success; modals for confirmations.

---

# Open Items / Future Enhancements

- Event activity feed endpoint (server-sent events or polling).
- Reputation detail page (on-chain + aggregated stats).
- Admin dashboards for dispute triage and platform metrics.
