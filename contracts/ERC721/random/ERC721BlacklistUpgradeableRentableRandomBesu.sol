// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "../ERC721BlacklistUpgradeableRentableRandom.sol";
import "../../MOCKS/ChainLinkBesu.sol";

/**
 * @dev An implementation of ERC721BlacklistUpgradeableRentableRandom for local/private blockchain based on Hyperledger Besu
 */
contract ERC721BlacklistUpgradeableRentableRandomBesu is ERC721BlacklistUpgradeableRentableRandom, ChainLinkBesu {
  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  )
    ERC721BlacklistUpgradeableRentableRandom(name, symbol, royalty, baseTokenURI)
    ChainLinkBesu(uint64(1), uint16(6), uint32(600000), uint32(1))
  {}

  /**
   * @notice Enable minting without random for test purposes
   */
  function mintCommon(address account, uint256 templateId) external virtual override onlyRole(MINTER_ROLE) {
    uint256 tokenId = _mintCommon(account, templateId);

    _upsertRecordField(tokenId, EARN_UPGRADE, 0);
    _upsertRecordField(tokenId, TIME_UPGRADE, 0);
    _upsertRecordField(tokenId, RARITY, 0);
  }

  /**
   * @dev See {ERC721Random-getRandomNumber}.
   */
  function getRandomNumber()
    internal
    override(ChainLinkBase, ERC721BlacklistUpgradeableRentableRandom)
    returns (uint256 requestId)
  {
    return super.getRandomNumber();
  }

  /**
   * @dev See {ERC721Random-fulfillRandomWords}.
   */
  function fulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
  ) internal override(ERC721BlacklistUpgradeableRentableRandom, VRFConsumerBaseV2) {
    return super.fulfillRandomWords(requestId, randomWords);
  }
}
