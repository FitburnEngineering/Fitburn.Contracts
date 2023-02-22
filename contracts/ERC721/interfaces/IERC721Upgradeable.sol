// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./IERC721Simple.sol";

interface IERC721Upgradeable {
  function earnUpgrade(uint256 tokenId) external returns (bool);

  function timeUpgrade(uint256 tokenId) external returns (bool);
}
