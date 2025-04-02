// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./VeraToken.sol";
import "./CouponNFT.sol";

/**
 * @title Chain4Good
 * @notice Blockchain-based donation and governance system for crisis management
 * @dev A Smart contract that manages DAO
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
        Newborns, 
        RespiratoryInfections, 
        DiarrhealDiseases, 
        Malaria, 
        Tuberculosis, 
        HIV 
    }

    enum UserType { Donator, Association }
    enum ProjectStatus { Pending, Approved, Rejected, Funding, Completed }

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
        bool couponsHasBeenCreated;
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
    event ProjectStatusChanged(uint256 projectId, uint8 status);
    event AssociationRegistered(address indexed associationAddress, string name);
    event AssociationApproved(address indexed associationAddress);
    event AssociationRejected(address indexed associationAddress);
    event ProjectVoted(uint256 projectId, address donor, bool vote);
    event CouponsCreated(uint256 projectId, uint256 numberOfCoupons);

    error DonationMustBeGreaterThanZero();
    error DonatorAlreadyRegistered();
    error NotValidAddress();
    error SendAmountFailed();

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
   
    modifier validAddress(address _addr) {
        require(_addr != address(0), NotValidAddress());
        _;
    }
   
    /// @notice Initializes the contract with the required parameters.
    /// @dev Ensures valid parameters using the `validConstructor` modifier.
    /// @param _veraTokenAddress Address of the VeraToken contract.
    /// @param _couponNFT Address of the CouponNFT contract.
    /// @param _votingDelay Delay before voting starts.
    /// @param _tokenRewardRate Token reward rate.
    /// @param _quorum Voting quorum threshold.
    constructor(address _veraTokenAddress, address payable _couponNFT, uint48 _votingDelay, uint256 _tokenRewardRate, uint256 _quorum) Ownable(msg.sender) validConstructor( _veraTokenAddress, _couponNFT, _votingDelay, _tokenRewardRate, _quorum) {
        veraToken = VeraToken(_veraTokenAddress);
        couponNFT = CouponNFT(_couponNFT);

        votingDelay = _votingDelay;
        tokenRewardRate= _tokenRewardRate;
        quorum= _quorum;
    }

    /// @notice Updates the token reward rate.
    /// @dev Only the contract owner can call this function.
    /// @param _tokenRewardRate The new reward rate for tokens.
    function setRewardRate(uint256 _tokenRewardRate) external onlyOwner {
        /// #if_succeeds _tokenRewardRate > 0;
        tokenRewardRate = _tokenRewardRate;
    }

    /// @notice Allows users to donate to a specific pool.
    /// @dev Ensures valid donation conditions via the `validDonation` modifier.
    /// @param _pool The pool to which the donation is made.
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

    
    /// @notice Creates a new project linked to a specific pool.
    /// @dev Ensures valid project conditions before creation.
    /// @param _projectId Unique identifier for the project.
    /// @param _poolType The pool from which funds will be allocated.
    /// @param _amountRequired The amount requested for the project.
    /// @param _receiver The address receiving the funds if the project is approved.
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

    /// @notice Allows a registered donor to vote on a project.
    /// @dev Ensures only eligible donors can vote and that their votes are counted properly.
    /// @param _projectId The ID of the project being voted on.
    /// @param _vote Boolean value representing the donor's vote (true for yes, false for no)./
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

   

    /// @notice Allows the owner to update the status of a project.
    /// @dev Ensures only the owner can change the status and emits an event.
    /// @param _projectId The ID of the project whose status is being updated.
    /// @param _status The new status to be assigned to the project.
    function changeProjectStatus(uint256 _projectId, ProjectStatus _status) external onlyOwner {      
        projects[_projectId].status = _status;
        emit ProjectStatusChanged(_projectId, uint8(_status));
    }


    /// @notice Registers a new association with a name and wallet address.
    /// @dev Ensures the wallet address is valid, the association name is non-empty, 
    ///      and that the association does not already exist.
    /// @param _name The name of the association to register.
    /// @param _wallet The wallet address associated with the association.
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

    /// @notice Approves an association, changing its approval status to true.
    /// @dev Ensures the association exists and is not already approved before changing the status.
    /// @param _wallet The wallet address of the association to approve.
    function approveAssociation(address _wallet) external onlyOwner {
        require(bytes(associations[_wallet].name).length > 0, "Association does not exist");
        require(!associations[_wallet].isApproved, "Already approved");

        associations[_wallet].isApproved = true;
        emit AssociationApproved(_wallet);
    }

    /// @notice Rejects an association, removing it from the list and deleting its data.
    /// @dev Ensures the association exists before deletion and removes the wallet from the association list.
    /// @param _wallet The wallet address of the association to reject.
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

    /// @notice Creates coupons for a given project if the conditions are met. 
    /// @dev Verifies that the amount required is divisible by the coupon value, checks the project status, and ensures coupons have not already been created.
    /// @param _projectId The ID of the project for which coupons will be created.
    /// @param couponValue The value of each coupon created.
    function createCoupons(uint256 _projectId, uint256 couponValue) external {       
        require(projects[_projectId].amountRequired % couponValue == 0, "TargetAmount not divisible by couponValue");
        require(projects[_projectId].status == ProjectStatus.Approved, "Project has not succeeded");
        require(projects[_projectId].receiver == msg.sender, "You are not the receiver of this project");
        require(projects[_projectId].couponsHasBeenCreated == false, "Coupons already created");

        (bool received,) = address(couponNFT).call{ value: projects[_projectId].amountRequired }('');
        if(!received) {
            revert SendAmountFailed();
        }
        
        uint256 numberOfCoupons = projects[_projectId].amountRequired / couponValue;
        for (uint256 i = 0; i < numberOfCoupons; i++) {
            uint256 couponId = couponNFT.createCoupon(couponValue, _projectId, projects[_projectId].receiver);
            projects[_projectId].coupons.push(couponId);
        }
        projects[_projectId].couponsHasBeenCreated = true;
        projects[_projectId].status = ProjectStatus.Funding;

        emit ProjectStatusChanged(_projectId, uint8(ProjectStatus.Funding));
        emit CouponsCreated(_projectId, numberOfCoupons);
    }

    /// @notice Finalizes the voting for a project and updates its status based on the votes.
    /// @dev Ensures the voting period has ended and checks if the project has enough votes to be approved or rejected. The project status is then updated accordingly.
    /// @param _projectId The ID of the project whose votes are being finalized.
    function finallizeVotes(uint256 _projectId) external onlyOwner {
        require(projects[_projectId].amountRequired != 0, "Project does not exist");
        require(block.number >= projects[_projectId].startBlock + votingDelay, "Voting period not yet ended");
        
        Project storage project = projects[_projectId];

        if (project.yesVotes > project.noVotes) {
            project.status = ProjectStatus.Approved;
           
        } else {
            project.status = ProjectStatus.Rejected;
        }

        emit ProjectStatusChanged(_projectId, uint8(project.status));
    }

    /// @notice Returns the details of a specific project based on its ID.
    /// @dev This function retrieves the project data stored in the `projects` mapping for the provided project ID.
    /// @param _projectId The ID of the project.
    /// @return project The details of the project corresponding to the provided ID.
    function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }

    /// @notice Retrieves all registered projects.
    /// @dev This function iterates over the `projectIds` array and fetches each project from the `projects` mapping.
    /// @return ids An array of project IDs.
    /// @return projectList An array of `Project` structs, containing the details of each project.
   function getAllProjects() external view returns (uint256[] memory, Project[] memory) {
        Project[] memory projectList = new Project[](projectIds.length);
        for (uint256 i = 0; i < projectIds.length; i++) {
            projectList[i] = projects[projectIds[i]];
        }
        return (projectIds, projectList);
    }


    /// @notice Retrieves the total contribution of a specific donor to a given pool.
    /// @dev This function looks up the contributions of a donor to a specific pool and returns the total amount donated by the donor.
    /// @param _pool The pool type to check the contribution for.
    /// @param _donor The address of the donor to retrieve contributions for.
    /// @return The total contribution amount of the donor in the specified pool.
    function getContribution(PoolType _pool, address _donor) external view returns (uint256) {
        return pools[_pool].contributions[_donor];
    }

    /**
    * @notice Retrieves the balance of a given pool.
    * @dev This function returns the current balance of a specific pool based on its `PoolType`.
    * @param _pool The pool type to check the balance for.
    * @return The balance of the specified pool.
    */
   function getPoolBalances(PoolType _pool) external view returns (uint256) {
        return pools[_pool].balance;
    }

    /**
    * @notice Retrieves the name and approval status of a specific association by address.
    * @dev This function checks if the association exists in the `associations` mapping and returns the name and approval status.
    * @param _association The address of the association to retrieve.
    * @return name The name of the association.
    * @return isApproved The approval status of the association.
    */
    function getAssociation(address _association) external view returns (string memory name, bool isApproved) {
        require(bytes(associations[_association].name).length > 0, "Association does not exist");
        return (associations[_association].name, associations[_association].isApproved);
    }

    /**
    * @notice Retrieves all registered associations along with their wallet addresses.
    * @dev This function iterates through the list of registered association wallets and retrieves their corresponding details.
    * @return allAssociations An array of all registered associations, including their name and approval status.
    * @return associationWallets An array of wallet addresses of the registered associations.
    */
    function getAllAssociations() external view returns (Association[] memory, address[] memory) {
        Association[] memory allAssociations = new Association[](associationWallets.length);
        for (uint256 i = 0; i < associationWallets.length; i++) {
            allAssociations[i] = associations[associationWallets[i]];
        }
        return (allAssociations, associationWallets);
    }
}
