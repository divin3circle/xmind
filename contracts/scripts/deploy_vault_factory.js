const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 1. Deploy PlatformTreasury
  console.log("\nDeploying PlatformTreasury...");
  const PlatformTreasury = await hre.ethers.getContractFactory("PlatformTreasury");
  const treasury = await PlatformTreasury.deploy(deployer.address);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("PlatformTreasury deployed to:", treasuryAddress);

  // 2. Deploy RiskValidator Library (Required by AgentVault)
  console.log("\nDeploying RiskValidator Library...");
  const RiskValidator = await hre.ethers.getContractFactory("RiskValidator");
  const riskValidator = await RiskValidator.deploy();
  await riskValidator.waitForDeployment();
  const riskValidatorAddress = await riskValidator.getAddress();
  console.log("RiskValidator deployed to:", riskValidatorAddress);

  // 3. Deploy VaultFactory (which deploys AgentVault, which needs RiskValidator)
  // Constructor args: _treasury, _joeRouter, _stargateRouter, _initialOwner
  // Avalanche Fuji Testnet Routers:
  // LFJ (Trader Joe) Router V2: 0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901
  // Stargate Swap Router: 0x13df3Eb5bc0128Bdc37130b4DC8e3DbbA3ff6D73 
  console.log("\nDeploying VaultFactory...");
  const VaultFactory = await hre.ethers.getContractFactory("VaultFactory", {
    libraries: {
      RiskValidator: riskValidatorAddress,
    },
  });
  const vaultFactory = await VaultFactory.deploy(
    treasuryAddress,
    "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901", // LFJ Fuji
    "0x13df3eb5bc0128bdc37130b4dc8e3dbba3ff6d73", // Stargate Fuji (lowercase to bypass checksum)
    deployer.address
  );
  await vaultFactory.waitForDeployment();
  const vaultFactoryAddress = await vaultFactory.getAddress();
  console.log("VaultFactory deployed to:", vaultFactoryAddress);

  console.log("\nDeployment Successful 🎉");
  console.log("-----------------------------------------");
  console.log("NEXT_PUBLIC_VAULT_FACTORY_ADDRESS=", vaultFactoryAddress);
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
