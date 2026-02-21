// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/RiskValidator.sol";
import "./PlatformTreasury.sol";
import "./interfaces/IJoeRouter02.sol";
import "./interfaces/IStargateRouter.sol";

contract AgentVault is ERC4626, Ownable, Pausable, ReentrancyGuard {
    using RiskValidator for RiskValidator.RiskProfile;

    enum Action { SWAP, BRIDGE, POOL }

    RiskValidator.RiskProfile public riskProfile;
    PlatformTreasury public treasury;
    
    // External Protocols (Avalanche Addresses)
    address public joeRouter;
    address public stargateRouter;
    
    uint256 public totalHighRiskAllocation;
    uint256 public totalStableAllocation;
    
    struct Investment {
        address asset;
        uint256 amount;
        bool isHighRisk;
        Action action;
    }
    
    mapping(address => Investment) public activeInvestments;
    
    event TradeExecuted(address indexed asset, uint256 amount, Action action, bool isHighRisk);
    event RiskProfileUpdated(RiskValidator.RiskProfile newProfile);
    event ProfitDistributed(uint256 investorsShare, uint256 platformShare);

    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        RiskValidator.RiskProfile _riskProfile,
        address _treasury,
        address _initialOwner,
        address _joeRouter,
        address _stargateRouter
    ) ERC4626(_asset) ERC20(_name, _symbol) Ownable(_initialOwner) {
        riskProfile = _riskProfile;
        treasury = PlatformTreasury(_treasury);
        joeRouter = _joeRouter;
        stargateRouter = _stargateRouter;
    }

    /**
     * @dev Trigger AI-approved trade.
     */
    function executeTrade(
        address targetAsset,
        uint256 amount,
        uint256 minAmountOut, // Slippage protection provided by AI
        Action action,
        bool isHighRisk,
        bytes calldata data
    ) external onlyOwner whenNotPaused nonReentrant {
        // 1. Risk Validation
        bool isValid = RiskValidator.validateTrade(
            riskProfile,
            targetAsset,
            amount,
            "",
            totalHighRiskAllocation,
            totalStableAllocation,
            totalAssets(),
            isHighRisk
        );
        require(isValid, "Trade violates risk limits");

        // 2. Execution Logic
        if (action == Action.SWAP) {
            _performSwap(targetAsset, amount, minAmountOut);
        } else if (action == Action.BRIDGE) {
            uint16 dstChainId = abi.decode(data, (uint16));
            _performBridge(targetAsset, amount, minAmountOut, dstChainId);
        } else if (action == Action.POOL) {
            _performLending(targetAsset, amount);
        }

        // 3. Status Update
        if (isHighRisk) {
            totalHighRiskAllocation += amount;
        } else {
            totalStableAllocation += amount;
        }
        
        activeInvestments[targetAsset] = Investment(targetAsset, amount, isHighRisk, action);
        emit TradeExecuted(targetAsset, amount, action, isHighRisk);
    }

    function _performSwap(address targetAsset, uint256 amount, uint256 minAmountOut) internal {
        IERC20(asset()).approve(joeRouter, amount);
        
        address[] memory path = new address[](2);
        path[0] = asset();
        path[1] = targetAsset;

        IJoeRouter02(joeRouter).swapExactTokensForTokens(
            amount,
            minAmountOut,
            path,
            address(this),
            block.timestamp + 600
        );
    }

    function _performBridge(address /*targetAsset*/, uint256 amount, uint256 minAmountOut, uint16 dstChainId) internal {
        IERC20(asset()).approve(stargateRouter, amount);

        uint256 srcPoolId = 1;
        uint256 dstPoolId = 1;

        IStargateRouter(stargateRouter).swap{value: msg.value}(
            dstChainId,
            srcPoolId,
            dstPoolId,
            payable(owner()),
            amount,
            minAmountOut,
            IStargateRouter.lzTxObj(0, 0, ""),
            abi.encodePacked(address(this)),
            ""
        );
    }

    function _performLending(address pool, uint256 amount) internal {
        // Example: Deposit into a lending pool (Aave/Benqi style)
        // ILendingPool(pool).deposit(asset(), amount, address(this), 0);
        IERC20(asset()).approve(pool, amount);
        
        // This is a generic call to a 'deposit' function found in most lending protocols
        (bool success, ) = pool.call(abi.encodeWithSignature("deposit(address,uint256,address,uint16)", asset(), amount, address(this), 0));
        require(success, "Lending deposit failed");
    }

    /**
     * @dev Split profit between investors and platform fees.
     */
    function distributeProfit(address profitAsset, uint256 profitAmount, uint256 feePercentage) external onlyOwner nonReentrant {
        uint256 platformShare = (profitAmount * feePercentage) / 10000;
        uint256 investorsShare = profitAmount - platformShare;
        
        // Transfer fee to treasury
        IERC20(profitAsset).approve(address(treasury), platformShare);
        treasury.collectFee(profitAsset, platformShare);
        
        emit ProfitDistributed(investorsShare, platformShare);
    }

    function setRiskProfile(RiskValidator.RiskProfile _newProfile) external onlyOwner {
        riskProfile = _newProfile;
        emit RiskProfileUpdated(_newProfile);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Override required for ERC4626 to represent Net Asset Value (NAV)
    function totalAssets() public view override returns (uint256) {
        // NAV = Idle USDC + Invested Capital (High Risk + Stable)
        return IERC20(asset()).balanceOf(address(this)) + totalHighRiskAllocation + totalStableAllocation;
    }
}
