// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@gemunion/contracts-chain-link-v2/contracts/extensions/ChainLinkBase.sol";

abstract contract ChainLinkHardhat is ChainLinkBase {
  constructor(
    uint64 subId,
    uint16 minReqConfs,
    uint32 callbackGasLimit,
    uint32 numWords
  )
    ChainLinkBase(
      address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512), // hardhat vrfCoordinatorV2
      0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186, // keyHash
      subId,
      minReqConfs,
      callbackGasLimit,
      numWords
    )
  {}
}
