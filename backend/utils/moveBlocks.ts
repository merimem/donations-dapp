import { network } from "hardhat"

//This script exports a function called moveBlocks that takes an amount parameter.
//It uses the Hardhat network provider to manually mine a specified number of blocks.
//could be used to advance the blockchain state by a certain number of blocks, simulating the passage of time or triggering events dependent on block timestamps.
export async function moveBlocks(amount: number) {
  console.log("Moving blocks...")
  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    })
  }
  console.log(`Moved ${amount} blocks`)
}
