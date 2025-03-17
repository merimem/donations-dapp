import { Signer } from "ethers"
import { DonationPools, VERA } from "../typechain-types"

const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("DonationPools", function () {
  let veraToken: VERA
  let donationPools: DonationPools
  let owner: Signer
  let addr1: Signer
  let addr2: Signer

  async function deployVeraFixture() {
    const [veraOwner] = await ethers.getSigners()
    const Vera = await ethers.getContractFactory("VERA")
    const veraToken = await Vera.deploy()
    return { veraToken, veraOwner }
  }
  async function deployDonationPoolsFixture(veraAddress: VERA["target"]) {
    const [owner, addr1, addr2] = await ethers.getSigners()
    const DonationPools = await ethers.getContractFactory("DonationPools")
    const donationPools = await DonationPools.deploy(veraAddress)
    return { donationPools, owner, addr1, addr2 }
  }

  beforeEach(async function () {
    const deployedVera = await deployVeraFixture()
    veraToken = deployedVera.veraToken

    const deployedContract = await deployDonationPoolsFixture(veraToken.target)
    donationPools = deployedContract.donationPools
    owner = deployedContract.owner
    addr1 = deployedContract.addr1
    addr2 = deployedContract.addr2
    await veraToken.transferOwnership(await donationPools.getAddress())
  })

  it("Should initialize with zero balances in all pools", async function () {
    for (let i = 0; i < 6; i++) {
      const balance = await donationPools.getPoolBalances(i)
      expect(balance).to.equal(0)
    }
  })

  it("Should accept donations and update pool balances", async function () {
    const poolIndex = 0
    const donationAmount = ethers.parseEther("1")
    const x = await donationPools
      .connect(addr1)
      .donate(poolIndex, { value: donationAmount })
    x.wait()
    const balance = await donationPools.getPoolBalances(poolIndex)

    expect(balance).to.equal(donationAmount)
  })

  it("Should mint VERA tokens as rewards for donations", async function () {
    const poolIndex = 1 // HumanitarianCrises
    const donationAmount = ethers.parseEther("2")
    await donationPools
      .connect(addr2)
      .donate(poolIndex, { value: donationAmount })

    const veraBalance = await veraToken.balanceOf(addr2.getAddress())
    expect(veraBalance).to.equal(BigInt(donationAmount) * 1000n)
  })

  it("Should revert if donation amount is zero", async function () {
    const poolIndex = 2 // TechnologicalDisasters

    await expect(
      donationPools.connect(addr1).donate(poolIndex, { value: 0 })
    ).to.be.revertedWithCustomError(
      donationPools,
      "DonationMustBeGreaterThanZero"
    )
  })

  it("Should track individual contributions correctly", async function () {
    const poolIndex = 3 // TransportDisasters
    const donationAmount = ethers.parseEther("0.5")

    await donationPools
      .connect(addr1)
      .donate(poolIndex, { value: donationAmount })

    const contribution = await donationPools.getContribution(
      poolIndex,
      addr1.getAddress()
    )
    expect(contribution).to.equal(donationAmount)
  })
})
