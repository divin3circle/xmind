// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IStargateRouter.sol";

contract MockRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint
    ) external returns (uint[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        amounts[1] = amountOutMin; 
        return amounts;
    }

    function swap(
        uint16, uint256, uint256, address payable, uint256, uint256, 
        IStargateRouter.lzTxObj calldata, bytes calldata, bytes calldata
    ) external payable {
        // Just mock
    }
}
