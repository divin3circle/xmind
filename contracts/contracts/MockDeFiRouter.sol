// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC20Mock.sol";
import "./interfaces/IJoeRouter02.sol";
import "./interfaces/IStargateRouter.sol";

/**
 * @title MockDeFiRouter
 * @notice Unified mock for SWAP, BRIDGE, and POOL actions on Fuji testnet.
 *         Implements IJoeRouter02 (swap), IStargateRouter (bridge), and
 *         an Aave-style deposit() for lending simulation.
 *
 *         - SWAP:   Burns input token, mints target ERC20Mock to caller (1:1)
 *         - BRIDGE: Burns input token, mints "bridged" mock token (1:1)
 *         - POOL:   Accepts deposit, tracks balance, harvestYield() mints 2% yield
 */
contract MockDeFiRouter is IJoeRouter02, IStargateRouter {

    // --- Lending State ---
    // vault => token => deposited amount
    mapping(address => mapping(address => uint256)) public lendingDeposits;
    // vault => token => last harvest timestamp
    mapping(address => mapping(address => uint256)) public lastHarvest;

    event MockSwap(address indexed from, address tokenIn, address tokenOut, uint256 amount);
    event MockBridge(address indexed from, uint16 dstChainId, uint256 amount);
    event MockDeposit(address indexed vault, address token, uint256 amount);
    event MockYieldHarvested(address indexed vault, address token, uint256 yield_);

    // ─── SWAP (IJoeRouter02) ─────────────────────────────────────────────────
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint /* deadline */
    ) external override returns (uint[] memory amounts) {
        require(path.length >= 2, "Invalid path");

        // Take input token from caller (the vault)
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);

        // Mint output token to recipient (simulated swap at 1:1)
        // The target token MUST be an ERC20Mock with open mint()
        ERC20Mock(path[path.length - 1]).mint(to, amountIn);

        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountIn; // 1:1 mock price

        emit MockSwap(msg.sender, path[0], path[path.length - 1], amountIn);
    }

    function addLiquidity(
        address, address, uint, uint, uint, uint, address, uint
    ) external pure override returns (uint, uint, uint) {
        revert("MockDeFiRouter: addLiquidity not implemented");
    }

    // ─── BRIDGE (IStargateRouter) ────────────────────────────────────────────
    function swap(
        uint16 _dstChainId,
        uint256 /* _srcPoolId */,
        uint256 /* _dstPoolId */,
        address payable /* _refundAddress */,
        uint256 _amountLD,
        uint256 /* _minAmountLD */,
        lzTxObj memory /* _lzTxParams */,
        bytes calldata /* _to */,
        bytes calldata /* _payload */
    ) external payable override {
        // In a real bridge, tokens leave this chain.
        // For simulation: just emit the event (tokens stay, simulating "bridged")
        emit MockBridge(msg.sender, _dstChainId, _amountLD);
    }

    // ─── POOL / LENDING (Aave-style deposit) ─────────────────────────────────
    /**
     * @dev Matches the signature AgentVault._performLending calls:
     *      deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
     */
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 /* referralCode */
    ) external {
        // Pull tokens from caller (the vault)
        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        // Track the deposit for yield calculation
        lendingDeposits[onBehalfOf][asset] += amount;
        if (lastHarvest[onBehalfOf][asset] == 0) {
            lastHarvest[onBehalfOf][asset] = block.timestamp;
        }

        emit MockDeposit(onBehalfOf, asset, amount);
    }

    /**
     * @dev Callable by anyone (or the CRE cron). Mints 2% of deposited amount
     *      as simulated yield back to the vault.
     */
    function harvestYield(address vault, address asset) external {
        uint256 deposited = lendingDeposits[vault][asset];
        require(deposited > 0, "No deposits to harvest");

        // 2% yield per harvest cycle (simplified — not time-weighted)
        uint256 yieldAmount = (deposited * 200) / 10000; // 2%

        // Mint yield to the vault
        ERC20Mock(asset).mint(vault, yieldAmount);
        lastHarvest[vault][asset] = block.timestamp;

        emit MockYieldHarvested(vault, asset, yieldAmount);
    }

    /**
     * @dev View function to check pending yield.
     */
    function pendingYield(address vault, address asset) external view returns (uint256) {
        uint256 deposited = lendingDeposits[vault][asset];
        if (deposited == 0) return 0;
        return (deposited * 200) / 10000;
    }
}
