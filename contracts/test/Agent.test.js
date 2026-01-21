const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Agent Contract", function () {
  // Fixture for deploying the contract
  async function deployAgentFixture() {
    const [owner, agentWallet, user] = await ethers.getSigners();

    const Agent = await ethers.getContractFactory("Agent");
    const agent = await Agent.deploy(
      "Trading Agent",
      "Automated trading agent for DeFi",
      "ipfs://QmExample",
      "You are a helpful trading assistant",
      agentWallet.address,
      owner.address,
    );

    return { agent, owner, agentWallet, user };
  }

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      const { agent, owner, agentWallet } = await loadFixture(
        deployAgentFixture,
      );

      expect(await agent.name()).to.equal("Trading Agent");
      expect(await agent.description()).to.equal(
        "Automated trading agent for DeFi",
      );
      expect(await agent.image()).to.equal("ipfs://QmExample");
      expect(await agent.systemPrompt()).to.equal(
        "You are a helpful trading assistant",
      );
      expect(await agent.agentWalletAddress()).to.equal(agentWallet.address);
      expect(await agent.creatorAddress()).to.equal(owner.address);
      expect(await agent.owner()).to.equal(owner.address);
      expect(await agent.isActive()).to.equal(true);
      expect(await agent.tasksCompleted()).to.equal(0);
      expect(await agent.tasksRan()).to.equal(0);
    });

    it("Should revert if name is empty", async function () {
      const [owner, agentWallet] = await ethers.getSigners();
      const Agent = await ethers.getContractFactory("Agent");

      await expect(
        Agent.deploy(
          "",
          "Description",
          "image.png",
          "Prompt",
          agentWallet.address,
          owner.address,
        ),
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should revert if system prompt is empty", async function () {
      const [owner, agentWallet] = await ethers.getSigners();
      const Agent = await ethers.getContractFactory("Agent");

      await expect(
        Agent.deploy(
          "Agent Name",
          "Description",
          "image.png",
          "",
          agentWallet.address,
          owner.address,
        ),
      ).to.be.revertedWith("System prompt cannot be empty");
    });

    it("Should revert if wallet address is zero", async function () {
      const [owner] = await ethers.getSigners();
      const Agent = await ethers.getContractFactory("Agent");

      await expect(
        Agent.deploy(
          "Agent Name",
          "Description",
          "image.png",
          "Prompt",
          ethers.ZeroAddress,
          owner.address,
        ),
      ).to.be.revertedWith("Invalid wallet address");
    });
  });

  describe("Update Functions", function () {
    it("Should update agent info", async function () {
      const { agent } = await loadFixture(deployAgentFixture);

      await expect(
        agent.updateAgentInfo("New Name", "New Description", "newimage.png"),
      )
        .to.emit(agent, "AgentUpdated")
        .withArgs("New Name", "New Description", "newimage.png");

      expect(await agent.name()).to.equal("New Name");
      expect(await agent.description()).to.equal("New Description");
      expect(await agent.image()).to.equal("newimage.png");
    });

    it("Should not allow non-owner to update agent info", async function () {
      const { agent, user } = await loadFixture(deployAgentFixture);

      await expect(
        agent.connect(user).updateAgentInfo("New Name", "New Desc", "new.png"),
      ).to.be.revertedWithCustomError(agent, "OwnableUnauthorizedAccount");
    });

    it("Should update system prompt", async function () {
      const { agent } = await loadFixture(deployAgentFixture);

      const newPrompt = "New system prompt";
      await expect(agent.updateSystemPrompt(newPrompt))
        .to.emit(agent, "SystemPromptUpdated")
        .withArgs(newPrompt);

      expect(await agent.systemPrompt()).to.equal(newPrompt);
    });

    it("Should revert when updating with empty name", async function () {
      const { agent } = await loadFixture(deployAgentFixture);

      await expect(
        agent.updateAgentInfo("", "Description", "image.png"),
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Task Management", function () {
    it("Should record completed tasks", async function () {
      const { agent } = await loadFixture(deployAgentFixture);

      const tx = await agent.recordTaskCompleted(1);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "TaskCompleted",
      );
      expect(event).to.not.be.undefined;
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      expect(event.args[0]).to.equal(1);
      expect(event.args[1]).to.equal(block.timestamp);

      expect(await agent.tasksCompleted()).to.equal(1);

      await agent.recordTaskCompleted(2);
      expect(await agent.tasksCompleted()).to.equal(2);
    });

    it("Should record ran tasks", async function () {
      const { agent } = await loadFixture(deployAgentFixture);

      const tx = await agent.recordTaskRan(1);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "TaskRan",
      );
      expect(event).to.not.be.undefined;
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      expect(event.args[0]).to.equal(1);
      expect(event.args[1]).to.equal(block.timestamp);

      expect(await agent.tasksRan()).to.equal(1);
    });

    it("Should not allow task recording when inactive", async function () {
      const { agent } = await loadFixture(deployAgentFixture);

      await agent.toggleActiveStatus();
      expect(await agent.isActive()).to.equal(false);

      await expect(agent.recordTaskCompleted(1)).to.be.revertedWith(
        "Agent is not active",
      );

      await expect(agent.recordTaskRan(1)).to.be.revertedWith(
        "Agent is not active",
      );
    });
  });

  describe("Status Management", function () {
    it("Should toggle active status", async function () {
      const { agent } = await loadFixture(deployAgentFixture);

      expect(await agent.isActive()).to.equal(true);

      await expect(agent.toggleActiveStatus())
        .to.emit(agent, "AgentStatusChanged")
        .withArgs(false);

      expect(await agent.isActive()).to.equal(false);

      await agent.toggleActiveStatus();
      expect(await agent.isActive()).to.equal(true);
    });
  });

  describe("Payment Management", function () {
    it("Should receive payments", async function () {
      const { agent, user } = await loadFixture(deployAgentFixture);

      const paymentAmount = ethers.parseEther("1.0");

      await expect(
        user.sendTransaction({
          to: await agent.getAddress(),
          value: paymentAmount,
        }),
      )
        .to.emit(agent, "PaymentReceived")
        .withArgs(user.address, paymentAmount);

      expect(await agent.totalEarnings()).to.equal(paymentAmount);
      expect(await agent.getBalance()).to.equal(paymentAmount);
    });

    it("Should allow owner to withdraw earnings", async function () {
      const { agent, owner, user } = await loadFixture(deployAgentFixture);

      const paymentAmount = ethers.parseEther("2.0");
      await user.sendTransaction({
        to: await agent.getAddress(),
        value: paymentAmount,
      });

      const withdrawAmount = ethers.parseEther("1.0");
      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner.address,
      );

      await expect(agent.withdrawEarnings(withdrawAmount))
        .to.emit(agent, "EarningsWithdrawn")
        .withArgs(owner.address, withdrawAmount);

      expect(await agent.getBalance()).to.equal(ethers.parseEther("1.0"));
    });

    it("Should not allow non-owner to withdraw", async function () {
      const { agent, user } = await loadFixture(deployAgentFixture);

      await user.sendTransaction({
        to: await agent.getAddress(),
        value: ethers.parseEther("1.0"),
      });

      await expect(
        agent.connect(user).withdrawEarnings(ethers.parseEther("0.5")),
      ).to.be.revertedWithCustomError(agent, "OwnableUnauthorizedAccount");
    });

    it("Should revert withdrawal if insufficient balance", async function () {
      const { agent } = await loadFixture(deployAgentFixture);

      await expect(
        agent.withdrawEarnings(ethers.parseEther("1.0")),
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("View Functions", function () {
    it("Should return complete agent info", async function () {
      const { agent, owner, agentWallet } = await loadFixture(
        deployAgentFixture,
      );

      const info = await agent.getAgentInfo();

      expect(info[0]).to.equal("Trading Agent");
      expect(info[1]).to.equal("Automated trading agent for DeFi");
      expect(info[2]).to.equal("ipfs://QmExample");
      expect(info[3]).to.equal("You are a helpful trading assistant");
      expect(info[4]).to.equal(agentWallet.address);
      expect(info[5]).to.equal(owner.address);
      expect(info[6]).to.equal(0); // tasksCompleted
      expect(info[7]).to.equal(0); // tasksRan
      expect(info[10]).to.equal(true); // isActive
    });
  });
});

async function getLatestTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}
