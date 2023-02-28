// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "@gemunion/contracts-chain-link-v2/contracts/extensions/ChainLinkBinance.sol";

import "../ERC721BlacklistUpgradeableRentableRandom.sol";

/**
 * @dev An implementation of ERC721BlacklistUpgradeableRentableRandom for Binance mainnet
 */
contract ERC721BlacklistUpgradeableRentableRandomBinance is ERC721BlacklistUpgradeableRentableRandom, ChainLinkBinance {
  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  )
    ERC721BlacklistUpgradeableRentableRandom(name, symbol, royalty, baseTokenURI)
    ChainLinkBinance(uint64(1), uint16(3), uint32(700000), uint32(1))
  {}

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
   * @dev See {ERC721Random-getRandomNumber}.
   */
  function fulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
  ) internal override(ERC721BlacklistUpgradeableRentableRandom, VRFConsumerBaseV2) {
    return super.fulfillRandomWords(requestId, randomWords);
  }
}
