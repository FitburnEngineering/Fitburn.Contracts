// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
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

    console.logBytes32(keccak256("TEMPLATE_ID"));
    console.logBytes32(keccak256("GRADE"));
    console.logBytes32(keccak256("RARITY"));
  }
}
