// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract CouponNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    struct Coupon {
        uint256 value;
        uint256 id;
    }
    
    mapping(uint256 => mapping(uint256 => uint256)) private projectCoupons;

    event CouponRedeemed(uint256 indexed tokenId, uint256 indexed projectId, address indexed redeemer, uint256 value);
    event EtherWithdrawn(address indexed owner, uint256 amount);

    constructor(address initialOwner) ERC721("Donation Coupon", "COUPON")Ownable(initialOwner) {}

    error NonexistentCoupon();
    error NotCouponOwner();
    error FailedTransfer();
    error InsuffisiantBalance();

    /// @notice Crée un coupon avec une valeur associée
    function createCoupons(
        uint256 value,
        uint256 projectId,
        address receiver,
        uint256 numberOfCoupons
    ) external onlyOwner returns (uint256[] memory) {
        uint256[] memory createdTokenIds = new uint256[](numberOfCoupons);
        for (uint256 i = 0; i < numberOfCoupons; i++) {
            uint256 tokenId = nextTokenId++;
            _safeMint(receiver, tokenId);
            projectCoupons[projectId][tokenId] = value;
            createdTokenIds[i] = tokenId;
        }

        return createdTokenIds;
    }

    function redeemCoupon(uint256 tokenId, uint256 projectId) external {
        require(projectCoupons[projectId][tokenId] != 0, NonexistentCoupon());
        require(ownerOf(tokenId) == msg.sender, NotCouponOwner());

        uint256 amount = projectCoupons[projectId][tokenId];
        projectCoupons[projectId][tokenId] = 0;
        _burn(tokenId);

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, FailedTransfer());
        emit CouponRedeemed(tokenId, projectId, msg.sender, amount);
    }

    function getCouponValue(uint256 tokenId, uint256 projectId) external view returns (uint256) {
       require(projectCoupons[projectId][tokenId] != 0, NonexistentCoupon());
        return projectCoupons[projectId][tokenId];
    }

    function getCouponsByProject(uint256 projectId) external view returns (uint256[] memory, uint256[] memory) {
        uint256 couponCount = 0;
        uint256[] memory keys = new uint256[](nextTokenId);
        uint256[] memory values = new uint256[](nextTokenId);

        for (uint256 i = 0; i < nextTokenId; i++) {
            if (projectCoupons[projectId][i] != 0) {
                keys[couponCount] = i;
                values[couponCount] = projectCoupons[projectId][i];
                couponCount++;
            }
        }

        uint256[] memory finalKeys = new uint256[](couponCount);
        uint256[] memory finalValues = new uint256[](couponCount);
        for (uint256 j = 0; j < couponCount; j++) {
            finalKeys[j] = keys[j];
            finalValues[j] = values[j];
        }

        return (finalKeys, finalValues);
    }

    function withdrawEther() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, InsuffisiantBalance());

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Ether withdrawal failed");

        emit EtherWithdrawn(owner(), balance);
    }


    receive() external payable {} 
}