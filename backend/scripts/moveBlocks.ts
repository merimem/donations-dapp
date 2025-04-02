import { ethers, network } from "hardhat"
import { VOTING_DELAY } from "../utils/helpers"

export async function moveBlocks(amount: number) {
  console.log("Moving blocks...")
  for (let index = 0; index < amount; index++) {
    await network.provider.send("evm_mine")
  }
  console.log(`Moved ${amount} blocks`)
}
async function mineBlocks(numBlocks: number) {
  console.log(`Mining ${numBlocks} blocks...`)
  for (let i = 0; i < numBlocks; i++) {
    await ethers.provider.send("evm_mine")
  }
  console.log(`Mined ${numBlocks} blocks.`)
}

async function increaseTime(seconds: number) {
  console.log(`Increasing time by ${seconds} seconds...`)
  await ethers.provider.send("evm_increaseTime", [seconds])
  await ethers.provider.send("evm_mine")
  console.log(`Time increased by ${seconds} seconds.`)
}

async function fastForwardBlocks(blocksToSkip: number) {
  console.log(`Fast forwarding ${blocksToSkip} blocks...`)
  await ethers.provider.send("hardhat_mine", ["0x" + blocksToSkip.toString(16)])
  console.log(`Skipped ${blocksToSkip} blocks.`)
}

async function main() {
  await moveBlocks(VOTING_DELAY)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
