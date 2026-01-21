// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Agent.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentFactory
 * @dev Factory contract for deploying and managing AI Agent contracts
 * @notice This contract handles the creation and tracking of all AI agents
 */
contract AgentFactory is Ownable, ReentrancyGuard {
    // Deployment fee in wei (2 CRO for testnet)
    uint256 public deploymentFee;
    
    // Array of all deployed agents
    address[] public deployedAgents;
    
    // Mapping from creator address to their agents
    mapping(address => address[]) public creatorToAgents;
    
    // Mapping from agent address to deployment info
    mapping(address => AgentInfo) public agentInfo;
    
    // Struct to store agent deployment info
    struct AgentInfo {
        address agentAddress;
        address creator;
        uint256 deployedAt;
        bool exists;
    }
    
    // Events
    event AgentDeployed(
        address indexed agentAddress,
        address indexed creator,
        string name,
        uint256 timestamp
    );
    event DeploymentFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);
    
    /**
     * @dev Constructor sets the initial deployment fee
     * @param _deploymentFee Initial fee in wei (2 CRO = 2 * 10^18)
     */
    constructor(uint256 _deploymentFee) Ownable(msg.sender) {
        deploymentFee = _deploymentFee;
    }
    
    /**
     * @dev Deploy a new AI Agent contract
     * @param _name Name of the agent
     * @param _description Description of the agent
     * @param _image Image URL for the agent
     * @param _systemPrompt System prompt for the AI
     * @param _agentWalletAddress Wallet address for the agent
     * @return Address of the newly deployed agent contract
     */
    function deployAgent(
        string memory _name,
        string memory _description,
        string memory _image,
        string memory _systemPrompt,
        address _agentWalletAddress
    ) external payable nonReentrant returns (address) {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_systemPrompt).length > 0, "System prompt cannot be empty");
        require(_agentWalletAddress != address(0), "Invalid wallet address");
        
        // Deploy new Agent contract
        Agent newAgent = new Agent(
            _name,
            _description,
            _image,
            _systemPrompt,
            _agentWalletAddress,
            msg.sender
        );
        
        address agentAddress = address(newAgent);
        
        // Store agent info
        agentInfo[agentAddress] = AgentInfo({
            agentAddress: agentAddress,
            creator: msg.sender,
            deployedAt: block.timestamp,
            exists: true
        });
        
        // Track deployed agents
        deployedAgents.push(agentAddress);
        creatorToAgents[msg.sender].push(agentAddress);
        
        emit AgentDeployed(agentAddress, msg.sender, _name, block.timestamp);
        
        return agentAddress;
    }
    
    /**
     * @dev Get all deployed agents
     * @return Array of agent addresses
     */
    function getAllAgents() external view returns (address[] memory) {
        return deployedAgents;
    }
    
    /**
     * @dev Get agents created by a specific address
     * @param creator Address of the creator
     * @return Array of agent addresses
     */
    function getAgentsByCreator(address creator) external view returns (address[] memory) {
        return creatorToAgents[creator];
    }
    
    /**
     * @dev Get total number of deployed agents
     * @return Total count of agents
     */
    function getTotalAgents() external view returns (uint256) {
        return deployedAgents.length;
    }
    
    /**
     * @dev Get agent deployment info
     * @param agentAddress Address of the agent contract
     * @return AgentInfo struct
     */
    function getAgentInfo(address agentAddress) external view returns (AgentInfo memory) {
        require(agentInfo[agentAddress].exists, "Agent does not exist");
        return agentInfo[agentAddress];
    }
    
    /**
     * @dev Update deployment fee (only owner)
     * @param _newFee New fee amount in wei
     */
    function updateDeploymentFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = deploymentFee;
        deploymentFee = _newFee;
        emit DeploymentFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Withdraw collected fees (only owner)
     * @param amount Amount to withdraw
     */
    function withdrawFees(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FeesWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Get contract balance
     * @return Current balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get paginated list of agents
     * @param startIndex Starting index
     * @param count Number of agents to return
     * @return Array of agent addresses
     */
    function getAgentsPaginated(uint256 startIndex, uint256 count) 
        external 
        view 
        returns (address[] memory) 
    {
        require(startIndex < deployedAgents.length, "Start index out of bounds");
        
        uint256 endIndex = startIndex + count;
        if (endIndex > deployedAgents.length) {
            endIndex = deployedAgents.length;
        }
        
        uint256 resultCount = endIndex - startIndex;
        address[] memory result = new address[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = deployedAgents[startIndex + i];
        }
        
        return result;
    }
}
