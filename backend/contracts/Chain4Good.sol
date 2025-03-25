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
    enum ProjectStatus { Pending, Approved, Funded, Rejected, Completed }

    struct Pool {
        uint256 balance;
        mapping(address => uint256) contributions;
    }
    struct Project {
        PoolType poolType;
        uint256 amountRequired;
        ProjectStatus status;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 totalDonators;
        address receiver;
    }

    struct DonatorVote{
        bool hasVoted;
        bool voteValue;
    }

    struct Donator {
        bool isRegistered;
        //projectId =>
        mapping(uint256 => DonatorVote) votes;
    }

    struct Association {
        string name;
        bool isApproved;
    }

    mapping(address => Donator) donators;
    mapping(PoolType => Pool) public pools;
    mapping(address => Association) public associations;
    mapping(uint256 => Project) public projects;

    uint256 public constant VERA_REWARD_RATE = 1000; 
    uint256 public constant QUORUM_PERCENTAGE = 30; // Par exemple 30% des donateurs du pool doivent voter

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
    constructor(address _veraTokenAddress) Ownable(msg.sender)  {
        require(_veraTokenAddress != address(0), "Invalid VERA token address");
        veraToken = VeraToken(_veraTokenAddress);
        
    }

    // function registerDonator(address _address)
    //     external
    //     onlyNotRegistered(_address)
    //     validAddress(_address)
    // {
    //     donators[_address].isRegistered = true;
    //     emit DonaterRegistered(_address);
    // }


//prevent associations from donate
    function donate(PoolType _pool) external payable validDonation {

        pools[_pool].balance += msg.value;
        pools[_pool].contributions[msg.sender] += msg.value;
        donators[msg.sender].isRegistered = true;

        uint256 veraReward = msg.value * VERA_REWARD_RATE;
        veraToken.mint(msg.sender, veraReward);   
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

        projects[_projectId].poolType = _poolType;
        projects[_projectId].amountRequired = _amountRequired;
        projects[_projectId].status = ProjectStatus.Pending;
        projects[_projectId].receiver = _receiver;
        projectIds.push(_projectId); 

        emit ProjectCreated(_projectId, _poolType, _amountRequired);
    }

    function voteOnProject(uint256 _projectId, bool _vote) external {
        require(donators[msg.sender].isRegistered, "Only registered donators can vote");
        require(projects[_projectId].status == ProjectStatus.Pending, "Project not pending");
        uint256 voterBalance = veraToken.balanceOf(msg.sender);
        require(voterBalance > 0, "Insufficient VERA token balance");
       
        DonatorVote storage donorVote = donators[msg.sender].votes[_projectId];
        require(!donorVote.hasVoted, "Donator has already voted");

        // Enregistrement du vote
        donorVote.hasVoted = true;
        donorVote.voteValue = _vote;

        // Mise à jour du décompte des votes
        if (_vote) {
            projects[_projectId].yesVotes+= voterBalance;
        } else {
            projects[_projectId].noVotes+= voterBalance;
        }

        emit ProjectVoted(_projectId, msg.sender, _vote);
    }

    

    // function _finalizeVoting(uint256 _projectId) internal {
    //     uint256 totalDonators = _getTotalDonators(projects[_projectId].poolType);
    //     uint256 totalVotes = projects[_projectId].yesVotes + projects[_projectId].noVotes;

    //     if (totalVotes * 100 / totalDonators >= QUORUM_PERCENTAGE) {
    //         if (projects[_projectId].yesVotes > projects[_projectId].noVotes) {
    //             projects[_projectId].status = ProjectStatus.Approved;
    //         } else {
    //             projects[_projectId].status = ProjectStatus.Rejected;
    //         }
    //         emit ProjectStatusChanged(_projectId, projects[_projectId].status);
    //     }
    // }

    

     function finallizeVotes(uint256 _projectId) external onlyOwner {
        require(projects[_projectId].amountRequired != 0, "Project does not exist");

        Project storage project = projects[_projectId];

        if (project.yesVotes > project.noVotes) {
            project.status = ProjectStatus.Approved;
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
