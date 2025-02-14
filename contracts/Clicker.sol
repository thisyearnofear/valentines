// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Clicker {
    address public immutable treasury;
    uint256 public constant MAX_CLICKS = 69420;
    uint256 public constant MAX_PER_WALLET = 420;
    uint256 public constant CLICK_PRICE = 0.0001 ether; // Price per click in ETH

    uint256 public totalPaidClicks;
    uint256 public totalActualClicks;
    uint256 public treasuryClicks;

    mapping(address => uint256) public paidClicks;
    mapping(address => uint256) public attributedClicks;
    address[] public users;

    // Tracking final ownership percentages
    mapping(address => uint256) public finalOwnershipShares;
    bool public ownershipFinalized;

    event Clicked(address indexed user, uint256 totalClicks);
    event ClicksPurchased(address indexed user, uint256 amount);
    event OwnershipFinalized();
    event OwnershipSharesCalculated(address indexed user, uint256 shares);

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    function buyClicks(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(amount + paidClicks[msg.sender] <= MAX_PER_WALLET, "Exceeds max allocation");
        require(totalPaidClicks + amount <= MAX_CLICKS, "Exceeds max supply");
        require(msg.value >= amount * CLICK_PRICE, "Insufficient ETH sent");

        if (paidClicks[msg.sender] == 0) {
            users.push(msg.sender);
        }

        paidClicks[msg.sender] += amount;
        totalPaidClicks += amount;

        // Refund excess ETH if sent
        uint256 excess = msg.value - (amount * CLICK_PRICE);
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "Failed to send ETH for user's excess funds.");
        }

        // Forward the payment to treasury
        (bool sent, ) = treasury.call{value: amount * CLICK_PRICE}("");
        require(sent,"Error sending funds");

        emit ClicksPurchased(msg.sender, amount);
    }

    function clickHeart() external {
        require(totalActualClicks < MAX_CLICKS, "Clicking phase is complete");
        totalActualClicks += 1;

        address nextOwner = findNextPaidClickOwner();
        if (nextOwner != address(0)) {
            attributedClicks[nextOwner] += 1;
        } else {
            treasuryClicks += 1;
        }

        emit Clicked(msg.sender, totalActualClicks);
    }

    function findNextPaidClickOwner() internal view returns (address) {
        uint256 userLength = users.length;
        for (uint256 i = 0; i < userLength; i++) {
            if (attributedClicks[users[i]] < paidClicks[users[i]]) {
                return users[i];
            }
        }
        return address(0);
    }

    function finalizeOwnership() external {
        require(totalActualClicks == MAX_CLICKS, "Not yet finalized");
        require(!ownershipFinalized, "Ownership already finalized");

        uint256 userLength = users.length;
        // Calculate and store final ownership shares (in basis points, i.e., 1/100th of a percent)
        for (uint256 i = 0; i < userLength; i++) {
            address user = users[i];
            uint256 userShare = (attributedClicks[user] * 10000) / MAX_CLICKS; // Convert to basis points
            finalOwnershipShares[user] = userShare;
            emit OwnershipSharesCalculated(user, userShare);
        }

        // Calculate treasury share
        uint256 treasuryShare = (treasuryClicks * 10000) / MAX_CLICKS;
        finalOwnershipShares[treasury] = treasuryShare;
        emit OwnershipSharesCalculated(treasury, treasuryShare);

        ownershipFinalized = true;
        emit OwnershipFinalized();
    }

    // View functions for frontend integration
    function getRemainingClicks() external view returns (uint256) {
        return MAX_CLICKS - totalPaidClicks;
    }

    function getUserRemainingClicks(address user) external view returns (uint256) {
        return MAX_PER_WALLET - paidClicks[user];
    }

    function getOwnershipShare(address user) external view returns (uint256) {
        require(ownershipFinalized, "Ownership not finalized yet");
        return finalOwnershipShares[user];
    }

    receive() external payable {}
}
