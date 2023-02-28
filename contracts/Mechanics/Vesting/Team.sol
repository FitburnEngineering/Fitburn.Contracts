// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractVesting.sol";

/**
 * @dev Contract for vesting tokens to the team
 */
contract TeamVesting is AbstractVesting {
  constructor(
    address account,
    uint64 startTimestamp,
    uint64
  ) AbstractVesting(account, startTimestamp, 12 * 30, 13698) {}
}
