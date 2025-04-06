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
      const value = ethers.parseEther("1")
      await owner.sendTransaction({ to: couponNFT.target, value })
      const tx = await couponNFT.createCoupons(value, 1, user1.address, 1)
      await tx.wait()

      expect(await couponNFT.nextTokenId()).to.equal(1)
    })
    it("Should store correct coupon details", async function () {
      const amount = ethers.parseEther("1")
      await owner.sendTransaction({ to: couponNFT.target, value: amount })
      await couponNFT.createCoupons(amount, 2, user1.address, 1)

      const value = await couponNFT.getCouponValue(0, 2)
      expect(value).to.equal(amount)
    })

    it("Should prevent non-owner from creating a coupon", async function () {
      const value = ethers.parseEther("1")
      await owner.sendTransaction({ to: couponNFT.target, value })
      await expect(
        couponNFT.connect(user1).createCoupons(1000, 1, user2.address, 1)
      ).to.be.revertedWithCustomError(couponNFT, "OwnableUnauthorizedAccount")
    })
    it("should create coupons and assign them", async function () {
      const value = ethers.parseEther("1")
      await owner.sendTransaction({ to: couponNFT.target, value })
      const projectId = 1
      const numCoupons = 4

      const tx = await couponNFT.createCoupons(
        ethers.parseEther("0.25"),
        projectId,
        user1.address,
        numCoupons
      )
      expect(tx).to.emit(couponNFT, "CouponsCreated")
      await tx.wait()

      const balance = await couponNFT.balanceOf(user1.address)
      expect(balance).to.equal(numCoupons)
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

      expect(
        await couponNFT.connect(user1).redeemCoupon(tokenId, projectId)
      ).to.emit(couponNFT, "CouponRedeemed")

      expect(
        couponNFT.getCouponValue(tokenId, projectId)
      ).to.be.revertedWithCustomError(couponNFT, "NonexistentCoupon")
    })

    it("Should prevent non-owners from redeeming someone else's coupon", async function () {
      const value = ethers.parseEther("1")

      await owner.sendTransaction({ to: couponNFT.target, value })
      await couponNFT.createCoupons(value, projectId, user1.address, 1)

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

      expect(recipientBalanceAfter).to.be.above(recipientBalanceBefore)

      const contractBalanceAfter = await ethers.provider.getBalance(
        couponNFT.target
      )
      expect(contractBalanceAfter).to.equal(contractBalanceBefore - couponValue)
    })

    it("Should burn the coupon after redeeming", async function () {
      const initialFunding = ethers.parseEther("1")
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
        .to.emit(couponNFT, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, tokenId)

      await expect(couponNFT.ownerOf(tokenId)).to.be.revertedWithCustomError(
        couponNFT,
        `ERC721NonexistentToken`
      )
    })
  })

  describe("getCouponsByProject", function () {
    it("should create coupons and retrieve them by projectId", async function () {
      const initialFunding = ethers.parseEther("1")
      await owner.sendTransaction({
        to: couponNFT.target,
        value: initialFunding,
      })

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
  describe("withdrawEther", function () {
    it("should allow the owner to withdraw ETH", async () => {
      const sendAmount = ethers.parseEther("1")

      await owner.sendTransaction({
        to: await couponNFT.getAddress(),
        value: sendAmount,
      })

      const contractBalanceBefore = await ethers.provider.getBalance(
        await couponNFT.getAddress()
      )
      expect(contractBalanceBefore).to.equal(sendAmount)

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address)

      const tx = await couponNFT.connect(owner).withdrawEther()
      const receipt = await tx.wait()

      //@ts-ignore
      const gasUsed = receipt.gasUsed * receipt.gasPrice!

      const contractBalanceAfter = await ethers.provider.getBalance(
        await couponNFT.getAddress()
      )
      expect(contractBalanceAfter).to.equal(0)

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address)
      const diff =
        BigInt(ownerBalanceAfter) - BigInt(ownerBalanceBefore) + gasUsed
      expect(diff).to.equal(sendAmount)
    })

    it("should revert if non-owner tries to withdraw", async () => {
      await expect(
        couponNFT.connect(user1).withdrawEther()
      ).to.be.revertedWithCustomError(couponNFT, "OwnableUnauthorizedAccount")
    })

    it("should revert if contract has no balance", async () => {
      await expect(couponNFT.withdrawEther()).to.be.revertedWithCustomError(
        couponNFT,
        "InsuffisiantBalance"
      )
    })
  })
})
