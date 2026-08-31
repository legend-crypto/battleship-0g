import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_FILE || "../.env" });
dotenv.config({ path: ".env" });

const TESTNET_PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun", // Mandatory for 0G Chain
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    zeroGTestnet: {
      url: process.env.ZEROG_TESTNET_RPC || "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: [TESTNET_PRIVATE_KEY],
    },
    zeroGMainnet: {
      url: process.env.ZEROG_MAINNET_RPC || "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: MAINNET_PRIVATE_KEY ? [MAINNET_PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
