// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract VeraToken is ERC20, Ownable {

    constructor(address initialOwner) ERC20("VeraToken", "VERA") Ownable(initialOwner){
    }

   function mint(address to, uint256 amount) public onlyOwner {    
        _mint(to, amount);
    }

    function sendTokens(address to, uint256 amount) external onlyOwner {
        require(this.balanceOf(address(this)) >= amount, "Insufficient balance");
        _transfer(address(this), to, amount); 
}
}