// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library RiskValidator {
    enum RiskProfile { Conservative, Balanced, Aggressive }

    struct RiskLimits {
        uint256 maxHighRisk;  // in basis points (e.g., 2000 = 20%)
        uint256 minStable;    // in basis points (e.g., 5000 = 50%)
    }

    event TradeRejected(string reason, address asset, uint256 amount);

    function getLimits(RiskProfile profile) public pure returns (RiskLimits memory) {
        if (profile == RiskProfile.Conservative) {
            return RiskLimits(2000, 5000);
        } else if (profile == RiskProfile.Balanced) {
            return RiskLimits(5000, 2000);
        } else {
            return RiskLimits(8000, 500);
        }
    }

    function validateTrade(
        RiskProfile profile,
        address /*asset*/,
        uint256 amount,
        string memory /*tradeType*/,
        uint256 currentHighRiskAllocation,
        uint256 currentStableAllocation,
        uint256 totalAssets,
        bool isHighRisk
    ) public pure returns (bool) {
        // Enforce 40% Liquidity Buffer: Total allocation (High Risk + Stable) cannot exceed 60%
        uint256 totalAllocated = currentHighRiskAllocation + currentStableAllocation + amount;
        if ((totalAllocated * 10000) / totalAssets > 6000) {
            return false; // Rejects trade if it would leave less than 40% idle USDC
        }

        RiskLimits memory limits = getLimits(profile);
        
        uint256 newAllocation;
        if (isHighRisk) {
            newAllocation = ((currentHighRiskAllocation + amount) * 10000) / totalAssets;
            if (newAllocation > limits.maxHighRisk) {
                return false;
            }
        }
        
        return true;
    }
}
