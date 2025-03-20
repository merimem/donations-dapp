import { Signer } from "ethers"
import { DonationPools, VERA } from "../typechain-types"
import { expect } from "chai"
import { ethers } from "hardhat"

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

  describe("Initialization", function () {
    it("Should initialize with zero balances in all pools", async function () {
      for (let i = 0; i < 6; i++) {
        const balance = await donationPools.getPoolBalances(i)
        expect(balance).to.equal(0)
      }
    })
  })

  describe("donations", function () {
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

    it("Should correctly track multiple donations and their contributions", async function () {
      const donationAmount1 = ethers.parseEther("1")
      const donationAmount2 = ethers.parseEther("2")
      const poolIndex = 0 // Exemple: PoolType.NaturalDisasters

      // Effectuer plusieurs donations
      await donationPools
        .connect(addr1)
        .donate(poolIndex, { value: donationAmount1 })
      await donationPools
        .connect(addr2)
        .donate(poolIndex, { value: donationAmount2 })

      // Vérifier les contributions individuelles
      const contribution1 = await donationPools.getContribution(
        poolIndex,
        addr1.getAddress()
      )
      const contribution2 = await donationPools.getContribution(
        poolIndex,
        addr2.getAddress()
      )

      expect(contribution1).to.equal(donationAmount1)
      expect(contribution2).to.equal(donationAmount2)

      // Vérifier le solde total du pool
      const poolBalances = await donationPools.getPoolBalances(poolIndex)
      expect(poolBalances).to.equal(donationAmount1 + donationAmount2)
    })

    it("Should correctly track multiple donations from the same user", async function () {
      const donationAmount1 = ethers.parseEther("1")
      const donationAmount2 = ethers.parseEther("2")
      const poolIndex = 0 // Exemple: PoolType.NaturalDisasters

      // Effectuer plusieurs donations depuis le même compte
      await donationPools
        .connect(addr1)
        .donate(poolIndex, { value: donationAmount1 })
      await donationPools
        .connect(addr1)
        .donate(poolIndex, { value: donationAmount2 })

      // Vérifier la contribution totale de addr1
      const totalContribution = await donationPools.getContribution(
        poolIndex,
        addr1.getAddress()
      )
      expect(totalContribution).to.equal(donationAmount1 + donationAmount2)

      // Vérifier le solde total du pool
      const poolBalances = await donationPools.getPoolBalances(poolIndex)
      expect(poolBalances).to.equal(donationAmount1 + donationAmount2)
    })

    it("Should correctly track multiple donations from the same user across multiple pools", async function () {
      const donationAmount1 = ethers.parseEther("1")
      const donationAmount2 = ethers.parseEther("2")
      const donationAmount3 = ethers.parseEther("3")

      const poolIndex1 = 0 // PoolType.NaturalDisasters
      const poolIndex2 = 1 // PoolType.HumanitarianCrises
      const poolIndex3 = 2 // PoolType.TechnologicalDisasters

      // Donations vers plusieurs pools
      await donationPools
        .connect(addr1)
        .donate(poolIndex1, { value: donationAmount1 })
      await donationPools
        .connect(addr1)
        .donate(poolIndex2, { value: donationAmount2 })
      await donationPools
        .connect(addr1)
        .donate(poolIndex3, { value: donationAmount3 })

      // Vérifier les contributions individuelles
      const contribution1 = await donationPools.getContribution(
        poolIndex1,
        addr1.getAddress()
      )
      const contribution2 = await donationPools.getContribution(
        poolIndex2,
        addr1.getAddress()
      )
      const contribution3 = await donationPools.getContribution(
        poolIndex3,
        addr1.getAddress()
      )

      expect(contribution1).to.equal(donationAmount1)
      expect(contribution2).to.equal(donationAmount2)
      expect(contribution3).to.equal(donationAmount3)

      // Vérifier les soldes des pools
      const poolBalances1 = await donationPools.getPoolBalances(poolIndex1)
      const poolBalances2 = await donationPools.getPoolBalances(poolIndex2)
      const poolBalances3 = await donationPools.getPoolBalances(poolIndex3)
      expect(poolBalances1).to.equal(donationAmount1)
      expect(poolBalances2).to.equal(donationAmount2)
      expect(poolBalances3).to.equal(donationAmount3)
    })
  })

  describe("projects", function () {
    it("Should allow the owner to create a project", async function () {
      const projectId = 0
      await donationPools
        .connect(owner)
        .createProject(projectId, 0, ethers.parseEther("5"))
      const project = await donationPools.projects(projectId)
      expect(project.amountRequired).to.equal(ethers.parseEther("5"))
      expect(project.status).to.equal(0)
    })

    it("should revert if amountRequired is zero", async function () {
      const projectId = 2
      const poolType = 1
      const amountRequired = 0

      await expect(
        donationPools.createProject(projectId, poolType, amountRequired)
      ).to.be.revertedWith("Amount must be greater than zero")
    })
  })

  describe("associations", function () {
    it("Should register an association successfully", async function () {
      await donationPools.registerAssociation("Red Cross", addr1.getAddress())

      const registeredAssociation = await donationPools.associations(
        addr1.getAddress()
      )
      expect(registeredAssociation.name).to.equal("Red Cross")
      expect(registeredAssociation.isApproved).to.be.false
    })

    it("Should approve an association successfully", async function () {
      await donationPools.registerAssociation("Red Cross", addr1.getAddress())
      await donationPools.approveAssociation(addr1.getAddress())

      const approvedAssociation = await donationPools.associations(
        addr1.getAddress()
      )
      expect(approvedAssociation.isApproved).to.be.true
    })
    it("should reject an existing association and remove it from the list", async function () {
      await donationPools.registerAssociation("Red Cross", addr1.getAddress())
      await expect(
        donationPools.connect(owner).rejectAssociation(addr1.getAddress())
      )
        .to.emit(donationPools, "AssociationRejected")
        .withArgs(addr1.getAddress())

      // Vérifier que l'association est bien supprimée
      const association = await donationPools.associations(addr1.getAddress())
      expect(association.name).to.equal("")

      // Vérifier que l'adresse est bien retirée du tableau
      const wallets = await donationPools.associationWallets
      expect(wallets).to.not.include(addr1.getAddress())
    })

    it("Should not allow duplicate association registration", async function () {
      await donationPools.registerAssociation("Red Cross", addr1.getAddress())
      await expect(
        donationPools.registerAssociation("Red", addr1.getAddress())
      ).to.be.revertedWith("Association already exists")
    })

    it("Should revert if approving a non-existent association", async function () {
      await expect(
        donationPools.approveAssociation(addr1.getAddress())
      ).to.be.revertedWith("Association does not exist")
    })

    it("Should revert if rejecting a non-existent association", async function () {
      await expect(
        donationPools.rejectAssociation(addr1.getAddress())
      ).to.be.revertedWith("Association does not exist")
    })

    it("Should get association details successfully", async function () {
      await donationPools.registerAssociation(
        "Red Cross",
        await addr1.getAddress()
      )

      const association = await donationPools.getAssociation(
        await addr1.getAddress()
      )

      expect(association[0]).to.equal("Red Cross") // Name
      expect(association[1]).to.be.false // Approval status
    })

    it("Should revert when fetching a non-existent association", async function () {
      await expect(
        donationPools.getAssociation(await addr1.getAddress())
      ).to.be.revertedWith("Association does not exist")
    })

    it("Should return all registered associations with addresses ", async function () {
      await donationPools.registerAssociation("Red Cross", addr1.getAddress())
      await donationPools.registerAssociation("UNICEF", addr2.getAddress())

      const [allAssociations, allAddresses] =
        await donationPools.getAllAssociations()
      await expect(allAssociations.length).to.equal(2)
      await expect(allAssociations[0].name).to.equal("Red Cross")
      await expect(allAddresses[0]).to.equal(await addr1.getAddress())

      expect(allAssociations[1].name).to.equal("UNICEF")
      expect(allAddresses[1]).to.equal(await addr2.getAddress())
    })
  })
})
