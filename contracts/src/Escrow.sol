// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IReputation {
    function incrementScore(address agent) external;
    function decrementScore(address agent) external;
    function getScore(address agent) external view returns (uint256);
}

/**
 * @title Escrow
 * @dev Manages trustless task-based payments with milestone support.
 * 
 * State Machine: Created → Funded → InProgress → Completed → Released
 *                                         ↓ Disputed → Refunded
 */
contract Escrow is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    enum TaskState {
        Created,      // 0: Task posted, awaiting funding
        Funded,       // 1: Escrow locked, awaiting agent selection
        InProgress,   // 2: Agent working, awaiting milestone/completion
        Completed,    // 3: Proof submitted, awaiting release
        Released,     // 4: Payment released to agent
        Disputed,     // 5: Dispute initiated
        Refunded      // 6: Funds returned to user
    }

    struct Task {
        address user;
        address agent;
        address token;
        uint256 budget;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 startedAt;
        uint256 completedAt;
        string description;
        string completionProof;
        TaskState state;
    }

    // USDC token address (Cronos Testnet/Mainnet)
    address public usdcToken;
    
    // Reputation contract reference
    IReputation public reputationContract;

    // Dispute resolution timeout (48 hours default)
    uint256 public disputeTimeout = 48 hours;

    // Timeouts to avoid stuck funds
    uint256 public selectionTimeout = 3 days; // time to pick an agent
    uint256 public workTimeout = 7 days; // time for agent to deliver proof

    // Task storage
    mapping(uint256 => Task) public tasks;
    uint256 public taskCount;

    // Events
    event TaskCreated(
        uint256 indexed taskId,
        address indexed user,
        uint256 budget,
        string description
    );

    event TaskFunded(
        uint256 indexed taskId,
        address indexed user,
        uint256 budget
    );

    event AgentSelected(
        uint256 indexed taskId,
        address indexed agent
    );

    event TaskStarted(
        uint256 indexed taskId,
        address indexed agent
    );

    event CompletionProofSubmitted(
        uint256 indexed taskId,
        address indexed agent,
        string proof
    );

    event TaskReleased(
        uint256 indexed taskId,
        address indexed agent,
        uint256 amount
    );

    event TaskDisputed(
        uint256 indexed taskId,
        address indexed initiator
    );

    event TaskRefunded(
        uint256 indexed taskId,
        address indexed user,
        uint256 amount
    );

    event DisputeResolved(
        uint256 indexed taskId,
        bool agentWon
    );

    // Modifiers
    modifier taskExists(uint256 taskId) {
        require(taskId < taskCount, "Task does not exist");
        _;
    }

    modifier onlyTaskUser(uint256 taskId) {
        require(msg.sender == tasks[taskId].user, "Only task user can call this");
        _;
    }

    modifier onlyTaskAgent(uint256 taskId) {
        require(msg.sender == tasks[taskId].agent, "Only task agent can call this");
        _;
    }

    // Constructor
    constructor(address _usdcToken, address _reputationContract) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_reputationContract != address(0), "Invalid reputation contract address");
        
        usdcToken = _usdcToken;
        reputationContract = IReputation(_reputationContract);
    }

    /**
     * @dev Create a new task (user posts task, funds transferred to escrow)
     */
    function createTask(
        string memory _description,
        uint256 _budget
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(_budget > 0, "Budget must be positive");
        require(bytes(_description).length > 0, "Description cannot be empty");

        // Transfer tokens from user to this contract
        IERC20(usdcToken).safeTransferFrom(msg.sender, address(this), _budget);

        uint256 taskId = taskCount;
        tasks[taskId] = Task({
            user: msg.sender,
            agent: address(0),
            token: usdcToken,
            budget: _budget,
            createdAt: block.timestamp,
            fundedAt: block.timestamp,
            startedAt: 0,
            completedAt: 0,
            description: _description,
            completionProof: "",
            state: TaskState.Funded
        });

        taskCount++;

        emit TaskCreated(taskId, msg.sender, _budget, _description);
        emit TaskFunded(taskId, msg.sender, _budget);

        return taskId;
    }

    /**
     * @dev Select an agent for the task (user chooses from bids)
     */
    function selectAgent(
        uint256 taskId,
        address _agent
    ) external taskExists(taskId) onlyTaskUser(taskId) nonReentrant whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.state == TaskState.Funded, "Task not in Funded state");
        require(_agent != address(0), "Agent address cannot be zero");
        require(_agent != task.user, "Agent cannot be task user");

        // Check agent reputation (basic: must have at least 1 point or be new)
        // In MVP, allow all; can add thresholds later
        
        task.agent = _agent;
        task.state = TaskState.InProgress;
        task.startedAt = block.timestamp;

        emit AgentSelected(taskId, _agent);
        emit TaskStarted(taskId, _agent);
    }

    /**
     * @dev Agent submits completion proof (e.g., tx hash, data, etc.)
     */
    function submitCompletionProof(
        uint256 taskId,
        string memory _proof
    ) external taskExists(taskId) onlyTaskAgent(taskId) nonReentrant whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.state == TaskState.InProgress, "Task not in InProgress state");
        require(bytes(_proof).length > 0, "Proof cannot be empty");

        task.completionProof = _proof;
        task.completedAt = block.timestamp;
        task.state = TaskState.Completed;

        emit CompletionProofSubmitted(taskId, msg.sender, _proof);
    }

    /**
     * @dev User approves completion and releases payment to agent
     */
    function approveAndRelease(
        uint256 taskId
    ) external taskExists(taskId) onlyTaskUser(taskId) nonReentrant whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.state == TaskState.Completed, "Task not in Completed state");
        require(task.agent != address(0), "No agent assigned");

        uint256 amountToRelease = task.budget;
        task.state = TaskState.Released;

        // Update agent reputation
        reputationContract.incrementScore(task.agent);

        // Transfer funds to agent
        IERC20(task.token).safeTransfer(task.agent, amountToRelease);

        emit TaskReleased(taskId, task.agent, amountToRelease);
    }

    /**
     * @dev User or agent can initiate dispute within timeout window
     */
    function initiateDispute(
        uint256 taskId
    ) external taskExists(taskId) nonReentrant whenNotPaused {
        Task storage task = tasks[taskId];
        require(
            msg.sender == task.user || msg.sender == task.agent,
            "Only user or agent can initiate dispute"
        );
        if (task.state == TaskState.Completed) {
            require(task.completedAt > 0, "No completion timestamp");
            require(
                block.timestamp <= task.completedAt + disputeTimeout,
                "Dispute window closed"
            );
        } else if (task.state == TaskState.InProgress) {
            require(task.startedAt > 0, "Task not started");
            // Allow dispute if agent exceeded work timeout
            require(
                block.timestamp > task.startedAt + workTimeout,
                "Work timeout not reached"
            );
        } else {
            revert("Cannot dispute in current state");
        }

        task.state = TaskState.Disputed;
        emit TaskDisputed(taskId, msg.sender);
    }

    /**
     * @dev Owner resolves dispute in favor of user (refund) or agent (release)
     */
    function resolveDispute(
        uint256 taskId,
        bool _agentWon
    ) external onlyOwner taskExists(taskId) nonReentrant {
        Task storage task = tasks[taskId];
        require(task.state == TaskState.Disputed, "Task not in Disputed state");

        if (_agentWon) {
            // Release funds to agent
            task.state = TaskState.Released;
            reputationContract.incrementScore(task.agent);
            IERC20(task.token).safeTransfer(task.agent, task.budget);
            emit TaskReleased(taskId, task.agent, task.budget);
        } else {
            // Refund user
            task.state = TaskState.Refunded;
            reputationContract.decrementScore(task.agent);
            IERC20(task.token).safeTransfer(task.user, task.budget);
            emit TaskRefunded(taskId, task.user, task.budget);
        }

        emit DisputeResolved(taskId, _agentWon);
    }

    /**
     * @dev Emergency refund (if user cancels before agent selection)
     */
    function refundBeforeAgentSelection(
        uint256 taskId
    ) external taskExists(taskId) onlyTaskUser(taskId) nonReentrant whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.state == TaskState.Funded, "Can only refund in Funded state");

        uint256 amountToRefund = task.budget;
        task.state = TaskState.Refunded;

        IERC20(task.token).safeTransfer(task.user, amountToRefund);
        emit TaskRefunded(taskId, task.user, amountToRefund);
    }

    /**
     * @dev Allow user to reclaim funds if no agent was selected within selectionTimeout
     */
    function refundIfSelectionTimeout(uint256 taskId)
        external
        taskExists(taskId)
        onlyTaskUser(taskId)
        nonReentrant
        whenNotPaused
    {
        Task storage task = tasks[taskId];
        require(task.state == TaskState.Funded, "Not in Funded state");
        require(task.fundedAt > 0, "No funded timestamp");
        require(block.timestamp > task.fundedAt + selectionTimeout, "Selection window open");

        uint256 amountToRefund = task.budget;
        task.state = TaskState.Refunded;
        IERC20(task.token).safeTransfer(task.user, amountToRefund);
        emit TaskRefunded(taskId, task.user, amountToRefund);
    }

    /**
     * @dev Allow user to reclaim funds if agent exceeded work timeout in InProgress
     */
    function refundIfWorkTimeout(uint256 taskId)
        external
        taskExists(taskId)
        onlyTaskUser(taskId)
        nonReentrant
        whenNotPaused
    {
        Task storage task = tasks[taskId];
        require(task.state == TaskState.InProgress, "Not in InProgress state");
        require(task.startedAt > 0, "No start timestamp");
        require(block.timestamp > task.startedAt + workTimeout, "Work timeout not reached");

        uint256 amountToRefund = task.budget;
        task.state = TaskState.Refunded;
        IERC20(task.token).safeTransfer(task.user, amountToRefund);
        emit TaskRefunded(taskId, task.user, amountToRefund);
    }

    /**
     * @dev Get task details
     */
    function getTask(uint256 taskId) 
        external 
        view 
        taskExists(taskId) 
        returns (Task memory) 
    {
        return tasks[taskId];
    }

    /**
     * @dev Pause/unpause emergency functions
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Update dispute timeout
     */
    function setDisputeTimeout(uint256 _timeout) external onlyOwner {
        require(_timeout > 0, "Timeout must be positive");
        disputeTimeout = _timeout;
    }

    /**
     * @dev Update selection timeout
     */
    function setSelectionTimeout(uint256 _timeout) external onlyOwner {
        require(_timeout > 0, "Timeout must be positive");
        selectionTimeout = _timeout;
    }

    /**
     * @dev Update work timeout
     */
    function setWorkTimeout(uint256 _timeout) external onlyOwner {
        require(_timeout > 0, "Timeout must be positive");
        workTimeout = _timeout;
    }
}
