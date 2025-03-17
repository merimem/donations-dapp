import hre from "hardhat"

async function main() {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
  const storage = await hre.ethers.getContractFactory("DonationPools")
  const contract = storage.attach("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199")

  //   const tx = await contract.donate(0, {
  //     value: "1000",
  //   })
  //   await tx.wait() // Attends que la transaction soit validée
  //console.log(`Donation réussie avec la tx: ${tx.hash}`)
  const poolIndex = hre.ethers.toBigInt(0)
  const pool = await contract.pools(poolIndex)
  console.log(`Pool ${0} balance: ${hre.ethers.formatEther(pool.balance)} ETH`)
  //.utils.formatEther(pool.balance)} ETH`
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
