// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "../ERC721BlacklistUpgradeableRentableRandomV2.sol";
import "../../MOCKS/ChainLinkHardhatV2.sol";

contract ERC721HardhatV2 is ERC721BlacklistUpgradeableRentableRandomV2, ChainLinkHardhatV2 {
  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  ) ERC721BlacklistUpgradeableRentableRandomV2(name, symbol, royalty, baseTokenURI) {}

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
    override(ChainLinkBaseV2, ERC721BlacklistUpgradeableRentableRandomV2)
    returns (uint256 requestId)
  {
    return super.getRandomNumber();
  }

  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override(ERC721BlacklistUpgradeableRentableRandomV2, VRFConsumerBaseV2) {
    return super.fulfillRandomWords(requestId, randomWords);
  }
}
