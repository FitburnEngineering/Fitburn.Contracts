// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "../../../Exchange/interfaces/IAsset.sol";

interface IStaking {
  struct Rule {
    Asset deposit;
    Asset reward;
    Asset[] content;
    uint256 period;
    uint256 penalty;
    bool recurrent;
    bool active;
    uint256 externalId;
  }

  struct Stake {
    address owner;
    Asset deposit;
    uint256 ruleId;
    uint256 startTimestamp;
    uint256 cycles;
    bool activeDeposit;
  }

  event RuleCreated(uint256 ruleId, Rule rule, uint256 externalId);
  event RuleUpdated(uint256 ruleId, bool active);
}
