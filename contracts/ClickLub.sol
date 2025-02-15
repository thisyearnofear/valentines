// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ClickLub
 * @dev Deployed on Linea Mainnet
 * Treasury: 0x7e0A89A36Ba135A79aF121f443e20860845A731b
 */
contract ClickLub {
    address public immutable treasury;
    uint256 public constant MAX_CLICKS = 69420;
    uint256 public constant MAX_PER_PURCHASE = 420;
    uint256 public constant CLICK_PRICE = 0.0001 ether; // Price per click in ETH

    uint256 public totalAttributedClicks;
    uint256 public treasuryClicks;

    mapping(address => uint256) public attributedClicks;
    address[] public users;

    // Tracking final ownership percentages
    mapping(address => uint256) public finalOwnershipShares;
    bool public ownershipFinalized;

    event ClicksAttributed(
        address indexed buyer,
        address indexed recipient,
        uint256 amount
    );
    event OwnershipFinalized();
    event OwnershipSharesCalculated(address indexed user, uint256 shares);

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    function buyClickAttribution(uint256 amount, address recipient) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= MAX_PER_PURCHASE, "Cannot exceed max per purchase");
        require(totalAttributedClicks + amount <= MAX_CLICKS, "Exceeds max attribution");
        require(msg.value >= amount * CLICK_PRICE, "Insufficient ETH sent");

        address effectiveRecipient = recipient == address(0) ? msg.sender : recipient;

        if (attributedClicks[effectiveRecipient] == 0) {
            users.push(effectiveRecipient);
        }

        attributedClicks[effectiveRecipient] += amount;
        totalAttributedClicks += amount;

        // Refund excess ETH if sent
        uint256 excess = msg.value - (amount * CLICK_PRICE);
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "Failed to send ETH for user's excess funds.");
        }

        // Forward the payment to treasury
        (bool sent, ) = treasury.call{value: amount * CLICK_PRICE}("");
        require(sent, "Error sending funds");

        emit ClicksAttributed(msg.sender, effectiveRecipient, amount);
    }

    function finalizeOwnership(uint256 totalClicks) external {
        require(totalClicks >= MAX_CLICKS, "Not enough clicks yet");
        require(!ownershipFinalized, "Ownership already finalized");

        uint256 userLength = users.length;
        // Calculate and store final ownership shares (in basis points, i.e., 1/100th of a percent)
        for (uint256 i = 0; i < userLength; i++) {
            address user = users[i];
            uint256 userShare = (attributedClicks[user] * 10000) / MAX_CLICKS; // Convert to basis points
            finalOwnershipShares[user] = userShare;
            emit OwnershipSharesCalculated(user, userShare);
        }

        // Calculate treasury share for unattributed clicks
        uint256 treasuryShare = ((MAX_CLICKS - totalAttributedClicks) * 10000) / MAX_CLICKS;
        finalOwnershipShares[treasury] = treasuryShare;
        emit OwnershipSharesCalculated(treasury, treasuryShare);

        ownershipFinalized = true;
        emit OwnershipFinalized();
    }

    // View functions for frontend integration
    function getRemainingAttributions() external view returns (uint256) {
        return MAX_CLICKS - totalAttributedClicks;
    }

    function getOwnershipShare(address user) external view returns (uint256) {
        require(ownershipFinalized, "Ownership not finalized yet");
        return finalOwnershipShares[user];
    }

    function getCurrentOwnershipShare(address user) external view returns (uint256) {
        if (totalAttributedClicks == 0) return 0;
        return (attributedClicks[user] * 10000) / MAX_CLICKS;
    }

    receive() external payable {}
}
