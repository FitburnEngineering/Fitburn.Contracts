// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "hardhat/console.sol";

import "../ERC721/interfaces/IERC721Simple.sol";
import "../ERC721/interfaces/IERC721Upgradeable.sol";
import "../ERC721/interfaces/IERC721Random.sol";

contract InterfaceIdCalculator {
  constructor() {
    console.logBytes4(type(IERC721Simple).interfaceId);
    console.logBytes4(type(IERC721Upgradeable).interfaceId);
    console.logBytes4(type(IERC721Random).interfaceId);
  }
}
