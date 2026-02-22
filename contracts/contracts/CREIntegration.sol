// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgentVault.sol";

contract CREIntegration is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public aiSigner;
    mapping(uint256 => bool) public processedNonces;

    event CREInstructionReceived(address indexed vault, string action, address asset, uint256 amount);

    constructor(address _initialOwner) Ownable(_initialOwner) {
        aiSigner = 0x6916B33af69E109328420469A9B15a1293CdAa8B;
    }

    function setAISigner(address _newSigner) external onlyOwner {
        aiSigner = _newSigner;
    }

    /**
     * @dev Validates signed instructions and triggers trade execution.
     */
    function submitAIInstruction(
        address vault,
        address asset,
        uint256 amount,
        uint256 minAmountOut,
        AgentVault.Action action,
        bool isHighRisk,
        uint256 nonce,
        bytes calldata data,
        bytes memory signature
    ) external {
        require(!processedNonces[nonce], "Nonce already used");
        
        bytes32 messageHash = keccak256(abi.encodePacked(vault, asset, amount, minAmountOut, action, isHighRisk, nonce, data));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == aiSigner, "Invalid signature");

        processedNonces[nonce] = true;

        AgentVault(vault).executeTrade(asset, amount, minAmountOut, action, isHighRisk, data);
        
        emit CREInstructionReceived(vault, "AI_ACTION", asset, amount);
    }
}
