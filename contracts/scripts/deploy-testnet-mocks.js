const hre = require("hardhat");

/**
 * Deploy mock token ecosystem + MockDeFiRouter to Avalanche Fuji.
 * Then update the existing VaultFactory's defaults to point to the mock router.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-testnet-mocks.js --network avalancheFuji
 *
 * Prerequisites:
 *   - PRIVATE_KEY set in .env
 *   - Existing VaultFactory address set below
 */

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
// Update this with your deployed VaultFactory address
const VAULT_FACTORY_ADDRESS = "0x4fbd789576a345fEEc104D956C7bf79EbEAeEd26";
// Treasury = deployer wallet (holds the 1M mUSDC supply)
const TREASURY_ADDRESS = "0x30948E57475B302a43876F09De1017FaB165a60d";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying mocks with account:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "AVAX\n");

  // ─── 1. Deploy Mock Tokens ────────────────────────────────────────────
  const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");

  console.log("Deploying mWETH...");
  const mWETH = await ERC20Mock.deploy("Mock Wrapped ETH", "mWETH", deployer.address, 0);
  await mWETH.waitForDeployment();
  console.log("  mWETH:", await mWETH.getAddress());

  console.log("Deploying mWAVAX...");
  const mWAVAX = await ERC20Mock.deploy("Mock Wrapped AVAX", "mWAVAX", deployer.address, 0);
  await mWAVAX.waitForDeployment();
  console.log("  mWAVAX:", await mWAVAX.getAddress());

  console.log("Deploying mWBTC...");
  const mWBTC = await ERC20Mock.deploy("Mock Wrapped BTC", "mWBTC", deployer.address, 0);
  await mWBTC.waitForDeployment();
  console.log("  mWBTC:", await mWBTC.getAddress());

  // ─── 2. Deploy MockDeFiRouter ─────────────────────────────────────────
  console.log("\nDeploying MockDeFiRouter...");
  const MockDeFiRouter = await hre.ethers.getContractFactory("MockDeFiRouter");
  const router = await MockDeFiRouter.deploy();
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("  MockDeFiRouter:", routerAddress);

  // ─── 3. Update VaultFactory Defaults ──────────────────────────────────
  console.log("\nUpdating VaultFactory defaults...");
  const VaultFactory = await hre.ethers.getContractAt("VaultFactory", VAULT_FACTORY_ADDRESS);
  const checksummedTreasury = hre.ethers.getAddress(TREASURY_ADDRESS);
  const tx = await VaultFactory.setDefaults(
    checksummedTreasury,
    routerAddress,  // joeRouter → MockDeFiRouter
    routerAddress   // stargateRouter → MockDeFiRouter
  );
  await tx.wait();
  console.log("  ✅ VaultFactory.setDefaults() updated!");

  // ─── Summary ──────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Testnet Mock Deployment Complete 🎉");
  console.log("═══════════════════════════════════════════════════");
  console.log("  mWETH:          ", await mWETH.getAddress());
  console.log("  mWAVAX:         ", await mWAVAX.getAddress());
  console.log("  mWBTC:          ", await mWBTC.getAddress());
  console.log("  MockDeFiRouter: ", routerAddress);
  console.log("  VaultFactory:   ", VAULT_FACTORY_ADDRESS, "(updated)");
  console.log("═══════════════════════════════════════════════════");
  console.log("\nNext steps:");
  console.log("  1. Create a NEW vault via the frontend (it will use MockDeFiRouter)");
  console.log("  2. Update config.staging.json with the new vault address");
  console.log("  3. Re-run: cre workflow simulate xmind-workflow --target staging-settings");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
