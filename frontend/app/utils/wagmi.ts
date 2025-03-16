import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { hardhat, sepolia } from "wagmi/chains"

export const config = getDefaultConfig({
  appName: "Good4Chain",
  projectId: "YOUR_PROJECT_ID",
  chains: [hardhat],
  ssr: true,
})
