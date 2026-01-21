const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * Script to interact with deployed AgentFactory
 * Usage: npx hardhat run scripts/interact.js --network cronosTestnet
 */

// Replace with your deployed factory address
const FACTORY_ADDRESS = "YOUR_FACTORY_ADDRESS_HERE";

async function main() {
  console.log("🤖 Agent Factory Interaction Script\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Connected account: ${deployer.address}\n`);

  // Get factory instance
  const factory = await ethers.getContractAt("AgentFactory", FACTORY_ADDRESS);

  // Get factory info
  console.log("📊 Factory Information:");
  const deploymentFee = await factory.deploymentFee();
  const totalAgents = await factory.getTotalAgents();
  const balance = await factory.getBalance();

  console.log(`   Address: ${FACTORY_ADDRESS}`);
  console.log(`   Deployment Fee: ${ethers.formatEther(deploymentFee)} CRO`);
  console.log(`   Total Agents: ${totalAgents}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} CRO\n`);

  // Example: Deploy a new agent
  console.log("🚀 Deploying a new agent...");

  const agentParams = {
    name: "Trading Assistant",
    description: "An AI agent for automated DeFi trading strategies",
    image: "ipfs://QmExampleImageHash",
    systemPrompt:
      "You are an expert DeFi trading assistant. Help users optimize their trading strategies.",
    agentWalletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Replace with actual wallet
  };

  try {
    const tx = await factory.deployAgent(
      agentParams.name,
      agentParams.description,
      agentParams.image,
      agentParams.systemPrompt,
      agentParams.agentWalletAddress,
      { value: deploymentFee },
    );

    console.log(`   Transaction hash: ${tx.hash}`);
    console.log("   Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("   ✅ Agent deployed successfully!\n");

    // Get deployed agent address from event
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "AgentDeployed",
    );

    if (event) {
      const agentAddress = event.args[0];
      console.log(`   Agent Address: ${agentAddress}\n`);

      // Interact with the deployed agent
      const agent = await ethers.getContractAt("Agent", agentAddress);
      const agentInfo = await agent.getAgentInfo();

      console.log("📋 Agent Details:");
      console.log(`   Name: ${agentInfo[0]}`);
      console.log(`   Description: ${agentInfo[1]}`);
      console.log(`   Creator: ${agentInfo[5]}`);
      console.log(`   Status: ${agentInfo[10] ? "Active" : "Inactive"}`);
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
  }

  // Get all agents
  console.log("\n📚 Listing all deployed agents:");
  const allAgents = await factory.getAllAgents();

  if (allAgents.length === 0) {
    console.log("   No agents deployed yet");
  } else {
    for (let i = 0; i < allAgents.length; i++) {
      const agentAddress = allAgents[i];
      const agent = await ethers.getContractAt("Agent", agentAddress);
      const name = await agent.name();
      const creator = await agent.creatorAddress();

      console.log(`   ${i + 1}. ${name} - ${agentAddress}`);
      console.log(`      Creator: ${creator}`);
    }
  }

  // Get user's agents
  console.log(`\n🔍 Your deployed agents:`);
  const userAgents = await factory.getAgentsByCreator(deployer.address);

  if (userAgents.length === 0) {
    console.log("   You haven't deployed any agents yet");
  } else {
    for (let i = 0; i < userAgents.length; i++) {
      const agent = await ethers.getContractAt("Agent", userAgents[i]);
      const name = await agent.name();
      console.log(`   ${i + 1}. ${name} - ${userAgents[i]}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
