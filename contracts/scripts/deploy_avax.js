const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy RiskValidator Library
  const RiskValidator = await hre.ethers.getContractFactory("RiskValidator");
  const riskValidator = await RiskValidator.deploy();
  await riskValidator.waitForDeployment();
  console.log("RiskValidator deployed to:", await riskValidator.getAddress());

  // 2. Deploy PlatformTreasury
  const PlatformTreasury = await hre.ethers.getContractFactory("PlatformTreasury");
  const treasury = await PlatformTreasury.deploy(deployer.address);
  await treasury.waitForDeployment();
  console.log("PlatformTreasury deployed to:", await treasury.getAddress());

  // 3. Deploy AgentVault (using a placeholder asset, e.g. a mock USDC if on testnet)
  // For Fuji, we might want to deploy a mock token first or use an existing one.
  // Let's deploy a simple mock token for testing.
  const MockToken = await hre.ethers.getContractFactory("ERC20Mock");
  const mockUSDC = await MockToken.deploy("Mock USDC", "mUSDC", deployer.address, hre.ethers.parseEther("1000000"));
  await mockUSDC.waitForDeployment();
  console.log("Mock USDC deployed to:", await mockUSDC.getAddress());

  // 3. Deploy AgentVault 
  const joeRouter = "0x60ae616a2155ee3d9a68541ba4544862310933d4"; // Trader Joe Router (Mainnet)
  const stargateRouter = "0x45A131C20056C9d875043F2479CF540C6276004d"; // Stargate Router (Mainnet)

  // For Fuji, you should replace these with testnet addresses or mocks.
  // Using mocks for the dry run/testnet demonstration if needed.

  const AgentVault = await hre.ethers.getContractFactory("AgentVault", {
    libraries: {
      RiskValidator: await riskValidator.getAddress(),
    },
  });
  const vault = await AgentVault.deploy(
    await mockUSDC.getAddress(),
    "XMind Conservative Vault",
    "XMCV",
    0, // Conservative
    await treasury.getAddress(),
    deployer.address,
    joeRouter,
    stargateRouter
  );
  await vault.waitForDeployment();
  console.log("AgentVault deployed to:", await vault.getAddress());

  // 4. Deploy CREIntegration
  const CREIntegration = await hre.ethers.getContractFactory("CREIntegration");
  const cre = await CREIntegration.deploy(deployer.address, deployer.address);
  await cre.waitForDeployment();
  console.log("CREIntegration deployed to:", await cre.getAddress());

  // 5. Deploy VaultFactory
  const VaultFactory = await hre.ethers.getContractFactory("VaultFactory");
  const factory = await VaultFactory.deploy(
    await treasury.getAddress(),
    joeRouter,
    stargateRouter,
    deployer.address
  );
  await factory.waitForDeployment();
  console.log("VaultFactory deployed to:", await factory.getAddress());

  console.log("Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
