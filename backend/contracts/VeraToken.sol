// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract VeraToken is ERC20, Ownable {
     uint256 public s_maxSupply = 10000000000000000000;

    constructor(address initialOwner) ERC20("VeraToken", "VERA") Ownable(initialOwner){
        _mint(msg.sender, s_maxSupply);
    }

   

    // The functions below are overrides required by Solidity.

    // function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
    //     super._update(from, to, amount);
    // }

    // function nonces(address owner) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
    //     return super.nonces(owner);
    // }
   function mint(address to, uint256 amount) public onlyOwner {
      
        _mint(to, amount);
    }
}