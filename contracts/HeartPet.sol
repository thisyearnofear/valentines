// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HeartPet is ERC721, Ownable {
    uint256 public constant PRICE = 0.0001 ether;
    uint256 public totalSupply;
    address public immutable registry; // ERC6551 registry

    mapping(uint256 => uint256) public level;

    event PetMinted(address indexed to, uint256 tokenId);
    event PetLeveled(uint256 indexed tokenId, uint256 level);

    constructor(string memory name, string memory symbol, address _registry) ERC721(name, symbol) {
        registry = _registry;
    }

    function mint() public payable {
        require(msg.value == PRICE, "Wrong price");
        totalSupply++;
        uint256 tokenId = totalSupply;
        _safeMint(msg.sender, tokenId);
        emit PetMinted(msg.sender, tokenId);
        // TODO: Create TBA via registry, e.g. ERC6551Registry(registry).createAccount(...)
    }

    function levelUp(uint256 tokenId) external onlyOwner {
        level[tokenId]++;
        emit PetLeveled(tokenId, level[tokenId]);
    }
}