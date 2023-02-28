// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "../Mechanics/Rarity/Rarity.sol";

contract Dispersion is Rarity {
  function getDispersion(uint256 randomness) external pure virtual returns (uint8) {
    return _getRarity(randomness);
  }
}
