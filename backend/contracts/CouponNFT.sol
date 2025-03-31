// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CouponNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    struct Coupon {
        uint256 value;
        uint256 projectId;
    }
    mapping(uint256 => Coupon) public coupons;

    constructor(address initialOwner) ERC721("Donation Coupon", "COUPON")Ownable(initialOwner) {}

    /// @notice Crée un coupon avec une valeur associée
    function createCoupon(
        uint256 value,
        uint256 projectId,
        address receiver
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _safeMint(receiver, tokenId);

        coupons[tokenId] = Coupon({
            value: value,
            projectId: projectId
        });

        return tokenId;
    }

    function redeemCoupon(uint256 tokenId) external {
        require(coupons[tokenId].value != 0, "Coupon does not exist");
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");

        uint256 amount = coupons[tokenId].value;
        require(amount > 0, "Coupon has no value");

        coupons[tokenId].value = 0;

        // Transfert des fonds au détenteur du coupon
        payable(msg.sender).transfer(amount);

        _burn(tokenId); // Optionnel selon ton besoin métier
    }
    function getCouponDetails(uint256 tokenId) external view returns (uint256, uint256) {
        require(coupons[tokenId].value != 0, "Coupon does not exist");
        return (coupons[tokenId].value, coupons[tokenId].projectId);
    }
}