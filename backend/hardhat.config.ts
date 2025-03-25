import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@typechain/hardhat"
require("@typechain/hardhat")
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-chai-matchers"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true, //Enables the solidity optimizer.
        runs: 200, //Specifies the number of runs the optimizer should perform.
      },
    },
  },
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      allowUnlimitedContractSize: true,
      gas: 30000000, // Match block gas limit
      blockGasLimit: 30000000, // Ensure Hardhat runs with this limit
    },
  },
}

export default config
