import { ethers } from "hardhat"

async function main() {
  const [owner, donor, adr2, addr3] = await ethers.getSigners()

  const DonationContract = await ethers.getContractFactory("Chain4Good")
  const donationContractAddress = "0xF9c0bF1CFAAB883ADb95fed4cfD60133BffaB18a"
  const donationContract = await DonationContract.attach(
    donationContractAddress
  )

  const donationAmount = ethers.parseEther("1") // Donating 1 ETH
  console.log(`Donating ${ethers.formatEther(donationAmount)} ETH...`)
  // Send the donation
  const tx = await donationContract
    .connect(addr3)
    .donate(0, { value: donationAmount })
  await donationContract.connect(addr3).donate(0, { value: donationAmount })
  await tx.wait()

  const y = await donationContract
    .connect(owner)
    .getContribution(0, addr3.address)
  // Wait for the transaction to be mined
  console.log("yyyyy", y.toString())

  console.log(`Donation of 1 ETH successful! Transaction hash: ${tx.hash}`)

  // Check total donations
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
