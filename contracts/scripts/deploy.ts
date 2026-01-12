import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying Cronos Agent Bazaar contracts...");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // For testing: Deploy MockERC20 as USDC
  // For mainnet: Use existing USDC address
  let usdcAddress: string;

  if (process.env.CRONOS_USDC_ADDRESS) {
    usdcAddress = process.env.CRONOS_USDC_ADDRESS;
    console.log(`Using existing USDC: ${usdcAddress}`);
  } else {
    console.log("Deploying mock USDC for testing...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockUsdc = await MockERC20.deploy("mUSDC", "mUSDC", 6);
    await mockUsdc.waitForDeployment();
    usdcAddress = mockUsdc.target.toString();
    console.log(`Mock USDC deployed to: ${usdcAddress}`);
  }

  // Deploy Reputation contract
  console.log("Deploying Reputation contract...");
  const ReputationFactory = await ethers.getContractFactory("Reputation");
  const reputation = await ReputationFactory.deploy(deployer.address); // Temp, will update
  await reputation.waitForDeployment();
  const reputationAddress = reputation.target.toString();
  console.log(`Reputation deployed to: ${reputationAddress}`);

  // Deploy Escrow contract
  console.log("Deploying Escrow contract...");
  const EscrowFactory = await ethers.getContractFactory("Escrow");
  const escrow = await EscrowFactory.deploy(usdcAddress, reputationAddress);
  await escrow.waitForDeployment();
  const escrowAddress = escrow.target.toString();
  console.log(`Escrow deployed to: ${escrowAddress}`);

  // Update Reputation to point to Escrow
  console.log("Updating Reputation to point to Escrow...");
  const tx = await reputation.setEscrowContract(escrowAddress);
  await tx.wait();
  console.log("Reputation updated");

  // Save deployment addresses
  const deploymentData = {
    network: process.env.HARDHAT_NETWORK || "hardhat",
    deployer: deployer.address,
    usdc: usdcAddress,
    reputation: reputationAddress,
    escrow: escrowAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = path.join(
    deploymentsDir,
    `${process.env.HARDHAT_NETWORK || "hardhat"}.json`
  );
  fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));

  console.log("\n========== Deployment Summary ==========");
  console.log(`USDC Token:        ${deploymentData.usdc}`);
  console.log(`Reputation:        ${deploymentData.reputation}`);
  console.log(`Escrow:            ${deploymentData.escrow}`);
  console.log(`Deployer:          ${deploymentData.deployer}`);
  console.log(`Network:           ${deploymentData.network}`);
  console.log(`Block Number:      ${deploymentData.blockNumber}`);
  console.log(`Timestamp:         ${deploymentData.timestamp}`);
  console.log("========================================\n");

  console.log(`Deployment info saved to: ${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
