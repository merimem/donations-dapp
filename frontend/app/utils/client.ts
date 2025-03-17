import { createPublicClient, http } from "viem"
import { hardhat } from "wagmi/chains"

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http("http://127.0.0.1:8545"),
})
