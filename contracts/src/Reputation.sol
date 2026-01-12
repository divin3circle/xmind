// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Reputation
 * @dev Stores and manages agent reputation scores.
 * 
 * Only Escrow contract can update scores on task completion/dispute.
 * Prevents Sybil attacks by requiring on-chain proof of work (completed tasks).
 */
contract Reputation is Ownable, Pausable {
    
    // Agent reputation scores
    mapping(address => uint256) public agentScores;
    
    // Agent registration status
    mapping(address => bool) public isRegisteredAgent;
    
    // Escrow contract (only one allowed to update scores)
    address public escrowContract;

    // Events
    event AgentRegistered(address indexed agent);
    event ScoreIncremented(address indexed agent, uint256 newScore);
    event ScoreDecremented(address indexed agent, uint256 newScore);
    event EscrowContractUpdated(address indexed newEscrow);

    // Modifiers
    modifier onlyEscrow() {
        require(msg.sender == escrowContract, "Only Escrow contract can call this");
        _;
    }

    // Constructor
    constructor(address _escrowContract) {
        require(_escrowContract != address(0), "Invalid Escrow contract address");
        escrowContract = _escrowContract;
    }

    /**
     * @dev Register a new agent (agent must stake or meet requirements in future)
     * For MVP: open registration; can add staking layer later
     */
    function registerAgent() external whenNotPaused {
        require(!isRegisteredAgent[msg.sender], "Agent already registered");
        
        isRegisteredAgent[msg.sender] = true;
        agentScores[msg.sender] = 0;
        
        emit AgentRegistered(msg.sender);
    }

    /**
     * @dev Increment agent score on successful task completion (callable only by Escrow)
     */
    function incrementScore(address agent) external onlyEscrow {
        require(agent != address(0), "Invalid agent address");
        
        // Auto-register if not already
        if (!isRegisteredAgent[agent]) {
            isRegisteredAgent[agent] = true;
            agentScores[agent] = 0;
            emit AgentRegistered(agent);
        }

        agentScores[agent]++;
        emit ScoreIncremented(agent, agentScores[agent]);
    }

    /**
     * @dev Decrement agent score on dispute loss (callable only by Escrow)
     * Prevents score going below 0
     */
    function decrementScore(address agent) external onlyEscrow {
        require(agent != address(0), "Invalid agent address");
        
        if (agentScores[agent] > 0) {
            agentScores[agent]--;
        }
        
        emit ScoreDecremented(agent, agentScores[agent]);
    }

    /**
     * @dev Get agent's current reputation score
     */
    function getScore(address agent) external view returns (uint256) {
        return agentScores[agent];
    }

    /**
     * @dev Check if agent is registered
     */
    function isAgent(address agent) external view returns (bool) {
        return isRegisteredAgent[agent];
    }

    /**
     * @dev Update Escrow contract address (only owner)
     */
    function setEscrowContract(address _newEscrow) external onlyOwner {
        require(_newEscrow != address(0), "Invalid Escrow contract address");
        escrowContract = _newEscrow;
        emit EscrowContractUpdated(_newEscrow);
    }

    /**
     * @dev Pause/unpause
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
