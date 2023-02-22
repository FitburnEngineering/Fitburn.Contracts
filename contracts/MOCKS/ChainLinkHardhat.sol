// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@gemunion/contracts-chain-link/contracts/extensions/ChainLinkBase.sol";

abstract contract ChainLinkHardhat is ChainLinkBase {
  constructor()
    ChainLinkBase(
      address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512), // besu vrfCoordinator
      address(0x5FbDB2315678afecb367f032d93F642f64180aa3), // besu LINK token
      0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186, // system hash
      0.1 ether // fee
    )
  {}
}
