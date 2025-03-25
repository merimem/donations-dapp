import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

export default buildModule("DonationPoolsModule", (m) => {
  const owner = m.getAccount(0)

  const veraToken = m.contract("VeraToken", [owner])
  const donationPools = m.contract("Chain4Good", [veraToken])

  m.call(veraToken, "transferOwnership", [donationPools])

  return { veraToken, donationPools }
})
