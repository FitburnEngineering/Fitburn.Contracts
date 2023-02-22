// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./VestingFactory.sol";
import "./ERC20Factory.sol";
import "./ERC721Factory.sol";

contract ContractManager is
  VestingFactory,
  ERC20Factory,
  ERC721Factory
{}
