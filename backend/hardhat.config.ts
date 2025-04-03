import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@typechain/hardhat"
require("@typechain/hardhat")
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-chai-matchers"
import * as dotenv from "dotenv"
dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || ""

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const RPC_URL_SEPOLIA = process.env.RPC_URL_SEPOLIA || ""

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "sepolia",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      allowUnlimitedContractSize: true,
      gas: 30000000,
      blockGasLimit: 30000000,
    },
    sepolia: {
      url: RPC_URL_SEPOLIA,
      chainId: 11155111,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: true,
  },
}

export default config
