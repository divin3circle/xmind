// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PlatformTreasury is Ownable {
    using SafeERC20 for IERC20;

    mapping(address => uint256) public vaultFees;
    uint256 public totalFeesCollected;

    event FeeCollected(address indexed vault, address indexed asset, uint256 amount);
    event TreasuryWithdraw(address indexed to, address indexed asset, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Vaults call this after profit calculation.
     */
    function collectFee(address asset, uint256 amount) external {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        vaultFees[msg.sender] += amount;
        totalFeesCollected += amount;
        emit FeeCollected(msg.sender, asset, amount);
    }

    /**
     * @dev Platform owner can withdraw collected fees.
     */
    function withdraw(address asset, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        IERC20(asset).safeTransfer(to, amount);
        emit TreasuryWithdraw(to, asset, amount);
    }
}
