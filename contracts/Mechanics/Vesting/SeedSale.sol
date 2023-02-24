// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractVestingDaily.sol";

contract SeedSaleVesting is AbstractVestingDaily {
  constructor(
    address account,
    uint64 startTimestamp,
    uint64
  ) AbstractVestingDaily(account, startTimestamp, 2 * 30, 15547) {}
}