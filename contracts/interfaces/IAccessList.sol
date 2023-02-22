// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@gemunion/contracts-access-list/contracts/extension/interfaces/IBlackList.sol";
import "@gemunion/contracts-access-list/contracts/extension/interfaces/IWhiteList.sol";

interface IAccessList is IBlackList, IWhiteList {}
