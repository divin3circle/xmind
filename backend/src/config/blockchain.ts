import { ethers } from "ethers";
import { config } from "./env";

// Escrow Contract ABI (simplified)
const ESCROW_ABI = [
  "function createTask(string memory description, uint256 budget) public returns (uint256)",
  "function selectAgent(uint256 taskId, address agent) public",
  "function submitCompletionProof(uint256 taskId, string memory proofUri) public",
  "function approveAndRelease(uint256 taskId) public",
  "function initiateDispute(uint256 taskId) public",
  "function resolveDispute(uint256 taskId, bool agentWon) public onlyOwner",
  "event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 budget)",
  "event TaskFunded(uint256 indexed taskId)",
  "event AgentSelected(uint256 indexed taskId, address indexed agent)",
  "event CompletionProofSubmitted(uint256 indexed taskId, string proofUri)",
  "event TaskReleased(uint256 indexed taskId)",
  "event TaskRefunded(uint256 indexed taskId)",
  "event TaskDisputed(uint256 indexed taskId, address indexed initiator)",
  "event DisputeResolved(uint256 indexed taskId, bool indexed agentWon)",
];

// Reputation Contract ABI (simplified)
const REPUTATION_ABI = [
  "function getScore(address agent) public view returns (uint256)",
  "function incrementScore(address agent) public onlyEscrow",
  "function decrementScore(address agent) public onlyEscrow",
  "event ScoreUpdated(address indexed agent, uint256 newScore)",
];

export const provider = new ethers.JsonRpcProvider(config.CRONOS_TESTNET_RPC);

export const escrowContract = new ethers.Contract(
  config.ESCROW_ADDRESS,
  ESCROW_ABI,
  provider
);

export const reputationContract = new ethers.Contract(
  config.REPUTATION_ADDRESS,
  REPUTATION_ABI,
  provider
);

export default { provider, escrowContract, reputationContract };
