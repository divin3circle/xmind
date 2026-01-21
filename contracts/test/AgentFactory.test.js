const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AgentFactory Contract", function () {
  // Fixture for deploying the factory
  async function deployFactoryFixture() {
    const [owner, creator, agentWallet, user] = await ethers.getSigners();

    const deploymentFee = ethers.parseEther("2.0"); // 2 CRO

    const AgentFactory = await ethers.getContractFactory("AgentFactory");
    const factory = await AgentFactory.deploy(deploymentFee);

    return { factory, owner, creator, agentWallet, user, deploymentFee };
  }

  describe("Deployment", function () {
    it("Should set the correct deployment fee", async function () {
      const { factory, deploymentFee } = await loadFixture(
        deployFactoryFixture,
      );

      expect(await factory.deploymentFee()).to.equal(deploymentFee);
    });

    it("Should set the correct owner", async function () {
      const { factory, owner } = await loadFixture(deployFactoryFixture);

      expect(await factory.owner()).to.equal(owner.address);
    });

    it("Should start with zero agents", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);

      expect(await factory.getTotalAgents()).to.equal(0);
    });
  });

  describe("Agent Deployment", function () {
    it("Should deploy a new agent successfully", async function () {
      const { factory, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      const tx = await factory
        .connect(creator)
        .deployAgent(
          "Trading Bot",
          "Automated trading agent",
          "ipfs://image",
          "You are a trading assistant",
          agentWallet.address,
          { value: deploymentFee },
        );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "AgentDeployed",
      );

      expect(event).to.not.be.undefined;
      expect(await factory.getTotalAgents()).to.equal(1);

      const agents = await factory.getAllAgents();
      expect(agents.length).to.equal(1);

      const creatorAgents = await factory.getAgentsByCreator(creator.address);
      expect(creatorAgents.length).to.equal(1);
      expect(creatorAgents[0]).to.equal(agents[0]);
    });

    it("Should revert if deployment fee is insufficient", async function () {
      const { factory, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      const insufficientFee = deploymentFee - ethers.parseEther("0.1");

      await expect(
        factory
          .connect(creator)
          .deployAgent(
            "Trading Bot",
            "Description",
            "image.png",
            "Prompt",
            agentWallet.address,
            { value: insufficientFee },
          ),
      ).to.be.revertedWith("Insufficient deployment fee");
    });

    it("Should revert if name is empty", async function () {
      const { factory, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      await expect(
        factory
          .connect(creator)
          .deployAgent(
            "",
            "Description",
            "image.png",
            "Prompt",
            agentWallet.address,
            { value: deploymentFee },
          ),
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should revert if system prompt is empty", async function () {
      const { factory, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      await expect(
        factory
          .connect(creator)
          .deployAgent(
            "Agent Name",
            "Description",
            "image.png",
            "",
            agentWallet.address,
            { value: deploymentFee },
          ),
      ).to.be.revertedWith("System prompt cannot be empty");
    });

    it("Should deploy multiple agents for same creator", async function () {
      const { factory, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      await factory
        .connect(creator)
        .deployAgent(
          "Agent 1",
          "Description 1",
          "image1.png",
          "Prompt 1",
          agentWallet.address,
          { value: deploymentFee },
        );

      await factory
        .connect(creator)
        .deployAgent(
          "Agent 2",
          "Description 2",
          "image2.png",
          "Prompt 2",
          agentWallet.address,
          { value: deploymentFee },
        );

      expect(await factory.getTotalAgents()).to.equal(2);

      const creatorAgents = await factory.getAgentsByCreator(creator.address);
      expect(creatorAgents.length).to.equal(2);
    });

    it("Should track agents from different creators", async function () {
      const { factory, creator, user, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      await factory
        .connect(creator)
        .deployAgent(
          "Agent 1",
          "Description",
          "image.png",
          "Prompt",
          agentWallet.address,
          { value: deploymentFee },
        );

      await factory
        .connect(user)
        .deployAgent(
          "Agent 2",
          "Description",
          "image.png",
          "Prompt",
          agentWallet.address,
          { value: deploymentFee },
        );

      expect(await factory.getTotalAgents()).to.equal(2);

      const creatorAgents = await factory.getAgentsByCreator(creator.address);
      const userAgents = await factory.getAgentsByCreator(user.address);

      expect(creatorAgents.length).to.equal(1);
      expect(userAgents.length).to.equal(1);
    });
  });

  describe("View Functions", function () {
    it("Should get all agents", async function () {
      const { factory, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      await factory
        .connect(creator)
        .deployAgent("Agent 1", "Desc", "img", "Prompt", agentWallet.address, {
          value: deploymentFee,
        });

      await factory
        .connect(creator)
        .deployAgent("Agent 2", "Desc", "img", "Prompt", agentWallet.address, {
          value: deploymentFee,
        });

      const agents = await factory.getAllAgents();
      expect(agents.length).to.equal(2);
    });

    it("Should get agent info", async function () {
      const { factory, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      await factory
        .connect(creator)
        .deployAgent(
          "Agent 1",
          "Description",
          "image.png",
          "Prompt",
          agentWallet.address,
          { value: deploymentFee },
        );

      const agents = await factory.getAllAgents();
      const agentAddress = agents[0];

      const info = await factory.getAgentInfo(agentAddress);

      expect(info.agentAddress).to.equal(agentAddress);
      expect(info.creator).to.equal(creator.address);
      expect(info.exists).to.equal(true);
    });

    it("Should revert getting info for non-existent agent", async function () {
      const { factory, user } = await loadFixture(deployFactoryFixture);

      await expect(factory.getAgentInfo(user.address)).to.be.revertedWith(
        "Agent does not exist",
      );
    });

    it("Should get paginated agents", async function () {
      const { factory, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      // Deploy 5 agents
      for (let i = 0; i < 5; i++) {
        await factory
          .connect(creator)
          .deployAgent(
            `Agent ${i}`,
            "Description",
            "image.png",
            "Prompt",
            agentWallet.address,
            { value: deploymentFee },
          );
      }

      const firstTwo = await factory.getAgentsPaginated(0, 2);
      expect(firstTwo.length).to.equal(2);

      const nextTwo = await factory.getAgentsPaginated(2, 2);
      expect(nextTwo.length).to.equal(2);

      const lastOne = await factory.getAgentsPaginated(4, 2);
      expect(lastOne.length).to.equal(1);
    });
  });

  describe("Fee Management", function () {
    it("Should update deployment fee", async function () {
      const { factory, owner } = await loadFixture(deployFactoryFixture);

      const newFee = ethers.parseEther("3.0");

      await expect(factory.updateDeploymentFee(newFee))
        .to.emit(factory, "DeploymentFeeUpdated")
        .withArgs(ethers.parseEther("2.0"), newFee);

      expect(await factory.deploymentFee()).to.equal(newFee);
    });

    it("Should not allow non-owner to update fee", async function () {
      const { factory, user } = await loadFixture(deployFactoryFixture);

      await expect(
        factory.connect(user).updateDeploymentFee(ethers.parseEther("3.0")),
      ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw fees", async function () {
      const { factory, owner, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      // Deploy an agent to generate fees
      await factory
        .connect(creator)
        .deployAgent(
          "Agent",
          "Description",
          "image.png",
          "Prompt",
          agentWallet.address,
          { value: deploymentFee },
        );

      const contractBalance = await factory.getBalance();
      expect(contractBalance).to.equal(deploymentFee);

      await expect(factory.withdrawFees(deploymentFee))
        .to.emit(factory, "FeesWithdrawn")
        .withArgs(owner.address, deploymentFee);

      expect(await factory.getBalance()).to.equal(0);
    });

    it("Should not allow non-owner to withdraw fees", async function () {
      const { factory, user } = await loadFixture(deployFactoryFixture);

      await expect(
        factory.connect(user).withdrawFees(ethers.parseEther("1.0")),
      ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
    });

    it("Should revert withdrawal if insufficient balance", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);

      await expect(
        factory.withdrawFees(ethers.parseEther("1.0")),
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Integration Tests", function () {
    it("Should create agent and interact with it", async function () {
      const { factory, creator, agentWallet, deploymentFee } =
        await loadFixture(deployFactoryFixture);

      // Deploy agent through factory
      await factory
        .connect(creator)
        .deployAgent(
          "Trading Bot",
          "Automated trading",
          "ipfs://image",
          "Trading prompt",
          agentWallet.address,
          { value: deploymentFee },
        );

      const agents = await factory.getAllAgents();
      const agentAddress = agents[0];

      // Get Agent contract instance
      const Agent = await ethers.getContractFactory("Agent");
      const agent = Agent.attach(agentAddress);

      // Verify agent details
      expect(await agent.name()).to.equal("Trading Bot");
      expect(await agent.creatorAddress()).to.equal(creator.address);
      expect(await agent.owner()).to.equal(creator.address);

      // Creator can interact with their agent
      await agent.connect(creator).recordTaskCompleted(1);
      expect(await agent.tasksCompleted()).to.equal(1);
    });
  });
});
