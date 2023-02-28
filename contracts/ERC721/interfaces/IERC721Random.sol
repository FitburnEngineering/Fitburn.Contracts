// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

interface IERC721Random {
  function mintRandom(address to, uint256 templateId) external;
}
