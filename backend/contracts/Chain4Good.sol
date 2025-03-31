// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./VeraToken.sol";
import "./CouponNFT.sol";

/**
 * @title Chain4Good
 * @dev Blockchain-based donation and governance system for crisis management
 */
contract Chain4Good is Ownable {
    // Token and NFT contracts
    VeraToken public veraToken;
    CouponNFT public couponNFT;

    uint48 public votingDelay;
    uint256 public tokenRewardRate; 
    uint256 public quorum; 

    uint256[] public projectIds;
    address[] public associationWallets;

    enum PoolType { 
        NaturalDisasters, 
        HumanitarianCrises, 
        TechnologicalDisasters, 
        TransportDisasters, 
        SocialDisasters, 
        EnvironmentalDisasters 
    }

    enum UserType { Donator, Association }
    enum ProjectStatus { Pending, Approved, Rejected, Funding, Funded, Completed }

    struct Pool {
        uint256 balance;
        mapping(address => uint256) contributions;
    }
    struct Project {
        address receiver;
        uint256 amountRequired;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 startBlock;
        uint256[] coupons;
        PoolType poolType;
        ProjectStatus status;
    }
    struct DonatorVote{
        bool hasVoted;
        bool voteValue;
    }
    struct Donator {
        bool isRegistered;
        uint256 firstDonationBlock; 
        mapping(uint256 => DonatorVote) votes;
    }
    struct Association {
        string name;
        bool isApproved;
    }

    mapping(address => Donator) public donators;
    mapping(PoolType => Pool) public pools;
    mapping(address => Association) public associations;
    mapping(uint256 => Project) public projects;

    event DonaterRegistered(address donatorAddress);
    event DonationReceived(address indexed donor, uint8 pool, uint256 amount);
    event ProjectCreated(uint256 projectId, PoolType poolType, uint256 amountRequired);
    event ProjectStatusChanged(uint256 projectId, ProjectStatus status);
    event AssociationRegistered(address indexed associationAddress, string name);
    event AssociationApproved(address indexed associationAddress);
    event AssociationRejected(address indexed associationAddress);
    event ProjectVoted(uint256 projectId, address donor, bool vote);
    event CouponsCreated(uint256 projectId, uint256 numberOfCoupons);

    error DonationMustBeGreaterThanZero();
    error DonatorAlreadyRegistered();
    error NotValidAddress();

    modifier validConstructor(address _veraTokenAddress, address _couponNFT, uint48 _votingDelay, uint256 _tokenRewardRate, uint256 _quorum){
        require(_veraTokenAddress != address(0), "Invalid VERA token address");
        require(_couponNFT != address(0), "Invalid CouponNFT address");
        require(_votingDelay > 0, "Voting delay must be greater than zero");
        require(_tokenRewardRate > 0, "Token reward rate must be greater than zero");
        require(_quorum > 0 && _quorum <= 100, "Quorum must be between 1 and 100");
        _;   
    }
    modifier validDonation() {
        if (msg.value == 0) revert DonationMustBeGreaterThanZero();
        _;    
    }
    modifier onlyNotRegistered(address _address) {
        require(
            donators[_address].isRegistered == false,
            DonatorAlreadyRegistered()
        );
        _;
    }
    modifier validAddress(address _addr) {
        require(_addr != address(0), NotValidAddress());
        _;
    }
   
    /**
     * @dev Contract constructor setting initial values
     */
    constructor(address _veraTokenAddress, address _couponNFT, uint48 _votingDelay, uint256 _tokenRewardRate, uint256 _quorum) Ownable(msg.sender) validConstructor( _veraTokenAddress, _couponNFT, _votingDelay, _tokenRewardRate, _quorum) {
        veraToken = VeraToken(_veraTokenAddress);
        couponNFT = CouponNFT(_couponNFT);

        votingDelay = _votingDelay;
        tokenRewardRate= _tokenRewardRate;
        quorum= _quorum;
    }

    /**
     * @dev Updates the reward rate for donations
     */
   function setRewardRate(uint256 _tokenRewardRate) external onlyOwner {
        tokenRewardRate = _tokenRewardRate;
    }

    /**
     * @dev Allows users to donate to a specific pool
     */
    function donate(PoolType _pool) external payable validDonation {
        pools[_pool].balance += msg.value;
        pools[_pool].contributions[msg.sender] += msg.value;
        if (!donators[msg.sender].isRegistered) {
            donators[msg.sender].firstDonationBlock = block.number; 
            donators[msg.sender].isRegistered = true;
        }
        uint256 veraReward = (msg.value / 10**17) * 10;  
        veraToken.mint( msg.sender, veraReward);

        emit DonationReceived(msg.sender, uint8(_pool), msg.value);
    }

    
    /**
     * @dev Creates a new project for funding
     */    
     function createProject(uint256 _projectId, PoolType _poolType, uint256 _amountRequired, address _receiver) onlyOwner() external  {
        require(_amountRequired > 0, "Amount must be greater than zero");
        require(_amountRequired <= pools[_poolType].balance, "Amount must be less or equal to pool balance");
        require(projects[_projectId].startBlock == 0, "Project already exists");
        require(_receiver != address(0), "Invalid receiver address");

        projects[_projectId].poolType = _poolType;
        projects[_projectId].amountRequired = _amountRequired;
        projects[_projectId].status = ProjectStatus.Pending;
        projects[_projectId].receiver = _receiver;
        projects[_projectId].startBlock = block.number;
        projectIds.push(_projectId); 

        emit ProjectCreated(_projectId, _poolType, _amountRequired);
    }

    /**
     * @dev Allows donors to vote on a project
     */
    function voteOnProject(uint256 _projectId, bool _vote) external {
        require(donators[msg.sender].isRegistered, "Only registered donors can vote");
        require(projects[_projectId].startBlock != 0, "Project does not exist");
        require(donators[msg.sender].firstDonationBlock < projects[_projectId].startBlock, "Donation should be done before project creation");
        require(pools[projects[_projectId].poolType].contributions[msg.sender] > 0, "You must donate to the relevant pool before voting");
        require(projects[_projectId].status == ProjectStatus.Pending, "Project not pending");
        require(veraToken.balanceOf(msg.sender) > 0, "Insufficient VERA token balance");
        
        DonatorVote storage donorVote = donators[msg.sender].votes[_projectId];
        require(!donorVote.hasVoted, "Donor has already voted");

        donorVote.hasVoted = true;
        donorVote.voteValue = _vote;

        if (_vote) {
            projects[_projectId].yesVotes+= veraToken.balanceOf(msg.sender);
        } else {
            projects[_projectId].noVotes+= veraToken.balanceOf(msg.sender);
        }

        emit ProjectVoted(_projectId, msg.sender, _vote);
    }

   

    /**
     * @dev Change project status
     */
    function changeProjectStatus(uint256 _projectId, ProjectStatus _status) external onlyOwner {      
        projects[_projectId].status = _status;
        emit ProjectStatusChanged(_projectId, _status);
    }


    /**
     * @dev Register Association
     */
    function registerAssociation(string memory _name, address _wallet) external validAddress(_wallet) {
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(associations[_wallet].name).length == 0, "Association already exists");

        associations[_wallet] = Association({
            name: _name,
            isApproved: false
        });
         associationWallets.push(_wallet); 
        emit AssociationRegistered(_wallet, _name);
    }

    /**
     * @dev Approve association subscription
     */
    function approveAssociation(address _wallet) external onlyOwner {
        require(bytes(associations[_wallet].name).length > 0, "Association does not exist");
        require(!associations[_wallet].isApproved, "Already approved");

        associations[_wallet].isApproved = true;
        emit AssociationApproved(_wallet);
    }

    /**
     * @dev Reject association subscription
     */
    function rejectAssociation(address _wallet) external onlyOwner {
        require(bytes(associations[_wallet].name).length > 0, "Association does not exist");
        for (uint i = 0; i < associationWallets.length; i++) {
            if (associationWallets[i] == _wallet) {
                associationWallets[i] = associationWallets[associationWallets.length - 1];
                associationWallets.pop();
                break;
            }
        }      
        delete associations[_wallet];
        emit AssociationRejected(_wallet);
    }

    /**
     * @dev Create coupons for the approved amount
     */
    function createCoupons(uint256 _projectId, uint256 couponValue) external {       
        require(projects[_projectId].amountRequired % couponValue == 0, "TargetAmount not divisible by couponValue");
        require(projects[_projectId].status == ProjectStatus.Approved, "Project has not succeeded");
        require(projects[_projectId].receiver == msg.sender, "You are not the receiver of this project");

        uint256 numberOfCoupons = projects[_projectId].amountRequired / couponValue;
        for (uint256 i = 0; i < numberOfCoupons; i++) {
            uint256 couponId = couponNFT.createCoupon(couponValue, _projectId, projects[_projectId].receiver);
            projects[_projectId].coupons.push(couponId);
        }
        emit CouponsCreated(_projectId, numberOfCoupons);
    }

    /**
     * @dev End vote session
     */
    function finallizeVotes(uint256 _projectId) external onlyOwner {
        require(projects[_projectId].amountRequired != 0, "Project does not exist");
        require(block.number >= projects[_projectId].startBlock + votingDelay, "Voting period not yet ended");
        
        Project storage project = projects[_projectId];

        if (project.yesVotes > project.noVotes) {
            project.status = ProjectStatus.Approved;
           
        } else {
            project.status = ProjectStatus.Rejected;
        }

        emit ProjectStatusChanged(_projectId, project.status);
    }

    /**
     * @dev Get a project bu projectId
     */
    function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }

    /**
     * @dev Get all registered projects
     */
   function getAllProjects() external view returns (uint256[] memory, Project[] memory) {
        Project[] memory projectList = new Project[](projectIds.length);
        for (uint256 i = 0; i < projectIds.length; i++) {
            projectList[i] = projects[projectIds[i]];
        }
        return (projectIds, projectList);
    }

    /**
     * @dev Get contribution of a specifid donator
     */
    function getContribution(PoolType _pool, address _donor) external view returns (uint256) {
        return pools[_pool].contributions[_donor];
    }

    /**
     * @dev Get pool balances by poolId
     */
   function getPoolBalances(PoolType _pool) external view returns (uint256) {
        return pools[_pool].balance;
    }

     /**
     * @dev Get association by address
     */
    function getAssociation(address _association) external view returns (string memory name, bool isApproved) {
        require(bytes(associations[_association].name).length > 0, "Association does not exist");
        return (associations[_association].name, associations[_association].isApproved);
    }

    /**
     * @dev Get all associations registered and not
     */
    function getAllAssociations() external view returns (Association[] memory, address[] memory) {
        Association[] memory allAssociations = new Association[](associationWallets.length);
        for (uint256 i = 0; i < associationWallets.length; i++) {
            allAssociations[i] = associations[associationWallets[i]];
        }
        return (allAssociations, associationWallets);
    }
}
