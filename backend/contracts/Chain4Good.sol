// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./VeraToken.sol";

contract Chain4Good is Ownable {
    VeraToken public veraToken;

    enum PoolType { 
        NaturalDisasters, 
        HumanitarianCrises, 
        TechnologicalDisasters, 
        TransportDisasters, 
        SocialDisasters, 
        EnvironmentalDisasters 
    }

    enum UserType { Donator, Association }
    enum ProjectStatus { Pending, Approved, Rejected, Funded, Completed }

    struct Pool {
        uint256 balance;
        mapping(address => uint256) contributions;
    }
    struct Project {
        PoolType poolType;
        ProjectStatus status;
        address receiver;
        uint256 amountRequired;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 totalDonators;
        uint256 startBlock;
    }

    struct DonatorVote{
        bool hasVoted;
        bool voteValue;
    }

    struct Donator {
        bool isRegistered;
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
    mapping(uint256 => uint256) public onHoldFunds;

    uint48 public votingDelay;
    uint256 public tokenRewardRate; 
    uint256 public quorum; 

    uint256[] public projectIds;
    address[] public associationWallets;

    event DonaterRegistered(address donatorAddress);
    event DonationReceived(address indexed donor, PoolType pool, uint256 amount);
    event ProjectCreated(uint256 projectId, PoolType poolType, uint256 amountRequired);
    event ProjectStatusChanged(uint256 projectId, ProjectStatus status);
    event AssociationRegistered(address indexed associationAddress, string name);
    event AssociationApproved(address indexed associationAddress);
    event AssociationRejected(address indexed associationAddress);
    event ProjectVoted(uint256 projectId, address donor, bool vote);

    error DonationMustBeGreaterThanZero();
    error DonatorAlreadyRegistered();
    error NotValidAddress();

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
   

    //Functions
    constructor(address _veraTokenAddress, uint48 _votingDelay, uint256 _tokenRewardRate, uint256 _quorum) Ownable(msg.sender)  {
        require(_veraTokenAddress != address(0), "Invalid VERA token address");
        require(_votingDelay > 0, "Voting delay must be greater than zero");
        require(_tokenRewardRate > 0, "Token reward rate must be greater than zero");
        require(_quorum > 0 && _quorum <= 100, "Quorum must be between 1 and 100");

        veraToken = VeraToken(_veraTokenAddress);
        votingDelay = _votingDelay;
        tokenRewardRate= _tokenRewardRate;
        quorum= _quorum;
    }

   
   function setRewardRate(uint256 _tokenRewardRate) external onlyOwner {
        tokenRewardRate = _tokenRewardRate;
    }

//prevent associations from donate
    function donate(PoolType _pool) external payable validDonation {
        require(msg.value > 0, "Donation must be greater than 0");
        pools[_pool].balance += msg.value;
        pools[_pool].contributions[msg.sender] += msg.value;
        donators[msg.sender].isRegistered = true;

        uint256 veraReward = (msg.value / 10**17) * 10;
   
        //veraToken.approve(msg.sender, veraReward);   
        veraToken.mint( msg.sender, veraReward);
       
        emit DonationReceived(msg.sender, _pool, msg.value);
    }

    function getContribution(PoolType _pool, address _donor) external view returns (uint256) {
        return pools[_pool].contributions[_donor];
    }

   function getPoolBalances(PoolType _pool) external view returns (uint256) {
        return pools[_pool].balance;
    }

//PROJECTS
    function createProject(uint256 _projectId, PoolType _poolType, uint256 _amountRequired, address _receiver) external  {
        require(_amountRequired > 0, "Amount must be greater than zero");
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

    function voteOnProject(uint256 _projectId, bool _vote) external {
        require(donators[msg.sender].isRegistered, "Only registered donors can vote");
        require(projects[_projectId].startBlock != 0, "Project does not exist");
        require(projects[_projectId].status == ProjectStatus.Pending, "Project not pending");
        //
        uint256 voterBalance = veraToken.balanceOf(msg.sender);
        require(voterBalance > 0, "Insufficient VERA token balance");

        DonatorVote storage donorVote = donators[msg.sender].votes[_projectId];
        require(!donorVote.hasVoted, "Donor has already voted");

        donorVote.hasVoted = true;
        donorVote.voteValue = _vote;

        if (_vote) {
            projects[_projectId].yesVotes+= voterBalance;
        } else {
            projects[_projectId].noVotes+= voterBalance;
        }

        emit ProjectVoted(_projectId, msg.sender, _vote);
    }

     function finallizeVotes(uint256 _projectId) external onlyOwner {
        require(projects[_projectId].amountRequired != 0, "Project does not exist");
        require(block.number >= projects[_projectId].startBlock + votingDelay, "Voting period not yet ended");
        
        Project storage project = projects[_projectId];

        if (project.yesVotes > project.noVotes) {
            project.status = ProjectStatus.Approved;
            onHoldFunds[_projectId] = project.amountRequired;
        } else {
            project.status = ProjectStatus.Rejected;
        }

        emit ProjectStatusChanged(_projectId, project.status);
    }

   function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }

   function getAllProjects() external view returns (uint256[] memory, Project[] memory) {
    Project[] memory projectList = new Project[](projectIds.length);

    for (uint256 i = 0; i < projectIds.length; i++) {
        projectList[i] = projects[projectIds[i]];
    }

    return (projectIds, projectList);
}

    //require project exists
    function changeProjectStatus(uint256 _projectId, ProjectStatus _status) external onlyOwner {      
        projects[_projectId].status = _status;
        emit ProjectStatusChanged(_projectId, _status);
    }


    // Associations
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

    function approveAssociation(address _wallet) external onlyOwner {
        require(bytes(associations[_wallet].name).length > 0, "Association does not exist");
        require(!associations[_wallet].isApproved, "Already approved");

        associations[_wallet].isApproved = true;
        emit AssociationApproved(_wallet);
    }

    function rejectAssociation(address _wallet) external onlyOwner {
        require(bytes(associations[_wallet].name).length > 0, "Association does not exist");
        bool exists = false;
        for (uint i = 0; i < associationWallets.length; i++) {
            if (associationWallets[i] == _wallet) {
                exists = true;

                associationWallets[i] = associationWallets[associationWallets.length - 1];
                associationWallets.pop();
                break;
            }
        }
        require(exists, "Association wallet not found in list");
        delete associations[_wallet];
        emit AssociationRejected(_wallet);
    }

    function getAssociation(address _association) external view returns (string memory name, bool isApproved) {
        require(bytes(associations[_association].name).length > 0, "Association does not exist");
        return (associations[_association].name, associations[_association].isApproved);
    }

    function getAllAssociations() external view returns (Association[] memory, address[] memory) {
        Association[] memory allAssociations = new Association[](associationWallets.length);
       

        for (uint256 i = 0; i < associationWallets.length; i++) {
            allAssociations[i] = associations[associationWallets[i]];
        }
        return (allAssociations, associationWallets);
    }
}
