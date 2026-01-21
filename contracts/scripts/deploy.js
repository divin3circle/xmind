const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting AgentFactory deployment...\n");

  // Get network
  const network = hre.network.name;
  console.log(`📡 Network: ${network}`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} CRO\n`);

  // Set deployment fee (2 CRO)
  const deploymentFee = ethers.parseEther("2.0");
  console.log(`💵 Deployment fee: ${ethers.formatEther(deploymentFee)} CRO\n`);

  // Deploy AgentFactory
  console.log("📝 Deploying AgentFactory contract...");
  const AgentFactory = await ethers.getContractFactory("AgentFactory");
  const factory = await AgentFactory.deploy(deploymentFee);

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("✅ AgentFactory deployed!\n");
  console.log("📋 Contract Details:");
  console.log(`   Address: ${factoryAddress}`);
  console.log(`   Deployment Fee: ${ethers.formatEther(deploymentFee)} CRO`);
  console.log(`   Owner: ${await factory.owner()}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: network,
    factoryAddress: factoryAddress,
    deploymentFee: deploymentFee.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n");

  // Verification instructions
  if (network !== "hardhat" && network !== "localhost") {
    console.log("🔍 To verify the contract, run:");
    console.log(
      `npx hardhat verify --network ${network} ${factoryAddress} "${deploymentFee}"`,
    );
    console.log("\n");
  }

  // Usage example
  console.log("📚 Usage Example:");
  console.log("To deploy an agent:");
  console.log(`
const factory = await ethers.getContractAt("AgentFactory", "${factoryAddress}");
const tx = await factory.deployAgent(
  "Agent Name",
  "Agent Description", 
  "ipfs://image-hash",
  "System prompt for the agent",
  "0x_AGENT_WALLET_ADDRESS",
  { value: ethers.parseEther("2.0") }
);
const receipt = await tx.wait();
console.log("Agent deployed!");
  `);

  return {
    factory: factoryAddress,
    deploymentFee: deploymentFee.toString(),
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
