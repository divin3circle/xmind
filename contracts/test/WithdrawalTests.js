const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentVault Withdrawal & Liquidity Tests", function () {
  let vault, mockUSDC, treasury, riskValidator, owner, user, mockRouter;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const RiskValidator = await ethers.getContractFactory("RiskValidator");
    riskValidator = await RiskValidator.deploy();

    const MockToken = await ethers.getContractFactory("ERC20Mock");
    mockUSDC = await MockToken.deploy("Mock USDC", "mUSDC", owner.address, ethers.parseEther("1000000"));

    const PlatformTreasury = await ethers.getContractFactory("PlatformTreasury");
    treasury = await PlatformTreasury.deploy(owner.address);

    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();

    const AgentVault = await ethers.getContractFactory("AgentVault", {
      libraries: { RiskValidator: await riskValidator.getAddress() },
    });
    vault = await AgentVault.deploy(
      await mockUSDC.getAddress(),
      "XMind Vault",
      "XMV",
      0, // Conservative
      await treasury.getAddress(),
      owner.address,
      await mockRouter.getAddress(),
      await mockRouter.getAddress()
    );

    await mockUSDC.transfer(user.address, ethers.parseEther("1000"));
    await mockUSDC.connect(user).approve(await vault.getAddress(), ethers.parseEther("1000"));
  });

  it("Should calculate NAV correctly after a trade", async function () {
    await vault.connect(user).deposit(ethers.parseEther("1000"), user.address);
    // Trade 30% capital
    await vault.executeTrade(owner.address, ethers.parseEther("300"), 0, 0, false, "0x");
    expect(await vault.totalAssets()).to.equal(ethers.parseEther("1000"));
    expect(await mockUSDC.balanceOf(await vault.getAddress())).to.equal(ethers.parseEther("700"));
  });

  it("Should FAIL to invest more than 60% of total assets (Liquidity Buffer)", async function () {
    await vault.connect(user).deposit(ethers.parseEther("1000"), user.address);
    
    // AI tries to invest 601 USDC (60.1%)
    await expect(
        vault.executeTrade(owner.address, ethers.parseEther("601"), 0, 0, false, "0x")
    ).to.be.revertedWith("Trade violates risk limits");
  });

  it("Should allow investing exactly 60%", async function () {
    await vault.connect(user).deposit(ethers.parseEther("1000"), user.address);
    await vault.executeTrade(owner.address, ethers.parseEther("600"), 0, 0, false, "0x");
    expect(await mockUSDC.balanceOf(await vault.getAddress())).to.equal(ethers.parseEther("400"));
  });

  it("Should allow withdrawal up to the idle amount (40%)", async function () {
    await vault.connect(user).deposit(ethers.parseEther("1000"), user.address);
    await vault.executeTrade(owner.address, ethers.parseEther("600"), 0, 0, false, "0x");
    
    // Withdraw 400 USDC (all idle cash)
    await vault.connect(user).withdraw(ethers.parseEther("400"), user.address, user.address);
    expect(await mockUSDC.balanceOf(user.address)).to.equal(ethers.parseEther("400"));
  });
});
