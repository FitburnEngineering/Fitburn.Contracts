// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractVesting.sol";

/**
 * @dev Contract for vesting tokens to the investors in pre-seed sale round
 */
contract PreSeedSaleVesting is AbstractVesting {
  constructor(address account, uint64 startTimestamp, uint64) AbstractVesting(account, startTimestamp, 3 * 30, 13337) {}
}
