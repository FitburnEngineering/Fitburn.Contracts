// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

contract Rarity {
  function _getDispersion(uint256 randomness) internal pure virtual returns (uint256) {
    uint256 percent = (randomness % 10_000) + 1;
    if (percent < 733) {
      return 4;
    } else if (percent < 2165) {
      // 733 + 1432
      return 3;
    } else if (percent < 4962) {
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
