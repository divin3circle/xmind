const hre = require("hardhat");

async function main() {
  // User-provided correct addresses
  const FACTORY = "0x4fbd789576a345fEEc104D956C7bf79EbEAeEd26";
  const TREASURY = "0x30948E57475B302a43876F09De1017FaB165a60d"; // deployer wallet
  const ROUTER = "0x324C51FB5DFaB1a6f04Fa209708b4764A490bDaf"; // MockDeFiRouter (just deployed)

  const factory = await hre.ethers.getContractAt("VaultFactory", FACTORY);
  
  console.log("Calling VaultFactory.setDefaults()...");
  console.log("  Treasury:", TREASURY);
  console.log("  JoeRouter → MockDeFiRouter:", ROUTER);
  console.log("  StargateRouter → MockDeFiRouter:", ROUTER);
  
  const tx = await factory.setDefaults(TREASURY, ROUTER, ROUTER);
  await tx.wait();
  console.log("✅ Done! Tx:", tx.hash);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
