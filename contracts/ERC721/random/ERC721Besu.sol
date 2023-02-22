// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "../ERC721BlacklistUpgradeableRentableRandom.sol";
import "../../MOCKS/ChainLinkBesu.sol";

contract ERC721Besu is ERC721BlacklistUpgradeableRentableRandom, ChainLinkBesu {
  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  ) ERC721BlacklistUpgradeableRentableRandom(name, symbol, royalty, baseTokenURI) {}

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
