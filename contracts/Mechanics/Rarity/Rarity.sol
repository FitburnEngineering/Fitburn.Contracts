// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

/**
 * @dev Contract for computing token's RARITY using ChainLink VRF
 */
contract Rarity {
  /**
   * @dev Returns rarity for the given randomness.
   *
   * @param randomness The randomness value used to calculate the dispersion.
   * @return Rarity
   */
  function _getRarity(uint256 randomness) internal pure virtual returns (uint8) {
    // Calculate the percentage from the randomness value.
    uint256 percent = (randomness % 10_000) + 1;

    // Determine rarity based on the percentage.
    if (percent <= 733) {
      return 4;
    } else if (percent <= 2165) {
      // 733 + 1432
      return 3;
    } else if (percent <= 4962) {
      // 733 + 1432 + 2797
      return 2;
    }

    // common
    return 1;
  }
}

// 0 28125 0,503617089854242
// 1 15625 0,279787272141246
// 2  8000 0,143251083336318
// 3  4096 0,073344554668195
