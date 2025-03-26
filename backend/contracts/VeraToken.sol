// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract VeraToken is ERC20, Ownable {
     uint256 public s_maxSupply = 500000 * (10 ** 18);

    constructor(address initialOwner) ERC20("VeraToken", "VERA") Ownable(initialOwner){
        _mint(msg.sender, s_maxSupply);
    }

   function mint(address to, uint256 amount) public onlyOwner {
      
        _mint(to, amount);
    }
}