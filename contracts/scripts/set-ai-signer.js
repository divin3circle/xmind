const hre = require("hardhat");

async function main() {
  // CREIntegration contract address (from original deployment)
  const CRE_ADDRESS = "0x3f9320845083AC5Fd0dF1Aa330fb3506157fe918";
  // Deployer wallet = the AI signer for testnet
  const NEW_SIGNER = "0x30948E57475B302a43876F09De1017FaB165a60d";

  const cre = await hre.ethers.getContractAt("CREIntegration", CRE_ADDRESS);
  
  const currentSigner = await cre.aiSigner();
  console.log("Current aiSigner:", currentSigner);
  console.log("New aiSigner:    ", NEW_SIGNER);
  
  if (currentSigner.toLowerCase() === NEW_SIGNER.toLowerCase()) {
    console.log("Already set. No action needed.");
    return;
  }

  console.log("Calling setAISigner...");
  const tx = await cre.setAISigner(NEW_SIGNER);
  await tx.wait();
  console.log("✅ setAISigner tx:", tx.hash);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
