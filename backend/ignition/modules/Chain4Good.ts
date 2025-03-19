import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

export default buildModule("DonationPoolsModule", (m) => {
  const deployer = m.getAccount(0)

  console.log("deployer", deployer)
  const veraToken = m.contract("VERA")
  const donationPools = m.contract("DonationPools", [veraToken])
  m.call(veraToken, "transferOwnership", [donationPools])

  return { veraToken, donationPools }
})
