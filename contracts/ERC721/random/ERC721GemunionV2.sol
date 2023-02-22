// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "@gemunion/contracts-chain-link/contracts/extensions/ChainLinkGemunionV2.sol";

import "../ERC721BlacklistUpgradeableRentableRandomV2.sol";

contract ERC721GemunionV2 is ERC721BlacklistUpgradeableRentableRandomV2, ChainLinkGemunionV2 {
  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  ) ERC721BlacklistUpgradeableRentableRandomV2(name, symbol, royalty, baseTokenURI)
  ChainLinkGemunionV2(uint64(1), uint16(3), uint32(700000), uint32(1))
  {}

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
