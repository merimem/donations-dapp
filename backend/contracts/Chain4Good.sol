// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract VERA is ERC20, Ownable {
    constructor() ERC20("VERA Token", "VERA") Ownable(msg.sender) {
        _mint(msg.sender, 1000);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

contract DonationPools is Ownable {
    VERA public veraToken;

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
    }

    struct Donator {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    struct Association {
        string name;
        bool isApproved;
    }

    mapping(address => Donator) donators;
    mapping(PoolType => Pool) public pools;
    mapping(address => Association) public associations;
    mapping(uint256 => Project) public projects;

    uint256 public constant VERA_REWARD_RATE = 1000; // Example: 1 ETH = 1000 VERA
    uint256[] public projectIds;

    event DonaterRegistered(address donatorAddress);
    event DonationReceived(address indexed donor, PoolType pool, uint256 amount);
    event ProjectCreated(uint256 projectId, PoolType poolType, uint256 amountRequired);
    event ProjectStatusChanged(uint256 projectId, ProjectStatus status);
    event AssociationRegistered(address indexed associationAddress, string name);
    event AssociationApproved(address indexed associationAddress);
    event AssociationRejected(address indexed associationAddress);
    

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
        veraToken = VERA(_veraTokenAddress);
        
    }

    // function registerDonator(address _address)
    //     external
    //     onlyNotRegistered(_address)
    //     validAddress(_address)
    // {
    //     donators[_address].isRegistered = true;
    //     emit DonaterRegistered(_address);
    // }



    function donate(PoolType _pool) external payable validDonation {

        pools[_pool].balance += msg.value;
        pools[_pool].contributions[msg.sender] += msg.value;

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

//add who creates the project
    function createProject(uint256 _projectId, PoolType _poolType, uint256 _amountRequired) external  {
        require(_amountRequired > 0, "Amount must be greater than zero");

        projects[_projectId] = Project({
            poolType: _poolType,
            amountRequired: _amountRequired,
            status: ProjectStatus.Pending
        });
        projectIds.push(_projectId); 
        emit ProjectCreated(_projectId, _poolType, _amountRequired);
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


    function registerAssociation(string memory _name, address _wallet) external validAddress(_wallet) {
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(associations[_wallet].name).length == 0, "Association already exists");

        associations[_wallet] = Association({
            name: _name,
            isApproved: false
        });
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
        delete associations[_wallet];
        emit AssociationRejected(_wallet);
    }



}
