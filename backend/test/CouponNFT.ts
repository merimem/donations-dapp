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
    it("Should allow owner to create coupons", async function () {
      const tx = await couponNFT.createCoupons(1000, 1, user1.address, 1)
      await tx.wait()

      expect(await couponNFT.nextTokenId()).to.equal(1)
    })
    it("Should store correct coupon details", async function () {
      await couponNFT.createCoupons(500, 2, user1.address, 1)

      const value = await couponNFT.getCouponValue(0, 2)
      expect(value).to.equal(500)
    })

    it("Should prevent non-owner from creating a coupon", async function () {
      await expect(
        couponNFT.connect(user1).createCoupons(1000, 1, user2.address, 1)
      ).to.be.revertedWithCustomError(couponNFT, "OwnableUnauthorizedAccount")
    })
  })

  describe("redeemCoupon", function () {
    const projectId = 1
    it("Should allow owner of coupon to redeem it", async function () {
      const value = ethers.parseEther("1")

      await owner.sendTransaction({ to: couponNFT.target, value })

      const tx = await couponNFT.createCoupons(
        value,
        projectId,
        user1.address,
        1
      )
      const receipt = await tx.wait()

      const transferEvent =
        receipt && receipt.logs.find((log) => log.address === couponNFT.target)
      //@ts-ignore
      const tokenId = transferEvent && transferEvent.args[2]
      const couponValue = await couponNFT.getCouponValue(tokenId, projectId)

      expect(couponValue).to.equal(value)

      await couponNFT.connect(user1).redeemCoupon(tokenId, projectId)

      expect(
        couponNFT.getCouponValue(tokenId, projectId)
      ).to.be.revertedWithCustomError(couponNFT, "NonexistentCoupon")
    })

    it("Should prevent non-owners from redeeming someone else's coupon", async function () {
      await couponNFT.createCoupons(1000, projectId, user1.address, 1)

      await expect(
        couponNFT.connect(user2).redeemCoupon(0, projectId)
      ).to.be.revertedWithCustomError(couponNFT, "NotCouponOwner")
    })

    it("Should prevent redeeming a non-existent coupon", async function () {
      await expect(
        couponNFT.redeemCoupon(99, projectId)
      ).to.be.revertedWithCustomError(couponNFT, "NonexistentCoupon")
    })

    it("Should transfer ETH when coupon is redeemed", async function () {
      const initialFunding = ethers.parseEther("5")
      await owner.sendTransaction({
        to: couponNFT.target,
        value: initialFunding,
      })

      const couponValue = ethers.parseEther("5")
      const tx = await couponNFT.createCoupons(
        couponValue,
        projectId,
        user1.address,
        1
      )
      const receipt = await tx.wait()

      const transferEvent =
        receipt && receipt.logs.find((log) => log.address === couponNFT.target)
      //@ts-ignore
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
      const tx = await couponNFT.createCoupons(
        couponValue,
        projectId,
        user1.address,
        1
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
      const nbrCoupons = 3
      const couponValue = 100

      await couponNFT.createCoupons(
        couponValue,
        projectId,
        user1.address,
        nbrCoupons
      )
      const [couponIds, values] = await couponNFT.getCouponsByProject(1)

      expect(couponIds.length).to.equal(nbrCoupons)
      expect(values.length).to.equal(nbrCoupons)

      expect(values[0]).to.equal(couponValue)
      expect(values[1]).to.equal(couponValue)
      expect(values[2]).to.equal(couponValue)
    })
  })
})
