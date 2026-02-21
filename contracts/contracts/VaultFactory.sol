// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgentVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultFactory is Ownable {
    address[] public allVaults;
    mapping(address => address[]) public ownerToVaults;

    address public defaultTreasury;
    address public defaultJoeRouter;
    address public defaultStargateRouter;

    event VaultCreated(address indexed vault, address indexed owner, address asset);

    constructor(
        address _treasury,
        address _joeRouter,
        address _stargateRouter,
        address _initialOwner
    ) Ownable(_initialOwner) {
        defaultTreasury = _treasury;
        defaultJoeRouter = _joeRouter;
        defaultStargateRouter = _stargateRouter;
    }

    function deployVault(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        RiskValidator.RiskProfile _riskProfile
    ) external returns (address) {
        AgentVault newVault = new AgentVault(
            _asset,
            _name,
            _symbol,
            _riskProfile,
            defaultTreasury,
            msg.sender,
            defaultJoeRouter,
            defaultStargateRouter
        );

        allVaults.push(address(newVault));
        ownerToVaults[msg.sender].push(address(newVault));

        emit VaultCreated(address(newVault), msg.sender, address(_asset));
        return address(newVault);
    }

    function setDefaults(
        address _treasury,
        address _joeRouter,
        address _stargateRouter
    ) external onlyOwner {
        defaultTreasury = _treasury;
        defaultJoeRouter = _joeRouter;
        defaultStargateRouter = _stargateRouter;
    }

    function getVaultsByOwner(address owner) external view returns (address[] memory) {
        return ownerToVaults[owner];
    }

    function totalVaults() external view returns (uint256) {
        return allVaults.length;
    }
}
