import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { CouponNFT } from "../typechain-types"

const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("CouponNFT", function () {
  let couponNFT: CouponNFT
  let owner: HardhatEthersSigner
  let user1: HardhatEthersSigner
  let user2: HardhatEthersSigner

  beforeEach(async function () {
    const [admin, addr2, addr3] = await ethers.getSigners()

    const CouponNFT = await ethers.getContractFactory("CouponNFT")
    couponNFT = await CouponNFT.deploy(admin.getAddress())
    await couponNFT.waitForDeployment()
    owner = admin
    user1 = addr2
    user2 = addr3
  })
  describe("deploy", function () {
    it("Should deploy with correct owner", async function () {
      expect(await couponNFT.owner()).to.equal(owner.address)
    })
  })

  describe("createCoupon", function () {
    it("Should allow owner to create a coupon", async function () {
      const tx = await couponNFT.createCoupon(1000, 1, user1.address)
      await tx.wait()

      expect(await couponNFT.nextTokenId()).to.equal(1)
    })
    it("Should store correct coupon details", async function () {
      await couponNFT.createCoupon(500, 2, user1.address)

      const value = await couponNFT.getCouponValue(0, 2)
      expect(value).to.equal(500)
    })

    it("Should prevent non-owner from creating a coupon", async function () {
      await expect(
        couponNFT.connect(user1).createCoupon(1000, 1, user2.address)
      ).to.be.revertedWithCustomError(couponNFT, "OwnableUnauthorizedAccount")
    })
  })

  describe("redeemCoupon", function () {
    const projectId = 1
    it("Should allow owner of coupon to redeem it", async function () {
      const value = ethers.parseEther("1")

      await owner.sendTransaction({ to: couponNFT.target, value })

      const tx = await couponNFT.createCoupon(value, projectId, user1.address)
      const receipt = await tx.wait()

      const transferEvent =
        receipt && receipt.logs.find((log) => log.address === couponNFT.target)
      const tokenId = transferEvent && transferEvent.args[2]
      const couponValue = await couponNFT.getCouponValue(tokenId, projectId)

      expect(couponValue).to.equal(value)

      await couponNFT.connect(user1).redeemCoupon(tokenId, projectId)

      expect(couponNFT.getCouponValue(tokenId, projectId)).to.be.revertedWith(
        "Coupon does not exist"
      )
    })

    it("Should prevent non-owners from redeeming someone else's coupon", async function () {
      await couponNFT.createCoupon(1000, projectId, user1.address)

      await expect(
        couponNFT.connect(user2).redeemCoupon(0, projectId)
      ).to.be.revertedWith("You are not the owner")
    })

    it("Should prevent redeeming a non-existent coupon", async function () {
      await expect(couponNFT.redeemCoupon(99, projectId)).to.be.revertedWith(
        "Coupon does not exist"
      )
    })

    it("Should transfer ETH when coupon is redeemed", async function () {
      const initialFunding = ethers.parseEther("5")
      await owner.sendTransaction({
        to: couponNFT.target,
        value: initialFunding,
      })

      const couponValue = ethers.parseEther("5")
      const tx = await couponNFT.createCoupon(
        couponValue,
        projectId,
        user1.address
      )
      const receipt = await tx.wait()

      const transferEvent =
        receipt && receipt.logs.find((log) => log.address === couponNFT.target)
      const tokenId = transferEvent && transferEvent.args[2]
      const contractBalanceBefore = await ethers.provider.getBalance(
        couponNFT.target
      )

      const recipientBalanceBefore = await ethers.provider.getBalance(
        user1.address
      )

      const redeemTx = await couponNFT
        .connect(user1)
        .redeemCoupon(tokenId, projectId)
      await redeemTx.wait()

      const recipientBalanceAfter = await ethers.provider.getBalance(
        user1.address
      )

      expect(recipientBalanceAfter).to.be.above(recipientBalanceBefore) // ETH received

      const contractBalanceAfter = await ethers.provider.getBalance(
        couponNFT.target
      )
      expect(contractBalanceAfter).to.equal(contractBalanceBefore - couponValue) // ETH deducted
    })

    it("Should burn the coupon after redeeming", async function () {
      // Step 1: Fund the contract so it can transfer ETH
      const initialFunding = ethers.parseEther("1") // 1 ETH
      await owner.sendTransaction({
        to: couponNFT.target,
        value: initialFunding,
      })

      const couponValue = ethers.parseEther("0.1")
      const tx = await couponNFT.createCoupon(
        couponValue,
        projectId,
        user1.address
      )
      const receipt = await tx.wait()
      //@ts-ignore
      const transferEvent = receipt.logs.find(
        (log) => log.address === couponNFT.target
      )
      //@ts-ignore
      const tokenId = transferEvent.args[2]

      expect(await couponNFT.ownerOf(tokenId)).to.equal(user1.address)

      await expect(couponNFT.connect(user1).redeemCoupon(tokenId, projectId))
        .to.emit(couponNFT, "Transfer") // Check if NFT burn event is emitted
        .withArgs(user1.address, ethers.ZeroAddress, tokenId)

      await expect(couponNFT.ownerOf(tokenId)).to.be.revertedWithCustomError(
        couponNFT,
        `ERC721NonexistentToken`
      )
    })
  })

  describe("getCouponsByProject", function () {
    it("should create coupons and retrieve them by projectId", async function () {
      const projectId = 1

      await couponNFT.createCoupon(100, projectId, user1.address)
      await couponNFT.createCoupon(200, projectId, user2.address)
      await couponNFT.createCoupon(300, projectId, user1.address)

      const [couponIds, values] = await couponNFT.getCouponsByProject(1)

      expect(couponIds.length).to.equal(3)
      expect(values.length).to.equal(3)

      expect(values[0]).to.equal(100)
      expect(values[1]).to.equal(200)
      expect(values[2]).to.equal(300)
    })
  })
})
