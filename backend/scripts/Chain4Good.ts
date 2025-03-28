import { ethers } from "hardhat"

async function main() {
  const [donor, adr2, addr3] = await ethers.getSigners()

  const DonationContract = await ethers.getContractFactory("Chain4Good")
  const donationContractAddress = "0x40918Ba7f132E0aCba2CE4de4c4baF9BD2D7D849"
  const donationContract = await DonationContract.attach(
    donationContractAddress
  )

  const donationAmount = ethers.parseEther("1") // Donating 1 ETH
  console.log(`Donating ${ethers.formatEther(donationAmount)} ETH...`)
  // Send the donation
  const tx = await donationContract
    .connect(addr3)
    .donate(0, { value: donationAmount })

  // Wait for the transaction to be mined
  await tx.wait()

  console.log(`Donation of 1 ETH successful! Transaction hash: ${tx.hash}`)

  // Check total donations
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
