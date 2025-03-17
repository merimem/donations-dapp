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

    struct Pool {
        uint256 balance;
        mapping(address => uint256) contributions;
    }

    mapping(PoolType => Pool) public pools;

    uint256 public constant VERA_REWARD_RATE = 1000; // Example: 1 ETH = 1000 VERA

    event DonationReceived(address indexed donor, PoolType pool, uint256 amount);

    error DonationMustBeGreaterThanZero();

    modifier validDonation() {
        if (msg.value == 0) revert DonationMustBeGreaterThanZero();
        _;    
    }
   

    //Functions
    constructor(address _veraTokenAddress) Ownable(msg.sender)  {
        require(_veraTokenAddress != address(0), "Invalid VERA token address");
        veraToken = VERA(_veraTokenAddress);
        
    }


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
}
