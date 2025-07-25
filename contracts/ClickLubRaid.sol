// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ClickLubRaid is Ownable, ReentrancyGuard {
    uint256 public constant PRICE = 0.0001 ether;
    uint256 public constant MAX_PER_TX = 420;
    address public immutable treasury;

    struct Raid {
        uint256 total;
    }

    mapping(uint256 => Raid) public raids; // channelId → Raid data

    mapping(address => uint256) public streakCount;
    mapping(address => uint256) public lastClaim;

    event RaidClicks(address indexed buyer, uint256 channelId, uint256 amount, uint256 value);
    event DailyStreak(address indexed user, uint256 streak);

    constructor(address _treasury) {
        require(_treasury != address(0), "treasury required");
        treasury = _treasury;
    }

    function batchBuyAttribution(uint256 channelId, uint256 amount) external payable nonReentrant {
        require(amount > 0 && amount <= MAX_PER_TX, "Invalid amount");
        require(msg.value == amount * PRICE, "Incorrect ETH sent");
        raids[channelId].total += amount;
        emit RaidClicks(msg.sender, channelId, amount, msg.value);
        // Forward ETH to treasury
        (bool ok, ) = treasury.call{value: msg.value}("");
        require(ok, "Treasury transfer failed");
    }

    function claimDailyStreak() external nonReentrant {
        uint256 last = lastClaim[msg.sender];
        require(block.timestamp - last >= 1 days, "Already claimed today");
        if (last == 0 || block.timestamp - last > 2 days) {
            streakCount[msg.sender] = 1;
        } else {
            streakCount[msg.sender] += 1;
        }
        lastClaim[msg.sender] = block.timestamp;
        emit DailyStreak(msg.sender, streakCount[msg.sender]);
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner().call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }
}