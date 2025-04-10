import { createPublicClient, http } from "viem"
import { hardhat } from "wagmi/chains"
import { sepolia } from "viem/chains"

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http("http://127.0.0.1:8545"),
})

// export const publicClient = createPublicClient({
//   chain: sepolia,
//   transport: http(process.env.RPC_URL),
// })
