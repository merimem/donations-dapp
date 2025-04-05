import { Signer } from "ethers"
import { Chain4Good, CouponNFT, VeraToken } from "../typechain-types"
import { expect } from "chai"
import { ethers } from "hardhat"
import { faker } from "@faker-js/faker"
import { moveBlocks } from "../utils/moveBlocks"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"

describe("DonationPools", function () {
  let veraTokenContract: VeraToken
  let donationPoolsContract: Chain4Good
  let couponNFTContract: CouponNFT
  let owner: HardhatEthersSigner
  let donor: HardhatEthersSigner
  let addr1: HardhatEthersSigner
  let addr2: HardhatEthersSigner
  let partner: HardhatEthersSigner
  let association: HardhatEthersSigner
  let donationAmount: bigint

  const votingDelay = 10
  const tokenRewardRate = 1
  const quorum = 50
  const randomAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

  async function deployVeraFixture(owner: HardhatEthersSigner) {
    const Vera = await ethers.getContractFactory("VeraToken")
    const veraToken = await Vera.connect(owner).deploy(owner.address)
    veraToken.waitForDeployment()
    return veraToken
  }

  async function deployCouponNFTFixture(owner: HardhatEthersSigner) {
    const CouponNFT = await ethers.getContractFactory("CouponNFT")
    const couponNFT = await CouponNFT.connect(owner).deploy(owner.address)
    couponNFT.waitForDeployment()
    return couponNFT
  }

  async function deployDonationPoolsFixture(
    veraAddress: VeraToken["target"],
    couponNFTAddress: CouponNFT["target"],
    owner: HardhatEthersSigner
  ) {
    const DonationPools = await ethers.getContractFactory("Chain4Good")

    const donationPools = await DonationPools.connect(owner).deploy(
      veraAddress,
      couponNFTAddress,
      votingDelay,
      tokenRewardRate,
      quorum
    )
    donationPools.waitForDeployment()
    return donationPools
  }

  async function deployAllFixtures() {
    const [owner, donor, association, partner, addr1, addr2] =
      await ethers.getSigners()
    veraTokenContract = await deployVeraFixture(owner)
    couponNFTContract = await deployCouponNFTFixture(owner)
    donationPoolsContract = await deployDonationPoolsFixture(
      veraTokenContract.target,
      couponNFTContract.target,
      owner
    )

    return {
      donationPoolsContract,
      veraTokenContract,
      couponNFTContract,
      owner,
      donor,
      addr1,
      addr2,
      association,
      partner,
    }
  }

  describe("deployment", function () {
    beforeEach(async function () {
      const [addr] = await ethers.getSigners()
      owner = addr
    })

    it("Should deploy successfully with valid parameters", async function () {
      const veraToken = await deployVeraFixture(owner)
      const couponNFT = await deployCouponNFTFixture(owner)
      const DonationPools = await ethers.getContractFactory("Chain4Good")
      const donationPools = await DonationPools.connect(owner).deploy(
        veraToken.target,
        couponNFT.target,
        votingDelay,
        tokenRewardRate,
        quorum
      )

      expect(await donationPools.veraToken()).to.equal(veraToken.target)
      expect(await donationPools.votingDelay()).to.equal(votingDelay)
      expect(await donationPools.tokenRewardRate()).to.equal(tokenRewardRate)
      expect(await donationPools.quorum()).to.equal(quorum)
    })

    it("Should revert with 'Invalid VERA token address' if address is zero", async function () {
      const DonationPools = await ethers.getContractFactory("Chain4Good")
      const couponNFT = await deployCouponNFTFixture(owner)
      await expect(
        DonationPools.connect(owner).deploy(
          ethers.ZeroAddress,
          couponNFT.target,
          votingDelay,
          tokenRewardRate,
          quorum
        )
      ).to.be.revertedWithCustomError(DonationPools, "InvalidAddress")
    })

    it("Should revert with 'Invalid CouponNFT address' if address is zero", async function () {
      const DonationPools = await ethers.getContractFactory("Chain4Good")
      const veraToken = await deployVeraFixture(owner)
      await expect(
        DonationPools.connect(owner).deploy(
          veraToken,
          ethers.ZeroAddress,
          votingDelay,
          tokenRewardRate,
          quorum
        )
      ).to.be.revertedWithCustomError(DonationPools, "InvalidAddress")
    })

    it("Should revert if voting delay is zero", async function () {
      const DonationPools = await ethers.getContractFactory("Chain4Good")
      const veraToken = await deployVeraFixture(owner)
      const couponNFT = await deployCouponNFTFixture(owner)
      await expect(
        DonationPools.deploy(veraToken, couponNFT, 0, 5, 50)
      ).to.be.revertedWithCustomError(DonationPools, "InvalidParameters")
    })
    it("Should revert if voting delay is zero", async function () {
      const DonationPools = await ethers.getContractFactory("Chain4Good")
      const veraToken = await deployVeraFixture(owner)
      const couponNFT = await deployCouponNFTFixture(owner)

      await expect(
        DonationPools.deploy(veraToken, couponNFT, 10, 0, 50)
      ).to.be.revertedWithCustomError(DonationPools, "InvalidParameters")
    })
    it("Should revert if quorum is zero", async function () {
      const DonationPools = await ethers.getContractFactory("Chain4Good")
      const veraToken = await deployVeraFixture(owner)
      const couponNFT = await deployCouponNFTFixture(owner)

      await expect(
        DonationPools.deploy(veraToken, couponNFT, 10, 10, 0)
      ).to.be.revertedWithCustomError(DonationPools, "InvalidParameters")
    })
  })

  describe("Initialization", function () {
    beforeEach(async function () {
      const fixtures = await deployAllFixtures()

      donationPoolsContract = fixtures.donationPoolsContract
      veraTokenContract = fixtures.veraTokenContract
      couponNFTContract = fixtures.couponNFTContract
      addr1 = fixtures.addr1
    })
    it("Should initialize with zero balances in all pools", async function () {
      for (let i = 0; i < 6; i++) {
        const balance = await donationPoolsContract
          .connect(addr1)
          .getPoolBalances(i)
        expect(balance).to.equal(0)
      }
    })

    it("Should initialize with a valid VERA token address", async function () {
      const storedVeraToken = await donationPoolsContract.veraToken()
      expect(storedVeraToken).to.equal(veraTokenContract.target)
    })

    it("Should initialize with a valid CouponNFT token address", async function () {
      const storedCouponNFT = await donationPoolsContract.couponNFT()
      expect(storedCouponNFT).to.equal(couponNFTContract.target)
    })

    it("Should initialize pools with zero balances", async function () {
      const randomPoolIndex = faker.number.int({ min: 0, max: 5 })
      const poolBalance = await donationPoolsContract.getPoolBalances(
        randomPoolIndex
      )
      expect(poolBalance).to.equal(0)
    })

    it("Should allow owner to set reward rate", async function () {
      const newRewardRate = 500
      await donationPoolsContract.setRewardRate(newRewardRate)
      const storedRate = await donationPoolsContract.tokenRewardRate()

      expect(storedRate).to.equal(newRewardRate)
    })
  })

  describe("donations", function () {
    beforeEach(async function () {
      const fixtures = await deployAllFixtures()
      donationPoolsContract = fixtures.donationPoolsContract
      veraTokenContract = fixtures.veraTokenContract
      couponNFTContract = fixtures.couponNFTContract
      owner = fixtures.owner
      addr1 = fixtures.addr1
      addr2 = fixtures.addr2
      donor = fixtures.donor
      await veraTokenContract.transferOwnership(
        await donationPoolsContract.getAddress()
      )
    })

    it("Should revert if donation amount is zero", async function () {
      const randomPoolIndex = faker.number.int({ min: 0, max: 5 })

      await expect(
        donationPoolsContract
          .connect(donor)
          .donate(randomPoolIndex, { value: 0 })
      ).to.be.revertedWithCustomError(
        donationPoolsContract,
        "DonationMustBeGreaterThanZero"
      )
    })

    it("Should record firstDonationBlock on first donation", async function () {
      const randomPoolIndex = faker.number.int({ min: 0, max: 5 })
      let donorData = await donationPoolsContract.donators(donor.getAddress())
      expect(donorData[0]).to.equal(false)
      expect(donorData[1]).to.equal(0n)

      const tx = await donationPoolsContract
        .connect(donor)
        .donate(randomPoolIndex, { value: ethers.parseEther("1") })
      const receipt = await tx.wait()
      const blockNumber = receipt && receipt.blockNumber
      donorData = await donationPoolsContract.donators(donor.getAddress())
      expect(donorData.isRegistered).to.equal(true)
      expect(donorData.firstDonationBlock).to.equal(blockNumber)
    })

    it("Should not change firstDonationBlock on additional donations", async function () {
      const poolType = 0
      const donationAmount = ethers.parseEther("1")
      let tx = await donationPoolsContract
        .connect(donor)
        .donate(poolType, { value: donationAmount })
      let receipt = await tx.wait()
      let firstDonationBlock = receipt && receipt.blockNumber
      tx = await donationPoolsContract
        .connect(donor)
        .donate(poolType, { value: donationAmount })
      await tx.wait()
      const donator = await donationPoolsContract.donators(donor.getAddress())

      expect(donator.firstDonationBlock).to.equal(firstDonationBlock)
    })

    it("Should accept donations and update pool balances ", async function () {
      const randomPoolIndex = faker.number.int({ min: 0, max: 5 })
      const donationAmount = ethers.parseEther("0.1")

      await expect(
        donationPoolsContract
          .connect(donor)
          .donate(randomPoolIndex, { value: donationAmount })
      )
        .to.emit(donationPoolsContract, "DonationReceived")
        .withArgs(donor.getAddress(), randomPoolIndex, donationAmount)

      const balance = await donationPoolsContract.getPoolBalances(
        randomPoolIndex
      )

      expect(balance).to.equal(donationAmount)
    })

    it("Should mint VERA tokens as rewards for donations", async function () {
      const randomPoolIndex = faker.number.int({ min: 0, max: 5 })
      const donationAmount = ethers.parseEther("1")
      await donationPoolsContract
        .connect(donor)
        .donate(randomPoolIndex, { value: donationAmount })

      const veraBalance = await veraTokenContract.balanceOf(donor.getAddress())
      expect(veraBalance).to.equal(100)
    })

    it("Should correctly track multiple donations and their contributions", async function () {
      const donationAmount1 = ethers.parseEther("0.1")
      const donationAmount2 = ethers.parseEther("0.2")
      const poolIndex = 0

      await donationPoolsContract
        .connect(addr1)
        .donate(poolIndex, { value: donationAmount1 })
      await donationPoolsContract
        .connect(addr2)
        .donate(poolIndex, { value: donationAmount2 })

      // Vérifier les contributions individuelles
      const contribution1 = await donationPoolsContract.getContribution(
        poolIndex,
        addr1.getAddress()
      )
      const contribution2 = await donationPoolsContract.getContribution(
        poolIndex,
        addr2.getAddress()
      )

      expect(contribution1).to.equal(donationAmount1)
      expect(contribution2).to.equal(donationAmount2)

      const poolBalances = await donationPoolsContract.getPoolBalances(
        poolIndex
      )
      expect(poolBalances).to.equal(donationAmount1 + donationAmount2)
    })
    it("Should track individual contributions correctly and register him", async function () {
      const randomPoolIndex = faker.number.int({ min: 0, max: 5 })
      const donationAmount = ethers.parseEther("0.5")

      await donationPoolsContract
        .connect(donor)
        .donate(randomPoolIndex, { value: donationAmount })

      const contribution = await donationPoolsContract.getContribution(
        randomPoolIndex,
        donor.getAddress()
      )
      expect(contribution).to.equal(donationAmount)
      const donorStatus = await donationPoolsContract.donators(
        donor.getAddress()
      )
      expect(donorStatus[0]).to.be.true
    })
    it("Should correctly track multiple donations from the same user", async function () {
      const donationAmount1 = ethers.parseEther("1")
      const donationAmount2 = ethers.parseEther("2")
      const poolIndex = 0

      await donationPoolsContract
        .connect(donor)
        .donate(poolIndex, { value: donationAmount1 })
      await donationPoolsContract
        .connect(donor)
        .donate(poolIndex, { value: donationAmount2 })

      const totalContribution = await donationPoolsContract.getContribution(
        poolIndex,
        donor.getAddress()
      )
      expect(totalContribution).to.equal(donationAmount1 + donationAmount2)

      const poolBalances = await donationPoolsContract.getPoolBalances(
        poolIndex
      )
      expect(poolBalances).to.equal(donationAmount1 + donationAmount2)
    })

    it("Should correctly track multiple donations from the same user across multiple pools", async function () {
      const donationAmount1 = ethers.parseEther("1")
      const donationAmount2 = ethers.parseEther("2")
      const donationAmount3 = ethers.parseEther("3")

      const poolIndex1 = 0
      const poolIndex2 = 1
      const poolIndex3 = 2

      await donationPoolsContract
        .connect(donor)
        .donate(poolIndex1, { value: donationAmount1 })
      await donationPoolsContract
        .connect(donor)
        .donate(poolIndex2, { value: donationAmount2 })
      await donationPoolsContract
        .connect(donor)
        .donate(poolIndex3, { value: donationAmount3 })

      const contribution1 = await donationPoolsContract.getContribution(
        poolIndex1,
        donor.getAddress()
      )
      const contribution2 = await donationPoolsContract.getContribution(
        poolIndex2,
        donor.getAddress()
      )
      const contribution3 = await donationPoolsContract.getContribution(
        poolIndex3,
        donor.getAddress()
      )

      expect(contribution1).to.equal(donationAmount1)
      expect(contribution2).to.equal(donationAmount2)
      expect(contribution3).to.equal(donationAmount3)

      // Vérifier les soldes des pools
      const poolBalances1 = await donationPoolsContract.getPoolBalances(
        poolIndex1
      )
      const poolBalances2 = await donationPoolsContract.getPoolBalances(
        poolIndex2
      )
      const poolBalances3 = await donationPoolsContract.getPoolBalances(
        poolIndex3
      )
      expect(poolBalances1).to.equal(donationAmount1)
      expect(poolBalances2).to.equal(donationAmount2)
      expect(poolBalances3).to.equal(donationAmount3)
    })
  })

  describe("projects", function () {
    const projectId = 3
    const poolType = 0
    const donationAmount = ethers.parseEther("5")
    beforeEach(async function () {
      const fixtures = await deployAllFixtures()
      donationPoolsContract = fixtures.donationPoolsContract
      veraTokenContract = fixtures.veraTokenContract
      couponNFTContract = fixtures.couponNFTContract
      owner = fixtures.owner
      addr1 = fixtures.addr1
      addr2 = fixtures.addr2
      donor = fixtures.donor
      partner = fixtures.partner
      await veraTokenContract.transferOwnership(
        await donationPoolsContract.getAddress()
      )
      await donationPoolsContract
        .connect(donor)
        .donate(poolType, { value: donationAmount })
    })
    it("Should allow the owner to create a project", async function () {
      await donationPoolsContract
        .connect(owner)
        .createProject(
          projectId,
          poolType,
          ethers.parseEther("0.1"),
          randomAddress,
          partner
        )
      const project = await donationPoolsContract.projects(projectId)
      expect(project.amountRequired).to.equal(ethers.parseEther("0.1"))
      expect(project.status).to.equal(0)
      expect(project.ong).to.equal(randomAddress)
      expect(project.partner).to.equal(partner)
    })

    it("Should return all project IDs and project details", async function () {
      const projectId1 = faker.number.bigInt()
      const projectId2 = faker.number.bigInt()
      const amount1 = ethers.parseEther("0.1")
      const amount2 = ethers.parseEther("0.2")
      const tx0 = await donationPoolsContract.createProject(
        projectId1,
        poolType,
        amount1,
        randomAddress,
        partner
      )
      const receipt0 = await tx0.wait()
      const blockNumber0 = receipt0 && receipt0.blockNumber

      const tx1 = await donationPoolsContract.createProject(
        projectId2,
        poolType,
        ethers.parseEther("0.2"),
        randomAddress,
        partner
      )
      const receipt1 = await tx1.wait()
      const blockNumber1 = receipt1 && receipt1.blockNumber

      const [projectIds, projects] = await donationPoolsContract.getAllProjects(
        0,
        10
      )
      expect(projectIds.length).to.equal(2)
      expect(projects.length).to.equal(2)
      const expectedArray1 = [
        randomAddress,
        partner.address,
        amount1,
        0,
        0,
        blockNumber0,
        false,
        poolType,
        0,
      ]
      const expectedArray2 = [
        randomAddress,
        partner.address,
        amount2,
        0,
        0,
        blockNumber1,
        false,
        poolType,
        0,
      ]
      expect(projectIds[0]).to.equal(projectId1)
      expect(projects[0]).to.deep.equal(expectedArray1)
      expect(projects[1]).to.deep.equal(expectedArray2)

      expect(projectIds[1]).to.equal(projectId2)
    })

    it("should revert if amountRequired is more than pool balance", async function () {
      await expect(
        donationPoolsContract.createProject(
          projectId,
          poolType,
          ethers.parseEther("10"),
          randomAddress,
          partner
        )
      ).to.be.revertedWithCustomError(donationPoolsContract, "InvalidAmount")
    })

    it("should revert if amountRequired is zero", async function () {
      await expect(
        donationPoolsContract.createProject(
          projectId,
          poolType,
          0,
          randomAddress,
          partner
        )
      ).to.be.revertedWithCustomError(donationPoolsContract, "InvalidAmount")
    })

    it("should revert if receiver address is invalid", async function () {
      await expect(
        donationPoolsContract.createProject(
          projectId,
          poolType,
          ethers.parseEther("1"),
          ethers.ZeroAddress,
          partner
        )
      ).to.be.revertedWithCustomError(donationPoolsContract, "InvalidAddress")
    })

    it("Should allow owner to change project status", async function () {
      await donationPoolsContract.createProject(
        projectId,
        poolType,
        ethers.parseEther("0.1"),
        randomAddress,
        partner
      )

      await donationPoolsContract.changeProjectStatus(0, 1)

      const project = await donationPoolsContract.projects(0)
      expect(project.status).to.equal(1)
    })

    it("Should revert if a non-owner tries to change project status", async function () {
      await donationPoolsContract.createProject(
        projectId,
        poolType,
        ethers.parseEther("0.1"),
        randomAddress,
        partner
      )

      await expect(
        donationPoolsContract.connect(addr1).changeProjectStatus(0, 1)
      ).to.be.revertedWithCustomError(
        donationPoolsContract,
        "OwnableUnauthorizedAccount"
      )
    })
  })

  describe("associations", function () {
    beforeEach(async function () {
      const fixtures = await deployAllFixtures()
      donationPoolsContract = fixtures.donationPoolsContract
      veraTokenContract = fixtures.veraTokenContract
      couponNFTContract = fixtures.couponNFTContract
      owner = fixtures.owner
      addr1 = fixtures.addr1
      addr2 = fixtures.addr2
      donor = fixtures.donor
      await veraTokenContract.transferOwnership(
        await donationPoolsContract.getAddress()
      )
    })
    it("Should register an association successfully", async function () {
      await donationPoolsContract.registerAssociation(
        "Red Cross",
        addr1.getAddress()
      )

      const registeredAssociation = await donationPoolsContract.associations(
        addr1.getAddress()
      )
      expect(registeredAssociation.name).to.equal("Red Cross")
      expect(registeredAssociation.isApproved).to.be.false
    })

    it("Should approve an association successfully", async function () {
      await donationPoolsContract.registerAssociation(
        "Red Cross",
        addr1.getAddress()
      )
      await donationPoolsContract.approveAssociation(addr1.getAddress())

      const approvedAssociation = await donationPoolsContract.associations(
        addr1.getAddress()
      )
      expect(approvedAssociation.isApproved).to.be.true
    })
    it("should reject an existing association and remove it from the list", async function () {
      await donationPoolsContract.registerAssociation(
        "Red Cross",
        addr1.getAddress()
      )
      await expect(
        donationPoolsContract
          .connect(owner)
          .rejectAssociation(addr1.getAddress())
      )
        .to.emit(donationPoolsContract, "AssociationRejected")
        .withArgs(addr1.getAddress())

      // Vérifier que l'association est bien supprimée
      const association = await donationPoolsContract.associations(
        addr1.getAddress()
      )
      expect(association.name).to.equal("")

      // Vérifier que l'adresse est bien retirée du tableau
      const wallets = await donationPoolsContract.associationWallets
      expect(wallets).to.not.include(addr1.getAddress())
    })

    it("Should not allow duplicate association registration", async function () {
      await donationPoolsContract.registerAssociation(
        "Red Cross",
        addr1.getAddress()
      )
      await expect(
        donationPoolsContract.registerAssociation("Red", addr1.getAddress())
      ).to.be.revertedWithCustomError(donationPoolsContract, "AlreadyExists")
    })

    it("Should revert if approving a non-existent association", async function () {
      await expect(
        donationPoolsContract.approveAssociation(addr1.getAddress())
      ).to.be.revertedWithCustomError(donationPoolsContract, "DoesNotExists")
    })

    it("Should revert if rejecting a non-existent association", async function () {
      await expect(
        donationPoolsContract.rejectAssociation(addr1.getAddress())
      ).to.be.revertedWithCustomError(donationPoolsContract, "DoesNotExists")
    })

    it("Should get association details successfully", async function () {
      await donationPoolsContract.registerAssociation(
        "Red Cross",
        await addr1.getAddress()
      )

      const association = await donationPoolsContract.getAssociation(
        await addr1.getAddress()
      )

      expect(association[0]).to.equal("Red Cross")
      expect(association[1]).to.be.false
    })

    it("Should revert when fetching a non-existent association", async function () {
      await expect(
        donationPoolsContract.getAssociation(await addr1.getAddress())
      ).to.be.revertedWithCustomError(donationPoolsContract, "DoesNotExists")
    })

    it("Should return all registered associations with addresses ", async function () {
      await donationPoolsContract.registerAssociation(
        "Red Cross",
        addr1.getAddress()
      )
      await donationPoolsContract.registerAssociation(
        "UNICEF",
        addr2.getAddress()
      )

      const [allAssociations, allAddresses] =
        await donationPoolsContract.getAllAssociations(0, 10)
      await expect(allAssociations.length).to.equal(2)
      await expect(allAssociations[0].name).to.equal("Red Cross")
      await expect(allAddresses[0]).to.equal(await addr1.getAddress())

      expect(allAssociations[1].name).to.equal("UNICEF")
      expect(allAddresses[1]).to.equal(await addr2.getAddress())
    })
  })

  describe("voting", function () {
    const projectId = 1
    const poolType = 0
    beforeEach(async function () {
      const fixtures = await deployAllFixtures()
      donationPoolsContract = fixtures.donationPoolsContract
      veraTokenContract = fixtures.veraTokenContract
      couponNFTContract = fixtures.couponNFTContract
      owner = fixtures.owner
      addr1 = fixtures.addr1
      addr2 = fixtures.addr2
      donor = fixtures.donor
      partner = fixtures.partner
      await veraTokenContract.transferOwnership(
        await donationPoolsContract.getAddress()
      )
      donationAmount = ethers.parseEther("2")
      await donationPoolsContract
        .connect(donor)
        .donate(poolType, { value: ethers.parseEther("2") })
      await donationPoolsContract.createProject(
        projectId,
        poolType,
        ethers.parseEther("1"),
        randomAddress,
        partner
      )
    })
    it("Should revert if a donor tries to vote twice on the same project", async function () {
      await donationPoolsContract.connect(donor).voteOnProject(projectId, false)
      await expect(
        donationPoolsContract.connect(donor).voteOnProject(projectId, true)
      ).to.be.revertedWithCustomError(donationPoolsContract, "AlreadyVoted")
    })

    it("Should revert if a non-registered user tries to vote", async function () {
      await expect(
        donationPoolsContract.connect(addr1).voteOnProject(1, true)
      ).to.be.revertedWithCustomError(donationPoolsContract, "InvalidOwner")
    })

    it("Should revert if trying to vote on a non-existing project", async function () {
      await expect(
        donationPoolsContract.connect(donor).voteOnProject(99, true)
      ).to.be.revertedWithCustomError(donationPoolsContract, "DoesNotExists")
    })

    it("Should allow voting only if donation was before project creation", async function () {
      await expect(
        donationPoolsContract.connect(donor).voteOnProject(projectId, true)
      ).to.not.be.reverted

      await donationPoolsContract
        .connect(addr1)
        .donate(poolType, { value: ethers.parseEther("1") })

      await expect(
        donationPoolsContract.connect(addr1).voteOnProject(projectId, true)
      ).to.be.revertedWithCustomError(
        donationPoolsContract,
        "DonationAfterProjectCreation"
      )
    })

    it("Should allow voting only if donor contributed to the specific pool", async function () {
      const anotherPoolType = 1
      await donationPoolsContract
        .connect(addr1)
        .donate(2, { value: ethers.parseEther("20") })
      await donationPoolsContract
        .connect(owner)
        .createProject(2, 2, ethers.parseEther("1"), randomAddress, partner)

      await expect(
        donationPoolsContract.connect(donor).voteOnProject(2, true)
      ).to.be.revertedWithCustomError(
        donationPoolsContract,
        "NotEligibleToVote"
      )
    })

    it("Should allow a registered donor to vote 'yes' on a project", async function () {
      await expect(
        donationPoolsContract.connect(donor).voteOnProject(projectId, true)
      )
        .to.emit(donationPoolsContract, "ProjectVoted")
        .withArgs(projectId, donor.getAddress(), true)

      const project = await donationPoolsContract.getProject(projectId)
      expect(project.yesVotes).to.equal(200)
      expect(project.noVotes).to.equal(0)
    })
    it("Should allow a registered donor to vote 'no' on a project", async function () {
      await expect(
        donationPoolsContract.connect(donor).voteOnProject(projectId, false)
      )
        .to.emit(donationPoolsContract, "ProjectVoted")
        .withArgs(projectId, donor.getAddress(), false)

      const project = await donationPoolsContract.getProject(projectId)
      expect(project.yesVotes).to.equal(0)
      expect(project.noVotes).to.equal(200)
    })

    it("should approve the project if yesVotes > noVotes", async function () {
      await donationPoolsContract.connect(donor).voteOnProject(projectId, true)
      await moveBlocks(votingDelay)

      await expect(donationPoolsContract.connect(owner).finallizeVotes(1))
        .to.emit(donationPoolsContract, "ProjectStatusChanged")
        .withArgs(1, 1)

      const project = await donationPoolsContract.connect(owner).projects(1)
      expect(project.status).to.equal(1)
    })
  })

  describe("finalizeVotes", function () {
    const projectId = 1
    const poolId = 0
    const targetAmount = ethers.parseEther("1")
    beforeEach(async function () {
      const fixtures = await deployAllFixtures()
      donationPoolsContract = fixtures.donationPoolsContract
      veraTokenContract = fixtures.veraTokenContract
      couponNFTContract = fixtures.couponNFTContract
      owner = fixtures.owner
      addr1 = fixtures.addr1
      addr2 = fixtures.addr2
      donor = fixtures.donor
      await veraTokenContract.transferOwnership(
        await donationPoolsContract.getAddress()
      )
      donationAmount = ethers.parseEther("2")
      await donationPoolsContract
        .connect(donor)
        .donate(poolId, { value: donationAmount })

      await donationPoolsContract
        .connect(owner)
        .createProject(projectId, poolId, targetAmount, randomAddress, partner)
    })

    it("should revert if finallizeVotes called by non-owner", async function () {
      await moveBlocks(votingDelay)
      await expect(
        donationPoolsContract.connect(addr1).finallizeVotes(1)
      ).to.be.revertedWithCustomError(
        donationPoolsContract,
        "OwnableUnauthorizedAccount"
      )
    })

    it("should revert if the project does not exist", async function () {
      await expect(
        donationPoolsContract.connect(owner).finallizeVotes(99)
      ).to.be.revertedWithCustomError(donationPoolsContract, "DoesNotExists")
    })

    it("should revert if the voting period is not yet ended", async function () {
      await expect(
        donationPoolsContract.connect(owner).finallizeVotes(projectId)
      ).to.be.revertedWithCustomError(
        donationPoolsContract,
        "VotingPeriodNotEnded"
      )
    })

    it("should approve the project if yesVotes > noVotes", async function () {
      await donationPoolsContract.connect(donor).voteOnProject(projectId, true)

      await moveBlocks(votingDelay)

      await donationPoolsContract.connect(owner).finallizeVotes(projectId)
      const projectAfterEndVotes = await donationPoolsContract.getProject(
        projectId
      )
      expect(projectAfterEndVotes.status).to.equal(1n)
    })

    it("should approve the project if noVotes > yesVotes ", async function () {
      await donationPoolsContract.connect(donor).voteOnProject(projectId, false)

      await moveBlocks(votingDelay)

      await donationPoolsContract.connect(owner).finallizeVotes(projectId)
      const projectAfterEndVotes = await donationPoolsContract.getProject(
        projectId
      )
      expect(projectAfterEndVotes.status).to.equal(2)
    })

    it("should emit ProjectStatusChanged event", async function () {
      await donationPoolsContract.connect(donor).voteOnProject(projectId, false)

      await moveBlocks(votingDelay)

      await expect(
        donationPoolsContract.connect(owner).finallizeVotes(projectId)
      )
        .to.emit(donationPoolsContract, "ProjectStatusChanged")
        .withArgs(projectId, 2)
    })
  })

  describe("createCoupons", function () {
    beforeEach(async function () {
      const projectId = 1
      const roomPoolIndex = 0
      const fixtures = await deployAllFixtures()
      donationPoolsContract = fixtures.donationPoolsContract
      veraTokenContract = fixtures.veraTokenContract
      couponNFTContract = fixtures.couponNFTContract
      owner = fixtures.owner
      addr1 = fixtures.addr1
      addr2 = fixtures.addr2
      donor = fixtures.donor
      association = fixtures.association
      await veraTokenContract.transferOwnership(
        await donationPoolsContract.getAddress()
      )
      await couponNFTContract.transferOwnership(
        await donationPoolsContract.getAddress()
      )
      donationAmount = ethers.parseEther("2")
      await donationPoolsContract
        .connect(donor)
        .donate(roomPoolIndex, { value: donationAmount })

      await donationPoolsContract
        .connect(owner)
        .createProject(
          projectId,
          0,
          ethers.parseEther("2"),
          association.getAddress(),
          partner
        )
      await donationPoolsContract.connect(donor).voteOnProject(projectId, true)
      await moveBlocks(votingDelay)
      await donationPoolsContract.connect(owner).finallizeVotes(projectId)
    })

    it("Should create coupons successfully", async function () {
      const projectId = 1
      const couponValue = ethers.parseEther("1")
      const initialBalance = await ethers.provider.getBalance(
        couponNFTContract.target
      )
      await expect(
        donationPoolsContract
          .connect(association)
          .createCoupons(projectId, couponValue)
      )
        .to.emit(donationPoolsContract, "CouponsCreated")
        .withArgs(projectId, 2)

      const finalBalance = await ethers.provider.getBalance(
        couponNFTContract.target
      )
      expect(finalBalance).to.be.gt(initialBalance)
    })

    it("Should revert if targetAmount is not divisible by couponValue", async function () {
      const projectId = 1
      const invalidCouponValue = ethers.parseEther("3")

      await expect(
        donationPoolsContract
          .connect(association)
          .createCoupons(projectId, invalidCouponValue)
      ).to.be.revertedWithCustomError(
        donationPoolsContract,
        "InvalidDivisibility"
      )
    })

    it("Should revert if project is not approved", async function () {
      const couponValue = ethers.parseEther("2")

      await expect(
        donationPoolsContract.connect(association).createCoupons(2, couponValue)
      ).to.be.revertedWithCustomError(
        donationPoolsContract,
        "InvalidProjectStatus"
      )
    })

    it("Should revert if caller is not the receiver", async function () {
      const projectId = 1
      const couponValue = ethers.parseEther("2")

      await expect(
        donationPoolsContract
          .connect(addr1)
          .createCoupons(projectId, couponValue)
      ).to.be.revertedWithCustomError(donationPoolsContract, "InvalidOwner")
    })

    // it("Should revert with SendAmountFailed if the call to couponNFT fails", async function () {
    //   let chain4GoodContract: Chain4Good
    //   const fixtures = await deployAllFixtures()
    //   const roomPoolIndex = 0
    //   const projectId = 1
    //   association = fixtures.association
    //   owner = fixtures.owner
    //   donor = fixtures.donor
    //   partner = fixtures.partner
    //   chain4GoodContract = fixtures.donationPoolsContract
    //   veraTokenContract = fixtures.veraTokenContract
    //   couponNFTContract = fixtures.couponNFTContract
    //   await veraTokenContract.transferOwnership(
    //     await donationPoolsContract.getAddress()
    //   )
    //   await couponNFTContract.transferOwnership(
    //     await donationPoolsContract.getAddress()
    //   )
    //   donationAmount = ethers.parseEther("2")
    //   await chain4GoodContract
    //     .connect(donor)
    //     .donate(roomPoolIndex, { value: donationAmount })

    //   await chain4GoodContract
    //     .connect(owner)
    //     .createProject(
    //       projectId,
    //       roomPoolIndex,
    //       ethers.parseEther("2"),
    //       association.getAddress(),
    //       partner.getAddress()
    //     )
    //   const contractBalance = await ethers.provider.getBalance(
    //     chain4GoodContract.target
    //   )
    //   console.log("contractBalance", contractBalance)
    //   await chain4GoodContract.changeProjectStatus(projectId, 1)
    //   const project = await chain4GoodContract.getProject(projectId)
    //   console.log("project", project)

    //   await chain4GoodContract
    //     .connect(association)
    //     .createCoupons(projectId, ethers.parseEther("1"))

    //   await chain4GoodContract.changeProjectStatus(projectId, 1)
    //   await expect(
    //     chain4GoodContract
    //       .connect(association)
    //       .createCoupons(projectId, ethers.parseEther("1"))
    //   ).to.be.revertedWithCustomError(chain4GoodContract, "SendAmountFailed")
    // })
  })
})
