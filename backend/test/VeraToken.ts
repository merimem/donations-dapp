import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { VeraToken } from "../typechain-types"

const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("VeraToken", function () {
  let token: VeraToken
  let owner: HardhatEthersSigner
  let addr1: HardhatEthersSigner
  let addr2: HardhatEthersSigner

  beforeEach(async function () {
    const [admin, user1, user2] = await ethers.getSigners()

    // Deploy the contract
    const VeraToken = await ethers.getContractFactory("VeraToken")
    token = await VeraToken.deploy(admin.address)
    owner = admin
    addr1 = user1
    addr2 = user2
  })

  describe("Deployment", function () {
    it("should deploy and set the owner correctly", async function () {
      expect(await token.owner()).to.equal(owner.address)
    })
  })

  describe("Minting", function () {
    it("should allow the owner to mint tokens", async function () {
      await token.mint(addr1.address, 1000)
      const balance = await token.balanceOf(addr1.address)
      expect(balance).to.equal(1000)
    })

    it("should not allow non-owners to mint tokens", async function () {
      await expect(
        token.connect(addr1).mint(addr2.address, 1000)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
    })
  })

  describe("Send Tokens", function () {
    beforeEach(async function () {
      await token.mint(token.target, 1000)
    })

    it("should allow the owner to send tokens", async function () {
      const initialBalance = await token.balanceOf(addr1.address)
      await token.sendTokens(addr1.address, 500)

      const finalBalance = await token.balanceOf(addr1.address)
      expect(finalBalance - initialBalance).to.equal(500)
    })

    it("should not allow non-owners to send tokens", async function () {
      await expect(
        token.connect(addr1).sendTokens(addr2.address, 500)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
    })

    it("should fail if the contract doesn't have enough balance", async function () {
      await expect(token.sendTokens(addr1.address, 10000)).to.be.revertedWith(
        "Insufficient balance"
      )
    })
    it("should transfer tokens from contract to recipient when balance is sufficient", async function () {
      // Check initial balances
      const initialContractBalance = await token.balanceOf(token.target)
      const initialAddr1Balance = await token.balanceOf(addr1.address)

      // Amount to send
      const amount = 500

      // Send tokens
      await token.sendTokens(addr1.address, amount)

      // Check balances after transfer
      const finalContractBalance = await token.balanceOf(token.target)
      const finalAddr1Balance = await token.balanceOf(addr1.address)

      // Verify the contract's balance is reduced by the amount
      expect(finalContractBalance).to.equal(
        initialContractBalance - BigInt(amount)
      )

      // Verify the recipient's balance is increased by the amount
      expect(finalAddr1Balance).to.equal(initialAddr1Balance + BigInt(amount))
    })
  })
})
