// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractVestingDaily.sol";

contract PreSeedSaleVesting is AbstractVestingDaily {
  constructor(
    address account,
    uint64 startTimestamp,
    uint64
  ) AbstractVestingDaily(account, startTimestamp, 3 * 30, 13337) {}
}
