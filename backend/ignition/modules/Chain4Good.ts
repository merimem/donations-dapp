import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import { QUORUM, TOKEN_REWARD_RATE, VOTING_DELAY } from "../../utils/helpers"
export default buildModule("DonationPoolsModule", (m) => {
  const owner = m.getAccount(0)

  const veraToken = m.contract("VeraToken", [owner])
  const couponNFT = m.contract("CouponNFT", [owner])

  const donationPools = m.contract("Chain4Good", [
    veraToken,
    couponNFT,
    VOTING_DELAY,
    TOKEN_REWARD_RATE,
    QUORUM,
  ])

  m.call(veraToken, "transferOwnership", [donationPools])
  m.call(couponNFT, "transferOwnership", [donationPools])
  return { veraToken, couponNFT, donationPools }
})
