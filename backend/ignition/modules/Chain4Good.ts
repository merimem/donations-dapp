import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import {
  QUORUM,
  TOKEN_REWARD_RATE,
  VERA_SUPPLY,
  VOTING_DELAY,
} from "../../utils/helpers"
export default buildModule("DonationPoolsModule", (m) => {
  const owner = m.getAccount(0)

  const veraToken = m.contract("VeraToken", [owner])

  const donationPools = m.contract("Chain4Good", [
    veraToken,
    VOTING_DELAY,
    TOKEN_REWARD_RATE,
    QUORUM,
  ])

  // m.call(veraToken, "mint", [veraToken, VERA_SUPPLY])
  m.call(veraToken, "transferOwnership", [donationPools])
  return { veraToken, donationPools }
})
