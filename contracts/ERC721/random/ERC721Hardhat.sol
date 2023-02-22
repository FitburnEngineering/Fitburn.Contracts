// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "../ERC721BlacklistUpgradeableRentableRandom.sol";
import "../../MOCKS/ChainLinkHardhat.sol";

contract ERC721Hardhat is ERC721BlacklistUpgradeableRentableRandom, ChainLinkHardhat {
  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  ) ERC721BlacklistUpgradeableRentableRandom(name, symbol, royalty, baseTokenURI) {}

  function mintCommon(address account, uint256 templateId) external virtual override onlyRole(MINTER_ROLE) {
    uint256 tokenId = _mintCommon(account, templateId);

    _upsertRecordField(tokenId, EARN_UPGRADE, 0);
    _upsertRecordField(tokenId, TIME_UPGRADE, 0);
    _upsertRecordField(tokenId, RARITY, 0);
  }

  function getDispersion(uint256 randomness) public pure returns (uint256) {
    return _getDispersion(randomness);
  }

  function getRandomNumber()
    internal
    override(ChainLinkBase, ERC721BlacklistUpgradeableRentableRandom)
    returns (bytes32 requestId)
  {
    return super.getRandomNumber();
  }

  function fulfillRandomness(
    bytes32 requestId,
    uint256 randomness
  ) internal override(ERC721BlacklistUpgradeableRentableRandom, VRFConsumerBase) {
    return super.fulfillRandomness(requestId, randomness);
  }
}
