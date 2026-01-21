// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Agent
 * @dev Individual AI Agent contract deployed by AgentFactory
 * @notice This contract represents a single AI agent with associated metadata
 */
contract Agent is Ownable, ReentrancyGuard {
    // Agent metadata
    string public name;
    string public description;
    string public image;
    string public systemPrompt;
    address public agentWalletAddress;
    address public creatorAddress;
    
    // Agent statistics
    uint256 public tasksCompleted;
    uint256 public tasksRan;
    uint256 public createdAt;
    
    // Payment tracking
    uint256 public totalEarnings;
    bool public isActive;
    
    // Events
    event AgentUpdated(string name, string description, string image);
    event SystemPromptUpdated(string newPrompt);
    event TaskCompleted(uint256 taskId, uint256 timestamp);
    event TaskRan(uint256 taskId, uint256 timestamp);
    event PaymentReceived(address indexed from, uint256 amount);
    event EarningsWithdrawn(address indexed to, uint256 amount);
    event AgentStatusChanged(bool isActive);
    
    /**
     * @dev Constructor initializes the agent with provided metadata
     * @param _name Name of the agent
     * @param _description Description of the agent's capabilities
     * @param _image IPFS or URL link to agent's image
     * @param _systemPrompt The system prompt for the AI agent
     * @param _agentWalletAddress The wallet address used by the agent
     * @param _creatorAddress Address of the agent creator
     */
    constructor(
        string memory _name,
        string memory _description,
        string memory _image,
        string memory _systemPrompt,
        address _agentWalletAddress,
        address _creatorAddress
    ) Ownable(_creatorAddress) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_systemPrompt).length > 0, "System prompt cannot be empty");
        require(_agentWalletAddress != address(0), "Invalid wallet address");
        require(_creatorAddress != address(0), "Invalid creator address");
        
        name = _name;
        description = _description;
        image = _image;
        systemPrompt = _systemPrompt;
        agentWalletAddress = _agentWalletAddress;
        creatorAddress = _creatorAddress;
        createdAt = block.timestamp;
        isActive = true;
        tasksCompleted = 0;
        tasksRan = 0;
        totalEarnings = 0;
    }
    
    /**
     * @dev Update agent metadata (only owner)
     * @param _name New name
     * @param _description New description
     * @param _image New image URL
     */
    function updateAgentInfo(
        string memory _name,
        string memory _description,
        string memory _image
    ) external onlyOwner {
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        name = _name;
        description = _description;
        image = _image;
        
        emit AgentUpdated(_name, _description, _image);
    }
    
    /**
     * @dev Update system prompt (only owner)
     * @param _newPrompt New system prompt
     */
    function updateSystemPrompt(string memory _newPrompt) external onlyOwner {
        require(bytes(_newPrompt).length > 0, "Prompt cannot be empty");
        systemPrompt = _newPrompt;
        emit SystemPromptUpdated(_newPrompt);
    }
    
    /**
     * @dev Record a completed task
     * @param taskId ID of the completed task
     */
    function recordTaskCompleted(uint256 taskId) external onlyOwner {
        require(isActive, "Agent is not active");
        tasksCompleted++;
        emit TaskCompleted(taskId, block.timestamp);
    }
    
    /**
     * @dev Record a task execution
     * @param taskId ID of the executed task
     */
    function recordTaskRan(uint256 taskId) external onlyOwner {
        require(isActive, "Agent is not active");
        tasksRan++;
        emit TaskRan(taskId, block.timestamp);
    }
    
    /**
     * @dev Toggle agent active status
     */
    function toggleActiveStatus() external onlyOwner {
        isActive = !isActive;
        emit AgentStatusChanged(isActive);
    }
    
    /**
     * @dev Receive payment for agent services
     */
    receive() external payable {
        require(msg.value > 0, "Payment must be greater than 0");
        totalEarnings += msg.value;
        emit PaymentReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw earnings (only owner)
     * @param amount Amount to withdraw
     */
    function withdrawEarnings(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit EarningsWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Get complete agent information
     * @return Agent metadata and statistics
     */
    function getAgentInfo() external view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        address,
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        bool
    ) {
        return (
            name,
            description,
            image,
            systemPrompt,
            agentWalletAddress,
            creatorAddress,
            tasksCompleted,
            tasksRan,
            createdAt,
            totalEarnings,
            isActive
        );
    }
    
    /**
     * @dev Get agent balance
     * @return Current contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
