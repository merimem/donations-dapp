import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { http } from "wagmi"
import { sepolia } from "wagmi/chains"

// export const config = getDefaultConfig({
//   appName: "Good4Chain",
//   projectId: "YOUR_PROJECT_ID",
//   chains: [hardhat],
//   ssr: true,
// })

export const config = getDefaultConfig({
  appName: "Chain4Good",
  projectId: "YOUR_PROJECT_ID",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/LjyUqVTQ5d8pBgPvLEUujMxnxoSJIj3M"
    ),
  },
  ssr: true,
})
