import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const CRONOS_TESTNET_RPC =
  process.env.CRONOS_TESTNET_RPC || "https://evm-t0.cronos.org:8545";
const CRONOS_MAINNET_RPC =
  process.env.CRONOS_MAINNET_RPC || "https://evm.cronos.org:8545";
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    cronosTestnet: {
      url: CRONOS_TESTNET_RPC,
      chainId: 338,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
    cronosMainnet: {
      url: CRONOS_MAINNET_RPC,
      chainId: 25,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  paths: {
    sources: "./src",
    tests: "./test",
    artifacts: "./artifacts",
    cache: "./cache",
  },
};

export default config;
